import React from 'react';
import { Bell, Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const RemindersView: React.FC = () => {
  const { reminders, currentPeriod } = useCRM();

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
          {reminders.map((r) => (
            <div key={r.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{r.title}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">{r.type}</span>
                </div>
                <p className="text-slate-600">{r.message}</p>
                <div className="text-[10px] text-slate-400">
                  Kimga: {r.targetRole || 'Barcha xodimlar'} &bull; Sana: {r.triggerDate}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
