import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  X, 
  FileCheck,
  FileText,
  Image as ImageIcon,
  Eye,
  AlertTriangle,
  Calendar,
  User
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { IssueStatus, IssueRecord, ProofAttachment } from '../../types';
import { ProofUploadModal } from '../common/ProofUploadModal';
import { ProofViewerModal } from '../common/ProofViewerModal';

export const IssuesView: React.FC = () => {
  const { 
    issues, 
    updateIssueStatus, 
    resolveIssue, 
    createIssue, 
    clients, 
    currentUser, 
    openClientCard 
  } = useCRM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Proof modals state
  const [issueForProofUpload, setIssueForProofUpload] = useState<IssueRecord | null>(null);
  const [viewingProof, setViewingProof] = useState<{ proof: ProofAttachment; title: string } | null>(null);

  // New issue form
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [type, setType] = useState('1C va Hisobot tafovuti');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('2026-08-16');

  const filtered = issues.filter(i => {
    const matchesSearch = 
      i.clientName.toLowerCase().includes(search.toLowerCase()) || 
      i.stir.includes(search) || 
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      (i.accountantName && i.accountantName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    createIssue({
      clientId: client.id,
      clientName: client.name,
      stir: client.stir,
      accountantId: client.accountantId,
      accountantName: client.accountantName,
      type,
      description,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
      deadlineDate,
      status: 'OCHIQ',
      priority: 'YUQORI',
    });

    setDescription('');
    setShowAddModal(false);
  };

  const handleProofConfirmed = (proof: ProofAttachment, notes?: string) => {
    if (!issueForProofUpload) return;
    resolveIssue(issueForProofUpload.id, notes, proof);
    setIssueForProofUpload(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">Kamchiliklar & Nazorat Jurnali</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-extrabold flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> Isbot bilan tasdiqlanadi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direktor yoki Nazoratchi tomonidan aniqlangan tafovutlar, kamchiliklar va ularni bartaraf etish isboti
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Yangi Kamchilik Qayd Etish
        </button>
      </div>

      {/* Mandatory Proof notice */}
      <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-3 text-xs text-orange-950">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
          <span>
            <strong>Nazorat qoidasi:</strong> Kamchilikni <strong>"Tuzatildi"</strong> deb yopish uchun soliq xabarnomasi javobi, to'g'rilangan 1C oborotka yoki PDF dalolatnoma yuklanishi majburiy.
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Mijoz nomi, STIR yoki kamchilik izohi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Holatlar</option>
          <option value="OCHIQ">Ochiq Kamchiliklar</option>
          <option value="TUZATILDI">Tuzatilganlar (Isbotlangan)</option>
        </select>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            Kamchiliklar mavjud emas.
          </div>
        ) : (
          filtered.map((issue) => (
            <div 
              key={issue.id} 
              className={`p-5 rounded-2xl bg-white border transition-all shadow-2xs space-y-3 ${
                issue.status === 'TUZATILDI' 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : 'border-orange-200 hover:border-orange-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span 
                      onClick={() => openClientCard(issue.clientId)}
                      className="font-extrabold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                    >
                      {issue.clientName}
                    </span>
                    <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      STIR: {issue.stir}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      issue.status === 'TUZATILDI' 
                        ? 'bg-emerald-100 text-emerald-800 flex items-center gap-1' 
                        : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}>
                      {issue.status === 'TUZATILDI' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {issue.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-orange-950 mt-1">
                    Kamchilik turi: <span className="text-slate-800">{issue.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {issue.status === 'OCHIQ' ? (
                    <button
                      onClick={() => setIssueForProofUpload(issue)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                      title="Kamchilik tuzatilganligini JPG/PDF isbot yuklab tasdiqlash"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Tuzatildi deb tasdiqlash (Isbot yuklash) ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => updateIssueStatus(issue.id, 'OCHIQ')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Qayta ochish
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-xs text-slate-800 leading-relaxed font-medium">
                {issue.description}
              </div>

              {/* Proof Card (If issue is resolved) */}
              {issue.proofAttachment && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                      {issue.proofAttachment.type?.includes('pdf') ? (
                        <FileText className="w-4 h-4 text-rose-600" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-emerald-950 truncate flex items-center gap-1.5">
                        <span>Isbot: {issue.proofAttachment.name}</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {issue.proofAttachment.size || 'Fayl'}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">
                        Yuklagan: {issue.proofAttachment.uploadedBy} &bull; {issue.proofAttachment.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingProof({
                      proof: issue.proofAttachment!,
                      title: `${issue.clientName} - ${issue.type}`
                    })}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" /> Isbotni ko'rish
                  </button>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-4">
                  <span>Aniqlagan shaxs: <strong>{issue.creatorName}</strong></span>
                  <span>Mas'ul buxgalter: <strong>{issue.accountantName || 'Tayinlanmagan'}</strong></span>
                  <span>Tuzatish muddati: <strong className="text-rose-700">{issue.deadlineDate}</strong></span>
                </div>
                {issue.resolvedAt && (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tuzatilgan vaqt: {issue.resolvedAt}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MANDATORY PROOF UPLOAD MODAL */}
      <ProofUploadModal
        isOpen={!!issueForProofUpload}
        title="Kamchilik bartaraf etilganligini tasdiqlash"
        subtitle="Soliq xabarnomasi, to'g'rilangan hisobot yoki 1C skrinshotini (JPG/PDF) yuklang"
        targetName={issueForProofUpload?.type || ''}
        clientInfo={issueForProofUpload ? {
          name: issueForProofUpload.clientName,
          stir: issueForProofUpload.stir
        } : undefined}
        actionLabel="Isbotni biriktirish va Tuzatildi deb belgilash ✓"
        onClose={() => setIssueForProofUpload(null)}
        onConfirm={handleProofConfirmed}
      />

      {/* PROOF VIEWER MODAL */}
      <ProofViewerModal
        isOpen={!!viewingProof}
        proof={viewingProof?.proof}
        targetTitle={viewingProof?.title}
        onClose={() => setViewingProof(null)}
      />

      {/* Add Issue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Yangi Kamchilik Qayd Etish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Mijozni tanlang:</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.stir})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Kamchilik turi:</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Tuzatish oxirgi muddati:</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Batafsil izoh:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  placeholder="Kamchilik tafsilotlari..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
