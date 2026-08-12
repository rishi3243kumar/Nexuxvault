import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wallet, Lock, Activity, CheckCircle2, ChevronDown, ExternalLink } from 'lucide-react';
import { midnightWallet, WalletState } from '../services/midnightWallet';

export const Header: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>(midnightWallet.getState());
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    return midnightWallet.subscribe(setWalletState);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await midnightWallet.connect();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    midnightWallet.disconnect();
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-veil-cyan via-midnight-500 to-veil-purple shadow-glow-cyan">
            <Lock className="w-5 h-5 text-midnight-950 stroke-[2.5]" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-veil-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-veil-emerald"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">VeilPass</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-veil-cyan/10 text-veil-cyan border border-veil-cyan/30">
                Midnight ZK
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Private Allowlist Access Protocol</p>
          </div>
        </div>

        {/* Network Badge & Wallet Action */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-midnight-900/80 border border-white/5 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-veil-emerald animate-pulse" />
            <span className="text-slate-300">Midnight Testnet</span>
            <span className="text-slate-500">•</span>
            <span className="text-veil-cyan font-semibold">Compact v0.14</span>
          </div>

          {walletState.isConnected ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                <span className="text-slate-400">Shielded Balance</span>
                <span className="text-veil-emerald font-semibold">{walletState.shieldedBalance}</span>
              </div>
              
              <div className="group relative">
                <button 
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-midnight-800/90 hover:bg-midnight-700 border border-veil-cyan/30 hover:border-veil-cyan/60 text-white font-mono text-xs transition-all shadow-glass"
                >
                  <ShieldCheck className="w-4 h-4 text-veil-cyan" />
                  <span className="max-w-[100px] truncate">{walletState.address}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-veil-cyan via-veil-blue to-veil-purple text-midnight-950 font-bold text-xs tracking-wide shadow-glow-cyan hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting Wallet...' : 'Connect Lace Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
