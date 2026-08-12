import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MemberPortal } from './components/MemberPortal';
import { AdminConsole } from './components/AdminConsole';
import { PrivacyInspector } from './components/PrivacyInspector';
import { IndexerFeed } from './components/IndexerFeed';
import { ProposalViewer } from './components/ProposalViewer';
import { DemoScriptViewer } from './components/DemoScriptViewer';
import { VeilPassContractEngine, LedgerState, ProofSubmissionResult } from '../contract/veilpass_api';
import { KeyRound, ShieldCheck, Users, Server, FileText, Video, Lock, ExternalLink } from 'lucide-react';

const engine = new VeilPassContractEngine();

// Register initial sample member credentials
engine.registerMemberSecret('user_alpha_private_secret_99812');
engine.registerMemberSecret('user_beta_private_secret_44721');

export default function App() {
  const [activeTab, setActiveTab] = useState<'portal' | 'admin' | 'privacy' | 'indexer' | 'proposal' | 'script'>('portal');
  const [ledgerState, setLedgerState] = useState<LedgerState>(engine.getLedgerState());
  const [lastSubmittedProof, setLastSubmittedProof] = useState<ProofSubmissionResult | null>(null);

  const refreshState = () => {
    setLedgerState(engine.getLedgerState());
  };

  const handleProofSubmitted = (result: ProofSubmissionResult) => {
    setLastSubmittedProof(result);
    refreshState();
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col font-sans selection:bg-veil-cyan selection:text-midnight-950">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'portal'
                  ? 'bg-veil-cyan/15 border border-veil-cyan text-veil-cyan shadow-glow-cyan font-bold'
                  : 'bg-midnight-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" /> Member Portal
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'admin'
                  ? 'bg-veil-cyan/15 border border-veil-cyan text-veil-cyan shadow-glow-cyan font-bold'
                  : 'bg-midnight-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Admin Console
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'privacy'
                  ? 'bg-veil-cyan/15 border border-veil-cyan text-veil-cyan shadow-glow-cyan font-bold'
                  : 'bg-midnight-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Privacy Inspector
            </button>

            <button
              onClick={() => setActiveTab('indexer')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'indexer'
                  ? 'bg-veil-cyan/15 border border-veil-cyan text-veil-cyan shadow-glow-cyan font-bold'
                  : 'bg-midnight-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" /> Ledger Indexer
            </button>

            <button
              onClick={() => setActiveTab('proposal')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'proposal'
                  ? 'bg-veil-cyan/15 border border-veil-cyan text-veil-cyan shadow-glow-cyan font-bold'
                  : 'bg-midnight-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Product Proposal
            </button>

            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'script'
                  ? 'bg-veil-cyan/15 border border-veil-cyan text-veil-cyan shadow-glow-cyan font-bold'
                  : 'bg-midnight-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" /> Demo Script
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="space-y-6">
          {activeTab === 'portal' && (
            <MemberPortal engine={engine} onProofSubmitted={handleProofSubmitted} />
          )}

          {activeTab === 'admin' && (
            <AdminConsole engine={engine} ledgerState={ledgerState} onAllowlistUpdated={refreshState} />
          )}

          {activeTab === 'privacy' && (
            <PrivacyInspector />
          )}

          {activeTab === 'indexer' && (
            <IndexerFeed lastSubmittedProof={lastSubmittedProof} />
          )}

          {activeTab === 'proposal' && (
            <ProposalViewer />
          )}

          {activeTab === 'script' && (
            <DemoScriptViewer />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/10 py-6 mt-12 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-veil-cyan" />
            <span>VeilPass — Midnight Compact Hackathon Project</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Compact Language v0.14</span>
            <span>•</span>
            <span>Vitest (6/6 Passing)</span>
            <span>•</span>
            <a href="https://midnight.network" target="_blank" rel="noreferrer" className="text-veil-cyan hover:underline">
              Midnight Network Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
