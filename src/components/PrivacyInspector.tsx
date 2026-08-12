import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, XCircle, ArrowRight, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

export const PrivacyInspector: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-veil-cyan" /> Privacy Model & On-Chain Audit Inspector
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Side-by-side comparison of public ledger state on EVM vs. NEXUS VAULT ZK Compact
          </p>
        </div>
      </div>

      {/* Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EVM Public Model */}
        <div className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-bold text-red-200">Standard EVM Allowlist</h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-red-500/20 text-red-300">
              100% Identity Leaked
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-midnight-950/90 border border-red-500/20 space-y-1">
              <div className="flex justify-between text-red-400">
                <span>Transaction Sender (msg.sender):</span>
                <XCircle className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-400 truncate">0x71C765...8976F (EXPOSED PUBLICLY)</p>
            </div>

            <div className="p-3 rounded-xl bg-midnight-950/90 border border-red-500/20 space-y-1">
              <div className="flex justify-between text-red-400">
                <span>On-Chain Merkle Proof:</span>
                <XCircle className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-400">Public Array [hash1, hash2] published in calldata</p>
            </div>

            <div className="p-3 rounded-xl bg-midnight-950/90 border border-red-500/20 space-y-1">
              <div className="flex justify-between text-red-400">
                <span>Vulnerability Profile:</span>
                <XCircle className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-400">Targeted phishing, physical threats, dApp activity tracking.</p>
            </div>
          </div>
        </div>

        {/* NEXUS VAULT ZK Model */}
        <div className="glass-card p-6 rounded-2xl border border-veil-emerald/30 bg-veil-emerald/5 space-y-4 shadow-glow-emerald">
          <div className="flex items-center justify-between border-b border-veil-emerald/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-veil-emerald" />
              <h3 className="text-sm font-bold text-veil-emerald">NEXUS VAULT Midnight ZK</h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-veil-emerald/20 text-veil-emerald font-bold">
              0% Identity Leaked
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-midnight-950/90 border border-veil-emerald/20 space-y-1">
              <div className="flex justify-between text-veil-emerald font-bold">
                <span>Transaction Prover Identity:</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-300">SHIELDED (Off-chain witness via Compact prover)</p>
            </div>

            <div className="p-3 rounded-xl bg-midnight-950/90 border border-veil-emerald/20 space-y-1">
              <div className="flex justify-between text-veil-emerald font-bold">
                <span>Public Ledger State:</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-300">accessGranted = TRUE | Nullifier recorded</p>
            </div>

            <div className="p-3 rounded-xl bg-midnight-950/90 border border-veil-emerald/20 space-y-1">
              <div className="flex justify-between text-veil-emerald font-bold">
                <span>Security Invariant:</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-300">Observer sees THAT access was granted, never WHO accessed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
