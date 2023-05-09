export type Bundle = unknown;
export interface SHCRetrieveEvent {
  shc: SHCFile;
  label?: string;
  content: Bundle;
  exp?: number;
}

export interface SHCFile {
  verifiableCredential: string[];
}
