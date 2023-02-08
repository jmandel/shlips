import { randomStringWithEntropy, base64url } from './util';
import { API_BASE, VIEWER_BASE } from './config';

type ConfigForServer = Pick<ClientSHL, 'passcode' | 'exp'>;

export interface ClientSHL {
  id: string;
  managementToken: string;
  encryptionKey: string;
  files: {
    content: Uint8Array;
    contentType: string;
    status: 'NEED_UPLOAD' | 'UPLOADING' | 'UPLOADED';
  }[];
  passcode?: string;
  exp?: number;
  label?: string;
  v?: number;
}

interface ServerSHL {
  id: string;
  managementToken: string;
  active: boolean;
}

export class SHLClient {
  async toLink(shl: ClientSHL): Promise<string> {
    const shlinkJsonPayload = {
      url: `${API_BASE}/shl/${shl.id}`,
      exp: shl.exp || undefined,
      flag: shl.passcode ? 'P' : '',
      key: shl.encryptionKey,
      label: shl.label
    };

    const encodedPayload: string = base64url.encode(JSON.stringify(shlinkJsonPayload));
    const shlinkBare = VIEWER_BASE + `shlink:/` + encodedPayload;
    return shlinkBare;
  }

  async create(config: ConfigForServer = {}): Promise<ClientSHL> {
    const ek = randomStringWithEntropy();
    const create = await fetch(`${API_BASE}/shl`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    const { id, managementToken } = await create.json();
    return {
      id,
      managementToken,
      encryptionKey: ek,
      files: [],
      ...config
    };
  }

  async addFile(shl: ClientSHL, content: Uint8Array, contentType: string): Promise<ClientSHL> {
    shl.files.push({ content, contentType, status: 'NEED_UPLOAD' });
    const add = await fetch(`${API_BASE}/shl/${shl.id}/file`, {
      method: 'POST',
      headers: {
        'content-type': contentType,
        authorization: `Bearer ${shl.managementToken}`
      },
      body: content
    });
    return shl;
  }
}
