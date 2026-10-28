import React from 'react';
import { useIdentity } from '../context/IdentityContext';
import { 
  UserCheck, 
  UploadCloud, 
  Cpu, 
  HardDrive, 
  Blocks, 
  ShieldCheck, 
  Lock, 
  FolderKanban,
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const STAGES = [
  {
    id: 1,
    title: 'User Registration',
    shortDesc: 'Auto-Generate DID & Keypair',
    icon: UserCheck
  },
  {
    id: 2,
    title: 'Document Upload',
    shortDesc: 'Image / PDF Proof Ingestion',
    icon: UploadCloud
  },
  {
    id: 3,
    title: 'Forgery Detection',
    shortDesc: 'ML CNN Pipeline Analysis',
    icon: Cpu
  },
  {
    id: 4,
    title: 'IPFS Storage',
    shortDesc: 'Decentralized CID Pinning',
    icon: HardDrive
  },
  {
    id: 5,
    title: 'Blockchain Storage',
    shortDesc: 'Smart Contract Mining',
    icon: Blocks
  },
  {
    id: 6,
    title: 'Verification Process',
    shortDesc: 'Public Hash Audit Engine',
    icon: ShieldCheck
  },
  {
    id: 7,
    title: 'Access Control',
    shortDesc: 'Verifier Logs & Permissions',
    icon: Lock
  },
  {
    id: 8,
    title: 'Document Library',
    shortDesc: 'Multi-File Vault & Dashboard',
    icon: FolderKanban
  }
];

export default function Sidebar() {
  const { 
    currentStage, 
    setCurrentStage, 
    userProfile, 
    uploadedDoc, 
    mlResult, 
    ipfsData, 
    blockchainData
  } = useIdentity();

  // Helper to determine stage status
  const getStageStatus = (stageId) => {
    if (currentStage === stageId) return 'ACTIVE';
    if (stageId === 1 && userProfile?.registered) return 'COMPLETED';
    if (stageId === 2 && uploadedDoc) return 'COMPLETED';
    if (stageId === 3 && mlResult?.status === 'scanned') {
      return mlResult.verdict === 'GENUINE' ? 'COMPLETED' : 'BLOCKED';
    }
    if (stageId === 4 && ipfsData?.pinned) return 'COMPLETED';
    if (stageId === 5 && blockchainData?.mined) return 'COMPLETED';
    if (stageId === 6 && (blockchainData?.mined || ipfsData?.pinned)) return 'AVAILABLE';
    if (stageId === 7) return 'AVAILABLE';
    if (stageId === 8) return 'AVAILABLE';
    return 'PENDING';
  };

  return (
    <aside className="w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100 tracking-wide flex items-center gap-1.5">
                BlockID <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 font-mono">v2.4</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Digital Identity Protocol</p>
            </div>
          </div>

          {/* User DID Badge */}
          {userProfile?.did && (
            <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">ACTIVE DID PROFILE</span>
              <span className="font-mono text-cyan-300 font-medium block truncate" title={userProfile.did}>
                {userProfile.did}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Stages */}
        <nav className="p-3 space-y-1.5">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const status = getStageStatus(stage.id);
            const isActive = currentStage === stage.id;
            const isBlocked = status === 'BLOCKED';

            return (
              <button
                key={stage.id}
                onClick={() => setCurrentStage(stage.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/70 to-purple-950/70 border border-cyan-500/40 text-slate-100 shadow-md shadow-cyan-950/30'
                    : isBlocked
                    ? 'bg-red-950/30 border border-red-900/50 text-red-300 hover:bg-red-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-colors ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' 
                      : status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isBlocked
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isBlocked ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <span>0{stage.id}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm leading-tight flex items-center gap-2">
                      {stage.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                      {stage.shortDesc}
                    </div>
                  </div>
                </div>

                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : isBlocked ? 'text-red-400' : 'text-slate-400'
                }`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
        <span className="text-[11px] text-slate-500 font-mono block">
          Document Verification System
        </span>
      </div>
    </aside>
  );
}
