import React from 'react';
import { BarChart3, TrendingUp, DollarSign, FileSpreadsheet, Building2, UserCheck } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const StatisticsView: React.FC = () => {
  const { clients, taxReports, payments, employees } = useCRM();

  const totalClients = clients.length;
  const totalReports = taxReports.filter(r => r.status !== 'TALAB_QILINMAYDI').length;
  const submittedReports = taxReports.filter(r => r.status === 'TOPSHIRILDI').length;
  const submittedPct = totalReports > 0 ? Math.round((submittedReports / totalReports) * 100) : 0;

  const totalRevenue = payments.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDebt = payments.reduce((acc, p) => acc + p.debtAmount, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Tahliliy Statistika & Grafiklar</h1>
          <p className="text-xs text-slate-500">2026-yil oylik dinamika, to'lovlar intizomi va hisobot topshirish ko'rsatkichlari</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Jami Mijozlar Dinamikasi</span>
          <div className="text-2xl font-black text-slate-900">{totalClients} ta</div>
          <p className="text-xs text-emerald-600 font-semibold">+12% o'tgan oyga nisbatan</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Oylik Hisobotlar Foizi</span>
          <div className="text-2xl font-black text-emerald-700">{submittedPct}%</div>
          <p className="text-xs text-slate-500">{submittedReports} / {totalReports} ta topshirildi</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Oylik Tushum (Daromad)</span>
          <div className="text-2xl font-black text-slate-900">{totalRevenue.toLocaleString()} so'm</div>
          <p className="text-xs text-emerald-600 font-semibold">Tushgan xizmat haqlari</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Umumiy Qarzdorlik</span>
          <div className="text-2xl font-black text-rose-700">{totalDebt.toLocaleString()} so'm</div>
          <p className="text-xs text-rose-600 font-semibold">Mijozlar qarz qoldig'i</p>
        </div>
      </div>

      {/* Breakdown by Tax Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Soliq Tizimlari Bo'yicha Taqsimot</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Aylanma Soliq (4%)</span>
                <span>{clients.filter(c => c.taxType === 'AYLANMA_SOLIQ').length} ta</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>QQS + Foyda Solig'i</span>
                <span>{clients.filter(c => c.taxType === 'QQS_FOYDA').length} ta</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>YaTT Qat'iy Soliq</span>
                <span>{clients.filter(c => c.taxType === 'JISMONIY_YATT').length} ta</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Efficiency Ranking */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Xodimlar Samaradorlik Reytingi</h3>
          <div className="divide-y divide-slate-100">
            {employees.map((emp, idx) => (
              <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-900">{emp.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{emp.position}</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {emp.reportCompletionRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
