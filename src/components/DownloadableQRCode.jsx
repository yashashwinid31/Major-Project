import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Info,
  X,
  Share2
} from 'lucide-react';

const PRODUCTION_HTTPS_URL = 'https://major-project-identity-verify.loca.lt';

const getDynamicOrigin = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, port, protocol } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }
  }
  return PRODUCTION_HTTPS_URL;
};

const formatUrlForMobile = (url) => {
  if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
    return getDynamicOrigin();
  }
  return url;
};

export default function DownloadableQRCode({ 
  initialUrl = null,
  title = "Mobile App Access QR Code",
  subtitle = "Scan with any smartphone camera to launch the web application",
  onClose = null,
  isModal = false
}) {
  const [targetUrl, setTargetUrl] = useState(() => {
    if (initialUrl && !initialUrl.includes('localhost') && !initialUrl.includes('127.0.0.1')) {
      return initialUrl;
    }
    return getDynamicOrigin();
  });
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(250);
  const [copied, setCopied] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState('H'); // L, M, Q, H
  const canvasRef = useRef(null);

  const isLocalhost = targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1');

  // Sync state if initialUrl changes
  useEffect(() => {
    if (initialUrl) {
      setTargetUrl(formatUrlForMobile(initialUrl));
    }
  }, [initialUrl]);

  // Generate QR Code on canvas
  useEffect(() => {
    if (canvasRef.current && targetUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        targetUrl,
        {
          width: qrSize,
          margin: 2,
          errorCorrectionLevel: errorCorrection,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        },
        (error) => {
          if (error) console.error('Error generating QR Code:', error);
        }
      );
    }
  }, [targetUrl, fgColor, bgColor, qrSize, errorCorrection]);

  // Copy target URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick preset URLs
  const setServeoPreset = () => {
    setTargetUrl(PUBLIC_SERVEO_URL);
  };

  const setMobileIpPreset = () => {
    setTargetUrl(`http://${LOCAL_WIFI_IP}:5173`);
  };

  const setAppOriginPreset = () => {
    if (typeof window !== 'undefined') {
      setTargetUrl(window.location.origin);
    }
  };

  const setVerificationPreset = () => {
    setTargetUrl(`http://${LOCAL_WIFI_IP}:5173/#verify`);
  };

  const content = (
    <div className="space-y-6">
      {/* Header section if modal */}
      {isModal && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Main Grid: QR Canvas & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: QR Code Display Card */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl relative overflow-hidden group">
          {/* Subtle glowing backdrop gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent pointer-events-none" />
          
          {/* Canvas Wrapper with white rounded frame */}
          <div className="p-4 bg-white rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-102">
            <canvas ref={canvasRef} className="rounded-lg block" />
          </div>

          {/* Quick instructions under QR */}
          <div className="mt-4 text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Compatible with iOS &amp; Android Cameras</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Universal High Error-Correction (Level {errorCorrection}) for instant mobile phone scanning.
            </p>
          </div>
        </div>

        {/* Right Column: Configuration & Link Target */}
        <div className="md:col-span-6 space-y-4">
          
          {/* Target URL Input Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Web Application URL / Address
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 pr-24 focus:outline-none transition-colors"
                placeholder="https://your-app-domain.com"
              />
              <button
                onClick={handleCopyLink}
                className="absolute right-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Enter any URL or network IP address to encode into the downloadable QR Code.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Address Presets</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={setServeoPreset}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-200" /> Public Tunnel (Serveo)
              </button>
              <button
                onClick={setMobileIpPreset}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Smartphone className="w-3 h-3 text-cyan-400" /> Mobile Wi-Fi (192.168.1.3:5173)
              </button>
              <button
                onClick={setAppOriginPreset}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Globe className="w-3 h-3 text-slate-400" /> PC Localhost
              </button>
            </div>
          </div>

          {/* Wi-Fi / Local Mobile Access Note */}
          {isLocalhost ? (
            <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200 text-xs space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                <span>⚠️ Localhost Detected (PC Only)</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Scanning <code className="bg-amber-900/80 px-1 py-0.5 rounded font-mono font-bold text-white">localhost</code> on a mobile phone fails because the phone tries to open itself instead of your PC!
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/30 text-[11px] space-y-1 font-mono text-slate-300">
                <div className="text-amber-400 font-bold">📲 How to connect your mobile phone:</div>
                <div>1. Connect phone &amp; PC to the **same Wi-Fi network**.</div>
                <div>2. Replace <code className="text-cyan-300">localhost</code> in the box above with your PC&apos;s local IP address (e.g., <code className="text-emerald-400">http://192.168.1.50:5173</code>).</div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>🌐 MOBILE NETWORK ADDRESS ACTIVE</span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                Target URL: <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-emerald-300 font-bold">{targetUrl}</code>. Mobile phones on the local network or public tunnel can scan and open this application immediately.
              </p>
            </div>
          )}

          {/* How to use steps */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> How Mobile Phones Read This:
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Open default <strong className="text-slate-200">Camera App</strong> on iOS or Android.</li>
              <li>Point camera lens directly at the generated QR Code.</li>
              <li>Tap the web link pop-up to immediately browse the web application.</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      {!isModal && (
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
      )}
      {content}
    </div>
  );
}
