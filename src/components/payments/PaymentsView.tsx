import React, { useState } from 'react';
import { CreditCard, Search, Plus, CheckCircle2, AlertCircle, DollarSign, ArrowUpRight } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const PaymentsView: React.FC = () => {
  const { payments, recordPayment, openClientCard, currentUser } = useCRM();
  const canManagePayments = currentUser.role === 'KASSIR';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClientForPay, setSelectedClientForPay] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const totalContract = payments.reduce((acc, p) => acc + p.monthlyFee, 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDebt = payments.reduce((acc, p) => acc + p.debtAmount, 0);

  const filtered = payments.filter(p => {
    const matchesSearch = p.clientName.toLowerCase().includes(search.toLowerCase()) || p.stir.includes(search);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPay) return;
    const amount = parseInt(payAmount.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) return;
    recordPayment(selectedClientForPay, amount, payNotes);
    setSelectedClientForPay(null);
    setPayAmount('');
    setPayNotes('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Buxgalteriya Xizmat To'lovlari & Qarzdorlik</h1>
          <p className="text-xs text-slate-500">Mijozlar bilan tuzilgan shartnoma bo'yicha oylik to'lovlar intizomi</p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Jami Oylik Shartnomalar</span>
          <div className="text-2xl font-black text-slate-900">{totalContract.toLocaleString()} so'm</div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase">🟢 Tushgan To'lovlar</span>
          <div className="text-2xl font-black text-emerald-900">{totalPaid.toLocaleString()} so'm</div>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-rose-800 uppercase">🔴 Qoldiq Qarzdorlik</span>
          <div className="text-2xl font-black text-rose-700">{totalDebt.toLocaleString()} so'm</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Mijoz nomi yoki STIR..."
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
          <option value="ALL">Barcha To'lov Holatlari</option>
          <option value="TOLANGAN">To'langan</option>
          <option value="QISMAN">Qisman To'langan</option>
          <option value="TOLANMAGAN">To'lanmagan (Qarzdor)</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mijoz & STIR</th>
                <th className="p-3.5">Oylik Tarif</th>
                <th className="p-3.5">To'langan Summa</th>
                <th className="p-3.5">Qoldiq Qarz</th>
                <th className="p-3.5">Holati</th>
                <th className="p-3.5">Oxirgi To'lov Sanasi</th>
                <th className="p-3.5 text-right">To'lov Yozish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <div 
                      onClick={() => openClientCard(item.clientId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                    >
                      {item.clientName}
                    </div>
                    <div className="text-[11px] text-slate-500">STIR: {item.stir}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {item.monthlyFee.toLocaleString()} so'm
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-700">
                    {item.paidAmount.toLocaleString()} so'm
                  </td>
                  <td className="p-3.5 font-bold text-rose-700">
                    {item.debtAmount > 0 ? `${item.debtAmount.toLocaleString()} so'm` : '0 so\'m'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'TOLANGAN' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'QISMAN' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {item.lastPaymentDate || '—'}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (!canManagePayments) {
                          alert('Faqat kassir to\'lov summasini qo\'shishi va o\'zgartirishi mumkin.');
                          return;
                        }
                        setSelectedClientForPay(item.clientId);
                        setPayAmount(item.debtAmount > 0 ? String(item.debtAmount) : String(item.monthlyFee));
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs disabled:opacity-50"
                      disabled={!canManagePayments}
                    >
                      + To'lov Qabul Qilish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Payment Modal */}
      {selectedClientForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">To'lovni Qabul Qilish</h3>
            <form onSubmit={handlePaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Summa (so'm):</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Izoh:</label>
                <input
                  type="text"
                  placeholder="Masalan: Bank orqali to'landi"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClientForPay(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
