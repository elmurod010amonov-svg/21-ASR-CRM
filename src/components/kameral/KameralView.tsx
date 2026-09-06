import React, { useState } from 'react';
import { FileSearch, Search, AlertTriangle, CheckCircle2, Clock, Building2, Plus, X, FileCheck, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { KameralAudit, KameralStatus, ProofAttachment } from '../../types';
import { ProofUploadModal } from '../common/ProofUploadModal';
import { ProofViewerModal } from '../common/ProofViewerModal';

export const KameralView: React.FC = () => {
  const { kameral, updateKameralStatus, openClientCard, addKameral, clients } = useCRM();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mandatory proof modals state
  const [kameralForProofUpload, setKameralForProofUpload] = useState<KameralAudit | null>(null);
  const [viewingProof, setViewingProof] = useState<{ proof: ProofAttachment; title: string } | null>(null);

  const handleProofConfirmed = (proof: ProofAttachment, notes?: string) => {
    if (!kameralForProofUpload) return;
    updateKameralStatus(kameralForProofUpload.id, 'YOPILDI', notes, proof);
    setKameralForProofUpload(null);
  };

  // New Kameral state
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [auditType, setAuditType] = useState('QQS va Foyda solig\'i mutanosibligi');
  const [summary, setSummary] = useState('');
  const [discrepancyAmount, setDiscrepancyAmount] = useState('14500000');
  const [deadlineDate, setDeadlineDate] = useState('2026-08-20');

  const filtered = kameral.filter(k => {
    const matchesSearch = 
      k.clientName.toLowerCase().includes(search.toLowerCase()) || 
      k.stir.includes(search) || 
      k.auditType.toLowerCase().includes(search.toLowerCase()) ||
      k.summary.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    addKameral({
      clientId: client.id,
      clientName: client.name,
      stir: client.stir,
      accountantId: client.accountantId,
      accountantName: client.accountantName,
      auditType,
      receivedDate: new Date().toISOString().split('T')[0],
      deadlineDate,
      status: 'OCHIQ',
      summary,
      discrepancyAmount: parseInt(discrepancyAmount.replace(/\D/g, ''), 10) || undefined,
    });

    setSummary('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Kameral Soliq Tekshiruvlari</h1>
          <p className="text-xs text-slate-500">
            Soliq idoralari tomonidan yuborilgan kameral xulosalar, tafovutlar va tushuntirish berish nazorati
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Yangi Kameral Qayd Etish
        </button>
      </div>

      {/* Mandatory Proof notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>Nazorat qoidasi:</strong> Kameral tekshiruvni <strong>"Yopildi"</strong> deb yakunlash uchun tushuntirish javobi yoki hujjat (JPG/PNG/PDF) yuklanishi majburiy.
        </span>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Mijoz nomi, STIR yoki tekshiruv turi..."
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
          <option value="OCHIQ">Ochiq</option>
          <option value="KAMCHILIK_ANIQLANDI">Kamchilik Aniqlangan</option>
          <option value="TUSHUNTIRISH_YUBORILDI">Tushuntirish Yuborildi</option>
          <option value="YOPILDI">Ijobiy Yopildi</option>
        </select>
      </div>

      {/* Kameral Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
            Kameral tekshiruvlar topilmadi.
          </div>
        ) : (
          filtered.map((k) => (
            <div key={k.id} className="p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span 
                      onClick={() => openClientCard(k.clientId)}
                      className="font-extrabold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                    >
                      {k.clientName}
                    </span>
                    <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      STIR: {k.stir}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800">
                      {k.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    Tekshiruv turi: {k.auditType}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {k.status !== 'YOPILDI' && (
                    <button
                      onClick={() => setKameralForProofUpload(k)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      title="Tushuntirish javobi yoki hujjatni JPG/PDF isbot yuklab tasdiqlash"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Yopildi deb belgilash (Isbot yuklash) ✓
                    </button>
                  )}
                  {k.status === 'OCHIQ' && (
                    <button
                      onClick={() => updateKameralStatus(k.id, 'TUSHUNTIRISH_YUBORILDI')}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
                    >
                      Tushuntirish yuborildi
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-slate-800 leading-relaxed font-medium">
                {k.summary}
              </div>

              {/* Proof Card (If kameral has been closed with proof) */}
              {k.proofAttachment && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                      {k.proofAttachment.type?.includes('pdf') ? (
                        <FileText className="w-4 h-4 text-rose-600" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-emerald-950 truncate flex items-center gap-1.5">
                        <span>Isbot: {k.proofAttachment.name}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">
                        Yuklagan: {k.proofAttachment.uploadedBy} &bull; {k.proofAttachment.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingProof({
                      proof: k.proofAttachment!,
                      title: `${k.clientName} - ${k.auditType}`
                    })}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" /> Isbotni ko'rish
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-4">
                  <span>Mas'ul buxgalter: <strong>{k.accountantName}</strong></span>
                  <span>Kelgan sana: <strong>{k.receivedDate}</strong></span>
                  <span>Oxirgi muddat (Deadline): <strong className="text-rose-700">{k.deadlineDate}</strong></span>
                </div>
                {k.discrepancyAmount && (
                  <div className="font-extrabold text-rose-700 text-xs">
                    Aniqlangan tafovut: {k.discrepancyAmount.toLocaleString()} so'm
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MANDATORY PROOF UPLOAD MODAL */}
      <ProofUploadModal
        isOpen={!!kameralForProofUpload}
        title="Kameral tekshiruv yopilganligini tasdiqlash"
        subtitle="Soliq idorasiga yuborilgan tushuntirish yoki yopilganlik xabarnomasini (JPG/PDF) yuklang"
        targetName={kameralForProofUpload?.auditType || ''}
        clientInfo={kameralForProofUpload ? {
          name: kameralForProofUpload.clientName,
          stir: kameralForProofUpload.stir
        } : undefined}
        actionLabel="Isbotni biriktirish va Yopildi deb belgilash ✓"
        onClose={() => setKameralForProofUpload(null)}
        onConfirm={handleProofConfirmed}
      />

      {/* PROOF VIEWER MODAL */}
      <ProofViewerModal
        isOpen={!!viewingProof}
        proof={viewingProof?.proof}
        targetTitle={viewingProof?.title}
        onClose={() => setViewingProof(null)}
      />

      {/* Add Kameral Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Yangi Kameral Tekshiruv Qayd Etish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-600 hover:text-slate-600">
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
                <label className="block text-slate-600 mb-1 font-bold">Tekshiruv turi:</label>
                <input
                  type="text"
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Tafovut summasi (so'm):</label>
                <input
                  type="number"
                  value={discrepancyAmount}
                  onChange={(e) => setDiscrepancyAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Javob berish muddati (Deadline):</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Qisqacha mazmuni:</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  placeholder="Kameral talabnoma sababi..."
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
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Qayd qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
