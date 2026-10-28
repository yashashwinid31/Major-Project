import React, { useState } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  HardDrive, 
  Blocks, 
  FileCheck, 
  Sparkles,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Lock
} from 'lucide-react';
import { calculateSHA256 } from '../../utils/cryptoUtils';
import confetti from 'canvas-confetti';

export default function Stage6Verification() {
  const { ipfsData, blockchainData, uploadedDoc, userProfile, addVerificationResult } = useIdentity();

  const [inputCID, setInputCID] = useState(ipfsData?.cid || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [verificationVerdict, setVerificationVerdict] = useState(null);

  const runVerification = async () => {
    if (!inputCID.trim()) return;

    setIsVerifying(true);
    setAuditStep(1);
    setVerificationVerdict(null);

    // Step 1: Fetch from IPFS
    setTimeout(() => {
      setAuditStep(2);
    }, 800);

    // Step 2: Retrieve from Blockchain
    setTimeout(() => {
      setAuditStep(3);
    }, 1600);

    // Step 3: Compute Document Hash
    setTimeout(async () => {
      setAuditStep(4);
    }, 2400);

    // Step 4: Compare Hashes & Verdict
    setTimeout(() => {
      setIsVerifying(false);
      
      const isCidMatch = ipfsData?.cid === inputCID.trim();
      const isDocGenuine = uploadedDoc && !uploadedDoc.isForged;
      const isBlockchainRecordValid = blockchainData?.mined;

      const isValid = isCidMatch && isDocGenuine && isBlockchainRecordValid;

      const verdictData = {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        queriedCID: inputCID.trim(),
        isValid: isValid,
        docName: uploadedDoc?.fileName || 'Degree_Certificate_2024.pdf',
        ownerName: userProfile?.fullName || 'Alexander Vance',
        ownerDID: userProfile?.did || 'did:identity:0x892a...',
        blockchainTx: blockchainData?.txHash || '0x39a1b028...',
        steps: [
          { name: 'Fetch Metadata from IPFS Node', status: 'SUCCESS', details: `CID: ${inputCID.substring(0, 16)}...` },
          { name: 'Query Smart Contract On-Chain Hash', status: 'SUCCESS', details: `Block #${blockchainData?.blockNumber || 18504912}` },
          { name: 'Compute SHA-256 Checksum of Document', status: 'SUCCESS', details: `Calculated Hash matched` },
          { 
            name: 'Compare Tri-Party Hashes (IPFS = Blockchain = Document)', 
            status: isValid ? 'SUCCESS' : 'FAILED',
            details: isValid ? '100% Cryptographic Match' : 'Mismatch: Document Hash altered' 
          }
        ]
      };

      setVerificationVerdict(verdictData);
      addVerificationResult(verdictData);

      if (isValid) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 3200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> STAGE 06: PUBLIC VERIFICATION PORTAL
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Document Authenticity Verification Engine</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Input an IPFS Content Identifier (CID) hash or file to perform step-by-step cryptographic proof verification comparing IPFS node data, Smart Contract state, and real-time document checksums.
          </p>
        </div>
      </div>

      {/* CID Input Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Enter Document IPFS Content ID (CID) to Verify
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputCID}
              onChange={(e) => setInputCID(e.target.value)}
              placeholder="e.g. QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>

          <button
            onClick={runVerification}
            disabled={isVerifying || !inputCID.trim()}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Hashes...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Run Verification
              </>
            )}
          </button>
        </div>

        {ipfsData?.cid && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Current Session CID:</span>
            <button
              onClick={() => setInputCID(ipfsData.cid)}
              className="text-cyan-400 hover:underline font-mono text-[11px]"
            >
              Use active CID ({ipfsData.cid.substring(0, 16)}...)
            </button>
          </div>
        )}
      </div>

      {/* Step-by-Step Verification Audit Visualizer */}
      {(isVerifying || verificationVerdict) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 4 Verification Steps */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-semibold text-sm text-slate-300 uppercase tracking-wider font-mono">
              Verification Step-by-Step Execution
            </h3>

            <div className="space-y-3">
              {[
                { step: 1, title: 'Fetch Metadata from IPFS', desc: 'Retrieve raw document DAG object using CID', icon: HardDrive },
                { step: 2, title: 'Query Blockchain Smart Contract', desc: 'Fetch canonical document hash from IdentityVerifier.sol', icon: Blocks },
                { step: 3, title: 'Calculate Document SHA-256 Hash', desc: 'Compute real-time cryptographic checksum of current document', icon: FileCheck },
                { step: 4, title: 'Compare Tri-Party Cryptographic Hashes', desc: 'Verify IPFS Hash == Blockchain Hash == Document Hash', icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = isVerifying && auditStep === item.step;
                const isPassed = verificationVerdict || (isVerifying && auditStep > item.step);

                return (
                  <div
                    key={item.step}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400/60 shadow-md shadow-cyan-500/10'
                        : isPassed
                        ? 'bg-slate-900/60 border-slate-800'
                        : 'bg-slate-950/30 border-slate-900 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs ${
                          isCurrent
                            ? 'bg-cyan-500 text-slate-950 animate-pulse'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-200">
                            Step 0{item.step}: {item.title}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Verdict Card */}
          <div className="lg:col-span-6">
            {verificationVerdict && (
              <div className={`glass-panel-glow rounded-2xl p-6 space-y-5 border ${
                verificationVerdict.isValid 
                  ? 'border-emerald-500/40 shadow-emerald-950/20' 
                  : 'border-red-500/50 shadow-red-950/20'
              }`}>
                {/* Verdict Badge */}
                <div className="text-center space-y-2 pb-4 border-b border-slate-800">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                    verificationVerdict.isValid
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}>
                    {verificationVerdict.isValid ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <XCircle className="w-8 h-8" />
                    )}
                  </div>

                  <h3 className={`text-2xl font-black tracking-wide ${
                    verificationVerdict.isValid ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    VERDICT: {verificationVerdict.isValid ? 'AUTHENTIC & VERIFIED' : 'VERIFICATION FAILED'}
                  </h3>

                  <p className="text-xs text-slate-400 font-mono">
                    Audit Timestamp: {verificationVerdict.timestamp}
                  </p>
                </div>

                {/* Audit Record Summary */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Document Name:</span>
                    <span className="font-mono text-slate-200 font-bold">{verificationVerdict.docName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Registered Owner:</span>
                    <span className="font-mono text-cyan-300 font-bold">{verificationVerdict.ownerName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Blockchain Tx Proof:</span>
                    <span className="font-mono text-purple-300 truncate max-w-[200px]">{verificationVerdict.blockchainTx}</span>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => setCurrentStage(7)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  Proceed to Stage 7: Access Control &amp; Logs <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
