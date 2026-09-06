import React, { useState } from 'react';
import { Search, ArrowDownToLine, ArrowUpFromLine, Trash2, Building2 } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { InvoiceDirection } from '../../types';
import { getTodayISO } from '../../utils/oborotka';

export const InvoicesView: React.FC = () => {
  const { clients, invoices, addInvoice, deleteInvoice, openClientCard, currentUser } = useCRM();

  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | InvoiceDirection>('ALL');

  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [direction, setDirection] = useState<InvoiceDirection>('KIRIM');
  const [date, setDate] = useState(getTodayISO());
  const [notes, setNotes] = useState('');

  const clientOptions = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.stir.includes(clientSearch)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !date) return;
    addInvoice(selectedClientId, direction, date, notes || undefined);
    setSelectedClientId('');
    setNotes('');
    setDate(getTodayISO());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Ushbu faktura yozuvini o\'chirishni tasdiqlaysizmi?')) {
      deleteInvoice(id);
    }
  };

  const totalIncoming = invoices.filter(i => i.direction === 'KIRIM').length;
  const totalOutgoing = invoices.filter(i => i.direction === 'CHIQIM').length;

  const filtered = invoices.filter(i => {
    const matchesSearch = i.clientName.toLowerCase().includes(search.toLowerCase()) || i.stir.includes(search);
    const matchesDirection = directionFilter === 'ALL' || i.direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Elektron Fakturalar</h1>
          <p className="text-xs text-slate-500">
            Mijozlarning imzolangan (kirim) va yuborilgan (chiqim) fakturalari — sana va kim kiritgani bilan qayd etiladi
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Hozircha qo'lda kiritiladi — Didox API integratsiyasi keyinroq ulanadi
          </p>
        </div>
      </div>

      {/* 2 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
            <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" /> Jami Kirim Fakturalar
          </span>
          <div className="text-2xl font-black text-slate-900">{totalIncoming} ta</div>
          <p className="text-xs text-emerald-600 font-semibold">Mijoz tomonidan imzolangan fakturalar</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
            <ArrowUpFromLine className="w-3.5 h-3.5 text-blue-600" /> Jami Chiqim Fakturalar
          </span>
          <div className="text-2xl font-black text-slate-900">{totalOutgoing} ta</div>
          <p className="text-xs text-blue-600 font-semibold">Mijozga yuborilgan fakturalar</p>
        </div>
      </div>

      {/* Add Invoice Form */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 mb-3">Yangi Faktura Qayd Etish</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Mijoz</label>
            <input
              type="text"
              placeholder="Mijozni qidirish (nomi yoki STIR)..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full px-3 py-2 mb-1.5 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">Mijozni tanlang... ({clientOptions.length} ta)</option>
              {clientOptions.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.stir})</option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Turi</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as InvoiceDirection)}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="KIRIM">Kirim (imzolangan)</option>
              <option value="CHIQIM">Chiqim (yuborilgan)</option>
            </select>
          </div>

          <div className="w-36">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Sana</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="min-w-[180px] flex-1">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Izoh (ixtiyoriy)</label>
            <input
              type="text"
              placeholder="Masalan: faktura raqami"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shrink-0 shadow-xs"
          >
            Qayd Etish
          </button>
        </form>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Mijoz nomi yoki STIR bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 placeholder:text-slate-500"
          />
        </div>

        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value as 'ALL' | InvoiceDirection)}
          className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Turlar</option>
          <option value="KIRIM">Faqat Kirim</option>
          <option value="CHIQIM">Faqat Chiqim</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Sana</th>
                <th className="p-3.5">Mijoz & STIR</th>
                <th className="p-3.5">Turi</th>
                <th className="p-3.5">Qo'shgan xodim</th>
                <th className="p-3.5">Izoh</th>
                <th className="p-3.5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-slate-500">Hozircha faktura yozuvlari yo'q</td>
                </tr>
              ) : (
                sorted.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-100/50">
                    <td className="p-3.5 text-slate-700 font-mono">{inv.date}</td>
                    <td className="p-3.5">
                      <div
                        onClick={() => openClientCard(inv.clientId)}
                        className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm flex items-center gap-1.5"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {inv.clientName}
                      </div>
                      <div className="text-[11px] text-slate-600">STIR: {inv.stir}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                        inv.direction === 'KIRIM' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {inv.direction === 'KIRIM' ? <ArrowDownToLine className="w-3 h-3" /> : <ArrowUpFromLine className="w-3 h-3" />}
                        {inv.direction === 'KIRIM' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-semibold">{inv.enteredByName}</td>
                    <td className="p-3.5 text-slate-600">{inv.notes || '—'}</td>
                    <td className="p-3.5 text-right">
                      {currentUser.role === 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
