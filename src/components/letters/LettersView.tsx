import React, { useState } from 'react';
import { Mail, Search, Eye, Send, CheckCircle2, Clock, AlertTriangle, Building2, Trash2, FileCheck, FileText, Image as ImageIcon, Plus, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { LetterRecord, ProofAttachment } from '../../types';
import { ProofUploadModal } from '../common/ProofUploadModal';
import { ProofViewerModal } from '../common/ProofViewerModal';

const emptyDraft = {
  clientId: '',
  letterNumber: '',
  type: '',
  summary: '',
  receivedDate: new Date().toISOString().split('T')[0],
  responseDeadline: '',
};

export const LettersView: React.FC = () => {
  const { letters, clients, markLetterAsRead, updateLetterStatus, openClientCard, deleteLetter, createLetter, currentUser } = useCRM();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [clientPickerSearch, setClientPickerSearch] = useState('');

  const resetDraft = () => { setDraft(emptyDraft); setClientPickerSearch(''); };

  const selectedDraftClient = clients.find(c => c.id === draft.clientId);
  const clientPickerResults = clients.filter(c =>
    c.name.toLowerCase().includes(clientPickerSearch.toLowerCase()) || c.stir.includes(clientPickerSearch)
  );

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === draft.clientId);
    if (!client || !draft.letterNumber || !draft.type || !draft.responseDeadline) return;

    createLetter({
      clientId: client.id,
      clientName: client.name,
      stir: client.stir,
      letterNumber: draft.letterNumber,
      type: draft.type,
      summary: draft.summary,
      receivedDate: draft.receivedDate,
      responseDeadline: draft.responseDeadline,
      status: 'YANGI',
      accountantId: client.accountantId,
    });
    resetDraft();
    setIsAddOpen(false);
  };

  // Mandatory proof modals state
  const [letterForProofUpload, setLetterForProofUpload] = useState<LetterRecord | null>(null);
  const [viewingProof, setViewingProof] = useState<{ proof: ProofAttachment; title: string } | null>(null);

  const handleProofConfirmed = (proof: ProofAttachment, notes?: string) => {
    if (!letterForProofUpload) return;
    updateLetterStatus(letterForProofUpload.id, 'JAVOB_BERILDI', new Date().toISOString().split('T')[0], notes, proof);
    setLetterForProofUpload(null);
  };

  const filtered = letters.filter(l => {
    const matchesSearch = 
      l.clientName.toLowerCase().includes(search.toLowerCase()) || 
      l.stir.includes(search) || 
      l.letterNumber.toLowerCase().includes(search.toLowerCase()) ||
      l.summary.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Soliq Xatlari & Talabnomalar</h1>
          <p className="text-xs text-slate-500">
            Davlat soliq xizmati va davlat organlaridan kelgan rasmiy xatlar monitoringi (O'qilgan vaqti avtomatik qayd etiladi)
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Yangi xat qo'shish
        </button>
      </div>

      {/* Mandatory Proof notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>Nazorat qoidasi:</strong> Xatni <strong>"Javob Berildi"</strong> deb yakunlash uchun javob xati yoki portal skrinshoti (JPG/PNG/PDF) yuklanishi majburiy.
        </span>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Xat raqami, mijoz nomi, STIR yoki mazmuni..."
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
          <option value="ALL">Barcha Xat Holatlari</option>
          <option value="YANGI">Yangi (O'qilmagan)</option>
          <option value="OQILGAN">O'qilgan</option>
          <option value="JAVOB_KUTILMOQDA">Javob Kutilmoqda</option>
          <option value="JAVOB_BERILDI">Javob Berildi</option>
        </select>
      </div>

      {/* Letters List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
            Mos keluvchi soliq xatlari topilmadi.
          </div>
        ) : (
          filtered.map((letter) => (
            <div
              key={letter.id}
              className={`p-5 rounded-2xl bg-white border transition-all space-y-3 ${
                letter.status === 'YANGI'
                  ? 'border-purple-300 ring-2 ring-purple-100 shadow-sm'
                  : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span 
                      onClick={() => openClientCard(letter.clientId)}
                      className="font-extrabold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                    >
                      {letter.clientName}
                    </span>
                    <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      STIR: {letter.stir}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                      {letter.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      letter.status === 'YANGI' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                      letter.status === 'OQILGAN' ? 'bg-blue-100 text-blue-800' :
                      letter.status === 'JAVOB_BERILDI' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {letter.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-purple-900 mt-1">
                    Xat raqami: {letter.letterNumber} &bull; Kelgan sana: {letter.receivedDate}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {letter.status === 'YANGI' && (
                    <button
                      onClick={() => markLetterAsRead(letter.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> O'qildi
                    </button>
                  )}

                  {letter.status !== 'JAVOB_BERILDI' && (
                    <button
                      onClick={() => setLetterForProofUpload(letter)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      title="Javob berilganligini JPG/PDF isbot yuklab tasdiqlash"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Javob Berildi (Isbot yuklash)
                    </button>
                  )}

                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => deleteLetter(letter.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
                {letter.summary}
              </div>

              {/* Proof Card (If letter has been replied to with proof) */}
              {letter.proofAttachment && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                      {letter.proofAttachment.type?.includes('pdf') ? (
                        <FileText className="w-4 h-4 text-rose-600" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-emerald-950 truncate flex items-center gap-1.5">
                        <span>Isbot: {letter.proofAttachment.name}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">
                        Yuklagan: {letter.proofAttachment.uploadedBy} &bull; {letter.proofAttachment.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingProof({
                      proof: letter.proofAttachment!,
                      title: `${letter.clientName} - ${letter.letterNumber}`
                    })}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" /> Isbotni ko'rish
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-4">
                  <span>Mas'ul xodim: <strong>{letter.accountantName}</strong></span>
                  <span>O'qilgan vaqti: <strong className="text-blue-700">{letter.readAt || 'O\'qilmagan'}</strong> ({letter.readBy || '—'})</span>
                  <span>Javob oxirgi muddati: <strong className="text-rose-700">{letter.responseDeadline}</strong></span>
                </div>
                {letter.repliedAt && (
                  <span className="font-bold text-emerald-700">Javob berilgan sana: {letter.repliedAt}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MANDATORY PROOF UPLOAD MODAL */}
      <ProofUploadModal
        isOpen={!!letterForProofUpload}
        title="Xatga javob berilganligini tasdiqlash"
        subtitle="Yuborilgan javob xati yoki portal skrinshotini (JPG/PDF) yuklang"
        targetName={letterForProofUpload ? `${letterForProofUpload.letterNumber} - ${letterForProofUpload.type}` : ''}
        clientInfo={letterForProofUpload ? {
          name: letterForProofUpload.clientName,
          stir: letterForProofUpload.stir
        } : undefined}
        actionLabel="Isbotni biriktirish va Javob Berildi deb belgilash ✓"
        onClose={() => setLetterForProofUpload(null)}
        onConfirm={handleProofConfirmed}
      />

      {/* PROOF VIEWER MODAL */}
      <ProofViewerModal
        isOpen={!!viewingProof}
        proof={viewingProof?.proof}
        targetTitle={viewingProof?.title}
        onClose={() => setViewingProof(null)}
      />

      {/* NEW LETTER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600" /> Yangi Soliq Xati Qo'shish
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddOpen(false); resetDraft(); }}
                className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLetter} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mijoz *</label>
                {selectedDraftClient ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs">
                    <span className="font-bold text-purple-900 truncate">
                      {selectedDraftClient.name} <span className="font-mono text-purple-500">({selectedDraftClient.stir})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, clientId: '' })}
                      className="p-1 text-purple-500 hover:text-purple-800 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={clientPickerSearch}
                        onChange={(e) => setClientPickerSearch(e.target.value)}
                        placeholder="Mijoz nomi yoki STIR bo'yicha qidirish..."
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <div className="mt-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                      {clientPickerResults.length === 0 ? (
                        <div className="p-2.5 text-center text-[11px] text-slate-400">Mijoz topilmadi</div>
                      ) : (
                        clientPickerResults.map(c => (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => { setDraft({ ...draft, clientId: c.id }); setClientPickerSearch(''); }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 cursor-pointer"
                          >
                            {c.name} <span className="text-slate-400 font-mono text-[10px]">({c.stir})</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Xat raqami *</label>
                  <input
                    required
                    type="text"
                    value={draft.letterNumber}
                    onChange={(e) => setDraft({ ...draft, letterNumber: e.target.value })}
                    placeholder="masalan: 12-15/3421"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Xat turi *</label>
                  <input
                    required
                    type="text"
                    value={draft.type}
                    onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                    placeholder="masalan: Soliq qo'mitasi talabnomasi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mazmuni / Qisqacha izoh</label>
                <textarea
                  value={draft.summary}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  rows={3}
                  placeholder="Xatning qisqacha mazmuni..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kelgan sana *</label>
                  <input
                    required
                    type="date"
                    value={draft.receivedDate}
                    onChange={(e) => setDraft({ ...draft, receivedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Javob muddati *</label>
                  <input
                    required
                    type="date"
                    value={draft.responseDeadline}
                    onChange={(e) => setDraft({ ...draft, responseDeadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); resetDraft(); }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Xatni qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
