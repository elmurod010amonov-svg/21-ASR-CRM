import React, { useState } from 'react';
import { Receipt, Search, Building2, CheckCircle2, Clock, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const InvoicesView: React.FC = () => {
  const { accounting1C, openClientCard } = useCRM();
  const [search, setSearch] = useState('');

  const totalIncoming = accounting1C.reduce((acc, i) => acc + i.incomingInvoicesCount, 0);
  const totalIncomingEntered = accounting1C.reduce((acc, i) => acc + i.incomingInvoicesEntered, 0);

  const totalOutgoing = accounting1C.reduce((acc, i) => acc + i.outgoingInvoicesCount, 0);
  const totalOutgoingEntered = accounting1C.reduce((acc, i) => acc + i.outgoingInvoicesEntered, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Elektron Fakturalar Tahlili (Didox)</h1>
          <p className="text-xs text-slate-500">Mijozlarning kirim va chiqim elektron hisob-fakturalari monitoringi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Jami Kirim Fakturalar</span>
          <div className="text-2xl font-black text-slate-900">{totalIncomingEntered} / {totalIncoming} ta</div>
          <p className="text-xs text-emerald-600 font-semibold">Didox bazasidan 1C ga qabul qilingan</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Jami Chiqim Fakturalar</span>
          <div className="text-2xl font-black text-slate-900">{totalOutgoingEntered} / {totalOutgoing} ta</div>
          <p className="text-xs text-emerald-600 font-semibold">1C dan Didox ga yuborilgan va tasdiqlangan</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Fakturalar Balansi</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mijoz & STIR</th>
                <th className="p-3.5">Kirim Fakturalar</th>
                <th className="p-3.5">Chiqim Fakturalar</th>
                <th className="p-3.5">Holati</th>
                <th className="p-3.5 text-right">360° Karta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounting1C
                .filter(i => i.clientName.toLowerCase().includes(search.toLowerCase()) || i.stir.includes(search))
                .map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.clientName}</div>
                      <div className="text-[11px] text-slate-500">STIR: {item.stir}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {item.incomingInvoicesEntered} / {item.incomingInvoicesCount} ta
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {item.outgoingInvoicesEntered} / {item.outgoingInvoicesCount} ta
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.incomingStatus === 'KIRITILGAN' && item.outgoingStatus === 'KIRITILGAN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.incomingStatus === 'KIRITILGAN' && item.outgoingStatus === 'KIRITILGAN' ? 'To\'liq' : 'Jarayonda'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openClientCard(item.clientId)}
                        className="text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Ochish &rarr;
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
