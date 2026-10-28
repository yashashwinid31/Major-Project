import React from 'react';
import { useIdentity } from '../context/IdentityContext';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Database,
  ArrowRight,
  FolderKanban
} from 'lucide-react';

const STAGE_TITLES = {
  1: { title: 'Stage 1: User Identity Registration', desc: 'Create a Decentralized Digital Identity (DID) & Cryptographic Keys' },
  2: { title: 'Stage 2: Identity Document Upload', desc: 'Ingest and preview official certificates, ID proofs, or passports' },
  3: { title: 'Stage 3: ML Forgery Detection Simulation', desc: 'Run automated Image Preprocessing, Feature Scan & CNN Classification' },
  4: { title: 'Stage 4: IPFS Storage & Pinning', desc: 'Store verified document on decentralized peer-to-peer storage and generate CID' },
  5: { title: 'Stage 5: Blockchain Smart Contract Storage', desc: 'Commit immutable CID & identity metadata to simulated blockchain ledger' },
  6: { title: 'Stage 6: Public Verification Portal', desc: 'Verify document authenticity step-by-step using cryptographic hash comparison' },
  7: { title: 'Stage 7: Access Control & Permission Logs', desc: 'Manage verifier access permissions and inspect blockchain audit trails' },
  8: { title: 'Stage 8: Document Library & Management Module', desc: 'Full-stack multi-file storage repository, REST APIs, responsive dashboard, view/download/delete controls' },
};

export default function Header() {
  const { currentStage, setCurrentStage, mlResult, ipfsData, blockchainData, uploadedDoc, totalDocumentCount } = useIdentity();
  const info = STAGE_TITLES[currentStage] || { title: 'Identity Verification System', desc: 'Blockchain Architecture' };

  return (
    <>
      <header className="h-20 bg-slate-900/60 border-b border-slate-800/80 px-8 flex items-center justify-between shrink-0 glass-panel">
        {/* Active Stage Title */}
        <div>
          <h2 className="font-bold text-xl text-slate-100 flex items-center gap-3">
            <span className="gradient-text-teal-purple">{info.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{info.desc}</p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-4">
          {/* Document Count Widget */}
          <button
            onClick={() => setCurrentStage(8)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 hover:border-purple-400 text-xs font-mono text-purple-300 shadow-sm transition-all"
            title="Click to open Document Library"
          >
            <FolderKanban className="w-3.5 h-3.5 text-purple-400" />
            <span>Vault Docs: <strong className="text-white font-bold">{totalDocumentCount ?? 3}</strong></span>
          </button>

          {/* Document Status */}
          {uploadedDoc && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Doc Status:</span>
              {mlResult ? (
                mlResult.verdict === 'GENUINE' ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Genuine ({mlResult.confidenceScore}%)
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Forged Blocked
                  </span>
                )
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Pending ML Scan
                </span>
              )}
            </div>
          )}

          {/* Network Node Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>IdentityChain Sepolia Node #4182</span>
          </div>
        </div>
      </header>
    </>
  );
}

