import React, { useState, useRef } from 'react';
import { FileUp, FileSpreadsheet, CheckCircle2, AlertCircle, Upload, ArrowRight, Table, Sparkles } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientType, TaxType } from '../../types';
import * as XLSX from 'xlsx';

export const ExcelImportView: React.FC = () => {
  const { clients, addClient, employees, setActiveTab, importClientsFromExcel } = useCRM();

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [importedSuccess, setImportedSuccess] = useState(false);

  const handleExecuteImport = () => {
    try {
      const { added } = importClientsFromExcel(previewRows.map(r => ({
        name: r.name,
        stir: String(r.stir),
        type: r.type,
        taxType: r.taxType,
        accountantName: r.accountantName,
        phone: r.phone,
        monthlyFee: Number(r.monthlyFee),
        address: r.address,
      })), false);

      setImportedSuccess(true);
      setTimeout(() => {
        setActiveTab('Mijozlar');
      }, 1200);
    } catch (e: any) {
      console.error('Import error', e);
      setParseError('Import bajarishda xatolik yuz berdi');
    }
  };

  const detectKey = (keys: string[], patterns: RegExp[]) => {
    for (const p of patterns) {
      const found = keys.find(k => p.test(k));
      if (found) return found;
    }
    return undefined;
  };

  const handleFile = async (file: File | null) => {
    setParseError(null);
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) {
      setParseError('Jadval topilmadi');
      return;
    }

    const raw = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });
    if (!Array.isArray(raw) || raw.length === 0) {
      setParseError('Jadval bo‘sh yoki noto‘g‘ri format');
      return;
    }

    const keys = Object.keys(raw[0]);
    // Header detection patterns
    const nameKey = detectKey(keys, [/name/i, /korxona/i, /company|firma/i, /nomi/i]);
    const stirKey = detectKey(keys, [/stir/i, /tin/i, /inn/i, /ident/i]);
    const typeKey = detectKey(keys, [/tur/i, /type/i]);
    const taxKey = detectKey(keys, [/soliq/i, /tax/i, /qqs/i, /foyda/i]);
    const accKey = detectKey(keys, [/buxgalter/i, /accountant/i, /masul/i, /responsible/i]);
    const phoneKey = detectKey(keys, [/telefon/i, /phone/i, /tel/i]);
    const feeKey = detectKey(keys, [/oylik/i, /monthly/i, /summa/i, /fee/i]);

    const mapped = raw.map((row: any) => {
      const get = (k?: string) => (k ? row[k] : undefined);
      const feeRaw = get(feeKey) || get('monthlyFee') || get('amount') || '';
      const feeNum = typeof feeRaw === 'number' ? feeRaw : Number(String(feeRaw).replace(/[^0-9]/g, '')) || 0;
      return {
        name: get(nameKey) || get('A') || get('Korxona') || "Noma'lum",
        stir: String(get(stirKey) || get('B') || ''),
        type: (get(typeKey) || 'YURIDIK') as ClientType,
        taxType: (get(taxKey) || 'AYLANMA') as TaxType,
        accountantName: get(accKey) || '',
        phone: get(phoneKey) || '',
        monthlyFee: feeNum,
        address: get('address') || '',
      };
    });

    setPreviewRows(mapped);
  };

  const onChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Excel / CSV Ma'lumotlarni Import Qilish</h1>
          <p className="text-xs text-slate-500">Mijozlar bazasini, hisobotlarni yoki to'lovlarni Excel jadvalidan tezkor yuklash</p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 transition-colors text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <FileUp className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Excel (.xlsx, .xls) yoki CSV faylni shu yerga tashlang</h3>
          <p className="text-xs text-slate-400 mt-1">yoki kompyuterdan fayl tanlash uchun bosing</p>
        </div>
        <div className="text-[11px] text-slate-500">
          Ustunlar avtomatik moslashtiriladi: <strong>Korxona nomi, 9 xonali STIR, Soliq turi, Mas'ul buxgalter, Telefon, Oylik summa</strong>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={onChooseFile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Fayl tanlash
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
          />
          {parseError && <span className="text-rose-600 text-xs font-semibold">{parseError}</span>}
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Yuklanishga Tayyor Qatorlar ({previewRows.length} ta)</h3>
          </div>

          <button
            onClick={handleExecuteImport}
            disabled={importedSuccess}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {importedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {importedSuccess ? "Muvaffaqiyatli Import Qilindi!" : "Bazaga Qo'shish & Saqlash"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Korxona Nomi</th>
                <th className="p-3.5">STIR</th>
                <th className="p-3.5">Turi</th>
                <th className="p-3.5">Soliq Tizimi</th>
                <th className="p-3.5">Mas'ul Xodim</th>
                <th className="p-3.5">Telefon</th>
                <th className="p-3.5">Oylik To'lov</th>
                <th className="p-3.5">STIR Takrorlanish Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRows.map((row, idx) => {
                const isDuplicate = clients.some(c => c.stir === row.stir);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{row.name}</td>
                    <td className="p-3.5 font-mono text-slate-700">{row.stir}</td>
                    <td className="p-3.5 font-medium">{row.type}</td>
                    <td className="p-3.5">{row.taxType}</td>
                    <td className="p-3.5 font-semibold text-emerald-800">{row.accountantName}</td>
                    <td className="p-3.5">{row.phone}</td>
                    <td className="p-3.5 font-bold">{row.monthlyFee.toLocaleString()} so'm</td>
                    <td className="p-3.5">
                      {isDuplicate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Mavjud (Yangilanadi)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Yangi Mijoz
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
