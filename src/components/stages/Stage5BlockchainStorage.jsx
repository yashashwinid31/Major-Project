import React, { useState, useEffect } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { 
  Blocks, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck,
  FileCode,
  Box,
  Flame,
  Search,
  X,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Stage5BlockchainStorage() {
  const { 
    userProfile, 
    uploadedDoc, 
    ipfsData, 
    blockchainData, 
    recordOnBlockchain, 
    setCurrentStage 
  } = useIdentity();

  const [isMining, setIsMining] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  useEffect(() => {
    if (ipfsData && !blockchainData && !isMining) {
      handleMineTransaction();
    }
  }, [ipfsData]);

  const handleMineTransaction = async () => {
    setIsMining(true);
    setTimeout(async () => {
      await recordOnBlockchain();
      setIsMining(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 2000);
  };

  const copyTxHash = () => {
    if (blockchainData?.txHash) {
      navigator.clipboard.writeText(blockchainData.txHash);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <Blocks className="w-3.5 h-3.5" /> STAGE 05: SMART CONTRACT EXECUTION
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Blockchain Immutable Ledger Storage</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Executes the <code className="text-cyan-300 font-mono">IdentityVerifier.sol</code> smart contract method to permanently write user DID, document category, and IPFS CID to the blockchain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Smart Contract Interaction & Mining Status */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-sm text-slate-200">Smart Contract Execution</h3>
              </div>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800 px-2.5 py-0.5 rounded-full">
                IdentityVerifier.sol v1.0
              </span>
            </div>

            {/* Solidity Code Preview snippet */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-300/90 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px] pb-1 border-b border-slate-800">
                <span>Contract Address: 0x7F9a...5e10</span>
                <span>EVM Compatible</span>
              </div>
              <pre className="text-slate-300 text-[10px] leading-relaxed pt-1 overflow-x-auto">
{`function storeRecord(
  bytes32 _docHash,
  string memory _ipfsCID,
  string memory _userDID
) public returns (bool success) {
  records[_docHash] = IdentityRecord({
    cid: _ipfsCID, ownerDID: _userDID, timestamp: block.timestamp
  });
  emit RecordCommitted(_docHash, _ipfsCID, _userDID);
  return true;
}`}
              </pre>
            </div>

            {/* Mining Status Visualizer */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
              {isMining ? (
                <div className="space-y-3 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto animate-bounce">
                    <Box className="w-6 h-6 animate-spin" />
                  </div>
                  <h4 className="font-bold text-sm text-purple-300">
                    Mining Block &amp; Verifying Transaction Proof...
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Broadcasting payload to IdentityChain Sepolia Validator Nodes...
                  </p>
                </div>
              ) : blockchainData ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-400">
                      Block #{blockchainData.blockNumber} Mined &amp; Finalized
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Transaction included with 12 Block Confirmations.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleMineTransaction}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold text-sm"
                >
                  Commit Payload to Blockchain
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Receipt & Details */}
        <div className="lg:col-span-6 space-y-6">
          {blockchainData ? (
            <div className="glass-panel-glow rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> TRANSACTION RECEIPT
                </span>
                <button
                  onClick={() => setShowExplorer(true)}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Search className="w-3.5 h-3.5" /> Open Explorer Modal
                </button>
              </div>

              {/* Transaction Hash */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-purple-400">
                    Transaction Hash (TxHash)
                  </span>
                  <button
                    onClick={copyTxHash}
                    className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedTx ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-xs text-purple-300 font-bold break-all">
                  {blockchainData.txHash}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px] uppercase">Block Number</span>
                  <span className="font-mono text-cyan-300 font-bold block mt-1">#{blockchainData.blockNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px] uppercase">Gas Used</span>
                  <span className="font-mono text-slate-200 block mt-1 flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> {blockchainData.gasUsed}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px] uppercase">Network</span>
                  <span className="font-mono text-emerald-400 font-semibold block mt-1">Sepolia</span>
                </div>
              </div>

              {/* Immutable Payload Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  On-Chain State Payload
                </span>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">User DID:</span>
                    <span className="text-cyan-300 truncate max-w-[240px]">{blockchainData.payload.userDID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IPFS CID:</span>
                    <span className="text-cyan-300 truncate max-w-[240px]">{blockchainData.payload.ipfsCID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Type:</span>
                    <span className="text-slate-200">{blockchainData.payload.documentType}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStage(6)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
              >
                Proceed to Stage 6: Public Verification Portal <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Blocks className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-200">Awaiting Transaction Execution...</h4>
            </div>
          )}
        </div>
      </div>

      {/* Block Explorer Modal */}
      {showExplorer && blockchainData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-2xl w-full rounded-2xl p-6 border border-cyan-500/40 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
                <Search className="w-4 h-4" /> BlockExplorer &bull; Tx {blockchainData.txHash.substring(0, 14)}...
              </div>
              <button
                onClick={() => setShowExplorer(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs space-y-3 border border-slate-800">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Transaction Status:</span>
                <span className="text-emerald-400 font-bold">SUCCESS (12 Confirmations)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Block Height:</span>
                <span className="text-slate-200">#{blockchainData.blockNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">From (User DID):</span>
                <span className="text-cyan-300 break-all">{blockchainData.payload.userDID}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">To (Contract):</span>
                <span className="text-purple-300 break-all">{blockchainData.contractAddress}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">IPFS CID Hash:</span>
                <span className="text-cyan-300 font-bold break-all">{blockchainData.payload.ipfsCID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-300">{blockchainData.timestamp}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowExplorer(false)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
