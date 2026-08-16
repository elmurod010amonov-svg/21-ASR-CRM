import React, { useState } from 'react';
import { History, Search, User, Clock, ShieldCheck, Filter } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useCRM();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.objectName.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Audit & Xavfsizlik Jurnali</h1>
          <p className="text-xs text-slate-500">Tizimda amalga oshirilgan har bir o'zgarish, status yangilanishi va foydalanuvchilar harakati tarixi</p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Xodim ismi, amal nomi, korxona yoki tafsilot bo'yicha qidiruv..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs outline-none text-slate-800"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Vaqt & Sana</th>
                <th className="p-3.5">Foydalanuvchi & Rol</th>
                <th className="p-3.5">Amal Nomi</th>
                <th className="p-3.5">Obyekt</th>
                <th className="p-3.5">Tafsilot & Qiymatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Audit yozuvlari topilmadi.</td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800">
                      {log.action}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {log.objectName}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div>{log.details}</div>
                      {log.oldValue && log.newValue && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          <span className="line-through text-rose-500">{log.oldValue}</span> &rarr; <span className="text-emerald-700 font-bold">{log.newValue}</span>
                        </div>
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
