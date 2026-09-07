import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
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
  Settings,
  Download
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ReportStatus, ReportType, TaxReport, Client, ProofAttachment } from '../../types';
import { ProofViewerModal } from '../common/ProofViewerModal';
import { ClientReportFormsConfigModal } from '../common/ClientReportFormsConfigModal';

export const ReportsView: React.FC = () => {
  const {
    taxReports,
    clients,
    employees,
    visibleEmployees,
    currentPeriod,
    updateTaxReportStatus,
    updateAllClientTaxReports,
    canMarkReportSubmitted,
    openClientCard,
    currentUser,
    setClientReportTypes,
    bulkSetClientReportTypes,
    addNotification,
    logAudit
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
      // Hisobotni haqiqatan kim topshirgani — statik "mas'ul buxgalter"dan
      // farqli o'laroq, bu har bir "Topshirildi" belgilashda o'sha amalni
      // bajargan xodimning ismi bilan avtomatik yoziladi.
      const lastSubmittedBy = submittedReports.length > 0
        ? submittedReports[submittedReports.length - 1].submittedBy || null
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
        lastSubmittedBy,
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

      // Statik biriktirilgan buxgalter emas — hisobotni haqiqatan kim
      // topshirgani bo'yicha filtrlaymiz.
      const matchesAccountant = accountantFilter === 'ALL' || group.reports.some(r => r.submittedBy === accountantFilter);

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
      const matchesAcc = accountantFilter === 'ALL' || r.submittedBy === accountantFilter;

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

  // Hisobot davri oxirida hisobot topshirmagan barcha mijozlar ro'yxatini bitta Excel faylida yuklab olish
  const exportNonSubmittedList = () => {
    const nonSubmitted = taxReports.filter(r => r.status === 'TOPSHIRILMAGAN');
    if (nonSubmitted.length === 0) {
      addNotification({
        type: 'SYSTEM',
        title: 'Ro\'yxat bo\'sh',
        message: `${currentPeriod.name} davri uchun topshirilmagan hisobot yo'q — barchasi topshirilgan.`,
        linkModule: 'Hisobotlar'
      });
      return;
    }

    // Bir mijozning bir nechta topshirilmagan hisobot shakli bo'lishi mumkin
    // (masalan AYLANMA + JSHDS + INPS) — har birini alohida qatorga
    // chiqarish o'rniga, mijoz bo'yicha guruhlab, bitta qatorda barcha
    // topshirilmagan shakllarni birgalikda ko'rsatamiz.
    const groupedByClient = new Map<string, typeof nonSubmitted>();
    nonSubmitted.forEach(r => {
      const list = groupedByClient.get(r.clientId) || [];
      list.push(r);
      groupedByClient.set(r.clientId, list);
    });

    const rows = Array.from(groupedByClient.values()).map((reports, idx) => {
      const first = reports[0];
      const client = clients.find(c => c.id === first.clientId);
      const accountant = employees.find(e => e.id === first.accountantId);
      return {
        '№': idx + 1,
        'Mijoz nomi': first.clientName,
        'STIR/JSHSHR': first.stir,
        'Turi': client?.type || '',
        'Hisobot shakli': reports.map(r => r.reportType).join(', '),
        'Davr': currentPeriod.name,
        "Mas'ul buxgalter": accountant?.name || client?.accountantName || 'Tayinlanmagan',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 16 }, { wch: 10 }, { wch: 24 }, { wch: 16 }, { wch: 24 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Topshirilmaganlar');
    const fileName = `Topshirilmagan_Hisobotlar_${currentPeriod.name.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    logAudit('Topshirilmagan hisobotlar ro\'yxati yuklab olindi', 'Report', 'ALL', `${rows.length} ta mijoz, ${nonSubmitted.length} ta hisobot (${currentPeriod.name})`);
  };

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
          <p className="text-xs text-slate-600 mt-0.5">
            {currentPeriod.name} oylik soliq hisobotlari holati &bull; <strong>15-avgust</strong> yakuniy topshirish muddati
          </p>
          <p className="text-xs text-amber-700 font-semibold mt-0.5">
            Qoida: mijoz uchun kassir to'lovni kiritmaguncha, uning hisobotini "Topshirildi" deb belgilab bo'lmaydi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk export of all clients who have NOT submitted, for the current period */}
          <button
            type="button"
            onClick={exportNonSubmittedList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            title="Joriy davr uchun hisobot topshirmagan barcha mijozlar ro'yxatini bitta Excel faylida yuklab olish"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Topshirmaganlar Ro'yxati (Excel)</span>
          </button>

          {/* Admin Tax Report Forms Config Button */}
          <button
            type="button"
            onClick={() => setIsGlobalConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold shadow-xs cursor-pointer transition-colors"
            title="Admin tomonidan mijozlar uchun soliq shakllarini (AYLANMA, QQS, FOYDA, JSHDS, INPS...) belgilash"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
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
      {/* 4 Status Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ALL' ? 'bg-white text-slate-900 border-emerald-500 shadow-md' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
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
            statusFilter === 'TOPSHIRILDI' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-600'
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
            statusFilter === 'JARAYONDA' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-600'
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
            statusFilter === 'TOPSHIRILMAGAN' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-rose-50 text-rose-800 border-rose-200 hover:border-rose-600'
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
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Mijoz nomi, STIR yoki hisobot shakli..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-500"
            />
          </div>

          {/* Tax Type Filter */}
          <select
            value={taxTypeFilter}
            onChange={(e) => setTaxTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
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

          {/* Kim topshirgani bo'yicha filtr (statik biriktirilgan buxgalter emas) */}
          <select
            value={accountantFilter}
            onChange={(e) => setAccountantFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Barcha Topshirganlar</option>
            {visibleEmployees.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name}</option>
            ))}
          </select>
        </div>

        {viewMode === 'GROUPED' && (
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 text-xs text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Barchasini ochish
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-xs text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
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
              <thead className="bg-white text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-8 text-center"></th>
                  <th className="p-3.5">Mijoz & STIR</th>
                  <th className="p-3.5">Biriktirilgan Hisobot Shakllari</th>
                  <th className="p-3.5">Topshirish Progressi</th>
                  <th className="p-3.5">Topshirgan Xodim</th>
                  <th className="p-3.5">Oxirgi Topshirilgan</th>
                  <th className="p-3.5 text-right">Boshqarish & Tezkor Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClientGroups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-600">
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
                    latestSubmission,
                    lastSubmittedBy,
                  }) => {
                    const isExpanded = !!expandedClientIds[client.id];
                    const allSubmitted = totalCount > 0 && submittedCount === totalCount;
                    const canSubmit = canMarkReportSubmitted(client.id);

                    return (
                      <React.Fragment key={client.id}>
                        {/* Main Client Row */}
                        <tr 
                          onClick={() => toggleExpand(client.id)}
                          className={`cursor-pointer transition-all hover:bg-slate-100/50 ${
                            isExpanded ? 'bg-emerald-50' : ''
                          }`}
                        >
                          {/* Expand Icon */}
                          <td className="p-3.5 text-center text-slate-600">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(client.id);
                              }}
                              className="p-1 rounded-md hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
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
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-xs shrink-0">
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
                                <div className="text-[11px] font-mono text-slate-600 flex items-center gap-2 mt-0.5">
                                  <span>STIR: <strong className="text-slate-800">{client.stir}</strong></span>
                                  <span>&bull;</span>
                                  <span className="text-slate-700">{client.taxRegime || 'Aylanma soliq'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Report Badges */}
                          <td className="p-3.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {activeReports.map(r => (
                                <div key={r.id} className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedClientModalId(client.id);
                                    }}
                                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer hover:brightness-95 ${
                                      r.status === 'TOPSHIRILDI'
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                                        : r.status === 'JARAYONDA'
                                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                                        : 'bg-rose-100 text-rose-900 border-rose-200'
                                    }`}
                                    title={`${r.reportType}: ${r.status} — batafsil ko'rish uchun bosing`}
                                  >
                                    {r.reportType} {r.status === 'TOPSHIRILDI' ? '✓' : ''}
                                  </button>
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
                                <span className="text-slate-600 italic text-[11px]">Hisobot talab etilmaydi</span>
                              )}
                            </div>
                          </td>

                          {/* Progress bar & counts */}
                          <td className="p-3.5">
                            <div className="w-36 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-900">
                                  {submittedCount} / {totalCount} ta
                                </span>
                                <span className={`font-extrabold ${
                                  completionPercentage === 100 ? 'text-emerald-600' : 'text-slate-700'
                                }`}>
                                  {completionPercentage}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-300 flex">
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

                          {/* Kim topshirgani — statik biriktirilgan xodim emas, aynan
                              "Topshirildi" deb belgilagan xodimning ismi avtomatik ko'rinadi */}
                          <td className="p-3.5 font-medium text-slate-800">
                            {lastSubmittedBy ? (
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{lastSubmittedBy}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Hali hech kim topshirmagan</span>
                            )}
                          </td>

                          {/* Latest Submission */}
                          <td className="p-3.5 text-slate-500">
                            {latestSubmission ? (
                              <span className="font-medium text-slate-800 text-[11px]">{latestSubmission}</span>
                            ) : (
                              <span className="text-slate-600 italic text-[11px]">Topshirilmagan</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5">
                              {/* Admin Report Forms Config for this Client */}
                              <button
                                type="button"
                                onClick={() => setClientForConfigForms(client)}
                                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                title="Admin: Ushbu mijoz hisobot shakllarini sozlash"
                              >
                                <Sliders className="w-3 h-3 text-slate-700" />
                                <span>Shakllar</span>
                              </button>

                              {!allSubmitted && totalCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => canSubmit && updateAllClientTaxReports(client.id, 'TOPSHIRILDI')}
                                  disabled={!canSubmit}
                                  className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                                    canSubmit
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  }`}
                                  title={canSubmit ? 'Barcha hisobotlarni topshirildi qilish' : 'Avval kassir to\'lovni kiritishi kerak'}
                                >
                                  <CheckCheck className="w-3.5 h-3.5" /> Barchasini Topshirildi ✓
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedClientModalId(client.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                Hisobotlar ({totalCount}) ▾
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ACCORDION SUB-ROW: DETAILED ALL REPORTS FOR THIS CLIENT */}
                        {isExpanded && (
                          <tr className="bg-slate-100/50 border-b border-slate-200">
                            <td colSpan={7} className="p-4 pl-12">
                              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                    <span className="font-extrabold text-slate-900 text-xs">
                                      {client.name} — Barcha {activeReports.length} ta hisobot shakli
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <button
                                      type="button"
                                      onClick={() => setClientForConfigForms(client)}
                                      className="px-2.5 py-1 rounded-md bg-indigo-900/50 hover:bg-indigo-900/70 text-indigo-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-indigo-700 transition-colors"
                                    >
                                      <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Shakllarni tahrirlash (Admin)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => canSubmit && updateAllClientTaxReports(client.id, 'TOPSHIRILDI')}
                                      disabled={!canSubmit}
                                      className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 ${
                                        canSubmit
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer'
                                          : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                                      }`}
                                      title={canSubmit ? undefined : 'Avval kassir to\'lovni kiritishi kerak'}
                                    >
                                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Barchasini Topshirildi ✓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateAllClientTaxReports(client.id, 'JARAYONDA')}
                                      className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] cursor-pointer"
                                    >
                                      Barchasini jarayonda qilish
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {activeReports.map((report) => (
                                    <div
                                      key={report.id}
                                      className="p-3 bg-slate-100 rounded-xl border border-slate-300 shadow-2xs space-y-2"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono px-2 py-0.5 rounded bg-slate-600 text-slate-900 font-extrabold text-xs">
                                              {report.reportType}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                              report.status === 'TOPSHIRILDI' ? 'bg-emerald-50 text-emerald-600' :
                                              report.status === 'JARAYONDA' ? 'bg-amber-50 text-amber-600' :
                                              'bg-rose-50 text-rose-600'
                                            }`}>
                                              {report.status}
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-slate-600 mt-1">
                                            {report.submittedBy ? (
                                              <>Topshirgan: <strong className="text-emerald-700">{report.submittedBy}</strong></>
                                            ) : (
                                              <span className="italic">Hali hech kim topshirmagan</span>
                                            )}
                                          </div>
                                        </div>

                                        {report.submittedAt && (
                                          <div className="text-right text-[10px] text-slate-600">
                                            <div className="font-bold text-emerald-600">Topshirildi</div>
                                            <div>{report.submittedAt}</div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Proof preview badge if present */}
                                      {report.proofAttachment && (
                                        <div className="p-2 bg-emerald-50 border border-emerald-700 rounded-lg flex items-center justify-between text-[11px]">
                                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium truncate">
                                            <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span className="truncate">{report.proofAttachment.name}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedProofForView({
                                              proof: report.proofAttachment!,
                                              title: `${client.name} — ${report.reportType} hisoboti isboti`,
                                              clientName: client.name,
                                            })}
                                            className="px-2 py-0.5 bg-slate-100 border border-emerald-600 text-emerald-700 rounded font-bold hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                          >
                                            <Eye className="w-3 h-3" /> Ko'rish
                                          </button>
                                        </div>
                                      )}

                                      {/* Action buttons */}
                                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-300/60">
                                        {report.status !== 'TOPSHIRILDI' ? (
                                          <button
                                            type="button"
                                            onClick={() => canSubmit && updateTaxReportStatus(report.id, 'TOPSHIRILDI')}
                                            disabled={!canSubmit}
                                            className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs ${
                                              canSubmit
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                            }`}
                                            title={canSubmit ? undefined : 'Avval kassir to\'lovni kiritishi kerak'}
                                          >
                                            <FileCheck className="w-3.5 h-3.5" /> Topshirildi ✓
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => updateTaxReportStatus(report.id, 'TOPSHIRILDI')}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                                            title="Holatni yangilash"
                                          >
                                            <FileCheck className="w-3 h-3" /> Qayta topshirish
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
          <div className="p-3.5 bg-white border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <span>Jami: <strong className="text-slate-900">{filteredClientGroups.length} ta mijoz</strong> ({totalReportsCount} ta hisobot shakli)</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Hisobot holatini bir klikda yangilang
            </span>
          </div>
        </div>
      ) : (
        /* FLAT VIEW (TRADITIONAL ALL ROWS TABLE) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mijoz & STIR</th>
                  <th className="p-3.5">Hisobot Shakli</th>
                  <th className="p-3.5">Holati</th>
                  <th className="p-3.5">Topshirgan Xodim</th>
                  <th className="p-3.5">Topshirilgan Vaqt</th>
                  <th className="p-3.5 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFlatReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-600">
                      Hisobotlar topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredFlatReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-100/50 transition-colors">
                      <td className="p-3.5">
                        <div
                          onClick={() => openClientCard(report.clientId)}
                          className="font-extrabold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                        >
                          {report.clientName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                          STIR: {report.stir}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-600 border border-slate-500 font-bold text-slate-900 font-mono">
                          {report.reportType}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          report.status === 'TOPSHIRILDI' ? 'bg-emerald-50 text-emerald-600' :
                          report.status === 'JARAYONDA' ? 'bg-amber-50 text-amber-600' :
                          report.status === 'TALAB_QILINMAYDI' ? 'bg-slate-600 text-slate-700' :
                          'bg-rose-50 text-rose-600 animate-pulse'
                        }`}>
                          {report.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-700 font-medium">
                        {report.submittedBy || <span className="text-slate-500 italic text-[11px]">Hali hech kim topshirmagan</span>}
                      </td>

                      <td className="p-3.5 text-slate-600">
                        {report.submittedAt ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">{report.submittedAt}</div>
                            {report.proofAttachment && (
                              <button
                                type="button"
                                onClick={() => setSelectedProofForView({
                                  proof: report.proofAttachment!,
                                  title: `${report.clientName} — ${report.reportType} hisoboti isboti`,
                                  clientName: report.clientName,
                                })}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-700 font-bold text-[10px] cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> Isbot ({report.proofAttachment.type.includes('pdf') ? 'PDF' : 'JPG'})
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Topshirilmagan</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {report.status !== 'TOPSHIRILDI' ? (
                            <button
                              type="button"
                              onClick={() => canMarkReportSubmitted(report.clientId) && updateTaxReportStatus(report.id, 'TOPSHIRILDI')}
                              disabled={!canMarkReportSubmitted(report.clientId)}
                              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs ${
                                canMarkReportSubmitted(report.clientId)
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                              }`}
                              title={canMarkReportSubmitted(report.clientId) ? 'Topshirildi deb belgilash' : 'Avval kassir to\'lovni kiritishi kerak'}
                            >
                              <FileCheck className="w-3.5 h-3.5" /> Topshirildi ✓
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateTaxReportStatus(report.id, 'TOPSHIRILDI')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                              title="Holatni yangilash"
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

          <div className="p-3.5 bg-white border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Jami ko'rsatilmoqda: <strong className="text-slate-900">{filteredFlatReports.length} ta hisobot</strong></span>
            <span className="text-emerald-600 font-bold">Har bir hisobot alohida qatorda</span>
          </div>
        </div>
      )}

      {/* CLIENT REPORTS DETAIL MODAL */}
      {selectedModalClientGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-white text-slate-900 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {selectedModalClientGroup.client.name}
                </h3>
                <p className="text-[11px] text-slate-700 mt-0.5">
                  STIR: {selectedModalClientGroup.client.stir}
                  {selectedModalClientGroup.lastSubmittedBy && (
                    <> &bull; Oxirgi topshirgan: {selectedModalClientGroup.lastSubmittedBy}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientModalId(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                Yopish ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-700">
                <div>
                  <div className="font-bold text-emerald-700">Topshirish holati:</div>
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
                      if (canMarkReportSubmitted(selectedModalClientGroup.client.id)) {
                        updateAllClientTaxReports(selectedModalClientGroup.client.id, 'TOPSHIRILDI');
                      }
                    }}
                    disabled={!canMarkReportSubmitted(selectedModalClientGroup.client.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 ${
                      canMarkReportSubmitted(selectedModalClientGroup.client.id)
                        ? 'bg-black hover:bg-neutral-800 text-white cursor-pointer shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    title={canMarkReportSubmitted(selectedModalClientGroup.client.id) ? undefined : 'Avval kassir to\'lovni kiritishi kerak'}
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
                    className="p-3.5 rounded-xl border border-slate-300 bg-white/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">{idx + 1}.</span>
                        <span className="font-extrabold text-slate-900 text-xs font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
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
                          onClick={() => canMarkReportSubmitted(selectedModalClientGroup.client.id) && updateTaxReportStatus(report.id, 'TOPSHIRILDI')}
                          disabled={!canMarkReportSubmitted(selectedModalClientGroup.client.id)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 ${
                            canMarkReportSubmitted(selectedModalClientGroup.client.id)
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                          title={canMarkReportSubmitted(selectedModalClientGroup.client.id) ? undefined : 'Avval kassir to\'lovni kiritishi kerak'}
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Topshirildi ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => updateTaxReportStatus(report.id, 'TOPSHIRILDI')}
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
