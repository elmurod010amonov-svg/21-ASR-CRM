import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Trash2,
  Eye
} from 'lucide-react';
import { ProofAttachment } from '../../types';
import { useCRM } from '../../context/CRMContext';

interface ProofUploadModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  targetName: string;
  targetLabel?: string;
  clientInfo?: { name: string; stir: string };
  actionLabel?: string;
  onClose: () => void;
  onConfirm: (proof: ProofAttachment, notes?: string) => void;
}

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  isOpen,
  title,
  subtitle,
  targetName,
  targetLabel = 'Topshiriq / Hisobot / Kamchilik:',
  clientInfo,
  actionLabel = 'Tasdiqlash va Bajarildi deb belgilash',
  onClose,
  onConfirm,
}) => {
  const { currentUser } = useCRM();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    size: string;
    dataUrl: string;
  } | null>(null);

  const [comment, setComment] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    
    if (!validTypes.includes(file.type)) {
      setError('Faqat JPG, PNG yoki PDF formatdagi isbot hujjatlari qabul qilinadi!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Fayl hajmi 10 MB dan oshmasligi kerak.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${sizeKB} KB`;

      setSelectedFile({
        name: file.name,
        type: file.type,
        size: sizeStr,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Bajarilganlikni tasdiqlash uchun JPG yoki PDF isbot yuklanishi shart!');
      return;
    }

    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;

    const proof: ProofAttachment = {
      name: selectedFile.name,
      type: selectedFile.type,
      url: selectedFile.dataUrl,
      size: selectedFile.size,
      uploadedAt: formatted,
      uploadedBy: currentUser.name,
      comment: comment.trim() || undefined,
    };

    onConfirm(proof, comment.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-300">
                {subtitle || 'Isbotsiz tasdiqlashga yo\'l qo\'yilmaydi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target details card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{targetLabel}</div>
            <div className="font-extrabold text-slate-900 text-sm">{targetName}</div>
            {clientInfo && (
              <div className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5 mt-0.5">
                <span>Mijoz: <strong>{clientInfo.name}</strong></span>
                <span className="font-mono text-[11px] text-slate-500">(STIR: {clientInfo.stir})</span>
              </div>
            )}
          </div>

          {/* Mandatory File Upload Zone */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 flex items-center justify-between">
              <span>Bajarilganlik Isboti (JPG, PNG yoki PDF) *</span>
              <span className="text-[11px] text-rose-600 font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Majburiy
              </span>
            </label>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">
                    Faylni bu yerga tashlang yoki <span className="text-emerald-700 underline">tanlang</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG skrinshotlar, to'lov kvitansiyasi yoki PDF hujjat (max 10MB)
                  </div>
                </div>
              </div>
            ) : (
              /* Selected File Preview Box */
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedFile.type.startsWith('image/') ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-emerald-200 shrink-0 shadow-2xs">
                      <img
                        src={selectedFile.dataUrl}
                        alt="Isbot preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {selectedFile.size} &bull; {selectedFile.type.toUpperCase().replace('APPLICATION/', '').replace('IMAGE/', '')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Faylni o'chirish va boshqasini tanlash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Comment / Note */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Bajarilganlik haqida qo'shimcha izoh (ixtiyoriy):
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Masalan: Fakturalar 1C ga to'liq kiritildi va soliq portaliga yuborildi."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white resize-none"
            />
          </div>

          {/* Verification info badge */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
            <strong>Muhim qoida:</strong> Isbot hujjati (JPG/PDF) bosh buxgalter va direktor tomonidan to'liq ko'rib chiqiladi. Isbotsiz vazifalar qabul qilinmaydi.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 ${
                selectedFile
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 cursor-pointer scale-100 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
