import React, { useState } from 'react';
import {
  Settings,
  Smartphone,
  Activity,
  Wrench,
  Download,
  Upload,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { arrayBufferToBase64 } from '../../utils/debtActDocx';

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
    debtActTemplateFile,
    updateDebtActTemplateFile
  } = useCRM();

  const [uploadError, setUploadError] = useState('');

  const handleFix = () => {
    applyDatabaseAutoFix();
  };

  const isWordZip = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer.slice(0, 4));
    return bytes[0] === 0x50 && bytes[1] === 0x4b;
  };

  const saveWordTemplate = async (file: File) => {
    const lower = file.name.toLowerCase();
    const isWordName = lower.endsWith('.docx') || lower.endsWith('.doc');
    const isWordMime =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword';

    if (!isWordName && !isWordMime) {
      setUploadError('Faqat Word fayl yuklang: .docx');
      return;
    }

    const buffer = await file.arrayBuffer();
    if (!isWordZip(buffer)) {
      setUploadError('Bu eski Word (.doc) formati. Word’da «Saqlash» → «Word hujjati (*.docx)» qilib yuklang.');
      return;
    }

    if (buffer.byteLength > 10 * 1024 * 1024) {
      setUploadError('Fayl hajmi 10 MB dan oshmasligi kerak. Rasm/logotiplarni siqib, qayta saqlab yuklang.');
      return;
    }

    const base64 = arrayBufferToBase64(buffer);
    const fileName = lower.endsWith('.doc') ? file.name.replace(/\.doc$/i, '.docx') : file.name;
    updateDebtActTemplateFile({ base64, fileName });
    setUploadError('');
    alert('Word shabloni yuklandi. Qarzdor mijozlar uchun Akt tugmasi shu Word fayldan foydalanadi.');
  };

  const handleResetToDefault = () => {
    if (!window.confirm('O\'zingiz yuklagan Word shablonini o\'chirib, tizimning standart AKT shabloniga qaytarilsinmi?')) return;
    updateDebtActTemplateFile(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError('');
    try {
      await saveWordTemplate(file);
    } catch (error) {
      console.error(error);
      setUploadError('Word shablonini o‘qib bo‘lmadi. Fayl .docx ekanini tekshiring.');
    }
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
        <p className="text-xs text-slate-600">21-ASR CRM konfiguratsiyasi, Baza skaneri va xavfsizlik parametrlari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Health & Scanner Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-700 text-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  Baza Diagnostikasi & Audit Skaneri
                </h3>
                <p className="text-xs text-slate-600">
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
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Skanerni Ochish
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
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Baza Salomatligi</div>
              <div className="text-xl font-black text-emerald-600">{scanResult?.healthScore ?? 100}%</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Jami Yozuvlar</div>
              <div className="text-xl font-black text-slate-900">{scanResult?.totalRecords ?? 0} ta</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Xatolar</div>
              <div className="text-xl font-black text-rose-600">{scanResult?.errorCount ?? 0} ta</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Ogohlantirishlar</div>
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
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-bold text-slate-900"
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
          <p className="text-xs text-slate-600 leading-relaxed">
            Barcha mijozlar, hisobotlar va to'lovlar ma'lumotlarini JSON formatida yuklab olish.
          </p>
          <button
            onClick={exportDataJson}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
          <p className="text-xs text-slate-600 leading-relaxed">
            Soliq hisobotlari va eslatmalarni buxgalterlar Telegram profiliga avtomatik yuborish ulanishi faol.
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-mono font-bold">
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
            <p className="text-xs text-slate-600 leading-relaxed">
              To'lovlar bo'limida qarzi bor mijoz uchun «Akt» bosilganda, tizim <strong>tayyor standart shablon</strong> asosida
              (tashkilot rekvizitlari, jadval va imzo joylari bilan) Word hujjatini avtomatik to'ldirib, yuklab beradi — hech narsa yuklash shart emas.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agar boshqacha ko'rinishdagi shablon kerak bo'lsa, o'z Word faylingizni (.docx) yuklashingiz mumkin — shunda tizim standart shablon o'rniga shu faylni ishlatadi.
              O'zgaruvchilar: {`{korxona_nomi}`}, {`{stir}`}, {`{manzil}`}, {`{hisobot_turi}`}, {`{davri}`}, {`{qarz_miqdori}`}, {`{oylik_tolov}`}, {`{tolangan}`}, {`{izoh}`}, {`{sana}`}.
              {' '}Direktor, Bosh buxgalter va tashkilot rekvizitlari (nom, manzil, STIR) — Word shablonining o'ziga to'g'ridan-to'g'ri statik matn sifatida yozing, ular har bir mijoz uchun o'zgarmaydi.
            </p>

            <label
              className="flex flex-col items-center justify-center gap-2 px-4 py-8 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl cursor-pointer transition-colors"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                setUploadError('');
                try {
                  await saveWordTemplate(file);
                } catch (error) {
                  console.error(error);
                  setUploadError('Word shablonini o‘qib bo‘lmadi. Fayl .docx ekanini tekshiring.');
                }
              }}
            >
              <Upload className="w-6 h-6 text-emerald-600" />
              <span className="text-slate-900 font-bold text-sm">Word faylni tanlang yoki shu yerga tashlang</span>
              <span className="text-[11px] text-slate-600">Faqat Word hujjati: .docx</span>
              <input
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {debtActTemplateFile ? (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-[11px] text-emerald-700 font-bold">
                  Faol shablon: {debtActTemplateFile.fileName} (o'zingiz yuklagan Word fayli)
                </div>
                <button
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-300 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Standart shablonga qaytarish
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-bold">
                Faol shablon: Tizimning standart AKT shabloni ishlatilmoqda.
              </div>
            )}
            {uploadError && (
              <div className="text-[11px] text-rose-700 font-bold">{uploadError}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
