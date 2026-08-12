import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Cpu, CheckCircle, AlertTriangle, ArrowRight, Lock, EyeOff, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { VeilPassContractEngine, ProofSubmissionResult } from '../../contract/veilpass_api';
import { crypto } from '../../contract/crypto_utils';

interface MemberPortalProps {
  engine: VeilPassContractEngine;
  onProofSubmitted: (result: ProofSubmissionResult) => void;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({ engine, onProofSubmitted }) => {
  const [userSecret, setUserSecret] = useState('user_alpha_private_secret_99812');
  const [nullifierSalt, setNullifierSalt] = useState('SESSION_SALT_2026');
  const [statusStep, setStatusStep] = useState<'idle' | 'witness' | 'proving' | 'broadcasting' | 'complete' | 'failed'>('idle');
  const [proofLogs, setProofLogs] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<ProofSubmissionResult | null>(null);

  const predefinedSecrets = [
    { label: 'Alpha Pass (Valid Member)', secret: 'user_alpha_private_secret_99812' },
    { label: 'Beta Pass (Valid Member)', secret: 'user_beta_private_secret_44721' },
    { label: 'Unregistered Pass (Fails ZK)', secret: 'unauthorized_imposter_secret_00000' },
  ];

  const logStep = (msg: string) => {
    setProofLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGenerateProof = async () => {
    if (!userSecret.trim()) return;

    setProofLogs([]);
    setStatusStep('witness');
    logStep('Initializing Midnight Compact Witness Engine...');
    
    await new Promise(r => setTimeout(r, 600));
    logStep(`Computing Leaf Commitment: H("${userSecret.substring(0, 8)}...") = ${crypto.hashSecret(userSecret).substring(0, 16)}...`);
    logStep('Fetching current Ledger Allowlist Root...');

    const tree = engine.getMerkleTree();
    const leaves = tree.getLeaves();
    const commitment = crypto.hashSecret(userSecret);
    const leafIndex = leaves.indexOf(commitment);

    await new Promise(r => setTimeout(r, 700));
    setStatusStep('proving');

    if (leafIndex === -1) {
      logStep('⚠️ Commitment not found in active Merkle tree. Constructing fallback witness for circuit verification test...');
    } else {
      logStep(`Constructed Merkle Path for leaf index #${leafIndex} (Depth: 8 layers)`);
    }

    // Get Merkle proof
    let proofPath: string[];
    let proofIndices: boolean[];

    if (leafIndex !== -1) {
      const proof = tree.getProof(leafIndex);
      proofPath = proof.path;
      proofIndices = proof.indices;
    } else {
      // Dummy proof path for non-member test
      const proof = tree.getProof(0);
      proofPath = proof.path;
      proofIndices = proof.indices;
    }

    logStep('Executing proveMembership() Compact Zero-Knowledge Circuit...');
    await new Promise(r => setTimeout(r, 900));

    setStatusStep('broadcasting');
    logStep('Deriving Nullifier Hash inside circuit: H(secret + salt)...');
    logStep('Submitting transaction payload to Midnight Testnet node...');

    await new Promise(r => setTimeout(r, 800));
    
    const witness = {
      userSecret,
      merkleProofPath: proofPath,
      merklePathIndices: proofIndices
    };

    const result = engine.proveMembership(witness, nullifierSalt);
    setLastResult(result);
    onProofSubmitted(result);

    if (result.success) {
      setStatusStep('complete');
      logStep(`✅ SUCCESS: Transaction confirmed in block #${result.blockHeight}`);
      logStep(`Ledger State Updated: accessGranted = TRUE`);
      logStep(`Nullifier Hash Recorded: ${result.nullifierHash}`);
      logStep(`🔒 PRIVACY GUARANTEE: Zero identity data exposed on ledger.`);
    } else {
      setStatusStep('failed');
      logStep(`❌ ERROR: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-veil-cyan/10 rounded-full blur-3xl"></div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-veil-cyan" />
              <h2 className="text-lg font-bold text-white">Private Member Access Portal</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Generate a Zero-Knowledge proof in your browser using Midnight Compact. Prove membership in the gated allowlist without revealing your secret key, raw address, identity, or Merkle tree leaf index.
            </p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-veil-emerald/10 text-veil-emerald text-xs font-mono font-semibold border border-veil-emerald/20">
            <EyeOff className="w-3.5 h-3.5" /> Zero Identity Leakage
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Proof Input & Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-card p-6 rounded-2xl space-y-5 border border-white/10">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-veil-cyan" /> 1. Input Member Private Secret
            </h3>

            {/* Quick Selection Buttons */}
            <div>
              <label className="text-xs text-slate-400 font-mono mb-2 block">Quick Select Test Credentials:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {predefinedSecrets.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserSecret(item.secret)}
                    className={`p-2.5 text-left rounded-xl text-xs font-mono transition-all border ${
                      userSecret === item.secret
                        ? 'bg-veil-cyan/10 border-veil-cyan text-veil-cyan shadow-glow-cyan'
                        : 'bg-midnight-900/60 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Secret Key Input */}
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1.5 flex justify-between">
                <span>Private Secret / Identity Passphrase</span>
                <span className="text-veil-cyan">Kept Off-Chain (Witness Only)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={userSecret}
                  onChange={(e) => setUserSecret(e.target.value)}
                  placeholder="Enter your secret passphrase..."
                  className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-veil-cyan transition-colors"
                />
                <EyeOff className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Session Salt Input */}
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1.5 flex justify-between">
                <span>Session Nullifier Salt</span>
                <span className="text-slate-500">Prevents Replay Attacks</span>
              </label>
              <input
                type="text"
                value={nullifierSalt}
                onChange={(e) => setNullifierSalt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-midnight-950 border border-white/10 text-slate-100 font-mono text-xs focus:outline-none focus:border-veil-cyan transition-colors"
              />
            </div>

            {/* Generate & Submit Button */}
            <button
              type="button"
              onClick={handleGenerateProof}
              disabled={statusStep !== 'idle' && statusStep !== 'complete' && statusStep !== 'failed'}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-veil-cyan via-veil-blue to-veil-purple text-midnight-950 font-bold text-xs tracking-wider uppercase shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {statusStep === 'idle' || statusStep === 'complete' || statusStep === 'failed' ? (
                <>
                  <Sparkles className="w-4 h-4" /> Generate ZK Proof & Submit to Midnight
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing ZK Circuit...
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Log & Verification Result */}
        <div className="lg:col-span-5 space-y-5">
          {/* Status Result Card */}
          {lastResult && (
            <div className={`glass-card p-5 rounded-2xl border ${
              lastResult.success 
                ? 'border-veil-emerald/40 bg-veil-emerald/5' 
                : 'border-red-500/40 bg-red-500/5'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {lastResult.success ? (
                  <CheckCircle className="w-6 h-6 text-veil-emerald" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {lastResult.success ? 'Access Granted' : 'Verification Failed'}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {lastResult.success ? 'Zero-Knowledge Proof Verified On-Chain' : 'Circuit Constraint Error'}
                  </p>
                </div>
              </div>

              {lastResult.success ? (
                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">On-Chain Status:</span>
                    <span className="text-veil-emerald font-bold">accessGranted = TRUE</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Transaction Hash:</span>
                    <span className="text-veil-cyan truncate max-w-[160px]">{lastResult.txHash}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Block Height:</span>
                    <span className="text-slate-200">#{lastResult.blockHeight}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-400">Nullifier Hash:</span>
                    <span className="text-slate-200 truncate max-w-[160px]">{lastResult.nullifierHash}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono text-red-300 leading-relaxed bg-midnight-950 p-2.5 rounded-lg border border-red-500/20">
                  {lastResult.error}
                </p>
              )}
            </div>
          )}

          {/* Execution Log */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-veil-cyan" /> Compact ZK Execution Log</span>
              <span className="text-[10px] text-slate-500 font-normal">{proofLogs.length} events</span>
            </h3>

            <div className="bg-midnight-950 p-3 rounded-xl border border-white/5 font-mono text-[11px] h-52 overflow-y-auto space-y-1 text-slate-300">
              {proofLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                  Ready. Click "Generate ZK Proof" to initiate Compact prover.
                </div>
              ) : (
                proofLogs.map((log, i) => (
                  <div key={i} className="leading-snug break-all">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
