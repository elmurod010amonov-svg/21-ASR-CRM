import React, { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { getTodayISO } from '../../utils/oborotka';

export const ReceiptsView: React.FC = () => {
  const { clients, receipts, addReceipt, updateReceipt, deleteReceipt, openClientCard } = useCRM();

  // Mijozlar bitta buxgalterga emas, balki barcha xodimlarga umumiy — shuning
  // uchun har bir xodim (roli qat'iy nazar) barcha mijozlar/cheklarni ko'radi.
  const scopedClients = clients;
  const scopedReceipts = receipts;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [cashAmount, setCashAmount] = useState('');
  const [terminalAmount, setTerminalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  const clientOptions = scopedClients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.stir.includes(clientSearch)
  );

  const cash = parseInt(cashAmount.replace(/\D/g, ''), 10) || 0;
  const terminal = parseInt(terminalAmount.replace(/\D/g, ''), 10) || 0;
  const total = cash + terminal;

  const resetForm = () => {
    setEditingId(null);
    setSelectedClientId('');
    setDate(getTodayISO());
    setCashAmount('');
    setTerminalAmount('');
    setNotes('');
  };

  const startEdit = (receiptId: string) => {
    const r = scopedReceipts.find(x => x.id === receiptId);
    if (!r) return;
    setEditingId(r.id);
    setSelectedClientId(r.clientId);
    setDate(r.date);
    setCashAmount(String(r.cashAmount));
    setTerminalAmount(String(r.terminalAmount));
    setNotes(r.notes || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateReceipt(editingId, { cashAmount: cash, terminalAmount: terminal, date, notes: notes || undefined });
    } else {
      if (!selectedClientId || total <= 0) return;
      addReceipt(selectedClientId, cash, terminal, date, notes || undefined);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Ushbu chek yozuvini o\'chirishni tasdiqlaysizmi?')) {
      deleteReceipt(id);
      if (editingId === id) resetForm();
    }
  };

  const filteredReceipts = scopedReceipts.filter(r =>
    r.clientName.toLowerCase().includes(search.toLowerCase()) || r.stir.includes(search)
  );

  const sortedReceipts = [...filteredReceipts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Chek Tahrirlash</h1>
          <p className="text-xs text-slate-600">Mijozlar bo'yicha urilgan cheklar — jami, naqd va terminal summasi nazorati</p>
        </div>
      </div>

      {/* Add / Edit Receipt Form */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 mb-3">{editingId ? 'Chekni Tahrirlash' : 'Yangi Chek Yozish'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Mijoz</label>
            {!editingId && (
              <input
                type="text"
                placeholder="Mijozni qidirish (nomi yoki STIR)..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full px-3 py-2 mb-1.5 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500"
              />
            )}
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              disabled={!!editingId}
              required
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 disabled:opacity-60 cursor-pointer"
            >
              <option value="">Mijozni tanlang... ({clientOptions.length} ta)</option>
              {clientOptions.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.stir})</option>
              ))}
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

          <div className="w-32">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Naqd summa</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-emerald-500"
            />
          </div>

          <div className="w-32">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Terminal summasi</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={terminalAmount}
              onChange={(e) => setTerminalAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-emerald-500"
            />
          </div>

          <div className="w-32">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Jami summa</label>
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-700">
              {total.toLocaleString()}
            </div>
          </div>

          <div className="min-w-[180px] flex-1">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Izoh (ixtiyoriy)</label>
            <input
              type="text"
              placeholder="Masalan: kunlik kassa"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shrink-0 shadow-xs"
            >
              {editingId ? 'Saqlash' : 'Chek Yozish'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Mijoz nomi yoki STIR bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] px-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 placeholder:text-slate-500"
        />
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mijoz & STIR</th>
                <th className="p-3.5">Sana</th>
                <th className="p-3.5">Naqd Summa</th>
                <th className="p-3.5">Terminal Summasi</th>
                <th className="p-3.5">Jami Summa</th>
                <th className="p-3.5">Izoh</th>
                <th className="p-3.5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-slate-500">Hozircha chek yozuvlari yo'q</td>
                </tr>
              ) : (
                sortedReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-100/50">
                    <td className="p-3.5">
                      <div
                        onClick={() => openClientCard(r.clientId)}
                        className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                      >
                        {r.clientName}
                      </div>
                      <div className="text-[11px] text-slate-600">STIR: {r.stir}</div>
                    </td>
                    <td className="p-3.5 text-slate-700 font-mono">{r.date}</td>
                    <td className="p-3.5 font-semibold text-slate-800 font-mono">{r.cashAmount.toLocaleString()} so'm</td>
                    <td className="p-3.5 font-semibold text-blue-700 font-mono">{r.terminalAmount.toLocaleString()} so'm</td>
                    <td className="p-3.5 font-bold text-emerald-600 font-mono">{r.totalAmount.toLocaleString()} so'm</td>
                    <td className="p-3.5 text-slate-600">{r.notes || '—'}</td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => startEdit(r.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
