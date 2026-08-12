import { describe, it, expect } from 'vitest';
import { VeilPassContractEngine } from '../contract/veilpass_api';
import { crypto } from '../contract/crypto_utils';

describe('VeilPass End-to-End Client & Indexer Integration Suite', () => {
  it('validates complete off-chain witness generation to on-chain indexer record flow', () => {
    const engine = new VeilPassContractEngine();
    const secret = "e2e_integration_secret_pass_2026";
    
    // 1. Register member
    const { commitment, leafIndex } = engine.registerMemberSecret(secret);
    expect(commitment).toBe(crypto.hashSecret(secret));

    // 2. Generate witness
    const tree = engine.getMerkleTree();
    const proof = tree.getProof(leafIndex);
    const witness = {
      userSecret: secret,
      merkleProofPath: proof.path,
      merklePathIndices: proof.indices
    };

    // 3. Submit ZK proof to contract engine
    const result = engine.proveMembership(witness, "E2E_SALT");
    expect(result.success).toBe(true);
    expect(result.accessGranted).toBe(true);
    expect(result.txHash).toBeDefined();

    // 4. Verify public ledger state
    const ledger = engine.getLedgerState();
    expect(ledger.accessGranted).toBe(true);
    expect(ledger.nullifierHashes.has(result.nullifierHash)).toBe(true);
  });
});
