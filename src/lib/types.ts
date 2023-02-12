  export type Bundle = unknown;
  export interface SHCRetrieveEvent {
    shc: SHCFile;
    patient: string;
    label?: string;
    content: Bundle;
  }

  export interface SHCFile {
  "verifiableCredential": string[]
  }
