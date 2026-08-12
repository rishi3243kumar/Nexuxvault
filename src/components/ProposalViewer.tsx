import React from 'react';
import { FileText, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProposalViewer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-veil-cyan/10 text-veil-cyan border border-veil-cyan/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Product Proposal (PROPOSAL.md)</h2>
            <p className="text-xs text-slate-400 font-mono">
              Official Hackathon Submission Product & Privacy Rationale
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-veil-cyan font-mono flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs bg-veil-cyan/10 text-veil-cyan rounded">1</span> Problem Statement
          </h3>
          <p className="bg-midnight-950 p-4 rounded-xl border border-white/5 font-mono text-xs">
            Traditional token-gated community access, whitelist presales, and member-only features on public EVM blockchains force users to expose their raw public wallet address and transaction history whenever proving membership. This lack of privacy exposes high-net-worth members, DAO contributors, and community delegates to targeted phishing, physical security risks, cross-dApp activity profiling, and unwanted surveillance whenever they interact with gated platforms.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-veil-blue font-mono flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs bg-veil-blue/10 text-veil-blue rounded">2</span> Proposed Solution
          </h3>
          <p className="bg-midnight-950 p-4 rounded-xl border border-white/5 font-mono text-xs">
            VeilPass solves this fundamentally by implementing a Zero-Knowledge Private Allowlist Access Protocol on the Midnight blockchain. An administrator stores a cryptographic Merkle root of hashed member commitments in Midnight's state. When a user wishes to unlock gated access, they generate an off-chain Zero-Knowledge proof via a Compact circuit proving they possess a secret key matching a leaf in the allowlist Merkle tree. The contract verifies the proof, checks a unique nullifier hash to prevent double-access replays, and updates a public ledger boolean (`accessGranted = true`) without ever revealing which identity proved access or exposing the member's wallet address.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-veil-emerald font-mono flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs bg-veil-emerald/10 text-veil-emerald rounded">3</span> Why Midnight's Privacy Model is Essential
          </h3>
          <p className="bg-midnight-950 p-4 rounded-xl border border-white/5 font-mono text-xs">
            On standard EVM blockchains, allowlists require published mapping arrays or public Merkle proofs where submitting a transaction explicitly ties the sender's address (`msg.sender`) to the specific leaf index on-chain. Midnight's dual ledger architecture with Compact smart contracts is indispensable for VeilPass because it natively decouples private witness inputs (the member's secret key and Merkle path) from the public on-chain ledger state. Midnight allows execution of private circuits off-chain, outputting only a succinct ZK proof and non-linkable nullifier hash to the ledger. This guarantees complete selective disclosure: the public ledger verifies *that* a legitimate member proved access, while ensuring an observer CANNOT discern *who* accessed the system, what their address is, or which allowlist entry was used.
          </p>
        </section>
      </div>
    </div>
  );
};
