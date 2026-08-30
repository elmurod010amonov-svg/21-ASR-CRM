import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  FileText,
  Building2,
  Receipt
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const Accounting1CView: React.FC = () => {
  const { 
    accounting1C, 
    toggle1COborotka, 
    openClientCard, 
    employees 
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = accounting1C.filter(item => {
    const matchesSearch = 
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stir.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || item.oborotkaStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = accounting1C.length;
  const entered = accounting1C.filter(a => a.oborotkaStatus === 'KIRITILGAN').length;
  const missing = accounting1C.filter(a => a.oborotkaStatus === 'KIRITILMAGAN').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">1C Nazorati & Oborotka</h1>
          <p className="text-xs text-slate-500">
            Har bir mijozning 1C bazasiga oborotka va elektron hisob-fakturalarni kiritish nazorati
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Jami Mijozlar Bazasida</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{total} ta</div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-800 uppercase">🟢 1C Oborotka Kiritilgan</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{entered} ta</div>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="text-xs font-bold text-rose-800 uppercase">🔴 Kiritilmagan (Qoldiq)</div>
          <div className="text-2xl font-black text-rose-800 mt-1">{missing} ta</div>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Mijoz nomi yoki STIR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Holatlar</option>
          <option value="KIRITILGAN">Faqat Kiritilganlar</option>
          <option value="KIRITILMAGAN">Faqat Kiritilmaganlar</option>
        </select>
      </div>

      {/* 1C Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mijoz & STIR</th>
                <th className="p-3.5">Oborotka Holati</th>
                <th className="p-3.5">Kirim Fakturalar (Didox → 1C)</th>
                <th className="p-3.5">Chiqim Fakturalar (1C → Didox)</th>
                <th className="p-3.5">Oxirgi Yangilanish</th>
                <th className="p-3.5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div 
                      onClick={() => openClientCard(item.clientId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                    >
                      {item.clientName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">STIR: {item.stir}</div>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.oborotkaStatus === 'KIRITILGAN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.oborotkaStatus === 'KIRITILGAN' ? '🟢 Kiritilgan' : '🔴 Kiritilmagan'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">
                      {item.incomingInvoicesEntered} / {item.incomingInvoicesCount} kiritildi
                    </div>
                    <span className={`text-[10px] font-bold ${item.incomingStatus === 'KIRITILGAN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.incomingStatus === 'KIRITILGAN' ? 'To\'liq' : 'Qisman'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">
                      {item.outgoingInvoicesEntered} / {item.outgoingInvoicesCount} kiritildi
                    </div>
                    <span className={`text-[10px] font-bold ${item.outgoingStatus === 'KIRITILGAN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.outgoingStatus === 'KIRITILGAN' ? 'To\'liq' : 'Qisman'}
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-500">
                    {item.lastUpdated || '—'}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => toggle1COborotka(item.id)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer shadow-xs ${
                        item.oborotkaStatus === 'KIRITILGAN'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {item.oborotkaStatus === 'KIRITILGAN' ? 'Kiritilmagan qilish' : 'Oborotka Kiritildi ✓'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
