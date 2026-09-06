import React, { useState } from 'react';
import { Bell, Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert, Plus, X, Trash2 } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { AutomaticReminder } from '../../types';

const emptyDraft: Omit<AutomaticReminder, 'id'> = {
  category: 'HISOBOT',
  targetDate: '',
  title: '',
  message: '',
  severity: 'INFO',
  isActive: true,
  conditionDescription: '',
};

const severityStyle: Record<AutomaticReminder['severity'], string> = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-amber-100 text-amber-800',
  DANGER: 'bg-rose-100 text-rose-800',
};

export const RemindersView: React.FC = () => {
  const { reminders, currentPeriod, currentUser, addReminder, deleteReminder } = useCRM();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<AutomaticReminder, 'id'>>(emptyDraft);

  const resetDraft = () => setDraft(emptyDraft);

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title || !draft.targetDate) return;
    addReminder(draft);
    resetDraft();
    setIsAddOpen(false);
  };

  const standardSchedule = [
    { day: '10-sana', title: '1-ogohlantirish', desc: 'Barcha buxgalterlarga oylik hisobotlarni kiritish boshlanganligi to\'g\'risida eslatma.', status: 'O\'TDİ' },
    { day: '13-sana', title: '2-ogohlantirish (Shoshilinch)', desc: 'Muddatga 2 kun qolganligi va topshirilmagan korxonalar ro\'yxati bo\'yicha ogohlantirish.', status: 'BUGUN' },
    { day: '15-sana', title: 'Yakuniy Deadline', desc: 'Soliq hisobotlarini topshirishning oxirgi soatlari (23:59 ga qadar).', status: 'KUTILMOQDA' },
    { day: '16-sana', title: 'Hisobot Tahlili & Jarimalar', desc: 'Topshirilmagan hisobotlar bo\'yicha rahbariyat hisoboti va tahlili.', status: 'KUTILMOQDA' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Eslatmalar & Deadline Kalendari</h1>
          <p className="text-xs text-slate-500">
            Avtomatlashtirilgan oylik soliq sikli eslatmalari (10-sana, 13-sana, 15-sana, 16-sana)
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Yangi eslatma qo'shish
        </button>
      </div>

      {/* Monthly Cycle Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          {currentPeriod.name} Soliq Eslatmalari Grafigi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {standardSchedule.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-2 ${
                item.status === 'BUGUN'
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                  : item.status === 'O\'TDİ'
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{item.day}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === 'BUGUN' ? 'bg-amber-200 text-amber-900 animate-pulse' :
                  item.status === 'O\'TDİ' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800">{item.title}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Reminders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Faol Eslatmalar Ro'yxati</h3>
        <div className="divide-y divide-slate-100">
          {reminders.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">Hozircha eslatmalar yo'q</div>
          ) : (
            reminders.map((r) => (
              <div key={r.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{r.title}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">{r.category}</span>
                  </div>
                  <p className="text-slate-600">{r.message}</p>
                  <div className="text-[10px] text-slate-600">
                    Sana: {r.targetDate} &bull; {r.conditionDescription}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${severityStyle[r.severity]}`}>
                    {r.isActive ? 'FAOL' : 'NOFAOL'}
                  </span>
                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Eslatmani o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* NEW REMINDER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" /> Yangi Eslatma Qo'shish
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddOpen(false); resetDraft(); }}
                className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sarlavha *</label>
                <input
                  required
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="masalan: Hisobot muddatiga 3 kun qoldi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Xabar matni</label>
                <textarea
                  value={draft.message}
                  onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  rows={3}
                  placeholder="Eslatma matni..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Turkum</label>
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value as AutomaticReminder['category'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="HISOBOT">Hisobot</option>
                    <option value="TOLOV">To'lov</option>
                    <option value="XAT">Xat</option>
                    <option value="KAMERAL">Kameral</option>
                    <option value="TOPSHIRIQ">Topshiriq</option>
                    <option value="1C">1C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Muhimlik darajasi</label>
                  <select
                    value={draft.severity}
                    onChange={(e) => setDraft({ ...draft, severity: e.target.value as AutomaticReminder['severity'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="INFO">Oddiy (INFO)</option>
                    <option value="WARNING">Ogohlantirish (WARNING)</option>
                    <option value="DANGER">Shoshilinch (DANGER)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sana / Sanasi *</label>
                <input
                  required
                  type="text"
                  value={draft.targetDate}
                  onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
                  placeholder="masalan: 20-sana yoki 2026-09-20"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Shart tavsifi</label>
                <input
                  type="text"
                  value={draft.conditionDescription}
                  onChange={(e) => setDraft({ ...draft, conditionDescription: e.target.value })}
                  placeholder="masalan: Har oyning 20-sanasida avtomatik ishga tushadi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                Faol (ro'yxatda FAOL deb ko'rsatiladi)
              </label>

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
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Eslatmani qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
