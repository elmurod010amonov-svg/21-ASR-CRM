import React, { useState } from 'react';
import { Mail, Search, Eye, Send, CheckCircle2, Clock, AlertTriangle, Building2 } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const LettersView: React.FC = () => {
  const { letters, markLetterAsRead, updateLetterStatus, openClientCard } = useCRM();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
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
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
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
                      onClick={() => updateLetterStatus(letter.id, 'JAVOB_BERILDI', new Date().toISOString().split('T')[0])}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Javob Berildi
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
                {letter.summary}
              </div>

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
    </div>
  );
};
