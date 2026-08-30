import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  ListFilter,
  CheckCheck,
  RotateCcw,
  ShieldCheck,
  User,
  ArrowRight,
  ExternalLink,
  Eye,
  FileCheck,
  Paperclip,
  FileText,
  AlertTriangle,
  Sliders,
  Settings
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ReportStatus, ReportType, TaxReport, Client, ProofAttachment } from '../../types';
import { ProofUploadModal } from '../common/ProofUploadModal';
import { ProofViewerModal } from '../common/ProofViewerModal';
import { ClientReportFormsConfigModal } from '../common/ClientReportFormsConfigModal';

export const ReportsView: React.FC = () => {
  const { 
    taxReports, 
    clients, 
    employees, 
    currentPeriod, 
    updateTaxReportStatus, 
    updateAllClientTaxReports,
    openClientCard,
    currentUser,
    setClientReportTypes,
    bulkSetClientReportTypes
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [accountantFilter, setAccountantFilter] = useState<string>('ALL');
  const [taxTypeFilter, setTaxTypeFilter] = useState<string>('ALL');
  
  // View mode: 'GROUPED' (by client - default) or 'FLAT' (all rows)
  const [viewMode, setViewMode] = useState<'GROUPED' | 'FLAT'>('GROUPED');

  // Expanded client IDs in accordion
  const [expandedClientIds, setExpandedClientIds] = useState<Record<string, boolean>>({});

  // Client Details Modal state
  const [selectedClientModalId, setSelectedClientModalId] = useState<string | null>(null);

  // Admin Config Report Forms Modal state
  const [clientForConfigForms, setClientForConfigForms] = useState<Client | null>(null);
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(false);

  // Mandatory Proof Upload States
  const [reportForProof, setReportForProof] = useState<TaxReport | null>(null);
  const [clientForBulkProof, setClientForBulkProof] = useState<{ client: Client; activeReports: TaxReport[] } | null>(null);

  // Proof Viewer State
  const [selectedProofForView, setSelectedProofForView] = useState<{
    proof: ProofAttachment;
    title: string;
    clientName?: string;
  } | null>(null);

  const toggleExpand = (clientId: string) => {
    setExpandedClientIds(prev => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    clients.forEach(c => { all[c.id] = true; });
    setExpandedClientIds(all);
  };

  const collapseAll = () => {
    setExpandedClientIds({});
  };

  // Group reports by Client
  const clientReportGroups = useMemo(() => {
    return clients.map(client => {
      const clientReports = taxReports.filter(r => r.clientId === client.id);
      const activeReports = clientReports.filter(r => r.status !== 'TALAB_QILINMAYDI');
      
      const totalCount = activeReports.length;
      const submittedCount = activeReports.filter(r => r.status === 'TOPSHIRILDI').length;
      const inProgressCount = activeReports.filter(r => r.status === 'JARAYONDA').length;
      const pendingCount = activeReports.filter(r => r.status === 'TOPSHIRILMAGAN').length;
      
      const completionPercentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 100;
      
      let overallStatus: 'TOLIQ_TOPSHIRILDI' | 'QISMAN' | 'JARAYONDA' | 'TOPSHIRILMAGAN' = 'TOPSHIRILMAGAN';
      if (submittedCount === totalCount && totalCount > 0) {
        overallStatus = 'TOLIQ_TOPSHIRILDI';
      } else if (submittedCount > 0) {
        overallStatus = 'QISMAN';
      } else if (inProgressCount > 0) {
        overallStatus = 'JARAYONDA';
      }

      // Accountant info
      const accountant = employees.find(e => e.id === client.accountantId);

      // Latest submitted date
      const submittedReports = activeReports.filter(r => r.submittedAt);
      const latestSubmission = submittedReports.length > 0 
        ? submittedReports[submittedReports.length - 1].submittedAt 
        : null;

      return {
        client,
        reports: clientReports,
        activeReports,
        totalCount,
        submittedCount,
        inProgressCount,
        pendingCount,
        completionPercentage,
        overallStatus,
        accountantName: accountant?.name || client.accountantName || 'Tayinlanmagan',
        latestSubmission,
      };
    });
  }, [clients, taxReports, employees]);

  // Filtered client groups
  const filteredClientGroups = useMemo(() => {
    return clientReportGroups.filter(group => {
      const matchesSearch = 
        group.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.client.stir.includes(searchTerm) ||
        group.reports.some(r => r.reportType.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === 'TOPSHIRILDI') {
        matchesStatus = group.overallStatus === 'TOLIQ_TOPSHIRILDI';
      } else if (statusFilter === 'QISMAN') {
        matchesStatus = group.overallStatus === 'QISMAN';
      } else if (statusFilter === 'JARAYONDA') {
        matchesStatus = group.overallStatus === 'JARAYONDA' || group.inProgressCount > 0;
      } else if (statusFilter === 'TOPSHIRILMAGAN') {
        matchesStatus = group.pendingCount > 0;
      }

      const matchesAccountant = accountantFilter === 'ALL' || group.client.accountantId === accountantFilter;
      
      const matchesTaxType = taxTypeFilter === 'ALL' || 
        group.reports.some(r => r.reportType === taxTypeFilter && r.status !== 'TALAB_QILINMAYDI');

      return matchesSearch && matchesStatus && matchesAccountant && matchesTaxType;
    });
  }, [clientReportGroups, searchTerm, statusFilter, accountantFilter, taxTypeFilter]);

  // Filtered Flat Reports (for flat table view)
  const filteredFlatReports = useMemo(() => {
    return taxReports.filter((r) => {
      const matchesSearch = 
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.stir.includes(searchTerm) ||
        r.reportType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesType = taxTypeFilter === 'ALL' || r.reportType === taxTypeFilter;
      const matchesAcc = accountantFilter === 'ALL' || r.accountantId === accountantFilter;

      return matchesSearch && matchesStatus && matchesType && matchesAcc;
    });
  }, [taxReports, searchTerm, statusFilter, taxTypeFilter, accountantFilter]);

  // Overall Statistics
  const totalReportsCount = taxReports.filter(r => r.status !== 'TALAB_QILINMAYDI').length;
  const totalSubmitted = taxReports.filter(r => r.status === 'TOPSHIRILDI').length;
  const totalPending = taxReports.filter(r => r.status === 'TOPSHIRILMAGAN').length;
  const totalInProgress = taxReports.filter(r => r.status === 'JARAYONDA').length;
  const overallCompletionPct = totalReportsCount > 0 ? Math.round((totalSubmitted / totalReportsCount) * 100) : 0;

  const fullyCompletedClients = clientReportGroups.filter(g => g.overallStatus === 'TOLIQ_TOPSHIRILDI').length;
  const totalClientsCount = clientReportGroups.length;

  const selectedModalClientGroup = useMemo(() => {
    if (!selectedClientModalId) return null;
    return clientReportGroups.find(g => g.client.id === selectedClientModalId);
  }, [clientReportGroups, selectedClientModalId]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Deadline Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">Soliq Hisobotlari Nazorati</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
              Mijozlar bo'yicha jamlangan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentPeriod.name} oylik soliq hisobotlari holati &bull; <strong>15-avgust</strong> yakuniy topshirish muddati
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Tax Report Forms Config Button */}
          <button
            type="button"
            onClick={() => setIsGlobalConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            title="Admin tomonidan mijozlar uchun soliq shakllarini (AYLANMA, QQS, FOYDA, JSHDS, INPS...) belgilash"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hisobot Shakllarini Belgilash (Admin)</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              onClick={() => setViewMode('GROUPED')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'GROUPED'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Mijoz bo'yicha (Bitta qator)
            </button>
            <button
              onClick={() => setViewMode('FLAT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'FLAT'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Yoyilgan ro'yxat
            </button>
          </div>

          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Topshirish: {overallCompletionPct}% ({fullyCompletedClients}/{totalClientsCount} korxona yopildi)
          </div>
        </div>
      </div>

      {/* Mandatory Proof Policy Notice Banner */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold flex items-center gap-1.5">
              <span>Qat'iy Qoida: Hisobot topshirilganligi isboti (JPG yoki PDF) majburiy</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">100% Nazorat</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Soliq portali kvitansiyasi yoki tasdiqlovchi skrinshot yuklanmasa, hisobot holatini «Topshirildi» deb belgilab bo'lmaydi.
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-400 font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
          <ShieldCheck className="w-4 h-4" />
          Isbotsiz tasdiqlash bloklangan
        </div>
      </div>

      {/* 4 Status Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">Jami Korxonalar & Hisobotlar</div>
          <div className="text-2xl font-black mt-1">
            {totalClientsCount} <span className="text-sm font-normal opacity-80">ta mijoz ({totalReportsCount} hisobot)</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('TOPSHIRILDI')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'TOPSHIRILDI' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">🟢 To'liq Topshirildi</div>
          <div className="text-2xl font-black mt-1">
            {fullyCompletedClients} <span className="text-sm font-normal opacity-80">korxona ({totalSubmitted} hisobot)</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('JARAYONDA')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'JARAYONDA' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">🟡 Jarayonda / Qisman</div>
          <div className="text-2xl font-black mt-1">
            {totalInProgress} <span className="text-sm font-normal opacity-80">ta hisobot</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('TOPSHIRILMAGAN')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'TOPSHIRILMAGAN' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-rose-50 text-rose-900 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">🔴 Topshirilmagan</div>
          <div className="text-2xl font-black mt-1">
            {totalPending} <span className="text-sm font-normal opacity-80">ta hisobot</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Mijoz nomi, STIR yoki hisobot shakli..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Tax Type Filter */}
          <select
            value={taxTypeFilter}
            onChange={(e) => setTaxTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Barcha Hisobot Turlari</option>
            <option value="AYLANMA">Aylanma soliq</option>
            <option value="QQS">QQS</option>
            <option value="JSHDS">JSHDS</option>
            <option value="INPS">INPS</option>
            <option value="FOYDA">Foyda solig'i</option>
            <option value="IJARA">Ijara to'lovi</option>
            <option value="MOL_MULK">Mol-mulk solig'i</option>
            <option value="YER_SOLIGI">Yer solig'i</option>
            <option value="SUV_SOLIGI">Suv solig'i</option>
          </select>

          {/* Accountant Filter */}
          <select
            value={accountantFilter}
            onChange={(e) => setAccountantFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Barcha Buxgalterlar</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        {viewMode === 'GROUPED' && (
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-lg font-medium cursor-pointer"
            >
              Barchasini ochish
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded-lg font-medium cursor-pointer"
            >
              Barchasini yopish
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'GROUPED' ? (
        /* GROUPED VIEW (1 ROW PER CLIENT WITH ACCORDION & MODAL) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-8 text-center"></th>
                  <th className="p-3.5">Mijoz & STIR</th>
                  <th className="p-3.5">Biriktirilgan Hisobot Shakllari</th>
                  <th className="p-3.5">Topshirish Progressi</th>
                  <th className="p-3.5">Mas'ul Xodim</th>
                  <th className="p-3.5">Oxirgi Topshirilgan</th>
                  <th className="p-3.5 text-right">Boshqarish & Tezkor Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClientGroups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      Mijozlar hisobotlari topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredClientGroups.map(({
                    client,
                    reports,
                    activeReports,
                    totalCount,
                    submittedCount,
                    inProgressCount,
                    pendingCount,
                    completionPercentage,
                    overallStatus,
                    accountantName,
                    latestSubmission,
                  }) => {
                    const isExpanded = !!expandedClientIds[client.id];
                    const allSubmitted = totalCount > 0 && submittedCount === totalCount;

                    return (
                      <React.Fragment key={client.id}>
                        {/* Main Client Row */}
                        <tr 
                          onClick={() => toggleExpand(client.id)}
                          className={`cursor-pointer transition-all hover:bg-slate-50/90 ${
                            isExpanded ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          {/* Expand Icon */}
                          <td className="p-3.5 text-center text-slate-400">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(client.id);
                              }}
                              className="p-1 rounded-md hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-emerald-700 font-bold" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Client Name & STIR */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openClientCard(client.id);
                                  }}
                                  className="font-extrabold text-slate-900 hover:text-emerald-700 transition-colors text-sm"
                                >
                                  {client.name}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>STIR: <strong>{client.stir}</strong></span>
                                  <span>&bull;</span>
                                  <span className="text-slate-600">{client.taxRegime || 'Aylanma soliq'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Report Badges */}
                          <td className="p-3.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {activeReports.map(r => (
                                <div key={r.id} className="inline-flex items-center gap-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                      r.status === 'TOPSHIRILDI'
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                                        : r.status === 'JARAYONDA'
                                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                                        : 'bg-rose-100 text-rose-900 border-rose-200'
                                    }`}
                                    title={`${r.reportType}: ${r.status}`}
                                  >
                                    {r.reportType} {r.status === 'TOPSHIRILDI' ? '✓' : ''}
                                  </span>
                                  {r.proofAttachment && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProofForView({
                                          proof: r.proofAttachment!,
                                          title: `${client.name} — ${r.reportType} soliq hisoboti isboti`,
                                          clientName: client.name,
                                        });
                                      }}
                                      className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer"
                                      title="Isbot hujjatini ko'rish (JPG/PDF)"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {activeReports.length === 0 && (
                                <span className="text-slate-400 italic text-[11px]">Hisobot talab etilmaydi</span>
                              )}
                            </div>
                          </td>

                          {/* Progress bar & counts */}
                          <td className="p-3.5">
                            <div className="w-36 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800">
                                  {submittedCount} / {totalCount} ta
                                </span>
                                <span className={`font-extrabold ${
                                  completionPercentage === 100 ? 'text-emerald-700' : 'text-slate-600'
                                }`}>
                                  {completionPercentage}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 flex">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    completionPercentage === 100 ? 'bg-emerald-500' : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${completionPercentage}%` }}
                                />
                                {inProgressCount > 0 && (
                                  <div 
                                    className="h-full bg-amber-400 transition-all duration-300"
                                    style={{ width: `${(inProgressCount / totalCount) * 100}%` }}
                                  />
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Accountant */}
                          <td className="p-3.5 font-medium text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{accountantName}</span>
                            </div>
                          </td>

                          {/* Latest Submission */}
                          <td className="p-3.5 text-slate-500">
                            {latestSubmission ? (
                              <span className="font-medium text-slate-800 text-[11px]">{latestSubmission}</span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Topshirilmagan</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5">
                              {/* Admin Report Forms Config for this Client */}
                              <button
                                type="button"
                                onClick={() => setClientForConfigForms(client)}
                                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                title="Admin: Ushbu mijoz hisobot shakllarini sozlash"
                              >
                                <Sliders className="w-3 h-3 text-slate-600" />
                                <span>Shakllar</span>
                              </button>

                              {!allSubmitted && totalCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setClientForBulkProof({ client, activeReports })}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                                  title="Isbot (JPG/PDF) yuklab barcha hisobotlarni topshirildi qilish"
                                >
                                  <CheckCheck className="w-3.5 h-3.5" /> Barchasini Topshirildi ✓
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedClientModalId(client.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                Hisobotlar ({totalCount}) ▾
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ACCORDION SUB-ROW: DETAILED ALL REPORTS FOR THIS CLIENT */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-200">
                            <td colSpan={7} className="p-4 pl-12">
                              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                                    <span className="font-extrabold text-slate-900 text-xs">
                                      {client.name} — Barcha {activeReports.length} ta hisobot shakli
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <button
                                      type="button"
                                      onClick={() => setClientForConfigForms(client)}
                                      className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-indigo-200 transition-colors"
                                    >
                                      <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Shakllarni tahrirlash (Admin)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setClientForBulkProof({ client, activeReports })}
                                      className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" /> Barchasiga isbot yuklab topshirish
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateAllClientTaxReports(client.id, 'JARAYONDA')}
                                      className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] cursor-pointer"
                                    >
                                      Barchasini jarayonda qilish
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {activeReports.map((report) => (
                                    <div 
                                      key={report.id}
                                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-2.5"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-extrabold text-xs">
                                              {report.reportType}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                              report.status === 'TOPSHIRILDI' ? 'bg-emerald-100 text-emerald-800' :
                                              report.status === 'JARAYONDA' ? 'bg-amber-100 text-amber-800' :
                                              'bg-rose-100 text-rose-800'
                                            }`}>
                                              {report.status}
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-slate-500 mt-1">
                                            Mas'ul: <strong>{accountantName}</strong>
                                          </div>
                                        </div>

                                        {report.submittedAt && (
                                          <div className="text-right text-[10px] text-slate-500">
                                            <div className="font-bold text-emerald-700">Topshirildi</div>
                                            <div>{report.submittedAt}</div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Proof preview badge if present */}
                                      {report.proofAttachment && (
                                        <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px]">
                                          <div className="flex items-center gap-1.5 text-emerald-900 font-medium truncate">
                                            <Paperclip className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                            <span className="truncate">{report.proofAttachment.name}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedProofForView({
                                              proof: report.proofAttachment!,
                                              title: `${client.name} — ${report.reportType} hisoboti isboti`,
                                              clientName: client.name,
                                            })}
                                            className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                          >
                                            <Eye className="w-3 h-3" /> Ko'rish
                                          </button>
                                        </div>
                                      )}

                                      {/* Action buttons */}
                                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                                        {report.status !== 'TOPSHIRILDI' ? (
                                          <button
                                            type="button"
                                            onClick={() => setReportForProof(report)}
                                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
                                          >
                                            <FileCheck className="w-3.5 h-3.5" /> Isbot yuklash va Topshirildi ✓
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => setReportForProof(report)}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                                            title="Isbot faylini yangilash"
                                          >
                                            <FileCheck className="w-3 h-3" /> Isbotni yangilash
                                          </button>
                                        )}

                                        {report.status !== 'JARAYONDA' && report.status !== 'TOPSHIRILDI' && (
                                          <button
                                            type="button"
                                            onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs cursor-pointer"
                                          >
                                            Jarayonda
                                          </button>
                                        )}

                                        {report.status === 'TOPSHIRILDI' && (
                                          <button
                                            type="button"
                                            onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                                          >
                                            Bekor qilish
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>Jami: <strong>{filteredClientGroups.length} ta mijoz</strong> ({totalReportsCount} ta hisobot shakli)</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Barcha hisobotlar PDF/JPG isbot bilan himoyalangan
            </span>
          </div>
        </div>
      ) : (
        /* FLAT VIEW (TRADITIONAL ALL ROWS TABLE) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mijoz & STIR</th>
                  <th className="p-3.5">Hisobot Shakli</th>
                  <th className="p-3.5">Holati</th>
                  <th className="p-3.5">Mas'ul Xodim</th>
                  <th className="p-3.5">Topshirilgan Vaqt & Isbot</th>
                  <th className="p-3.5 text-right">Harakatlar (Isbotli)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFlatReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Hisobotlar topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredFlatReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <div 
                          onClick={() => openClientCard(report.clientId)}
                          className="font-extrabold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                        >
                          {report.clientName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          STIR: {report.stir}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-bold text-slate-800 font-mono">
                          {report.reportType}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          report.status === 'TOPSHIRILDI' ? 'bg-emerald-100 text-emerald-800' :
                          report.status === 'JARAYONDA' ? 'bg-amber-100 text-amber-800' :
                          report.status === 'TALAB_QILINMAYDI' ? 'bg-slate-100 text-slate-600' :
                          'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {report.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-700 font-medium">
                        {employees.find(e => e.id === report.accountantId)?.name || 'Tayinlanmagan'}
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {report.submittedAt ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">{report.submittedAt}</div>
                            <div className="text-[10px] text-slate-400">{report.submittedBy}</div>
                            {report.proofAttachment && (
                              <button
                                type="button"
                                onClick={() => setSelectedProofForView({
                                  proof: report.proofAttachment!,
                                  title: `${report.clientName} — ${report.reportType} hisoboti isboti`,
                                  clientName: report.clientName,
                                })}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-emerald-700" />
                                <span>Isbot ({report.proofAttachment.type.includes('pdf') ? 'PDF' : 'JPG'})</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Topshirilmagan</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {report.status !== 'TOPSHIRILDI' ? (
                            <button
                              type="button"
                              onClick={() => setReportForProof(report)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
                              title="Isbot (JPG/PDF) yuklab topshirildi deb belgilash"
                            >
                              <FileCheck className="w-3.5 h-3.5" /> Topshirildi ✓
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReportForProof(report)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                              title="Isbot hujjatini almashtirish"
                            >
                              <FileCheck className="w-3 h-3" /> Isbot
                            </button>
                          )}

                          {report.status !== 'JARAYONDA' && report.status !== 'TOPSHIRILDI' && (
                            <button
                              type="button"
                              onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                              className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs cursor-pointer"
                            >
                              Jarayonda
                            </button>
                          )}

                          {report.status === 'TOPSHIRILDI' && (
                            <button
                              type="button"
                              onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                            >
                              Bekor qilish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Jami ko'rsatilmoqda: <strong>{filteredFlatReports.length} ta hisobot</strong></span>
            <span className="text-emerald-700 font-bold">Har bir hisobot alohida qatorda &bull; Isbot bilan tasdiqlanadi</span>
          </div>
        </div>
      )}

      {/* CLIENT REPORTS DETAIL MODAL */}
      {selectedModalClientGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  {selectedModalClientGroup.client.name}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  STIR: {selectedModalClientGroup.client.stir} &bull; Mas'ul buxgalter: {selectedModalClientGroup.accountantName}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientModalId(null)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yopish ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div>
                  <div className="font-bold text-emerald-950">Topshirish holati:</div>
                  <div className="text-[11px] text-emerald-800">
                    {selectedModalClientGroup.submittedCount} / {selectedModalClientGroup.totalCount} ta hisobot topshirildi ({selectedModalClientGroup.completionPercentage}%)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const c = selectedModalClientGroup.client;
                      setSelectedClientModalId(null);
                      setClientForConfigForms(c);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Shakllarni Sozlash (Admin)
                  </button>
                  <button
                    onClick={() => {
                      setClientForBulkProof({
                        client: selectedModalClientGroup.client,
                        activeReports: selectedModalClientGroup.activeReports,
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Barchasini Topshirildi qilish ✓
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Mijozga biriktirilgan hisobot shakllari:
                </h4>

                {selectedModalClientGroup.activeReports.map((report, idx) => (
                  <div 
                    key={report.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">{idx + 1}.</span>
                        <span className="font-extrabold text-slate-900 text-xs font-mono bg-white px-2 py-0.5 rounded border">
                          {report.reportType}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status === 'TOPSHIRILDI' ? 'bg-emerald-100 text-emerald-800' :
                          report.status === 'JARAYONDA' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.submittedAt && (
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>Topshirildi: <strong>{report.submittedAt}</strong> ({report.submittedBy || 'Buxgalter'})</span>
                          {report.proofAttachment && (
                            <button
                              type="button"
                              onClick={() => setSelectedProofForView({
                                proof: report.proofAttachment!,
                                title: `${selectedModalClientGroup.client.name} — ${report.reportType} hisoboti isboti`,
                                clientName: selectedModalClientGroup.client.name,
                              })}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Isbot
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {report.status !== 'TOPSHIRILDI' ? (
                        <button
                          onClick={() => setReportForProof(report)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Topshirildi ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => setReportForProof(report)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                        >
                          <FileCheck className="w-3 h-3" /> Isbot
                        </button>
                      )}

                      {report.status !== 'JARAYONDA' && report.status !== 'TOPSHIRILDI' && (
                        <button
                          onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs cursor-pointer"
                        >
                          Jarayonda
                        </button>
                      )}

                      {report.status === 'TOPSHIRILDI' && (
                        <button
                          onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Bekor qilish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY PROOF UPLOAD MODAL FOR INDIVIDUAL TAX REPORT */}
      {reportForProof && (
        <ProofUploadModal
          isOpen={!!reportForProof}
          title="Soliq Hisoboti Topshirilganligini Tasdiqlash"
          subtitle="Qat'iy qoida: Soliq portali kvitansiyasi yoki skrinshoti (JPG, PNG yoki PDF) majburiy"
          targetName={`${reportForProof.reportType} hisoboti (${currentPeriod.name})`}
          targetLabel="Soliq Hisoboti Shakli:"
          clientInfo={{
            name: reportForProof.clientName,
            stir: reportForProof.stir,
          }}
          actionLabel="Isbotni yuklash va Topshirildi deb tasdiqlash"
          onClose={() => setReportForProof(null)}
          onConfirm={(proof, notes) => {
            updateTaxReportStatus(reportForProof.id, 'TOPSHIRILDI', notes, proof);
            setReportForProof(null);
          }}
        />
      )}

      {/* MANDATORY PROOF UPLOAD MODAL FOR BULK CLIENT TAX REPORTS */}
      {clientForBulkProof && (
        <ProofUploadModal
          isOpen={!!clientForBulkProof}
          title="Barcha Soliq Hisobotlari Topshirilganligini Tasdiqlash"
          subtitle={`Qat'iy qoida: ${clientForBulkProof.activeReports.length} ta hisobot uchun soliq portali kvitansiyasi (JPG, PNG yoki PDF) majburiy`}
          targetName={`${clientForBulkProof.activeReports.map(r => r.reportType).join(', ')} (${currentPeriod.name})`}
          targetLabel="Barcha Hisobot Shakllari:"
          clientInfo={{
            name: clientForBulkProof.client.name,
            stir: clientForBulkProof.client.stir,
          }}
          actionLabel="Isbot bilan Barchasini Topshirildi deb tasdiqlash"
          onClose={() => setClientForBulkProof(null)}
          onConfirm={(proof, notes) => {
            updateAllClientTaxReports(clientForBulkProof.client.id, 'TOPSHIRILDI', proof, notes);
            setClientForBulkProof(null);
          }}
        />
      )}

      {/* PROOF VIEWER MODAL */}
      {selectedProofForView && (
        <ProofViewerModal
          isOpen={!!selectedProofForView}
          proof={selectedProofForView.proof}
          targetTitle={selectedProofForView.title}
          onClose={() => setSelectedProofForView(null)}
        />
      )}

      {/* ADMIN CLIENT REPORT FORMS CONFIGURATION MODAL */}
      <ClientReportFormsConfigModal
        isOpen={isGlobalConfigOpen || !!clientForConfigForms}
        onClose={() => {
          setIsGlobalConfigOpen(false);
          setClientForConfigForms(null);
        }}
        client={clientForConfigForms}
        clientsList={clients}
        currentAssignedReports={clientForConfigForms?.assignedReportTypes}
        onSave={(reportTypes, targetClientIds) => {
          if (targetClientIds && targetClientIds.length > 1) {
            bulkSetClientReportTypes(targetClientIds, reportTypes);
          } else if (targetClientIds && targetClientIds[0]) {
            setClientReportTypes(targetClientIds[0], reportTypes);
          } else if (clientForConfigForms) {
            setClientReportTypes(clientForConfigForms.id, reportTypes);
          }
        }}
      />
    </div>
  );
};
