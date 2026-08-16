import React from 'react';
import { X, Download, FileText, Calendar, User, CheckCircle2, ExternalLink } from 'lucide-react';
import { ProofAttachment } from '../../types';

interface ProofViewerModalProps {
  isOpen: boolean;
  proof: ProofAttachment | null | undefined;
  targetTitle?: string;
  onClose: () => void;
}

export const ProofViewerModal: React.FC<ProofViewerModalProps> = ({
  isOpen,
  proof,
  targetTitle,
  onClose,
}) => {
  if (!isOpen || !proof) return null;

  const isImage = proof.type?.startsWith('image/') || proof.name?.match(/\.(jpeg|jpg|png|webp)$/i);
  const isPdf = proof.type?.includes('pdf') || proof.name?.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    if (!proof.url) return;
    const link = document.createElement('a');
    link.href = proof.url;
    link.download = proof.name || 'isbot_hujjati';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs md:text-sm text-white">Bajarilganlik Isbot Hujjati</h3>
              <p className="text-[10px] text-slate-300 truncate max-w-md">
                {targetTitle || proof.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {proof.url && (
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Yuklab olish
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4 bg-slate-100 flex-1 overflow-y-auto flex items-center justify-center min-h-[300px] max-h-[500px]">
          {isImage && proof.url ? (
            <div className="relative rounded-xl overflow-hidden bg-white shadow-md border border-slate-200 max-h-full">
              <img
                src={proof.url}
                alt={proof.name}
                className="max-w-full max-h-[450px] object-contain rounded-xl"
              />
            </div>
          ) : isPdf ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{proof.name}</h4>
                <p className="text-xs text-slate-500 mt-1">PDF Hujjat &bull; {proof.size || 'Hajmi mavjud'}</p>
              </div>
              {proof.url && (
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" /> PDF Hujjatni Ochish / Yuklash
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center max-w-md space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-xs">{proof.name}</div>
              <div className="text-[11px] text-slate-400">{proof.size}</div>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="p-4 bg-white border-t border-slate-200 text-xs space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 block font-semibold">Yuklagan xodim:</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-emerald-600" /> {proof.uploadedBy}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Yuklangan vaqt:</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {proof.uploadedAt}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Fayl hajmi & formati:</span>
              <strong className="text-slate-800 font-mono mt-0.5 block">
                {proof.size || '1.2 MB'} &bull; {proof.name.split('.').pop()?.toUpperCase()}
              </strong>
            </div>
          </div>

          {proof.comment && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs">
              <strong className="text-slate-900 block text-[11px] mb-0.5">Xodim izohi:</strong>
              {proof.comment}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
