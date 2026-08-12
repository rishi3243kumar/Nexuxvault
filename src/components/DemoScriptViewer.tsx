import React from 'react';
import { Video, PlayCircle, Clock, CheckSquare } from 'lucide-react';

export const DemoScriptViewer: React.FC = () => {
  const scriptSteps = [
    { time: '0:00 - 0:12', title: 'Introduction & Problem Overview', desc: 'Introduce VeilPass and state the core problem of raw address exposure in public allowlists.' },
    { time: '0:12 - 0:25', title: 'Wallet Connection', desc: 'Demonstrate Lace Wallet connection to Midnight Testnet sandbox.' },
    { time: '0:25 - 0:42', title: 'ZK Proof Generation & Circuit Execution', desc: 'Select valid member secret, trigger proveMembership Compact circuit execution off-chain.' },
    { time: '0:42 - 0:55', title: 'On-Chain Access Grant & Privacy Verification', desc: 'Highlight accessGranted = TRUE ledger status with zero member identity or leaf index leak.' },
    { time: '0:55 - 1:00', title: 'Closing Summary', desc: 'Recap why Midnight Compact privacy is required for production private allowlists.' }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-veil-purple/10 text-veil-purple border border-veil-purple/30">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">1-Minute Video Demo Script</h2>
            <p className="text-xs text-slate-400 font-mono">
              Step-by-step presentation walkthrough script for judges
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        {scriptSteps.map((step, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-midnight-950/80 border border-white/5 flex items-start gap-4 text-xs font-mono">
            <div className="px-2.5 py-1 rounded bg-veil-purple/20 text-veil-purple font-bold flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5" /> {step.time}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-veil-emerald" /> {step.title}
              </h4>
              <p className="text-slate-400 leading-relaxed font-sans">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
