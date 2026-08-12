import React, { useState } from 'react';
import { ShieldAlert, Plus, CheckCircle, Copy, Hash, RefreshCw, KeyRound, Users, Layers } from 'lucide-react';
import { VeilPassContractEngine, LedgerState } from '../../contract/veilpass_api';
import { crypto } from '../../contract/crypto_utils';

interface AdminConsoleProps {
  engine: VeilPassContractEngine;
  ledgerState: LedgerState;
  onAllowlistUpdated: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ engine, ledgerState, onAllowlistUpdated }) => {
  const [newSecret, setNewSecret] = useState('');
  const [generatedCommitment, setGeneratedCommitment] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [memberList, setMemberList] = useState<{ secret: string; commitment: string; leafIndex: number }[]>([
    { secret: 'user_alpha_private_secret_99812', commitment: crypto.hashSecret('user_alpha_private_secret_99812'), leafIndex: 0 },
    { secret: 'user_beta_private_secret_44721', commitment: crypto.hashSecret('user_beta_private_secret_44721'), leafIndex: 1 }
  ]);

  const handleGenerateMemberPass = () => {
    const randomSecret = `veil_pass_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-4)}`;
    setNewSecret(randomSecret);
    const commitment = crypto.hashSecret(randomSecret);
    setGeneratedCommitment(commitment);
  };

  const handleAddMemberToAllowlist = async () => {
    if (!newSecret) return;
    setIsUpdating(true);
    await new Promise(r => setTimeout(r, 600));

    const { commitment, leafIndex } = engine.registerMemberSecret(newSecret);
    setMemberList(prev => [...prev, { secret: newSecret, commitment, leafIndex }]);

    setNewSecret('');
    setGeneratedCommitment(null);
    setIsUpdating(false);
    onAllowlistUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-veil-cyan/10 border border-veil-cyan/30 text-veil-cyan">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Admin Allowlist Management</h2>
            <p className="text-xs text-slate-400 font-mono">
              Manage member commitments and publish Merkle Tree roots to Midnight private state
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-midnight-900 border border-white/10">
            <span className="text-slate-400">Total Members: </span>
            <span className="text-veil-cyan font-bold">{ledgerState.totalMembersCount || memberList.length}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add Member Form */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Plus className="w-4 h-4 text-veil-cyan" /> Add New Member Commitment
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1.5 justify-between flex">
                <span>Member Secret Passphrase</span>
                <button
                  type="button"
                  onClick={handleGenerateMemberPass}
                  className="text-veil-cyan hover:underline text-[11px]"
                >
                  Generate Random Secret
                </button>
              </label>
              <input
                type="text"
                value={newSecret}
                onChange={(e) => {
                  setNewSecret(e.target.value);
                  if (e.target.value) setGeneratedCommitment(crypto.hashSecret(e.target.value));
                }}
                placeholder="Generate or input private member secret..."
                className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-veil-cyan"
              />
            </div>

            {generatedCommitment && (
              <div className="bg-midnight-950 p-3.5 rounded-xl border border-veil-cyan/20 space-y-1 text-xs font-mono">
                <span className="text-slate-400 text-[10px] uppercase">Derived Commitment Leaf (Hashed):</span>
                <div className="text-veil-cyan font-semibold truncate">{generatedCommitment}</div>
                <p className="text-[10px] text-slate-500">Only this commitment hash is added to the Merkle tree. Raw secret remains offline.</p>
              </div>
            )}

            <button
              onClick={handleAddMemberToAllowlist}
              disabled={!newSecret || isUpdating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-veil-cyan to-veil-blue text-midnight-950 font-bold text-xs uppercase tracking-wider shadow-glow-cyan hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Publish Commitment & Recalculate Merkle Root
            </button>
          </div>
        </div>

        {/* Ledger State & Active Root */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-veil-purple" /> Active On-Chain Merkle Root State
          </h3>

          <div className="bg-midnight-950 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block mb-1">On-Chain Allowlist Root:</span>
              <span className="text-veil-purple font-bold text-sm break-all">{ledgerState.allowlistRoot}</span>
            </div>

            <div className="flex justify-between border-t border-white/5 pt-2 text-slate-300">
              <span>Nullifier Entries Spent:</span>
              <span className="text-veil-cyan font-bold">{ledgerState.nullifierHashes.size}</span>
            </div>

            <div className="flex justify-between border-t border-white/5 pt-2 text-slate-300">
              <span>Public Access Status:</span>
              <span className={ledgerState.accessGranted ? "text-veil-emerald font-bold" : "text-slate-500"}>
                {ledgerState.accessGranted ? "accessGranted = TRUE" : "accessGranted = FALSE"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-mono block">Registered Allowlist Commitments ({memberList.length}):</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {memberList.map((m, idx) => (
                <div key={idx} className="p-2 rounded bg-midnight-950/70 border border-white/5 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-slate-300">Leaf #{m.leafIndex}:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{m.commitment}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
