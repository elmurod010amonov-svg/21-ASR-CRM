import React, { useState, useRef } from 'react';
import { FileUp, FileSpreadsheet, CheckCircle2, AlertCircle, Upload, ArrowRight, Table, Sparkles } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientType, TaxType } from '../../types';
import * as XLSX from 'xlsx';

// Sarlavha (header) ustunini aniqlash uchun barcha maydonlarning kalit
// so'zlari — haqiqiy fayllarda ko'p uchraydigan Uzbek/rus/lotin variantlari
// bilan (masalan JSHSHR, Hisobot, To'lov, Narx).
const NAME_PATTERNS = [/name/i, /korxona/i, /company|firma/i, /nomi/i];
const STIR_PATTERNS = [/stir/i, /jshshr/i, /jshr/i, /tin/i, /inn/i, /ident/i];
const TYPE_PATTERNS = [/\btur/i, /type/i];
const TAX_PATTERNS = [/soliq/i, /tax/i, /qqs/i, /foyda/i, /hisobot/i];
const ACCOUNTANT_PATTERNS = [/buxgalter/i, /accountant/i, /masul/i, /responsible/i, /direktor/i];
const PHONE_PATTERNS = [/telefon/i, /phone/i, /\btel\b/i];
const FEE_PATTERNS = [/oylik/i, /monthly/i, /summa/i, /fee/i, /to.?lov/i, /narx/i, /kelishilgan/i];
const ADDRESS_PATTERNS = [/manzil/i, /address/i];

const ALL_HEADER_PATTERNS = [
  ...NAME_PATTERNS, ...STIR_PATTERNS, ...TYPE_PATTERNS, ...TAX_PATTERNS,
  ...ACCOUNTANT_PATTERNS, ...PHONE_PATTERNS, ...FEE_PATTERNS, ...ADDRESS_PATTERNS,
];

const normalizeClientType = (raw: string): ClientType => {
  const v = raw.trim().toUpperCase();
  return v.includes('YATT') || v.includes('ЯТТ') ? 'YATT' : 'YURIDIK';
};

const normalizeTaxType = (raw: string): TaxType => {
  const v = raw.trim().toUpperCase();
  if (v.includes('QQS') || v.includes('ҚҚС')) return 'QQS';
  if (v.includes('FOYDA')) return 'FOYDA';
  if (v.includes('QAT')) return 'YATT_QATQIY';
  return 'AYLANMA';
};

export const ExcelImportView: React.FC = () => {
  const { clients, addClient, employees, setActiveTab, importClientsFromExcel } = useCRM();

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

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

  // Ba'zi fayllarda jadval sarlavhasidan oldin sarlavha/nom qatori (masalan
  // "Yuridik korxonalar") bo'ladi — shu sababli har doim 1-qatorni sarlavha
  // deb olish xato. Shuning uchun birinchi bir necha qatorni tekshirib,
  // tanish kalit so'zlar (Nomi, STIR, JSHSHR, Hisobot, To'lov va h.k.) eng
  // ko'p uchragan qatorni haqiqiy sarlavha deb tanlaymiz.
  const findHeaderRowIndex = (rows: any[][]): number => {
    let bestIdx = 0;
    let bestScore = -1;
    const scanLimit = Math.min(rows.length, 10);
    for (let i = 0; i < scanLimit; i++) {
      const row = rows[i] || [];
      const score = row.reduce((acc: number, cell: any) => {
        const text = String(cell ?? '').trim();
        if (!text) return acc;
        return acc + (ALL_HEADER_PATTERNS.some(p => p.test(text)) ? 1 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  const parseSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    setParseError(null);
    const sheet = wb.Sheets[sheetName];
    if (!sheet) {
      setParseError('Jadval topilmadi');
      setPreviewRows([]);
      return;
    }

    const aoa = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' }) as any[][];
    if (!Array.isArray(aoa) || aoa.length === 0) {
      setParseError('Jadval bo‘sh yoki noto‘g‘ri format');
      setPreviewRows([]);
      return;
    }

    const headerRowIdx = findHeaderRowIndex(aoa);
    const headerRow = (aoa[headerRowIdx] || []).map((h: any) => String(h ?? '').trim());
    const dataRows = aoa
      .slice(headerRowIdx + 1)
      .filter(row => row.some((cell: any) => String(cell ?? '').trim() !== ''));

    if (dataRows.length === 0) {
      setParseError("Ustunlar topildi, lekin ma'lumot qatorlari yo'q");
      setPreviewRows([]);
      return;
    }

    const raw = dataRows.map(row => {
      const obj: Record<string, any> = {};
      headerRow.forEach((h, idx) => {
        obj[h || `col_${idx}`] = row[idx] !== undefined ? row[idx] : '';
      });
      return obj;
    });

    const keys = Object.keys(raw[0]);
    const nameKey = detectKey(keys, NAME_PATTERNS);
    const stirKey = detectKey(keys, STIR_PATTERNS);
    const typeKey = detectKey(keys, TYPE_PATTERNS);
    const taxKey = detectKey(keys, TAX_PATTERNS);
    const accKey = detectKey(keys, ACCOUNTANT_PATTERNS);
    const phoneKey = detectKey(keys, PHONE_PATTERNS);
    const feeKey = detectKey(keys, FEE_PATTERNS);
    const addressKey = detectKey(keys, ADDRESS_PATTERNS);

    const mapped = raw.map((row: any) => {
      const get = (k?: string) => (k ? row[k] : undefined);
      const feeRaw = get(feeKey) || '';
      const feeNum = typeof feeRaw === 'number' ? feeRaw : Number(String(feeRaw).replace(/[^0-9]/g, '')) || 0;
      const stirVal = String(get(stirKey) || '').replace(/\D/g, '');
      // "Turi" ustuni topilmasa — STIR uzunligidan aniqlaymiz: 14 xonali
      // JSHSHR = YaTT, 9 xonali STIR = Yuridik shaxs.
      const typeVal = get(typeKey);
      const type: ClientType = typeVal
        ? normalizeClientType(String(typeVal))
        : (stirVal.length === 14 ? 'YATT' : 'YURIDIK');
      const taxVal = get(taxKey);
      const taxType: TaxType = taxVal ? normalizeTaxType(String(taxVal)) : 'AYLANMA';

      return {
        name: String(get(nameKey) || "Noma'lum").trim(),
        stir: stirVal,
        type,
        taxType,
        accountantName: String(get(accKey) || '').trim(),
        phone: String(get(phoneKey) || '').trim(),
        monthlyFee: feeNum,
        address: String(get(addressKey) || '').trim(),
      };
    });

    setPreviewRows(mapped);
  };

  const handleFile = async (file: File | null) => {
    setParseError(null);
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    if (!wb.SheetNames.length) {
      setParseError('Jadval topilmadi');
      return;
    }
    setWorkbook(wb);
    setSheetNames(wb.SheetNames);
    const firstSheet = wb.SheetNames[0];
    setSelectedSheet(firstSheet);
    parseSheet(wb, firstSheet);
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbook) {
      parseSheet(workbook, sheetName);
    }
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
          <p className="text-xs text-slate-600 mt-1">yoki kompyuterdan fayl tanlash uchun bosing</p>
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

        {sheetNames.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <label className="text-[11px] font-bold text-slate-600">Varaq (sheet):</label>
            <select
              value={selectedSheet}
              onChange={(e) => handleSheetChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              {sheetNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}
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
