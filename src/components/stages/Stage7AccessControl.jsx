import React, { useState } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { 
  Lock, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  ExternalLink,
  CheckCircle2,
  Filter,
  X,
  FolderKanban
} from 'lucide-react';

export default function Stage7AccessControl() {
  const { 
    accessPermissions, 
    toggleVerifierStatus, 
    addVerifier, 
    auditLogs, 
    userProfile,
    setCurrentStage
  } = useIdentity();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVerifier, setNewVerifier] = useState({
    name: '',
    organization: '',
    duration: '30 Days'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newVerifier.name.trim()) return;
    addVerifier(newVerifier.name, newVerifier.organization, newVerifier.duration);
    setNewVerifier({ name: '', organization: '', duration: '30 Days' });
    setShowAddModal(false);
  };

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.verifierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.txHash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <Lock className="w-3.5 h-3.5" /> STAGE 07: ACCESS CONTROL &amp; PERMISSIONS
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Owner Access Management &amp; On-Chain Audit Logs</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Identity Owners hold sovereign control to grant or revoke verification access to third parties. Every permission modification emits a smart contract transaction event recorded on the immutable ledger.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Grant Access to New Verifier
        </button>
      </div>

      {/* Verifiers Management Grid */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Authorized Verifiers List
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accessPermissions.map((verifier) => {
            const isGranted = verifier.status === 'GRANTED';

            return (
              <div
                key={verifier.id}
                className={`glass-panel rounded-2xl p-5 border transition-all space-y-4 ${
                  isGranted ? 'border-slate-800' : 'border-red-900/40 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-200">{verifier.name}</h4>
                    <p className="text-xs text-slate-400">{verifier.organization}</p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isGranted 
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                      : 'bg-red-950/80 text-red-400 border border-red-800'
                  }`}>
                    {verifier.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-slate-200">{verifier.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span className="text-slate-400">{verifier.grantedAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleVerifierStatus(verifier.id)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isGranted
                      ? 'bg-red-950/40 hover:bg-red-900/40 border border-red-700/50 text-red-300'
                      : 'bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-700/50 text-emerald-300'
                  }`}
                >
                  {isGranted ? (
                    <>
                      <UserX className="w-3.5 h-3.5 text-red-400" /> Revoke Access
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Re-Grant Access
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Blockchain Access Log Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-sm text-slate-200">On-Chain Permission Audit Trail</h3>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs or TxHash..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500/60"
            >
              <option value="ALL">All Event Types</option>
              <option value="ACCESS_GRANTED">ACCESS_GRANTED</option>
              <option value="ACCESS_REVOKED">ACCESS_REVOKED</option>
              <option value="BLOCKCHAIN_RECORDED">BLOCKCHAIN_RECORDED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Verifier / Entity</th>
                <th className="py-3 px-3">Event Action</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-3 font-semibold text-slate-200">{log.verifierName}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'ACCESS_GRANTED' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : log.action === 'ACCESS_REVOKED'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{log.status}</td>
                  <td className="py-3 px-3 text-cyan-300 truncate max-w-[180px]" title={log.txHash}>
                    {log.txHash.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protocol Completion Banner -> Document Library */}
      <div className="glass-panel-glow rounded-2xl p-8 border border-cyan-500/40 text-center space-y-4 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-purple-950/20 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 mx-auto shadow-lg shadow-cyan-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold uppercase tracking-wider">
            ALL PROTOCOL STAGES COMPLETE
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-2">Digital Identity &amp; Verification Pipeline Complete</h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-1">
            You have completed all steps: Registration, Document Ingestion, ML Forgery Scan, IPFS Pinning, Blockchain Storage, Public Audit, and Access Control. View and manage all stored assets in your Document Library.
          </p>
        </div>

        <button
          onClick={() => setCurrentStage(8)}
          className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 inline-flex items-center gap-2.5 transition-all cursor-pointer"
        >
          <FolderKanban className="w-5 h-5" /> Open Complete Document Library (Stage 8)
        </button>
      </div>

      {/* Add Verifier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-2xl p-6 border border-cyan-500/40 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Grant Verifier Access</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Verifier Name
                </label>
                <input
                  type="text"
                  required
                  value={newVerifier.name}
                  onChange={(e) => setNewVerifier({ ...newVerifier, name: e.target.value })}
                  placeholder="e.g. Apex Global Bank"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Organization / Entity Type
                </label>
                <input
                  type="text"
                  required
                  value={newVerifier.organization}
                  onChange={(e) => setNewVerifier({ ...newVerifier, organization: e.target.value })}
                  placeholder="e.g. Financial Compliance Dept"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Access Duration
                </label>
                <select
                  value={newVerifier.duration}
                  onChange={(e) => setNewVerifier({ ...newVerifier, duration: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm"
                >
                  <option value="24 Hours">24 Hours</option>
                  <option value="30 Days">30 Days</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Permanent">Permanent</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Grant Access &amp; Commit Tx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
