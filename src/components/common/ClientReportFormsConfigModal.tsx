import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sliders, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  FileSpreadsheet, 
  Info, 
  CheckCircle2,
  Layers,
  HelpCircle
} from 'lucide-react';
import { ReportType, Client } from '../../types';

interface ClientReportFormsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  clientIds?: string[];
  clientsList?: Client[];
  currentAssignedReports?: ReportType[];
  onSave: (reportTypes: ReportType[], targetClientIds?: string[]) => void;
}

export interface TaxReportDefinition {
  type: ReportType;
  name: string;
  codeName: string;
  rateDesc: string;
  periodicity: string;
  category: 'ASOSIY' | 'DAROMAD' | 'MULK' | 'MAXSUS';
  badgeColor: string;
}

export const ALL_TAX_REPORTS: TaxReportDefinition[] = [
  {
    type: 'AYLANMA',
    name: 'Aylanmadan olinadigan soliq',
    codeName: 'Aylanma soliq (4%)',
    rateDesc: 'Standart stavka 4%',
    periodicity: 'Oylik (15-sanagacha)',
    category: 'ASOSIY',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    type: 'QQS',
    name: 'Qo\'shilgan qiymat solig\'i',
    codeName: 'QQS (12%)',
    rateDesc: 'Umumiy stavka 12%',
    periodicity: 'Oylik (20-sanagacha)',
    category: 'ASOSIY',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  {
    type: 'FOYDA',
    name: 'Yuridik shaxslar foyda solig\'i',
    codeName: 'Foyda solig\'i (15%)',
    rateDesc: 'Standart stavka 15%',
    periodicity: 'Oylik / Choraklik',
    category: 'ASOSIY',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  {
    type: 'JSHDS',
    name: 'JSHODS (Daromad solig\'i)',
    codeName: 'JSHDS (12%)',
    rateDesc: 'Xodimlar daromadidan 12%',
    periodicity: 'Oylik (15-sanagacha)',
    category: 'DAROMAD',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    type: 'INPS',
    name: 'INPS (Xalq banki ShJBPT)',
    codeName: 'INPS (0.1%)',
    rateDesc: 'Jamg\'arib boriladigan pensiya 0.1%',
    periodicity: 'Oylik (15-sanagacha)',
    category: 'DAROMAD',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
  },
  {
    type: 'IJARA',
    name: 'Ijara to\'lovlari hisoboti',
    codeName: 'Ijara (ijara.soliq.uz)',
    rateDesc: 'Bino, inshoot, transport ijarasi',
    periodicity: 'Oylik (15-sanagacha)',
    category: 'MAXSUS',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    type: 'MOL_MULK',
    name: 'Yuridik shaxslar mol-mulk solig\'i',
    codeName: 'Mol-mulk solig\'i (1.5%)',
    rateDesc: 'Binolar va asosiy vositalar',
    periodicity: 'Oylik / Yillik',
    category: 'MULK',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    type: 'YER',
    name: 'Yuridik shaxslar yer solig\'i',
    codeName: 'Yer solig\'i',
    rateDesc: 'Mulkdagi yoki ijaradagi yerlar',
    periodicity: 'Oylik / Choraklik',
    category: 'MULK',
    badgeColor: 'bg-lime-100 text-lime-900 border-lime-300',
  },
  {
    type: 'SUV',
    name: 'Suv resurslaridan foydalanganlik solig\'i',
    codeName: 'Suv solig\'i',
    rateDesc: 'Iste\'mol qilingan suv hajmi',
    periodicity: 'Choraklik / Oylik',
    category: 'MAXSUS',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  {
    type: 'AOS',
    name: 'Aylanma soliq (Soddalashtirilgan tartib)',
    codeName: 'AOS / Fiksirlangan',
    rateDesc: 'Qat\'iy belgilangan yillik to\'lov',
    periodicity: 'Oylik',
    category: 'ASOSIY',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-300',
  }
];

export const ClientReportFormsConfigModal: React.FC<ClientReportFormsConfigModalProps> = ({
  isOpen,
  onClose,
  client,
  clientIds,
  clientsList = [],
  currentAssignedReports = [],
  onSave,
}) => {
  const [selectedReports, setSelectedReports] = useState<ReportType[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(client?.id || '');

  const isBulkMode = !!clientIds && clientIds.length > 1;

  useEffect(() => {
    if (!isOpen) return;

    if (client) {
      setSelectedClientId(client.id);
      if (client.assignedReportTypes && client.assignedReportTypes.length > 0) {
        setSelectedReports([...client.assignedReportTypes]);
      } else if (currentAssignedReports.length > 0) {
        setSelectedReports([...currentAssignedReports]);
      } else if (client.taxType === 'QQS') {
        setSelectedReports(['QQS', 'FOYDA', 'JSHDS', 'INPS']);
      } else if (client.taxType === 'FOYDA') {
        setSelectedReports(['FOYDA', 'JSHDS', 'INPS']);
      } else {
        setSelectedReports(['AYLANMA', 'JSHDS', 'INPS']);
      }
      return;
    }

    if (currentAssignedReports.length > 0) {
      setSelectedReports([...currentAssignedReports]);
    } else {
      setSelectedReports(['AYLANMA', 'JSHDS', 'INPS']);
    }
  }, [isOpen, client?.id]);

  // When changing selected client from dropdown (if no single client fixed)
  const handleClientChange = (newClientId: string) => {
    setSelectedClientId(newClientId);
    const target = clientsList.find(c => c.id === newClientId);
    if (target) {
      if (target.assignedReportTypes && target.assignedReportTypes.length > 0) {
        setSelectedReports([...target.assignedReportTypes]);
      } else if (target.taxType === 'QQS') {
        setSelectedReports(['QQS', 'FOYDA', 'JSHDS', 'INPS']);
      } else {
        setSelectedReports(['AYLANMA', 'JSHDS', 'INPS']);
      }
    }
  };

  if (!isOpen) return null;

  const currentClient = client || clientsList.find(c => c.id === selectedClientId);

  const toggleReport = (type: ReportType) => {
    setSelectedReports(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Preset Template Applicators
  const applyPreset = (presetType: 'AYLANMA_STD' | 'QQS_STD' | 'QQS_WITH_PROPERTY' | 'YATT_STD' | 'RENTAL') => {
    switch (presetType) {
      case 'AYLANMA_STD':
        setSelectedReports(['AYLANMA', 'JSHDS', 'INPS']);
        break;
      case 'QQS_STD':
        setSelectedReports(['QQS', 'FOYDA', 'JSHDS', 'INPS']);
        break;
      case 'QQS_WITH_PROPERTY':
        setSelectedReports(['QQS', 'FOYDA', 'JSHDS', 'INPS', 'MOL_MULK', 'YER']);
        break;
      case 'YATT_STD':
        setSelectedReports(['JSHDS', 'INPS', 'AYLANMA']);
        break;
      case 'RENTAL':
        setSelectedReports(prev => Array.from(new Set([...prev, 'IJARA'])));
        break;
    }
  };

  const handleSave = () => {
    if (isBulkMode && clientIds) {
      onSave(selectedReports, clientIds);
    } else if (currentClient) {
      onSave(selectedReports, [currentClient.id]);
    } else {
      onSave(selectedReports);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Hisobot Shakllarini Belgilash</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  Admin Nazorati
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Mijoz topshirishi shart bo'lgan barcha soliq shakllarini yoqing yoki o'chiring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Client Info or Dropdown */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            {!client && clientsList.length > 0 && !isBulkMode ? (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Mijozni tanlang:
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {clientsList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (STIR: {c.stir}) &bull; {c.accountantName}
                    </option>
                  ))}
                </select>
              </div>
            ) : isBulkMode ? (
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">
                    Ommaviy belgilash rejimi ({clientIds?.length} ta mijoz tanlangan)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tanlangan barcha mijozlarga quyida belgilangan soliq shakllari birdaniga tatbiq etiladi.
                  </div>
                </div>
              </div>
            ) : currentClient ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 font-black text-slate-800 flex items-center justify-center text-sm shadow-2xs">
                    {currentClient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {currentClient.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                      <span>STIR: <strong>{currentClient.stir}</strong></span>
                      <span>&bull;</span>
                      <span>Mas'ul: <strong>{currentClient.accountantName}</strong></span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {currentClient.taxType} rejimi
                </span>
              </div>
            ) : null}
          </div>

          {/* Quick Preset Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tezkor Tayyor Shablonlar (Presets):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('AYLANMA_STD')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 bg-white text-left transition-all cursor-pointer group"
              >
                <div className="font-extrabold text-slate-800 group-hover:text-emerald-700 text-xs">
                  🏢 Standart Aylanma
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Aylanma (4%) + JSHDS + INPS
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('QQS_STD')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 bg-white text-left transition-all cursor-pointer group"
              >
                <div className="font-extrabold text-slate-800 group-hover:text-blue-700 text-xs">
                  🏭 Umumiy Tartib / QQS
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  QQS (12%) + Foyda + JSHDS + INPS
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('QQS_WITH_PROPERTY')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 bg-white text-left transition-all cursor-pointer group"
              >
                <div className="font-extrabold text-slate-800 group-hover:text-indigo-700 text-xs">
                  🏛️ Mulkli & Yerli QQS
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  QQS + Foyda + Mol-mulk + Yer
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('YATT_STD')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 bg-white text-left transition-all cursor-pointer group"
              >
                <div className="font-extrabold text-slate-800 group-hover:text-amber-700 text-xs">
                  👤 YaTT Standart
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  JSHDS + INPS + Aylanma
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('RENTAL')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 bg-white text-left transition-all cursor-pointer group"
              >
                <div className="font-extrabold text-slate-800 group-hover:text-teal-700 text-xs">
                  🏢 + Ijara Hisoboti
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Joriy ro'yxatga Ijarani qo'shish
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReports(ALL_TAX_REPORTS.map(r => r.type))}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 bg-white text-left transition-all cursor-pointer group"
              >
                <div className="font-extrabold text-slate-800 group-hover:text-purple-700 text-xs">
                  ⚡ Barcha Shakllar
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Barcha 10 ta soliq hisoboti
                </div>
              </button>
            </div>
          </div>

          {/* Form Checkboxes Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                Mavjud Soliq Hisobot Shakllari ({selectedReports.length} ta tanlandi):
              </span>
              <button
                type="button"
                onClick={() => setSelectedReports([])}
                className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Barchasini tozalash
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_TAX_REPORTS.map((report) => {
                const isSelected = selectedReports.includes(report.type);

                return (
                  <button
                    key={report.type}
                    type="button"
                    onClick={() => toggleReport(report.type)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleReport(report.type);
                      }
                    }}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 text-left focus:outline-none ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-slate-900">
                            {report.type}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${report.badgeColor}`}>
                            {report.codeName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                          {report.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {report.periodicity} &bull; {report.rateDesc}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection summary */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-extrabold text-white">
                  Jami belgilandi: {selectedReports.length} ta hisobot shakli
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5 flex flex-wrap gap-1">
                  {selectedReports.map(st => (
                    <span key={st} className="px-1.5 py-0.2 rounded bg-white/10 font-mono text-[10px]">
                      {st}
                    </span>
                  ))}
                  {selectedReports.length === 0 && (
                    <span className="text-rose-300 italic">Hech qanday hisobot tanlanmadi</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={selectedReports.length === 0}
            className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedReports.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Saqlash va Jadvalga Qo'llash ✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
