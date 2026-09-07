import React, { useState } from 'react';
import { CreditCard, Search, Plus, CheckCircle2, AlertCircle, DollarSign, ArrowUpRight, Download } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CLIENT_SEGMENTS, CLIENT_SEGMENT_LABELS, getClientSegment } from '../../types';

export const PaymentsView: React.FC = () => {
  const { payments, clients, recordPayment, openClientCard, currentUser, generateDebtAct, generateCombinedDebtAct } = useCRM();
  const canGenerateAct = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'KASSIR';
  const canManagePayments = currentUser.role === 'KASSIR';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClientForPay, setSelectedClientForPay] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL');

  const totalContract = payments.reduce((acc, p) => acc + p.monthlyFee, 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDebt = payments.reduce((acc, p) => acc + p.debtAmount, 0);

  // Turkum (YaTT / Yuridik / Buxgalteriya / Samarqand) bo'yicha jami
  // nachisleniya (oylik shartnoma summasi) — har biri alohida + umumiy jami.
  const clientSegmentMap = new Map(clients.map(c => [c.id, getClientSegment(c)]));
  const segmentTotals = CLIENT_SEGMENTS.map(seg => ({
    segment: seg,
    label: CLIENT_SEGMENT_LABELS[seg],
    total: payments.reduce((acc, p) => acc + (clientSegmentMap.get(p.clientId) === seg ? p.monthlyFee : 0), 0),
  }));

  const filtered = payments.filter(p => {
    const matchesSearch = p.clientName.toLowerCase().includes(search.toLowerCase()) || p.stir.includes(search);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSegment = segmentFilter === 'ALL' || clientSegmentMap.get(p.clientId) === segmentFilter;
    return matchesSearch && matchesStatus && matchesSegment;
  });

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPay) return;
    const amount = parseInt(payAmount.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount < 0) return;
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
          <p className="text-xs text-slate-600">Mijozlar bilan tuzilgan shartnoma bo'yicha oylik to'lovlar intizomi</p>
        </div>
        {canGenerateAct && (
          <button
            onClick={() => generateCombinedDebtAct()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs shrink-0"
            title="Qarzdorligi bor va hisobot topshirmagan barcha Yuridik/YaTT mijozlar uchun bitta Word faylida umumiy akt"
          >
            <Download className="w-3.5 h-3.5" />
            Umumiy Akt (Barcha Qarzdorlar)
          </button>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-600 uppercase">Jami Oylik Shartnomalar</span>
          <div className="text-2xl font-black text-slate-900">{totalContract.toLocaleString()} so'm</div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase">🟢 Tushgan To'lovlar</span>
          <div className="text-2xl font-black text-emerald-600">{totalPaid.toLocaleString()} so'm</div>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-rose-700 uppercase">🔴 Qoldiq Qarzdorlik</span>
          <div className="text-2xl font-black text-rose-600">{totalDebt.toLocaleString()} so'm</div>
        </div>
      </div>

      {/* Turkumlar bo'yicha jami nachisleniya (tushum) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase">Turkumlar Bo'yicha Jami Nachisleniya</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {segmentTotals.map(({ segment, label, total }) => (
            <div key={segment} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
              <div className="text-base font-black text-slate-900">{total.toLocaleString()} so'm</div>
            </div>
          ))}
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-900 space-y-1">
            <span className="text-[10px] font-bold text-slate-300 uppercase">Jami (Barchasi)</span>
            <div className="text-base font-black text-white">{totalContract.toLocaleString()} so'm</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Mijoz nomi yoki STIR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 placeholder:text-slate-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha To'lov Holatlari</option>
          <option value="TOLANGAN">To'langan</option>
          <option value="QISMAN">Qisman To'langan</option>
          <option value="TOLANMAGAN">To'lanmagan (Qarzdor)</option>
        </select>

        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Turkumlar</option>
          {CLIENT_SEGMENTS.map(seg => (
            <option key={seg} value={seg}>{CLIENT_SEGMENT_LABELS[seg]}</option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-700 font-bold border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-100/50">
                  <td className="p-3.5">
                    <div 
                      onClick={() => openClientCard(item.clientId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                    >
                      {item.clientName}
                    </div>
                    <div className="text-[11px] text-slate-600">STIR: {item.stir}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {item.monthlyFee.toLocaleString()} so'm
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-600">
                    {item.paidAmount.toLocaleString()} so'm
                  </td>
                  <td className="p-3.5 font-bold text-rose-600">
                    {item.debtAmount > 0 ? `${item.debtAmount.toLocaleString()} so'm` : '0 so\'m'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'TOLANGAN' ? 'bg-emerald-50 text-emerald-700' :
                      item.status === 'QISMAN' ? 'bg-amber-50 text-amber-800' :
                      'bg-rose-50 text-rose-700 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {item.lastPaymentDate || '—'}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex gap-2 justify-end">
                      {item.debtAmount > 0 && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'KASSIR') && (
                        <button
                          onClick={() => generateDebtAct(item.clientId)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Akt
                        </button>
                      )}
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
                        + To'lov
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Payment Modal */}
      {selectedClientForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-xs">
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
