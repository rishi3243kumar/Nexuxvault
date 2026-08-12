# VeilPass — Private Allowlist Access Protocol on Midnight

[![CI/CD Pipeline](https://github.com/veilpass/veilpass/actions/workflows/ci.yml/badge.svg)](https://github.com/veilpass/veilpass/actions/workflows/ci.yml)
![Midnight Compact](https://img.shields.io/badge/Midnight-Compact_v0.14-00f2fe?style=flat-square)
![Vitest Passing](https://img.shields.io/badge/Tests-7%20Passing-00f5a0?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-7f00ff?style=flat-square)

---

## Overview

**VeilPass** is a privacy-preserving allowlist access dApp built on the **Midnight blockchain** using **Compact zero-knowledge smart contracts**. It allows users to prove membership in an admin-managed private allowlist without revealing their identity, raw wallet address, secret passphrase, or Merkle tree leaf index. This project was developed as a production-grade submission for the **Midnight "New Moon to Full" Level 3 (First Quarter)** developer hackathon.

---

## Problem Statement

Traditional token-gated community access, whitelist presales, and member-only dApps on public EVM blockchains force users to reveal their public wallet address (`msg.sender`) whenever proving eligibility. Publishing raw addresses or public Merkle tree leaf indices on-chain links user transaction histories across platforms, creating severe privacy violations. This exposes high-net-worth members, DAO delegates, and community contributors to targeted phishing, physical extortion, and unwanted surveillance.

---

## Solution

VeilPass fundamentally solves this issue by leveraging Midnight's dual-ledger state model and Compact Zero-Knowledge circuits. An administrator maintains a cryptographic Merkle root of hashed member commitments stored in Midnight's contract state. A user proves membership off-chain via a Compact circuit (`proveMembership`) using private witness inputs, emitting only a succinct Zero-Knowledge proof and single-use nullifier hash to the ledger. The contract verifies the proof and sets a public boolean (`accessGranted = true`) without ever storing or revealing the user's wallet address, identity, or allowlist entry position.

---

## Architecture

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|   React + TypeScript + Vite + Tailwind CSS ([src/App.tsx](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/src/App.tsx))           |
|   Connected to Midnight Lace Wallet / Sandbox ([src/services/midnightWallet.ts](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/src/services/midnightWallet.ts))|
+-----------------------------------------------------------------------------------+
                                         |
                   1. Private Witness Off-Chain Input
                                         v
+-----------------------------------------------------------------------------------+
|                                COMPACT ZK PROVER                                  |
|   Circuit: proveMembership(secret, merklePath, pathIndices)                       |
|   Code: [contract/veilpass.compact](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/contract/veilpass.compact)                          |
|   - Computes H(secret) leaf commitment                                            |
|   - Reconstructs Merkle root & asserts match with ledger root                     |
|   - Computes unique single-use nullifier H(secret + salt)                         |
+-----------------------------------------------------------------------------------+
                                         |
                   2. Succinct Zero-Knowledge Proof Payload
                                         v
+-----------------------------------------------------------------------------------+
|                             MIDNIGHT BLOCKCHAIN LEDGER                            |
|   Engine: [contract/veilpass_api.ts](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/contract/veilpass_api.ts)                       |
|   On-Chain State:                                                                 |
|   - allowlistRoot: Bytes<32>                                                      |
|   - nullifierHashes: Map<Bytes<32>, Boolean>                                      |
|   - accessGranted: Boolean (Public Output: TRUE with zero identity leakage)       |
+-----------------------------------------------------------------------------------+
                                         |
                   3. Public Ledger Event Stream
                                         v
+-----------------------------------------------------------------------------------+
|                              NODE.JS EVENT INDEXER                                |
|   Express REST API Server ([indexer/server.js](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/indexer/server.js))                  |
|   Watches ledger events & exposes anonymous status feed at /api/verifications     |
+-----------------------------------------------------------------------------------+
```

### Component Details
- **Frontend App (`/src`)**: Built with React 18, TypeScript, Vite, and Tailwind CSS. Interfaces with the Lace wallet service ([src/services/midnightWallet.ts](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/src/services/midnightWallet.ts)) and renders the Member Portal, Admin Console, and Privacy Auditor UI.
- **Compact Contract & Circuits (`/contract`)**: Written in Midnight's Compact language ([contract/veilpass.compact](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/contract/veilpass.compact)). Features private witness circuits for `proveMembership` and ledger state management for `allowlistRoot` and `nullifierHashes`.
- **Contract Engine & Crypto Helpers (`contract/veilpass_api.ts`, `contract/crypto_utils.ts`)**: TypeScript bindings managing 8-layer Merkle tree construction, leaf hashing, and proof simulation.
- **Node.js Ledger Indexer (`/indexer`)**: Express backend service ([indexer/server.js](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/indexer/server.js)) monitoring state changes and serving REST API verification metrics.

---

## 🔒 Privacy Model

The table below details the precise public vs. private state guarantees enforced by Midnight's Compact circuit:

```
┌─────────────────────────────────────────────────────────┐
│                 OBSERVER PRIVACY MATRIX                 │
├────────────────────────────┬────────────────────────────┤
│    PUBLIC LEDGER SEES      │  PUBLIC LEDGER CANNOT SEE  │
├────────────────────────────┼────────────────────────────┤
│ 🟢 accessGranted = true    │ 🛑 Member Wallet Address   │
│ 🟢 Allowlist Merkle Root   │ 🛑 Raw Member Identity     │
│ 🟢 Nullifier Hash (Replay) │ 🛑 Secret Passphrase       │
│ 🟢 Total Member Count      │ 🛑 Merkle Tree Leaf Index  │
│ 🟢 Block Timestamp & TxHash│ 🛑 Linkability Across Proofs│
└────────────────────────────┴────────────────────────────┘
```

### What an observer CAN see:
1. **`accessGranted` Boolean Output**: A public ledger flag confirming that a legitimate, allowlisted member successfully executed a valid ZK proof.
2. **`allowlistRoot`**: The active 32-byte Merkle root commitment representing the set of allowed members.
3. **`nullifierHash`**: A single-use derived hash recorded on-chain to prevent double-submission or replay attacks.
4. **`totalMembersCount`**: The total count of commitments registered by the contract administrator.
5. **Transaction Hash & Block Height**: Standard transaction metadata indicating *when* a proof was verified.

### What an observer CANNOT see:
1. **Which specific member proved access**: The identity of the prover remains 100% concealed.
2. **The member's wallet address or public key**: No connection exists on-chain between `msg.sender` / caller and the allowlist entry.
3. **The member's secret key or raw passphrase**: Secret inputs remain strictly inside private off-chain witness memory.
4. **The Merkle tree leaf index**: The position of the member's commitment within the tree is masked inside the ZK proof.
5. **Cross-transaction linkability**: Session nullifier salts prevent tracking or linking multiple proof submissions from the same user.

> **Contrast with EVM**: Unlike standard EVM allowlists where user addresses are publicly visible in contract mappings or Merkle proof calldata, VeilPass proves membership with **zero identity exposure**.

---

## 📸 Screenshots & Visual Verification

### 1. dApp Interface & ZK Member Portal Design
![dApp Interface & Design Screenshot](./docs/assets/dapp_interface_screenshot.png)
*Figure 1: VeilPass dark glassmorphic user interface featuring Lace Wallet connection, off-chain ZK witness proof generator, Admin Allowlist Console, and Privacy Auditor.*

### 2. Test Output Verification (7 Passing Tests)
![Vitest Output Screenshot](./docs/assets/test_output_screenshot.png)
*Figure 2: Vitest test suite log demonstrating 7/7 passing unit & integration tests (valid member proof, non-member rejection, nullifier reuse prevention, and identity confidentiality invariants).*

### 3. CI/CD GitHub Actions Workflow Pipeline
![CI/CD Workflow Status Screenshot](./docs/assets/cicd_workflow_screenshot.png)
*Figure 3: GitHub Actions workflow execution showing automated dependency installation, Compact circuit compilation, and full test suite verification on every push/PR.*

---

## Tech Stack

- **Smart Contract Language**: Midnight Compact (`pragma language_version >= 0.14.0`)
- **Midnight SDK & Packages**:
  - `@midnight-ntwrk/compact-runtime` (^0.7.0)
  - `@midnight-ntwrk/ledger` (^0.7.0)
  - `@midnight-ntwrk/midnight-js-contracts` (^0.7.0)
  - `@midnight-ntwrk/midnight-js-types` (^0.7.0)
- **Frontend**: React 18.3, TypeScript 5.4, Vite 5.2, Tailwind CSS 3.4, Lucide React icons
- **Backend / Indexer**: Express 4.19, CORS 2.8, Node.js 20
- **Testing Framework**: Vitest 1.6
- **CI/CD Automation**: GitHub Actions (`.github/workflows/ci.yml`)

---

## Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### Local Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/veilpass/veilpass.git
cd veilpass

# 2. Install project dependencies
npm install

# 3. Compile Midnight Compact circuits
npm run compile:contract

# 4. Start the Vite frontend development server
npm run dev

# 5. Start the Node.js event indexer service (in a separate terminal)
npm run indexer
```

Open your browser and navigate to `http://localhost:3000`.

---

## Running Tests

VeilPass includes 7 unit and integration tests written in Vitest covering circuit logic, root verification, privacy constraints, and indexer integration.

Execute the full test suite with:

```bash
npm test
```

### Test Output Log

```text
 RUN  v1.6.1 C:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass

 ✓ tests/integration.test.ts (1 test) 9ms
   ✓ validates complete off-chain witness generation to on-chain indexer record flow
 ✓ tests/veilpass.test.ts (6 tests) 31ms
   ✓ (a) valid member proof succeeds and grants access on ledger
   ✓ (b) non-member proof fails ZK root verification
   ✓ (c) privacy invariant: secret identity & commitment never appear in public ledger state
   ✓ (d) double submission / nullifier reuse prevention
   ✓ (e) admin allowlist tree update recalculates ledger root
   ✓ (f) Merkle tree integrity and proof path boundaries

 Test Files  2 passed (2)
      Tests  7 passed (7)
   Duration  1.33s
```

---

## CI/CD Pipeline

The repository uses GitHub Actions configured in [.github/workflows/ci.yml](file:///c:/Users/hp/Desktop/Moon/rishigshshshsh/VeilPass/.github/workflows/ci.yml). 

On every `push` or `pull_request` to `main` or `master`, the workflow automatically:
1. Checks out source code and initializes Node.js 20 environment with npm caching.
2. Installs dependencies (`npm ci`).
3. Compiles Compact smart contract circuits (`npm run compile:contract`).
4. Executes the full Vitest unit & integration test suite (`npm test`).
5. Verifies the production build bundle (`npm run build`).

The passing status badge at the top of this README dynamically reflects the latest workflow run state.

---

## Live Demo

🔗 Live demo: [ADD LINK AFTER DEPLOYMENT]

*(Note: Target contract deployed to Midnight Testnet / Simulated Local Sandbox environment).*

---

## Demo Video

🎥 Demo video (1 min): [ADD LINK AFTER RECORDING]

*(Includes walkthrough of Lace Wallet connection, off-chain ZK witness proof generation, `accessGranted` ledger confirmation, and privacy inspector audit).*

---

## Project Structure

```
VeilPass/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD workflow
├── contract/
│   ├── veilpass.compact           # Midnight Compact ZK membership proof circuit
│   ├── veilpass_api.ts            # Contract state engine & Merkle tree manager
│   └── crypto_utils.ts            # Deterministic hash & commitment helpers
├── docs/
│   └── assets/                    # Screenshots for dApp design, tests, and CI/CD workflow
├── indexer/
│   └── server.js                  # Express REST API watching Midnight ledger events
├── src/
│   ├── components/                # MemberPortal, AdminConsole, PrivacyInspector, IndexerFeed, etc.
│   ├── services/                  # Midnight Lace Wallet integration service
│   ├── types/                     # Ambient Midnight TypeScript declarations
│   ├── App.tsx                    # Main React dApp layout & tab navigation
│   └── index.css                  # Dark glassmorphic design system tokens
├── tests/
│   ├── veilpass.test.ts           # Vitest contract & privacy unit tests (6 tests)
│   └── integration.test.ts        # Vitest client-to-indexer integration test (1 test)
├── PROPOSAL.md                    # Official Level 3 product proposal document
└── README.md                      # Complete project documentation & privacy matrix
```

---

## Idea Submission

This project was submitted and approved under the **"Private Allowlist Access — prove membership without revealing identity"** category from the official Midnight hackathon idea list.

---

## License

This project is licensed under the [MIT License](./LICENSE).
