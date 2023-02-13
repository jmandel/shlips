export type Bundle = unknown;
export interface SHCRetrieveEvent {
  shc: SHCFile;
  label?: string;
  content: Bundle;
}

export interface SHCFile {
  verifiableCredential: string[];
}
