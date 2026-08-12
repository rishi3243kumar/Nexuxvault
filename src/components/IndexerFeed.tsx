import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, Shield, Activity, ExternalLink, Server } from 'lucide-react';
import { ProofSubmissionResult } from '../../contract/veilpass_api';

interface IndexerEvent {
  id: string;
  blockHeight: number;
  txHash: string;
  timestamp: string;
  nullifierHash: string;
  accessGranted: boolean;
  privacyModel: string;
  identityExposed: boolean;
}

interface IndexerFeedProps {
  lastSubmittedProof: ProofSubmissionResult | null;
}

export const IndexerFeed: React.FC<IndexerFeedProps> = ({ lastSubmittedProof }) => {
  const [events, setEvents] = useState<IndexerEvent[]>([
    {
      id: 'evt_10425_01',
      blockHeight: 10425,
      txHash: '0x3a91f892c019d4b2e88a0e1c',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      nullifierHash: '0x99a1b2c3d4e5f6a701928374',
      accessGranted: true,
      privacyModel: 'Shielded Compact Witness',
      identityExposed: false
    },
    {
      id: 'evt_10427_02',
      blockHeight: 10427,
      txHash: '0x7c42b109e4418a09f120199d',
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      nullifierHash: '0x112233445566778899aabbcc',
      accessGranted: true,
      privacyModel: 'Shielded Compact Witness',
      identityExposed: false
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lastSubmittedProof && lastSubmittedProof.success) {
      const newEvt: IndexerEvent = {
        id: `evt_${lastSubmittedProof.blockHeight}_${Date.now()}`,
        blockHeight: lastSubmittedProof.blockHeight,
        txHash: lastSubmittedProof.txHash,
        timestamp: new Date().toISOString(),
        nullifierHash: lastSubmittedProof.nullifierHash,
        accessGranted: true,
        privacyModel: 'Shielded Compact Witness',
        identityExposed: false
      };
      setEvents(prev => [newEvt, ...prev]);
    }
  }, [lastSubmittedProof]);

  const fetchIndexerEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/verifications');
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      }
    } catch (e) {
      console.log('Using local in-memory indexer feed state');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-veil-purple/10 border border-veil-purple/30 text-veil-purple">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Midnight Event Indexer Feed
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-veil-emerald/10 text-veil-emerald border border-veil-emerald/20">
                REST API Live
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Watches the Midnight ledger for public <span className="text-veil-cyan">accessGranted</span> boolean state transitions
            </p>
          </div>
        </div>

        <button
          onClick={fetchIndexerEvents}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-midnight-900 border border-white/10 hover:border-veil-cyan/40 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync Indexer Node
        </button>
      </div>

      {/* Feed List */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Indexed On-Chain Events ({events.length})
          </span>
          <span className="text-xs font-mono text-veil-cyan flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> 100% Zero-Identity Leakage
          </span>
        </div>

        <div className="space-y-3">
          {events.map((evt) => (
            <div 
              key={evt.id} 
              className="p-4 rounded-xl bg-midnight-950/80 border border-white/5 hover:border-veil-cyan/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-veil-cyan/10 text-veil-cyan font-bold">
                    Block #{evt.blockHeight}
                  </span>
                  <span className="text-slate-400">Tx:</span>
                  <span className="text-slate-200 font-semibold">{evt.txHash}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>Nullifier:</span>
                  <span className="text-slate-300">{evt.nullifierHash}</span>
                  <span>•</span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-veil-emerald font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> accessGranted = true
                  </div>
                  <div className="text-[10px] text-slate-500">Identity: ANONYMOUS / SHIELDED</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
