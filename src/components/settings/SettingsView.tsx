import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  RefreshCw, 
  Smartphone, 
  Zap, 
  Activity, 
  Wrench, 
  CheckCircle2,
  Sparkles,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const SettingsView: React.FC = () => {
  const { 
    currentPeriod, 
    periods, 
    setCurrentPeriod,
    scanResult,
    runDatabaseScan,
    applyDatabaseAutoFix,
    setIsScannerModalOpen,
    clients,
    taxReports,
    currentUser,
    debtActTemplate,
    updateDebtActTemplate
  } = useCRM();

  const [templateInput, setTemplateInput] = useState(debtActTemplate);

  const handleFix = () => {
    applyDatabaseAutoFix();
  };

  const handleSaveTemplate = () => {
    updateDebtActTemplate(templateInput);
    alert('Qarzdorlik akti shabloni saqlandi!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // For Word files, we'll extract text content
      if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        // For now, we'll store the base64 content
        // In a real implementation, you'd use a library like mammoth.js to extract text from .docx
        setTemplateInput(content);
      } else {
        setTemplateInput(content);
      }
    };
    reader.readAsText(file);
  };

  const exportDataJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        clients,
        taxReports,
        exportDate: new Date().toISOString(),
        version: "21ASR-CRM-V1"
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `21ASR_CRM_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900">Tizim Sozlamalari & Baza Nazorati</h1>
        <p className="text-xs text-slate-500">21-ASR CRM konfiguratsiyasi, Baza skaneri va xavfsizlik parametrlari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Health & Scanner Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  Baza Diagnostikasi & Audit Skaneri
                </h3>
                <p className="text-xs text-slate-500">
                  STIRlar, hisobotlar, 1C, to'lovlar va bog'lanishlar yaxlitligi tahlili
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  runDatabaseScan();
                  setIsScannerModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Skanerni Ochish
              </button>
              <button
                onClick={handleFix}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" /> 1-Click Avto-Tuzatish
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Baza Salomatligi</div>
              <div className="text-xl font-black text-emerald-600">{scanResult?.healthScore ?? 100}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Jami Yozuvlar</div>
              <div className="text-xl font-black text-slate-900">{scanResult?.totalRecords ?? 0} ta</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Xatolar</div>
              <div className="text-xl font-black text-rose-600">{scanResult?.errorCount ?? 0} ta</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Ogohlantirishlar</div>
              <div className="text-xl font-black text-amber-600">{scanResult?.warningCount ?? 0} ta</div>
            </div>
          </div>
        </div>

        {/* Period Configuration */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            Faol Soliq Davri
          </h3>

          <div className="space-y-2 text-xs">
            <label className="block font-bold text-slate-700">Joriy ishchi hisobot davri:</label>
            <select
              value={currentPeriod.id}
              onChange={(e) => {
                const found = periods.find(p => p.id === e.target.value);
                if (found) setCurrentPeriod(found);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
            >
              {periods.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.isCurrent ? "Joriy" : "Tarixiy"})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            Baza Zaxira Nusxasi (Backup)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Barcha mijozlar, hisobotlar va to'lovlar ma'lumotlarini JSON formatida yuklab olish.
          </p>
          <button
            onClick={exportDataJson}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" /> JSON Backup Yuklab Olish
          </button>
        </div>

        {/* Telegram Bot Integration */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            Telegram Bot Integratsiyasi
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Soliq hisobotlari va eslatmalarni buxgalterlar Telegram profiliga avtomatik yuborish ulanishi faol.
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-mono font-bold">
            @Asr21_Accounting_Bot (Ulangan)
          </div>
        </div>

        {/* Debt Act Template */}
        {currentUser.role === 'SUPER_ADMIN' && (
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-600" />
              Qarzdorlik Akti Shabloni
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              SUPER_ADMIN tomonidan qarzdorlik akti shablonini sozlash. Quyidagi o'zgaruvchilardan foydalaning: {`{korxona_nomi}`}, {`{stir}`}, {`{manzil}`}, {`{qarz_miqdori}`}, {`{oylik_tolov}`}, {`{tolangan}`}, {`{sana}`}
            </p>
            
            <div className="flex gap-2">
              <label className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Word faylni yuklash (.doc, .docx)
                <input
                  type="file"
                  accept=".doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={templateInput}
              onChange={(e) => setTemplateInput(e.target.value)}
              placeholder="Qarzdorlik akti shablonini kiriting..."
              className="w-full h-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-600 resize-none"
            />
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Shablonni Saqlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
