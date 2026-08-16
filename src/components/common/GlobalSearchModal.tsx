import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Building2, FileText, Mail, AlertTriangle, CheckSquare, User, ArrowRight } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const GlobalSearchModal: React.FC = () => {
  const { 
    globalSearchOpen, 
    setGlobalSearchOpen, 
    clients, 
    taxReports, 
    letters, 
    kameral, 
    tasks, 
    employees, 
    openClientCard,
    setActiveTab 
  } = useCRM();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(!globalSearchOpen);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  // Clean query
  const cleanQ = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!cleanQ) return { clients: [], reports: [], letters: [], kameral: [], tasks: [], employees: [] };

    const matchedClients = clients.filter(c => 
      c.name.toLowerCase().includes(cleanQ) || 
      c.stir.includes(cleanQ) || 
      c.phone.includes(cleanQ) ||
      c.accountantName.toLowerCase().includes(cleanQ)
    );

    const matchedReports = taxReports.filter(r => 
      r.clientName.toLowerCase().includes(cleanQ) || 
      r.stir.includes(cleanQ) || 
      r.reportType.toLowerCase().includes(cleanQ)
    ).slice(0, 5);

    const matchedLetters = letters.filter(l => 
      l.clientName.toLowerCase().includes(cleanQ) || 
      l.stir.includes(cleanQ) || 
      l.letterNumber.toLowerCase().includes(cleanQ) ||
      l.summary.toLowerCase().includes(cleanQ)
    ).slice(0, 5);

    const matchedKameral = kameral.filter(k => 
      k.clientName.toLowerCase().includes(cleanQ) || 
      k.stir.includes(cleanQ) || 
      k.auditType.toLowerCase().includes(cleanQ)
    ).slice(0, 5);

    const matchedTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(cleanQ) || 
      (t.clientName && t.clientName.toLowerCase().includes(cleanQ))
    ).slice(0, 5);

    const matchedEmployees = employees.filter(e => 
      e.name.toLowerCase().includes(cleanQ) || 
      e.phone.includes(cleanQ) || 
      e.position.toLowerCase().includes(cleanQ)
    );

    return {
      clients: matchedClients,
      reports: matchedReports,
      letters: matchedLetters,
      kameral: matchedKameral,
      tasks: matchedTasks,
      employees: matchedEmployees,
    };
  }, [cleanQ, clients, taxReports, letters, kameral, tasks, employees]);

  if (!globalSearchOpen) return null;

  const totalResultsCount = 
    results.clients.length + 
    results.reports.length + 
    results.letters.length + 
    results.kameral.length + 
    results.tasks.length + 
    results.employees.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            placeholder="Korxona nomi, 9 xonali STIR, telefon, xat raqami yoki xodim ismi bo'yicha qidiruv..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-base font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-200/80 rounded border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Search Results / Suggestion Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!cleanQ ? (
            <div className="py-10 text-center text-slate-500 space-y-3">
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">Tezkor 360° Global Qidiruv</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Masalan: <span className="font-semibold text-emerald-700">"304918273"</span> (STIR), <span className="font-semibold text-emerald-700">"DILSHOD"</span>, <span className="font-semibold text-emerald-700">"Kameral"</span>, yoki <span className="font-semibold text-emerald-700">"Aliyev"</span>
              </p>
            </div>
          ) : totalResultsCount === 0 ? (
            <div className="py-10 text-center text-slate-500">
              <p className="text-sm font-medium text-slate-700">"{query}" bo'yicha hech narsa topilmadi</p>
              <p className="text-xs text-slate-400 mt-1">STIR raqami yoki korxona nomini qayta tekshirib ko'ring.</p>
            </div>
          ) : (
            <>
              {/* Clients section */}
              {results.clients.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Mijozlar ({results.clients.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          openClientCard(c.id);
                          setGlobalSearchOpen(false);
                        }}
                        className="p-3 rounded-xl hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 group-hover:text-emerald-800">{c.name}</span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${c.type === 'YATT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                              {c.type}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                              {c.taxType}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>STIR: <strong className="text-slate-700">{c.stir}</strong></span>
                            <span>Mas'ul: <strong className="text-slate-700">{c.accountantName}</strong></span>
                            <span>Tel: {c.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                          360° Karta <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Reports section */}
              {results.reports.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Hisobotlar ({results.reports.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.reports.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setActiveTab('Hisobotlar');
                          setGlobalSearchOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{r.clientName} &mdash; {r.reportType} hisoboti</div>
                          <div className="text-xs text-slate-500">STIR: {r.stir}</div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          r.status === 'TOPSHIRILDI' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'JARAYONDA' ? 'bg-amber-100 text-amber-800' :
                          r.status === 'TALAB_QILINMAYDI' ? 'bg-slate-100 text-slate-600' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Letters section */}
              {results.letters.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    Soliq Xatlari ({results.letters.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.letters.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setActiveTab('Xatlar');
                          setGlobalSearchOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-purple-50/70 border border-slate-100 hover:border-purple-200 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{l.clientName} &bull; {l.letterNumber} ({l.type})</div>
                          <div className="text-xs text-slate-500 truncate max-w-md">{l.summary}</div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          l.status === 'YANGI' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                          l.status === 'OQILGAN' ? 'bg-blue-100 text-blue-800' :
                          l.status === 'JAVOB_BERILDI' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kameral section */}
              {results.kameral.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Kameral Tekshiruvlar ({results.kameral.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.kameral.map((k) => (
                      <div
                        key={k.id}
                        onClick={() => {
                          setActiveTab('Kameral');
                          setGlobalSearchOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-rose-50/70 border border-slate-100 hover:border-rose-200 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{k.clientName} &mdash; {k.auditType}</div>
                          <div className="text-xs text-slate-500">{k.summary}</div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-100 text-rose-800">
                          {k.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Topshiriqlar ({results.tasks.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setActiveTab('Topshiriqlar');
                          setGlobalSearchOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{t.title}</div>
                          <div className="text-xs text-slate-500">Mijoz: {t.clientName || 'Umumiy'} &bull; Deadline: {t.deadlineDate}</div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-700">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Employees */}
              {results.employees.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    Xodimlar ({results.employees.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.employees.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          setActiveTab('Xodimlar');
                          setGlobalSearchOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 cursor-pointer transition-all flex items-center gap-3"
                      >
                        <img src={e.avatar} alt={e.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{e.name} ({e.role})</div>
                          <div className="text-xs text-slate-500">{e.position} &bull; {e.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Search Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
          <span>21-ASR Professional Buxgalteriya CRM</span>
          <span>Bosish: <kbd className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">Enter</kbd> ochish, <kbd className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">Esc</kbd> yopish</span>
        </div>
      </div>
    </div>
  );
};
