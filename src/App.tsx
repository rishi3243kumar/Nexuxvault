import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Terminal, 
  Cpu, 
  EyeOff, 
  RefreshCw, 
  Users, 
  KeyRound, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Server, 
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  Wallet,
  X,
  ExternalLink
} from 'lucide-react';
import { VeilPassContractEngine, LedgerState, ProofSubmissionResult } from '../contract/veilpass_api';
import { midnightWallet, WalletState } from './services/midnightWallet';
import { crypto } from '../contract/crypto_utils';

const engine = new VeilPassContractEngine();
engine.registerMemberSecret('nexus_alpha_secret_pass_99812');
engine.registerMemberSecret('nexus_beta_secret_pass_44721');

export default function App() {
  const [activeTab, setActiveTab] = useState('portal');
  const [walletState, setWalletState] = useState<WalletState>(midnightWallet.getState());
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Member Form State
  const [secretPassphrase, setSecretPassphrase] = useState('nexus_alpha_secret_pass_99812');
  const [sessionSalt, setSessionSalt] = useState('SESSION_SALT_2026');
  const [isProving, setIsProving] = useState(false);
  
  // Console & Ledger State
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] NEXUS VAULT Kernel v2.0 Initialized',
    '[NETWORK] Connected to Midnight Shielded Testnet',
    '[STATUS] Compact ZK Prover Engine Ready'
  ]);
  const [securityGranted, setSecurityGranted] = useState(false);
  const [lastResult, setLastResult] = useState<ProofSubmissionResult | null>(null);

  // Command Center (Admin) State
  const [newMemberSecret, setNewMemberSecret] = useState('');
  const [ledgerState, setLedgerState] = useState<LedgerState>(engine.getLedgerState());

  useEffect(() => {
    return midnightWallet.subscribe(setWalletState);
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleWalletClick = () => {
    if (walletState.isConnected) {
      midnightWallet.disconnect();
      addLog('Wallet disconnected');
    } else {
      midnightWallet.checkAvailability();
      setShowWalletModal(true);
    }
  };

  const connectSelectedWallet = async (walletType: 'freighter' | 'lace' | 'sandbox') => {
    setIsWalletConnecting(true);
    setShowWalletModal(false);

    try {
      if (walletType === 'freighter') {
        addLog('Triggering Freighter Wallet extension popup authorization...');
        const state = await midnightWallet.connectFreighter();
        addLog(`Connected via ${state.walletName}: ${state.address}`);
      } else if (walletType === 'lace') {
        addLog('Triggering Midnight Lace Wallet extension authorization...');
        const state = await midnightWallet.connectLace();
        addLog(`Connected via ${state.walletName}: ${state.address}`);
      } else {
        const state = midnightWallet.connectSandbox();
        addLog(`Connected in Midnight Testnet Sandbox Mode: ${state.address}`);
      }
    } finally {
      setIsWalletConnecting(false);
    }
  };

  const handleSelectDemoKey = (keyType: string) => {
    if (keyType === 'alpha') {
      setSecretPassphrase('nexus_alpha_secret_pass_99812');
    } else if (keyType === 'beta') {
      setSecretPassphrase('nexus_beta_secret_pass_44721');
    } else {
      setSecretPassphrase('unauthorized_imposter_key_00000');
    }
  };

  const handleGenerateProof = async () => {
    if (!secretPassphrase.trim()) return;

    setIsProving(true);
    setSecurityGranted(false);
    addLog('Initiating Compact ZK Proof Circuit Execution...');

    await new Promise((r) => setTimeout(r, 500));
    addLog(`Computing Leaf Hash: H("${secretPassphrase.slice(0, 6)}...")`);

    const tree = engine.getMerkleTree();
    const commitment = crypto.hashSecret(secretPassphrase);
    const leaves = tree.getLeaves();
    const leafIndex = leaves.indexOf(commitment);

    await new Promise((r) => setTimeout(r, 600));
    addLog('Fetching active Merkle Root from Midnight Ledger...');

    let proofPath: string[];
    let proofIndices: boolean[];

    if (leafIndex !== -1) {
      const proof = tree.getProof(leafIndex);
      proofPath = proof.path;
      proofIndices = proof.indices;
      addLog(`Constructed Merkle Witness for leaf #${leafIndex}`);
    } else {
      const proof = tree.getProof(0);
      proofPath = proof.path;
      proofIndices = proof.indices;
      addLog('⚠️ Commitment not in tree. Constructing test witness...');
    }

    await new Promise((r) => setTimeout(r, 700));
    addLog('Executing proveMembership() Compact Circuit off-chain...');

    const witness = {
      userSecret: secretPassphrase,
      merkleProofPath: proofPath,
      merklePathIndices: proofIndices
    };

    const result = engine.proveMembership(witness, sessionSalt);
    setLastResult(result);
    setLedgerState(engine.getLedgerState());

    if (result.success) {
      setSecurityGranted(true);
      addLog(`✅ ZK Proof verified! accessGranted = TRUE`);
      addLog(`Nullifier Hash: ${result.nullifierHash}`);
      addLog(`Confirmed in Block #${result.blockHeight}`);
      addLog('🔒 100% ANONYMOUS: Zero identity leaked on ledger');
    } else {
      setSecurityGranted(false);
      addLog(`❌ ERROR: ${result.error}`);
    }

    setIsProving(false);
  };

  const handleAddMember = () => {
    if (!newMemberSecret.trim()) return;
    const { commitment, leafIndex } = engine.registerMemberSecret(newMemberSecret);
    setLedgerState(engine.getLedgerState());
    setNewMemberSecret('');
    addLog(`New commitment added to Merkle Tree at index #${leafIndex}`);
  };

  return (
    <div className="min-h-screen bg-[#020204] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      
      {/* Background FX: Rotating Ring + Grid + Radial Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Animated Rotating Ring */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-cyan-500/10 opacity-30 blur-2xl animate-[spin_60s_linear_infinite]" />
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full border border-purple-500/10 opacity-20 blur-3xl animate-[spin_90s_linear_infinite_reverse]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Sticky Header */}
        <header className="sticky top-4 z-50 my-4 rounded-3xl bg-[#080b14]/70 backdrop-blur-2xl border border-white/10 p-4 shadow-2xl transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Shield className="w-6 h-6 text-black stroke-[2.5]" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
                  NEXUS VAULT
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                  ZERO KNOWLEDGE PROTOCOL v2.0
                </p>
              </div>
            </div>

            {/* Right Header Status */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Mainnet Ready
              </div>

              <button
                onClick={handleWalletClick}
                disabled={isWalletConnecting}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {walletState.isConnected ? (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    {walletState.address ? `${walletState.address.substring(0, 10)}...` : 'Connected'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-black" />
                    {isWalletConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 4 Glass Pill Tabs */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'portal', label: 'Access Portal', icon: KeyRound },
              { id: 'command', label: 'Command Center', icon: Users },
              { id: 'privacy', label: 'Privacy Audit', icon: ShieldCheck },
              { id: 'ledger', label: 'On-Chain Ledger', icon: Server }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-bold'
                      : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-emerald-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            100% Anonymous • Zero Data Leakage
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold font-['Space_Grotesk'] tracking-tight"
          >
            Prove Access.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Reveal Nothing.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-sans"
          >
            Execute off-chain Compact Zero-Knowledge circuits to prove allowlist membership without disclosing your identity, address, or secret passphrase.
          </motion.p>
        </section>

        {/* Main View Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'portal' && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column 2/3: Generate Access Proof Card */}
              <div className="lg:col-span-8 group rounded-3xl bg-[#080b14]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-300">
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                        Generate Access Proof
                      </h2>
                      <p className="text-xs text-slate-400 font-mono">
                        Compact ZK Witness Constructor
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Demo Key Buttons */}
                <div className="space-y-2 mb-6">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Select Demo Credentials:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'alpha', label: 'Alpha Key (Valid)', secret: 'nexus_alpha_secret_pass_99812' },
                      { id: 'beta', label: 'Beta Key (Valid)', secret: 'nexus_beta_secret_pass_44721' },
                      { id: 'invalid', label: 'Invalid Key (Fails)', secret: 'unauthorized_imposter_key_00000' }
                    ].map((keyItem) => (
                      <button
                        key={keyItem.id}
                        type="button"
                        onClick={() => handleSelectDemoKey(keyItem.id)}
                        className={`p-3 rounded-2xl text-xs font-mono text-left transition-all border ${
                          secretPassphrase === keyItem.secret
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold">{keyItem.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4 mb-6">
                  {/* Input 1: Secret Passphrase */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono text-slate-300">Secret Passphrase</label>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
                        Stored Locally
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={secretPassphrase}
                        onChange={(e) => setSecretPassphrase(e.target.value)}
                        placeholder="Enter secret passphrase..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                      <EyeOff className="w-4 h-4 text-slate-500 absolute right-4 top-4" />
                    </div>
                  </div>

                  {/* Input 2: Session Salt */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono text-slate-300">Session Salt</label>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-mono">
                        Anti-Replay
                      </span>
                    </div>
                    <input
                      type="text"
                      value={sessionSalt}
                      onChange={(e) => setSessionSalt(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Big CTA Button with Shine & Loading */}
                <button
                  type="button"
                  onClick={handleGenerateProof}
                  disabled={isProving}
                  className="relative overflow-hidden w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-black font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.7)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_2s_infinite]" />
                  <span className="relative z-10 flex items-center gap-2">
                    {isProving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-black" />
                        COMPUTING ZK PROOF...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 fill-black text-black" />
                        GENERATE & SUBMIT PROOF
                      </>
                    )}
                  </span>
                </button>

              </div>

              {/* Right Column 1/3: System Console Card */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Terminal Log Box */}
                <div className="rounded-3xl bg-[#05070f] border border-white/10 p-5 shadow-2xl space-y-3 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      System Console
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="h-64 overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-300 pr-1">
                    {logs.map((log, index) => (
                      <div key={index} className="leading-snug break-all border-b border-white/[0.02] pb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Status Box */}
                <div className={`rounded-3xl p-5 border transition-all duration-300 ${
                  securityGranted
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-6 h-6 ${securityGranted ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <h4 className="text-sm font-bold font-['Space_Grotesk'] text-white">
                        {securityGranted ? 'Access Granted' : 'Verification Standby'}
                      </h4>
                      <p className="text-xs font-mono text-slate-400">
                        {securityGranted ? 'ZK Proof Validated On-Chain' : 'Awaiting Proof Execution'}
                      </p>
                    </div>
                  </div>

                  {securityGranted && lastResult && (
                    <div className="mt-4 pt-3 border-t border-emerald-500/20 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-emerald-400 font-bold">accessGranted = TRUE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nullifier:</span>
                        <span className="text-slate-200 truncate max-w-[140px]">{lastResult.nullifierHash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Block Height:</span>
                        <span className="text-slate-200">#{lastResult.blockHeight}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* Command Center (Admin) */}
          {activeTab === 'command' && (
            <motion.div
              key="command"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-6 rounded-3xl bg-[#080b14]/80 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-300 space-y-5">
                <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> Member Commitment Registration
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">New Member Secret</label>
                    <input
                      type="text"
                      value={newMemberSecret}
                      onChange={(e) => setNewMemberSecret(e.target.value)}
                      placeholder="Input passphrase..."
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={handleAddMember}
                    className="relative overflow-hidden w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_2s_infinite]" />
                    <span className="relative z-10">Add Commitment to Merkle Tree</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-3xl bg-[#080b14]/80 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-300 space-y-4">
                <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" /> Active Merkle Root State
                </h3>

                <div className="bg-black/60 p-4 rounded-2xl border border-white/5 font-mono text-xs space-y-2">
                  <div className="text-slate-400">On-Chain Root:</div>
                  <div className="text-purple-400 font-bold break-all text-xs">{ledgerState.allowlistRoot}</div>
                  <div className="flex justify-between border-t border-white/5 pt-2 text-slate-300">
                    <span>Registered Commitments:</span>
                    <span className="text-cyan-400 font-bold">{ledgerState.totalMembersCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Audit */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="rounded-3xl bg-red-500/5 border border-red-500/20 p-6 space-y-4 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] transition-all duration-300">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider font-mono">
                  Standard EVM Public Allowlist
                </h3>
                <ul className="space-y-2 font-mono text-xs text-slate-300">
                  <li className="p-3 rounded-2xl bg-black/60 border border-red-500/20 text-red-300">
                    ❌ msg.sender Wallet Address Exposed Publicly
                  </li>
                  <li className="p-3 rounded-2xl bg-black/60 border border-red-500/20 text-red-300">
                    ❌ Merkle Proof Leaf Index Public in Calldata
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl bg-emerald-500/5 border border-emerald-500/30 p-6 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-300">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  NEXUS VAULT Midnight ZK
                </h3>
                <ul className="space-y-2 font-mono text-xs text-slate-300">
                  <li className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 text-emerald-300">
                    ✅ 100% Shielded Witness Prover
                  </li>
                  <li className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 text-emerald-300">
                    ✅ Zero Address Leakage • Public accessGranted Only
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* On-Chain Ledger */}
          {activeTab === 'ledger' && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl bg-[#080b14]/80 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-300 space-y-4"
            >
              <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" /> On-Chain Midnight Verification Feed
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {engine.getMerkleTree().getLeaves().map((hash, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-black/60 border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-cyan-400 font-bold">Leaf #{idx}: </span>
                      <span className="text-slate-300">{hash}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Selection Modal */}
        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md rounded-3xl bg-[#080b14] border border-white/15 p-6 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">
                      Connect Wallet
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs font-mono text-slate-400">
                  Select your preferred Web3 / Midnight provider to initialize ZK proof authorization:
                </p>

                <div className="space-y-3">
                  {/* Option 1: Freighter Wallet */}
                  <button
                    onClick={() => connectSelectedWallet('freighter')}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 hover:border-purple-400 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold text-xs font-mono">
                        FR
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                          Freighter Wallet
                          {walletState.isFreighterInstalled && (
                            <span className="px-2 py-0.5 text-[9px] rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                              Detected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Triggers Freighter browser extension popup
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Option 2: Midnight Lace Wallet */}
                  <button
                    onClick={() => connectSelectedWallet('lace')}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs font-mono">
                        MN
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                          Midnight Lace Wallet
                          {walletState.isLaceInstalled && (
                            <span className="px-2 py-0.5 text-[9px] rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                              Detected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Native Midnight Shielded ZK Extension
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Option 3: Testnet Sandbox */}
                  <button
                    onClick={() => connectSelectedWallet('sandbox')}
                    className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-xs font-mono">
                        ZK
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Midnight Testnet Sandbox
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Instant demo connect (no extension required)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
