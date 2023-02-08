  export type Bundle = unknown;
  export interface SHCRetrieveEvent {
    shc: SHCFile;
    patient: string;
    content: Bundle;
  }

  export interface SHCFile {
  "verifiableCredential": string[]
  }
