declare module '@midnight-ntwrk/compact-runtime' {
  export interface CircuitProof {
    proof: Uint8Array;
    publicInputs: string[];
  }
}

declare module '@midnight-ntwrk/ledger' {
  export interface LedgerContractState {
    allowlistRoot: string;
    nullifierHashes: Set<string>;
    accessGranted: boolean;
  }
}

declare module '@midnight-ntwrk/midnight-js-contracts' {
  export class MidnightContractClient {
    deploy(): Promise<{ contractAddress: string }>;
  }
}

declare module '@midnight-ntwrk/midnight-js-types' {
  export interface MidnightProvider {
    getShieldedAddress(): Promise<string>;
  }
}
