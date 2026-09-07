import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  X,
  Calendar
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { isOborotkaActive, getTodayISO, isSubjectTo1C, ONE_C_MIN_MONTHLY_FEE } from '../../utils/oborotka';
import { Accounting1CRecord } from '../../types';

export const Accounting1CView: React.FC = () => {
  const {
    accounting1C,
    clients,
    toggle1COborotka,
    openClientCard,
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateModalItem, setDateModalItem] = useState<Accounting1CRecord | null>(null);
  const [untilDate, setUntilDate] = useState(getTodayISO());

  // Faqat oylik to'lovi 1 000 000 so'mdan yuqori mijozlar 1C nazoratida shakllanadi
  const eligible1C = accounting1C.filter(item => {
    const client = clients.find(c => c.id === item.clientId);
    return client ? isSubjectTo1C(client.monthlyFee) : false;
  });

  const filtered = eligible1C.filter(item => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stir.includes(searchTerm);
    const active = isOborotkaActive(item);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'KIRITILGAN' && active) ||
      (statusFilter === 'KIRITILMAGAN' && !active);
    return matchesSearch && matchesStatus;
  });

  const total = eligible1C.length;
  const entered = eligible1C.filter(a => isOborotkaActive(a)).length;
  const missing = total - entered;

  const openEnterModal = (item: Accounting1CRecord) => {
    setUntilDate(item.oborotkaDate && item.oborotkaDate >= getTodayISO() ? item.oborotkaDate : getTodayISO());
    setDateModalItem(item);
  };

  const confirmEnter = () => {
    if (!dateModalItem || !untilDate) return;
    toggle1COborotka(dateModalItem.id, untilDate);
    setDateModalItem(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-neutral-900">1C Nazorati & Oborotka</h1>
          <p className="text-xs text-neutral-500">
            Oborotka kiritilganda muddat sanasi belgilanadi — shu sanagacha «Topshirilgan» ko‘rinadi
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Faqat oylik to'lovi {ONE_C_MIN_MONTHLY_FEE.toLocaleString()} so'mdan boshlab (shu summa ham kiradi) mijozlar shu ro'yxatda shakllanadi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200">
          <div className="text-xs font-bold text-neutral-500 uppercase">Jami Mijozlar Bazasida</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{total} ta</div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
          <div className="text-xs font-bold text-neutral-700 uppercase">🟢 1C Oborotka Kiritilgan</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{entered} ta</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-neutral-200">
          <div className="text-xs font-bold text-neutral-700 uppercase">🔴 Kiritilmagan (Qoldiq)</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{missing} ta</div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-neutral-200 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Mijoz nomi yoki STIR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-neutral-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Holatlar</option>
          <option value="KIRITILGAN">Faqat Kiritilganlar</option>
          <option value="KIRITILMAGAN">Faqat Kiritilmaganlar</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-dense">
            <thead className="bg-[#f9f9f9] text-[#777] font-semibold border-b border-neutral-200">
              <tr>
                <th className="p-3.5">Mijoz & STIR</th>
                <th className="p-3.5">Oborotka Holati</th>
                <th className="p-3.5">Muddat (gacha)</th>
                <th className="p-3.5">Kirim Fakturalar</th>
                <th className="p-3.5">Chiqim Fakturalar</th>
                <th className="p-3.5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((item) => {
                const active = isOborotkaActive(item);
                return (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3.5">
                      <div
                        onClick={() => openClientCard(item.clientId)}
                        className="font-bold text-neutral-900 hover:underline cursor-pointer text-sm"
                      >
                        {item.clientName}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 mt-0.5">STIR: {item.stir}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        active ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-50 text-neutral-600'
                      }`}>
                        {active ? '🟢 Kiritilgan' : '🔴 Kiritilmagan'}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-700 font-mono">
                      {active && item.oborotkaDate ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          {item.oborotkaDate}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-neutral-800">
                        {item.incomingInvoicesEntered} / {item.incomingInvoicesCount} kiritildi
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-neutral-800">
                        {item.outgoingInvoicesEntered} / {item.outgoingInvoicesCount} kiritildi
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      {active ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEnterModal(item)}
                            className="px-3 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs cursor-pointer"
                          >
                            Sanani o‘zgartirish
                          </button>
                          <button
                            onClick={() => toggle1COborotka(item.id)}
                            className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs cursor-pointer"
                          >
                            Kiritilmagan qilish
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openEnterModal(item)}
                          className="px-3 py-1 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs cursor-pointer"
                        >
                          Oborotka Kiritildi ✓
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dateModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <div>
                  <div className="text-sm font-bold text-neutral-900">Oborotka muddati</div>
                  <div className="text-[10px] text-neutral-500">{dateModalItem.clientName}</div>
                </div>
              </div>
              <button type="button" onClick={() => setDateModalItem(null)} className="p-1 text-neutral-500 hover:text-neutral-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-xs font-bold text-neutral-700">
                Shu sanagacha topshirilgan deb hisoblansin
              </label>
              <input
                type="date"
                value={untilDate}
                min={getTodayISO()}
                onChange={(e) => setUntilDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm outline-none focus:border-black"
              />
              <p className="text-[11px] text-neutral-500">
                Belgilangan sanadan keyin avtomatik «Kiritilmagan» ko‘rinadi.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-neutral-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDateModalItem(null)}
                className="px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold cursor-pointer"
              >
                Bekor
              </button>
              <button
                type="button"
                onClick={confirmEnter}
                className="px-3 py-2 rounded-lg bg-black text-white text-xs font-bold cursor-pointer"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
