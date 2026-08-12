import { describe, it, expect, beforeEach } from 'vitest';
import { VeilPassContractEngine, MerkleTree } from '../contract/veilpass_api';
import { crypto } from '../contract/crypto_utils';

describe('VeilPass Midnight Compact Circuit & Smart Contract Tests', () => {
  let engine: VeilPassContractEngine;
  const memberSecretA = "user_alpha_private_secret_99812";
  const memberSecretB = "user_beta_private_secret_44721";
  const nonMemberSecret = "unauthorized_imposter_secret_00000";

  let memberAIndex: number;
  let memberBIndex: number;

  beforeEach(() => {
    engine = new VeilPassContractEngine();
    // Register 2 initial allowlist members
    const memberA = engine.registerMemberSecret(memberSecretA);
    const memberB = engine.registerMemberSecret(memberSecretB);
    memberAIndex = memberA.leafIndex;
    memberBIndex = memberB.leafIndex;
  });

  it('(a) valid member proof succeeds and grants access on ledger', () => {
    const tree = engine.getMerkleTree();
    const proof = tree.getProof(memberAIndex);

    const witness = {
      userSecret: memberSecretA,
      merkleProofPath: proof.path,
      merklePathIndices: proof.indices
    };

    const result = engine.proveMembership(witness, "SESSION_SALT_1");

    expect(result.success).toBe(true);
    expect(result.accessGranted).toBe(true);
    expect(result.nullifierHash).toBeDefined();
    expect(result.nullifierHash.length).toBeGreaterThan(0);
    expect(result.error).toBeUndefined();

    const ledger = engine.getLedgerState();
    expect(ledger.accessGranted).toBe(true);
    expect(ledger.nullifierHashes.has(result.nullifierHash)).toBe(true);
  });

  it('(b) non-member proof fails ZK root verification', () => {
    const tree = engine.getMerkleTree();
    const proof = tree.getProof(memberAIndex); // Using member A's path with fake secret

    const invalidWitness = {
      userSecret: nonMemberSecret,
      merkleProofPath: proof.path,
      merklePathIndices: proof.indices
    };

    const result = engine.proveMembership(invalidWitness, "SESSION_SALT_1");

    expect(result.success).toBe(false);
    expect(result.accessGranted).toBe(false);
    expect(result.error).toContain('ZK Proof Error');
  });

  it('(c) privacy invariant: secret identity & commitment never appear in public ledger state', () => {
    const tree = engine.getMerkleTree();
    const proof = tree.getProof(memberBIndex);

    const witness = {
      userSecret: memberSecretB,
      merkleProofPath: proof.path,
      merklePathIndices: proof.indices
    };

    const result = engine.proveMembership(witness, "SESSION_SALT_2");
    expect(result.success).toBe(true);

    const ledger = engine.getLedgerState();
    const serializedLedger = JSON.stringify({
      allowlistRoot: ledger.allowlistRoot,
      nullifierHashes: Array.from(ledger.nullifierHashes),
      accessGranted: ledger.accessGranted,
      totalMembersCount: ledger.totalMembersCount
    });

    // Verify raw secret is NEVER in public ledger state
    expect(serializedLedger).not.toContain(memberSecretB);
    expect(serializedLedger).not.toContain("user_beta_private_secret_44721");
    
    // Verify leaf index is not stored in public ledger
    expect(serializedLedger).not.toContain(`"leafIndex":${memberBIndex}`);
    
    // Verify raw commitment leaf is not exposed directly in nullifier set
    const leafCommitment = crypto.hashSecret(memberSecretB);
    expect(ledger.nullifierHashes.has(leafCommitment)).toBe(false);
  });

  it('(d) double submission / nullifier reuse prevention', () => {
    const tree = engine.getMerkleTree();
    const proof = tree.getProof(memberAIndex);

    const witness = {
      userSecret: memberSecretA,
      merkleProofPath: proof.path,
      merklePathIndices: proof.indices
    };

    // First attempt succeeds
    const firstAttempt = engine.proveMembership(witness, "STATIC_SALT");
    expect(firstAttempt.success).toBe(true);

    // Second attempt with exact same nullifier salt fails
    const secondAttempt = engine.proveMembership(witness, "STATIC_SALT");
    expect(secondAttempt.success).toBe(false);
    expect(secondAttempt.error).toContain('Nullifier already submitted');
  });

  it('(e) admin allowlist tree update recalculates ledger root', () => {
    const initialLedger = engine.getLedgerState();
    const initialRoot = initialLedger.allowlistRoot;

    const newMemberSecret = "user_gamma_private_secret_77192";
    engine.registerMemberSecret(newMemberSecret);

    const updatedLedger = engine.getLedgerState();
    expect(updatedLedger.allowlistRoot).not.toBe(initialRoot);
    expect(updatedLedger.totalMembersCount).toBe(initialLedger.totalMembersCount + 1);
  });

  it('(f) Merkle tree integrity and proof path boundaries', () => {
    const tree = new MerkleTree(8);
    const secret = "test_boundary_secret";
    const commitment = crypto.hashSecret(secret);
    const idx = tree.addCommitment(commitment);

    const proof = tree.getProof(idx);
    expect(proof.path).toHaveLength(8);
    expect(proof.indices).toHaveLength(8);
    expect(tree.getRoot()).toBeDefined();
  });
});
