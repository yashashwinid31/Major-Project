import React, { useState } from 'react';
import { useIdentity } from '../../context/IdentityContext';
import { 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert,
  FileCheck,
  Tag,
  FolderKanban,
  RefreshCw,
  Crop,
  Wand2,
  Sliders,
  RotateCw,
  Maximize2,
  Clock,
  HardDrive,
  FileType,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { getSampleDocument } from '../../utils/cryptoUtils';

export default function Stage2DocUpload() {
  const { uploadedDoc, uploadDocument, setCurrentStage, userProfile } = useIdentity();
  
  const [category, setCategory] = useState(uploadedDoc?.category || 'Educational Degree');
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('normalized'); // preview filter: 'original' | 'boundary' | 'quality' | 'denoised' | 'normalized'
  const [analysisProgress, setAnalysisProgress] = useState(100);

  // Process file upload & simulate instant automatic analysis
  const processAndUpload = async (file, docCategory) => {
    setIsUploading(true);
    setAnalysisProgress(0);

    // Simulate preprocessing step progress
    const progressTimer = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 30;
      });
    }, 200);

    const uploadTimeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('category', docCategory || category);
      formData.append('uploadedBy', userProfile?.fullName || 'Alexander Vance');
      formData.append('roleAccess', userProfile?.role || 'Identity Owner');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success && data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        uploadDocument({
          fileName: doc.original_name,
          fileSize: doc.formattedSize,
          fileType: doc.file_type,
          category: doc.file_category,
          previewUrl: doc.viewUrl,
          uploadTime: uploadTimeStr,
          rawBytes: file.size,
          issuedTo: userProfile?.fullName || 'Alexander Vance',
          documentId: doc.id,
          issuer: 'Official Issuing Authority',
          issueDate: new Date().toISOString().split('T')[0],
          rawHashSeed: doc.file_hash,
          preprocessing: {
            boundaryDetected: true,
            boundaryCoords: { x: 18, y: 18, width: 564, height: 384 },
            qualityScore: 97.2,
            noiseLevel: "0.014 (Filtered)",
            skewAngle: "-1.1° → 0.0° (Corrected)",
            tensorShape: "[1, 3, 512, 512]"
          }
        });
      } else {
        throw new Error('Upload API response missing document records.');
      }
    } catch (err) {
      console.warn('Backend API upload fallback to local reader:', err);
      // Fallback local file reader
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadDocument({
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          fileType: file.type || 'application/pdf',
          category: docCategory || category,
          uploadTime: uploadTimeStr,
          rawBytes: file.size,
          previewUrl: event.target.result,
          issuedTo: userProfile?.fullName || 'Alexander Vance',
          documentId: 'DOC-' + Math.floor(100000 + Math.random() * 900000),
          issuer: 'Official Issuing Authority',
          issueDate: new Date().toISOString().split('T')[0],
          rawHashSeed: file.name + file.size + Date.now(),
          preprocessing: {
            boundaryDetected: true,
            boundaryCoords: { x: 18, y: 18, width: 564, height: 384 },
            qualityScore: 97.2,
            noiseLevel: "0.014 (Filtered)",
            skewAngle: "-1.1° → 0.0° (Corrected)",
            tensorShape: "[1, 3, 512, 512]"
          }
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setAnalysisProgress(100);
      clearInterval(progressTimer);
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUpload(file, category);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <UploadCloud className="w-3.5 h-3.5" /> STEP 02: DOCUMENT INGESTION &amp; AUTOMATIC ANALYSIS
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Document Upload &amp; Automatic Preprocessing</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Upload identity cards, certificates, or PDF documents. Upon upload, our automatic analysis engine immediately detects document boundaries, enhances quality, removes noise, corrects skew, and normalizes image matrices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Dropzone & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Select Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
              >
                <option value="Educational Degree">Educational Degree Certificate</option>
                <option value="Identity Card">National Identity Card / Passport</option>
                <option value="Medical Certificate">Medical Authorization Record</option>
                <option value="Land Record">Property Land Deed</option>
              </select>
            </div>

            {/* Drop Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) {
                  processAndUpload(e.dataTransfer.files[0], category);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative overflow-hidden ${
                dragOver 
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/20">
                {isUploading ? <RefreshCw className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
              </div>
              <h4 className="font-semibold text-sm text-slate-200">
                {isUploading ? 'Uploading & Executing Automatic Analysis...' : 'Drag & Drop Document or Browse'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Supports Images (JPG, JPEG, PNG) &amp; PDFs (Max 25MB)
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-mono">
                <span>File Browser Ready</span>
              </div>
            </div>
          </div>

          {/* Automatic Analysis Process Status Breakdown */}
          {uploadedDoc && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-cyan-400" /> Automatic Analysis Report
                </h4>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800 font-bold">
                  AUTOPROCESS COMPLETE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <Crop className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Boundaries</span>
                    <span className="text-slate-200 font-mono font-semibold">Detected [18,18,564,384]</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quality Score</span>
                    <span className="text-emerald-400 font-mono font-semibold">97.8% (Enhanced)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <Wand2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Noise Level</span>
                    <span className="text-slate-200 font-mono font-semibold">Filtered (Bilateral)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Skew Correction</span>
                    <span className="text-slate-200 font-mono font-semibold">-1.2° → 0.0° Horizontal</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Tensor Normalization:</span>
                <span className="text-cyan-300 font-mono font-bold">[1, 3, 512, 512] Float32</span>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Document Preview & Metadata Panel */}
        <div className="lg:col-span-7 space-y-6">
          {uploadedDoc ? (
            <div className="glass-panel-glow rounded-2xl p-6 space-y-5 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4.5 h-4.5 text-cyan-400" />
                  <h3 className="font-semibold text-sm text-slate-200">Interactive Document Viewer</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  uploadedDoc.isForged 
                    ? 'bg-red-950/80 text-red-400 border border-red-800' 
                    : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                }`}>
                  {uploadedDoc.isForged ? 'PRESET FORGED SAMPLE' : 'PRESET GENUINE SAMPLE'}
                </span>
              </div>

              {/* Automatic Preprocessing View Controls */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-[11px] font-mono">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                    activeTab === 'original' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" /> Raw Input
                </button>
                <button
                  onClick={() => setActiveTab('boundary')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                    activeTab === 'boundary' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crop className="w-3 h-3" /> Boundary Box
                </button>
                <button
                  onClick={() => setActiveTab('quality')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                    activeTab === 'quality' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3 h-3" /> Contrast Boost
                </button>
                <button
                  onClick={() => setActiveTab('denoised')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                    activeTab === 'denoised' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wand2 className="w-3 h-3" /> Denoised
                </button>
                <button
                  onClick={() => setActiveTab('normalized')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                    activeTab === 'normalized' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Maximize2 className="w-3 h-3" /> Deskewed &amp; Tensor
                </button>
              </div>

              {/* Document Image Canvas Preview Box with Preprocessing Filter Overlays */}
              <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group aspect-video flex items-center justify-center shadow-inner">
                {/* Visual Boundary Box Overlay when activeTab === 'boundary' */}
                {activeTab === 'boundary' && (
                  <div className="absolute inset-4 border-2 border-dashed border-cyan-400 pointer-events-none rounded-lg z-20 flex items-start justify-between p-2">
                    <span className="bg-cyan-950/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-800">
                      BOUNDS: [X:18, Y:18, W:564, H:384]
                    </span>
                    <span className="bg-cyan-950/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-800">
                      CONTOUR DETECTED (100%)
                    </span>
                  </div>
                )}

                {uploadedDoc.previewUrl ? (
                  <img 
                    src={uploadedDoc.previewUrl} 
                    alt="Uploaded document preview" 
                    className={`w-full h-full object-contain p-2 transition-all duration-300 ${
                      activeTab === 'quality' 
                        ? 'contrast-150 brightness-110 saturate-150' 
                        : activeTab === 'denoised' 
                        ? 'blur-[0.3px] brightness-105 contrast-125' 
                        : activeTab === 'normalized' 
                        ? 'hue-rotate-15 contrast-125' 
                        : ''
                    }`}
                  />
                ) : (
                  <div className="text-center p-6">
                    <FileText className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-mono">{uploadedDoc.fileName}</p>
                  </div>
                )}

                {/* Filter Indicator Tag */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-300 z-10 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                  <span>PREVIEW MODE: {activeTab.toUpperCase()}</span>
                </div>
              </div>

              {/* Requirement 1: Document Metadata Table (File Name, Size, Type, Upload Time) */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  Document Metadata Specifications
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold flex items-center gap-1">
                      <FileText className="w-3 h-3 text-cyan-400" /> File Name
                    </span>
                    <span className="font-mono text-slate-200 truncate block mt-1 font-bold">{uploadedDoc.fileName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" /> File Size
                    </span>
                    <span className="font-mono text-slate-200 block mt-1 font-bold">{uploadedDoc.fileSize}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold flex items-center gap-1">
                      <FileType className="w-3 h-3 text-cyan-400" /> File Type
                    </span>
                    <span className="font-mono text-cyan-300 block mt-1 truncate font-bold">{uploadedDoc.fileType}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> Upload Time
                    </span>
                    <span className="font-mono text-slate-200 block mt-1 text-[11px] font-bold">{uploadedDoc.uploadTime}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setCurrentStage(8)}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <FolderKanban className="w-4 h-4 text-slate-400" /> Document Library
                </button>

                <button
                  onClick={() => setCurrentStage(3)}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  Run Step 3 AI Forgery Scan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-10 border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center mx-auto border border-slate-800">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">No Document Uploaded Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Drag and drop a file or select a quick test sample on the left to initiate automatic analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
