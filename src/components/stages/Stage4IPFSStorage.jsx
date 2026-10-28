import React, { useState, useEffect } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { 
  HardDrive, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight, 
  Network, 
  CheckCircle2, 
  Lock,
  Layers,
  Database,
  Globe
} from 'lucide-react';

export default function Stage4IPFSStorage() {
  const { uploadedDoc, mlResult, ipfsData, pinDocumentToIPFS, setCurrentStage } = useIdentity();
  const [isPinning, setIsPinning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinnedSuccess, setPinnedSuccess] = useState(!!ipfsData?.pinned);

  useEffect(() => {
    if (uploadedDoc && mlResult?.verdict === 'GENUINE' && !ipfsData && !isPinning) {
      handlePin();
    }
  }, [uploadedDoc, mlResult]);

  const handlePin = async () => {
    setIsPinning(true);
    setTimeout(async () => {
      await pinDocumentToIPFS();
      setIsPinning(false);
      setPinnedSuccess(true);
    }, 1500);
  };

  const copyCID = () => {
    if (ipfsData?.cid) {
      navigator.clipboard.writeText(ipfsData.cid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (mlResult?.verdict === 'FORGED') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-panel rounded-2xl p-8 border border-red-900/50 bg-red-950/20 text-center space-y-4">
          <Lock className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-100">IPFS Pinning Blocked</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Stage 3 ML Forgery Detection flagged this document as tampered or forged. Decentralized storage is prohibited for unverified files.
          </p>
          <button
            onClick={() => setCurrentStage(3)}
            className="py-2.5 px-5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700"
          >
            Return to Stage 3 Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <HardDrive className="w-3.5 h-3.5" /> STAGE 04: DECENTRALIZED IPFS PINNING
          </div>
          <h2 className="text-2xl font-bold text-slate-100">IPFS File Storage &amp; CID Generation</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate storing the verified document onto the InterPlanetary File System (IPFS) peer-to-peer network to generate an immutable Content Identifier (CID) cryptographic content hash.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* IPFS Network Node Visualizer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-sm text-slate-200">Distributed P2P Node Cluster</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                24 PEER NODES ACTIVE
              </span>
            </div>

            {/* P2P Node Grid Graphic */}
            <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden text-center space-y-4">
              <div className="grid grid-cols-4 gap-3 py-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((node) => (
                  <div
                    key={node}
                    className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
                      isPinning || pinnedSuccess
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Globe className={`w-4 h-4 mx-auto mb-1 ${isPinning ? 'animate-spin text-cyan-400' : 'text-cyan-300'}`} />
                    <span className="text-[10px] font-mono block">Node-{node}</span>
                  </div>
                ))}
              </div>

              {isPinning ? (
                <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs animate-pulse">
                  <Layers className="w-4 h-4 animate-spin" /> Chunking &amp; Distributing File Fragments...
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-mono">
                  All 24 replicas synchronized &amp; pinned across IPFS Cluster.
                </p>
              )}
            </div>

            {/* Manual Pin Trigger if needed */}
            {!pinnedSuccess && (
              <button
                onClick={handlePin}
                disabled={isPinning}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                {isPinning ? 'Pinning to IPFS Network...' : 'Pin Document to IPFS Now'}
              </button>
            )}
          </div>
        </div>

        {/* IPFS CID Receipt & Payload Explorer */}
        <div className="lg:col-span-6 space-y-6">
          {ipfsData ? (
            <div className="glass-panel-glow rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> IPFS PINNED SUCCESSFULLY
                </span>
                <span className="text-[11px] font-mono text-slate-400">{ipfsData.timestamp}</span>
              </div>

              {/* CID Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">
                    Content Identifier (CID v0 Hash)
                  </span>
                  <button
                    onClick={copyCID}
                    className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied CID' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-sm text-cyan-300 font-bold break-all">
                  {ipfsData.cid}
                </p>
              </div>

              {/* Metadata Key Values */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">SHA-256 Checksum</span>
                  <span className="font-mono text-slate-200 truncate block mt-0.5" title={ipfsData.docHash}>
                    {ipfsData.docHash.substring(0, 16)}...
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">IPFS Gateway Link</span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert(`Mock IPFS Gateway: ${ipfsData.gatewayUrl}`); }}
                    className="font-mono text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    ipfs://{ipfsData.cid.substring(0, 10)}... <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* IPFS DAG Object Payload View */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <span className="text-slate-500 uppercase text-[10px] block font-bold">IPFS UnixFS DAG Object:</span>
                <pre className="text-cyan-300/90 whitespace-pre-wrap overflow-x-auto">
{JSON.stringify({
  Data: `\u0008\u0002\u0012\u0084\u0001${ipfsData.docHash.substring(0, 20)}...`,
  Links: [
    { Name: "document_data.bin", Hash: ipfsData.cid, Size: 145408 }
  ]
}, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => setCurrentStage(5)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
              >
                Proceed to Stage 5: Blockchain Smart Contract Storage <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <HardDrive className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-200">Preparing IPFS Node...</h4>
              <p className="text-xs text-slate-400">Click Pin Document above to generate the CID hash.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
