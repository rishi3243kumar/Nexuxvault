import { crypto } from './crypto_utils';

export interface LedgerState {
  allowlistRoot: string;
  nullifierHashes: Set<string>;
  accessGranted: boolean;
  totalMembersCount: number;
  lastUpdatedBlock: number;
}

export interface PrivateWitnesses {
  userSecret: string;
  merkleProofPath: string[];
  merklePathIndices: boolean[];
}

export interface ProofSubmissionResult {
  success: boolean;
  nullifierHash: string;
  accessGranted: boolean;
  txHash: string;
  blockHeight: number;
  error?: string;
}

export class MerkleTree {
  private depth: number;
  private leaves: string[];
  private layers: string[][];

  constructor(depth: number = 8) {
    this.depth = depth;
    this.leaves = [];
    this.layers = [];
    this.buildTree();
  }

  public addCommitment(commitment: string): number {
    const index = this.leaves.length;
    this.leaves.push(commitment);
    this.buildTree();
    return index;
  }

  public getRoot(): string {
    if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
      return crypto.hash('EMPTY_TREE_SEED');
    }
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(index: number): { path: string[]; indices: boolean[] } {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error(`Leaf index ${index} out of bounds`);
    }

    const path: string[] = [];
    const indices: boolean[] = [];
    let currIndex = index;

    for (let i = 0; i < this.depth; i++) {
      const layer = this.layers[i];
      const isRight = currIndex % 2 === 1;
      const siblingIndex = isRight ? currIndex - 1 : currIndex + 1;
      
      const siblingHash = siblingIndex < layer.length ? layer[siblingIndex] : crypto.hash(`ZERO_PADDING_LAYER_${i}`);
      
      path.push(siblingHash);
      indices.push(isRight);

      currIndex = Math.floor(currIndex / 2);
    }

    return { path, indices };
  }

  private buildTree(): void {
    const capacity = Math.pow(2, this.depth);
    const paddedLeaves = [...this.leaves];
    while (paddedLeaves.length < capacity) {
      paddedLeaves.push(crypto.hash(`ZERO_PADDING_LEAF_${paddedLeaves.length}`));
    }

    this.layers = [paddedLeaves];
    let currentLayer = paddedLeaves;

    for (let d = 0; d < this.depth; d++) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1];
        nextLayer.push(crypto.hashConcat(left, right));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getLeaves(): string[] {
    return [...this.leaves];
  }
}

/**
 * VeilPass Contract Engine simulating Midnight Ledger & Circuit execution
 */
export class VeilPassContractEngine {
  private state: LedgerState;
  private tree: MerkleTree;
  private currentBlock: number;

  constructor() {
    this.tree = new MerkleTree(8);
    this.currentBlock = 10428;
    this.state = {
      allowlistRoot: this.tree.getRoot(),
      nullifierHashes: new Set<string>(),
      accessGranted: false,
      totalMembersCount: 0,
      lastUpdatedBlock: this.currentBlock
    };
  }

  public registerMemberSecret(secret: string): { commitment: string; leafIndex: number } {
    const commitment = crypto.hashSecret(secret);
    const leafIndex = this.tree.addCommitment(commitment);
    this.state.allowlistRoot = this.tree.getRoot();
    this.state.totalMembersCount = this.tree.getLeaves().length;
    this.state.lastUpdatedBlock = ++this.currentBlock;
    return { commitment, leafIndex };
  }

  public updateAllowlistRootDirectly(newRoot: string, count: number): void {
    this.state.allowlistRoot = newRoot;
    this.state.totalMembersCount = count;
    this.state.lastUpdatedBlock = ++this.currentBlock;
  }

  public proveMembership(witnesses: PrivateWitnesses, rawNullifierSalt: string = "VEILPASS_SALT"): ProofSubmissionResult {
    this.currentBlock++;
    
    // 1. Verify commitment leaf
    const leafCommitment = crypto.hashSecret(witnesses.userSecret);

    // 2. Reconstruct root off-chain witness
    let currentHash = leafCommitment;
    for (let i = 0; i < witnesses.merkleProofPath.length; i++) {
      const sibling = witnesses.merkleProofPath[i];
      const isRight = witnesses.merklePathIndices[i];
      if (isRight) {
        currentHash = crypto.hashConcat(sibling, currentHash);
      } else {
        currentHash = crypto.hashConcat(currentHash, sibling);
      }
    }

    // 3. Root check
    if (currentHash !== this.state.allowlistRoot) {
      return {
        success: false,
        nullifierHash: '',
        accessGranted: false,
        txHash: `0x${crypto.hash(Date.now().toString()).substring(0, 16)}`,
        blockHeight: this.currentBlock,
        error: "ZK Proof Error: Calculated Merkle root does not match active ledger allowlist root."
      };
    }

    // 4. Compute nullifier hash
    const nullifierHash = crypto.hashNullifier(witnesses.userSecret, rawNullifierSalt);

    // 5. Double submit / replay check
    if (this.state.nullifierHashes.has(nullifierHash)) {
      return {
        success: false,
        nullifierHash,
        accessGranted: false,
        txHash: `0x${crypto.hash(Date.now().toString()).substring(0, 16)}`,
        blockHeight: this.currentBlock,
        error: "ZK Proof Error: Nullifier already submitted to ledger. Double-access attempt rejected."
      };
    }

    // 6. Update ledger
    this.state.nullifierHashes.add(nullifierHash);
    this.state.accessGranted = true;

    return {
      success: true,
      nullifierHash,
      accessGranted: true,
      txHash: `0x${crypto.hash(`tx_${Date.now()}_${Math.random()}`).substring(0, 24)}`,
      blockHeight: this.currentBlock
    };
  }

  public getLedgerState(): LedgerState {
    return {
      ...this.state,
      nullifierHashes: new Set(this.state.nullifierHashes)
    };
  }

  public getMerkleTree(): MerkleTree {
    return this.tree;
  }
}
