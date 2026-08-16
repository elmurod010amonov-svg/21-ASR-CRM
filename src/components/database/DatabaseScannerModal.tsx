import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Wrench, 
  Database, 
  Building2, 
  FileText, 
  CreditCard, 
  Mail, 
  Zap,
  Activity,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { DatabaseScanIssue } from '../../types';

export const DatabaseScannerModal: React.FC = () => {
  const { 
    isScannerModalOpen, 
    setIsScannerModalOpen, 
    scanResult, 
    runDatabaseScan, 
    applyDatabaseAutoFix,
    isDemoMode,
    switchToRealMode,
    switchToDemoMode,
    toggleDemoMode
  } = useCRM();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeSeverity, setActiveSeverity] = useState<string>('ALL');
  const [isFixing, setIsFixing] = useState(false);
  const [fixSuccessMessage, setFixSuccessMessage] = useState<string | null>(null);

  if (!isScannerModalOpen) return null;

  const currentScan = scanResult || runDatabaseScan();

  const filteredIssues = currentScan.issues.filter(issue => {
    const matchesCategory = activeCategory === 'ALL' || issue.category === activeCategory;
    const matchesSeverity = activeSeverity === 'ALL' || issue.severity === activeSeverity;
    return matchesCategory && matchesSeverity;
  });

  const handleFixAll = () => {
    setIsFixing(true);
    setTimeout(() => {
      const { scanResult: newScan, repairedCount } = applyDatabaseAutoFix();
      setIsFixing(false);
      setFixSuccessMessage(`✅ Jami ${repairedCount} ta kamchilik va nomutanosiblik to'liq to'g'irlandi! Yangi salomatlik: ${newScan.healthScore}%`);
      setTimeout(() => setFixSuccessMessage(null), 5000);
    }, 600);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">XATOLIK</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">OGOHLANTIRISH</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">MA'LUMOT</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CLIENT': return <Building2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'REPORT': return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'PAYMENT': return <CreditCard className="w-3.5 h-3.5 text-amber-600" />;
      case 'LETTER': return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      default: return <Database className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white tracking-tight">
                  Baza Diagnostikasi & Audit Skaneri
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME SCAN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Barcha jadvallar, STIRlar, hisobotlar, 1C va to'lovlar yaxlitligi tekshiruvi
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsScannerModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode / Real Mode Switch Banner */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 ring-4 ring-emerald-100'}`} />
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                Rejim: {isDemoMode ? (
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px] font-extrabold">🧪 DEMO REJIMI</span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] font-extrabold">🟢 REAL ISHCHI REJIM (DEMO O'CHIRILGAN)</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isDemoMode 
                  ? "Siz namuna ma'lumotlar bilan ishlayapsiz. Real korxonalarga o'tish uchun quyidagi tugmani bosing."
                  : "Barcha kiritilgan mijozlar, hisobotlar va o'zgarishlar doimiy real bazada saqlanadi."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDemoMode ? (
              <button
                onClick={switchToRealMode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" /> Demoni O'chirish & Reallikka O'tish
              </button>
            ) : (
              <button
                onClick={switchToDemoMode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Demo Rejimga O'tish
              </button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {fixSuccessMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{fixSuccessMessage}</span>
          </div>
        )}

        {/* Scan Summary Cards */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100/50 border-b border-slate-200">
          {/* Health Score */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Baza Salomatligi</div>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-black ${
                currentScan.healthScore >= 90 ? 'text-emerald-600' :
                currentScan.healthScore >= 70 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {currentScan.healthScore}%
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                currentScan.healthScore >= 90 ? 'bg-emerald-50 text-emerald-700' :
                currentScan.healthScore >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {currentScan.healthScore >= 90 ? 'Mukammal' : currentScan.healthScore >= 70 ? 'Qoniqarli' : 'Xatolar mavjud'}
              </span>
            </div>
          </div>

          {/* Total Records Scanned */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tekshirilgan Yozuvlar</div>
            <div className="text-2xl font-black text-slate-900">{currentScan.totalRecords} ta</div>
            <div className="text-[10px] text-slate-400">9 ta asosiy jadval bo'yicha</div>
          </div>

          {/* Discovered Issues */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Aniqlangan Holatlar</div>
            <div className="text-2xl font-black text-slate-900">{currentScan.totalIssues} ta</div>
            <div className="text-[10px] flex items-center gap-2 text-slate-500 font-semibold">
              <span className="text-rose-600">{currentScan.errorCount} xato</span>
              <span>&bull;</span>
              <span className="text-amber-600">{currentScan.warningCount} ogohlantirish</span>
            </div>
          </div>

          {/* 1-Click Action */}
          <div className="p-3 bg-linear-to-br from-emerald-600 to-teal-700 rounded-xl text-white shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Tezkor Tuzatish</div>
            <button
              onClick={handleFixAll}
              disabled={isFixing || currentScan.totalIssues === 0}
              className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-emerald-950 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Tuzatilmoqda...
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5 text-emerald-700" /> Kamchiliklarni To'g'irla
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter and Action bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-bold text-[11px] mr-1">Bo'lim:</span>
            {['ALL', 'CLIENT', 'REPORT', '1C', 'PAYMENT', 'LETTER', 'EMPLOYEE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Barchasi' :
                 cat === 'CLIENT' ? 'Mijozlar' :
                 cat === 'REPORT' ? 'Hisobotlar' :
                 cat === '1C' ? '1C & Faktura' :
                 cat === 'PAYMENT' ? 'To\'lovlar' :
                 cat === 'LETTER' ? 'Xatlar' : 'Xodimlar'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runDatabaseScan()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Qayta Tekshirish
            </button>
          </div>
        </div>

        {/* Issues List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 bg-slate-50/50">
          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Bazada Hech Qanday Kamchilik Aniqlanmadi</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Barcha mijozlar, 9 xonali STIRlar, hisobotlar, to'lov balanslari va xodim birikmalari 100% yaxlit va sinxron holatda!
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div 
                key={issue.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getCategoryIcon(issue.category)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{issue.title}</span>
                      {getSeverityBadge(issue.severity)}
                      {issue.affectedEntityName && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {issue.affectedEntityName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {issue.description}
                    </p>
                    {issue.fixActionName && (
                      <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                        <Wrench className="w-3 h-3" /> Avto-tuzatish: {issue.fixActionName}
                      </div>
                    )}
                  </div>
                </div>

                {issue.autoFixable && (
                  <button
                    onClick={handleFixAll}
                    className="shrink-0 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Tuzatish
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Oxirgi skanerlash vaqti: <strong>{currentScan.timestamp}</strong>
          </span>
          <button
            onClick={() => setIsScannerModalOpen(false)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
