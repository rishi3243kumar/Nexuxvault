# VeilPass — Private Allowlist Access Protocol on Midnight

![CI/CD Pipeline](https://github.com/veilpass/veilpass/actions/workflows/ci.yml/badge.svg)
![Midnight Compact](https://img.shields.io/badge/Midnight-Compact_v0.14-00f2fe?style=flat-square)
![Vitest Passing](https://img.shields.io/badge/Tests-6%20Passing-00f5a0?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-7f00ff?style=flat-square)

> **VeilPass** is a production-grade dApp built on the **Midnight blockchain** enabling privacy-preserving membership verification. Members prove they belong to an admin-managed allowlist without revealing their identity, wallet address, raw secret, or position in the allowlist.

---

## 🚀 Live Demo & Links
- **Web App Demo**: [https://veilpass.vercel.app](https://veilpass.vercel.app) *(Note: Contract target is Midnight Testnet / Sandbox)*
- **Product Proposal**: Read [PROPOSAL.md](./PROPOSAL.md)

---

## 🔒 Privacy Model: EVM vs. Midnight VeilPass

In traditional EVM smart contracts, gated access requires public mapping checks or on-chain Merkle proofs where `msg.sender` is permanently bound to the member identity. 

**VeilPass leverages Midnight’s dual public/private state model and Compact ZK circuits to achieve total privacy.**

```
       ┌────────────────────────────────────────────────────────┐
       │                OBSERVER PRIVACY MATRIX                │
       ├───────────────────────────┬────────────────────────────┤
       │   PUBLIC LEDGER SEES      │   PUBLIC LEDGER CANNOT SEE │
       ├───────────────────────────┼────────────────────────────┤
       │ 🟢 accessGranted = true   │ 🛑 Member Wallet Address   │
       │ 🟢 Allowlist Merkle Root  │ 🛑 Raw Member Identity     │
       │ 🟢 Nullifier Hash (Replay)│ 🛑 Secret Passphrase       │
       │ 🟢 Total Member Count     │ 🛑 Merkle Tree Leaf Index  │
       │ 🟢 Block Timestamp        │ 🛑 Timing/Identity Linkage │
       └───────────────────────────┴────────────────────────────┘
```

### An observer of the public ledger CAN see:
1. `accessGranted`: A boolean state indicating that a legitimate allowlist member proved valid membership.
2. `allowlistRoot`: A 32-byte cryptographic Merkle root commitment representing the full set of member commitments.
3. `nullifierHash`: A unique single-use hash derived off-chain to prevent double-access replay attacks.
4. `totalMembersCount`: The total count of registered commitments.
5. Transaction execution block height and timestamp.

### An observer CANNOT see:
1. **Which member proved access**: The identity of the prover remains completely concealed.
2. **The member's wallet address or public key**: No linkage exists between the transaction caller and the allowlist entry.
3. **The member's secret key or raw passphrase**: Secret inputs stay strictly inside private witness memory.
4. **The Merkle tree leaf index**: The specific position within the allowlist is hidden inside the ZK proof.
5. **Correlation across multiple accesses**: Different session nullifier salts prevent cross-transaction tracking of the same member.

---

## 🏗️ Architecture Diagram

```
+-----------------------------------------------------------------------------+
|                               FRONTEND DAPP                                 |
|  [React + Vite + Tailwind] <---> [Midnight Lace Wallet Extension / Sandbox] |
+-----------------------------------------------------------------------------+
                                       |
                   1. Private Witness Off-Chain Input
                                       v
+-----------------------------------------------------------------------------+
|                            COMPACT ZK PROVER                                |
|  Circuit: proveMembership(secret, merklePath, pathIndices)                   |
|  - Computes H(secret) leaf commitment                                        |
|  - Reconstructs Merkle root & verifies match against on-chain root           |
|  - Derives single-use nullifier H(secret + salt)                           |
+-----------------------------------------------------------------------------+
                                       |
                   2. Succinct Zero-Knowledge Proof
                                       v
+-----------------------------------------------------------------------------+
|                         MIDNIGHT BLOCKCHAIN LEDGER                          |
|  Contract State:                                                            |
|  - allowlistRoot: Bytes<32>                                                 |
|  - nullifierHashes: Map<Bytes<32>, Boolean>                                 |
|  - accessGranted: Boolean (Output: TRUE with zero identity leakage)         |
+-----------------------------------------------------------------------------+
                                       |
                   3. Public Ledger Event Stream
                                       v
+-----------------------------------------------------------------------------+
|                           NODE.JS EVENT INDEXER                             |
|  Express REST API (/api/verifications) serving anonymous status feed        |
+-----------------------------------------------------------------------------+
```

---

## 🧪 Test Suite & Verification Output

VeilPass includes 6 unit and integration tests written in Vitest covering circuits, contracts, replay protection, and privacy invariants.

```bash
 RUN  v1.6.1 C:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass

 ✓ tests/veilpass.test.ts (6 tests) 16ms
   ✓ (a) valid member proof succeeds and grants access on ledger
   ✓ (b) non-member proof fails ZK root verification
   ✓ (c) privacy invariant: secret identity & commitment never appear in public ledger state
   ✓ (d) double submission / nullifier reuse prevention
   ✓ (e) admin allowlist tree update recalculates ledger root
   ✓ (f) Merkle tree integrity and proof path boundaries

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  17:41:51
   Duration  16.80s
```

---

## 🎬 1-Minute Video Demo Script & Outline

- **[0:00 - 0:12] Introduction**: "Welcome to VeilPass — Private Allowlist Access powered by Midnight smart contracts and Compact ZK circuits."
- **[0:12 - 0:25] Lace Wallet Connection**: Click "Connect Lace Wallet". Show Midnight Testnet active network status.
- **[0:25 - 0:42] Proof Generation & Submission**: Select "Alpha Member Pass". Click "Generate ZK Proof". Watch live execution steps: witness setup → Merkle root reconstruction → Compact proof generation → ledger broadcast.
- **[0:42 - 0:55] Ledger Verification Result**: Show on-chain confirmation `accessGranted = TRUE`. Switch to Privacy Inspector & Indexer Feed to demonstrate zero raw address or identity exposure on-chain.
- **[0:55 - 1:00] Conclusion**: "VeilPass proves membership with zero identity leakage on Midnight."

---

## 🛠️ Local Installation & Setup

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/veilpass/veilpass.git
cd veilpass

# 2. Install dependencies
npm install

# 3. Compile Compact smart contracts
npm run compile:contract

# 4. Run test suite
npm test

# 5. Launch frontend dev server
npm run dev

# 6. Launch indexer backend service (optional)
npm run indexer
```

Open `http://localhost:3000` in your browser.

---

## 📂 Project Structure

```
VeilPass/
├── .github/workflows/
│   └── ci.yml             # GitHub Actions CI workflow
├── contract/
│   ├── veilpass.compact   # Compact ZK membership proof circuit
│   ├── veilpass_api.ts    # Contract engine & Merkle tree logic
│   └── crypto_utils.ts    # Deterministic cryptographic helpers
├── indexer/
│   └── server.js          # Express event indexer REST API
├── src/
│   ├── components/        # MemberPortal, AdminConsole, PrivacyInspector, IndexerFeed
│   ├── services/          # Midnight Lace Wallet integration
│   ├── types/             # Ambient Midnight TypeScript declarations
│   ├── App.tsx            # Main application component
│   └── index.css          # Dark glassmorphic styling tokens
├── tests/
│   └── veilpass.test.ts   # Vitest unit test suite (6 passing tests)
├── PROPOSAL.md            # Product proposal document
└── README.md              # Documentation & Privacy Model
```

---

## 📄 License
Licensed under the [MIT License](./LICENSE).
