import React, { useState } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { 
  UserCheck, 
  Key, 
  QrCode, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  Eye, 
  EyeOff,
  Fingerprint,
  Lock
} from 'lucide-react';

export default function Stage1Registration() {
  const { userProfile, registerUser, setCurrentStage } = useIdentity();
  
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || 'Alexander Vance',
    email: userProfile?.email || 'alexander.vance@identity.io',
    password: userProfile?.password || '••••••••',
    dob: userProfile?.dob || '1998-04-12',
    role: userProfile?.role || 'Identity Owner'
  });

  const [copied, setCopied] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      registerUser(formData);
      setIsGenerating(false);
    }, 600);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Intro Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <Fingerprint className="w-3.5 h-3.5" /> STAGE 01: IDENTITY CREATION
          </div>
          <h2 className="text-2xl font-bold text-slate-100">User Identity Registration & DID Generation</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Register basic user identity details to auto-generate a unique W3C-compliant Decentralized Digital Identifier (DID) and cryptographic public/private keypair using simulated blockchain algorithms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Registration Form */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-200">Registration Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
                placeholder="e.g. Alexander Vance"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
                  placeholder="name@domain.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
                >
                  <option value="Identity Owner">Identity Owner</option>
                  <option value="Academic Verifier">Academic Verifier</option>
                  <option value="Enterprise Verifier">Enterprise Verifier</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating Blockchain DID...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Decentralized Digital Identity (DID)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated DID Card */}
        <div className="lg:col-span-6 space-y-6">
          {userProfile?.registered ? (
            <div className="glass-panel-glow rounded-2xl p-6 relative overflow-hidden space-y-5">
              {/* Top Accent Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    DID ACTIVE & SIGNED
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {userProfile.registeredAt}
                </span>
              </div>

              {/* User Profile Card */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-slate-100">{userProfile.fullName}</h4>
                  <p className="text-xs text-slate-400">{userProfile.email} • {userProfile.role}</p>
                </div>

                {/* DID String Box */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-semibold text-cyan-400">
                      Decentralized Identifier (DID)
                    </span>
                    <button
                      onClick={() => copyToClipboard(userProfile.did)}
                      className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-200 break-all">
                    {userProfile.did}
                  </p>
                </div>

                {/* Cryptographic Keys */}
                <div className="space-y-2 pt-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                      <Key className="w-3 h-3 text-purple-400" /> Public Key (Ed25519)
                    </span>
                    <p className="font-mono text-[11px] text-slate-300 break-all">
                      {userProfile.keys.publicKey}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-red-400" /> Cryptographic Private Key
                      </span>
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        {showPrivateKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPrivateKey ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 break-all">
                      {showPrivateKey ? userProfile.keys.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Proceed Action Button */}
              <button
                onClick={() => setCurrentStage(2)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-sm border border-cyan-500/30 flex items-center justify-center gap-2 transition-all"
              >
                Proceed to Stage 2: Document Upload <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">No DID Identity Registered Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Fill in the registration form on the left to generate your unique cryptographic identity hash.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
