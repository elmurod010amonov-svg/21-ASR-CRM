import JSZip from 'jszip';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';

export type DebtActValues = {
  korxona_nomi: string;
  stir: string;
  manzil: string;
  qarz_miqdori: string;
  oylik_tolov: string;
  tolangan: string;
  sana: string;
  hisobot_turi: string;
  davri: string;
  izoh: string;
};

const PLACEHOLDER_KEYS: (keyof DebtActValues)[] = [
  'korxona_nomi',
  'stir',
  'manzil',
  'qarz_miqdori',
  'oylik_tolov',
  'tolangan',
  'sana',
  'hisobot_turi',
  'davri',
  'izoh',
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unescapeXml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function replaceRange(texts: string[], start: number, end: number, value: string) {
  let cursor = 0;
  let startNode = 0;
  let startOff = 0;
  let endNode = 0;
  let endOff = 0;

  for (let i = 0; i < texts.length; i++) {
    const len = texts[i].length;
    if (start >= cursor && start <= cursor + len) {
      startNode = i;
      startOff = start - cursor;
    }
    if (end >= cursor && end <= cursor + len) {
      endNode = i;
      endOff = end - cursor;
      break;
    }
    cursor += len;
  }

  if (startNode === endNode) {
    texts[startNode] = texts[startNode].slice(0, startOff) + value + texts[startNode].slice(endOff);
    return;
  }

  texts[startNode] = texts[startNode].slice(0, startOff) + value;
  for (let i = startNode + 1; i < endNode; i++) texts[i] = '';
  texts[endNode] = texts[endNode].slice(endOff);
}

function fillWordXml(xml: string, replacements: Record<string, string>): string {
  const nodeRe = /<w:t(\s[^>]*)?>([^<]*)<\/w:t>/g;
  const nodes: { attrs: string; index: number; length: number }[] = [];
  const texts: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = nodeRe.exec(xml)) !== null) {
    nodes.push({ attrs: match[1] || '', index: match.index, length: match[0].length });
    texts.push(unescapeXml(match[2]));
  }

  const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);

  if (nodes.length === 0) {
    let out = xml;
    for (const token of tokens) {
      out = out.split(token).join(escapeXml(replacements[token]));
    }
    return out;
  }

  for (const token of tokens) {
    const value = replacements[token];
    while (true) {
      const joined = texts.join('');
      const found = joined.indexOf(token);
      if (found === -1) break;
      replaceRange(texts, found, found + token.length, value);
    }
  }

  let out = xml;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const attrs = node.attrs.includes('xml:space') ? node.attrs : `${node.attrs} xml:space="preserve"`;
    const replacement = `<w:t${attrs}>${escapeXml(texts[i])}</w:t>`;
    out = out.slice(0, node.index) + replacement + out.slice(node.index + node.length);
  }
  return out;
}

function buildReplacementMap(values: DebtActValues): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of PLACEHOLDER_KEYS) {
    const value = values[key];
    map[`{${key}}`] = value;
    map[`{{${key}}}`] = value;
  }
  return map;
}

export async function extractDocxPlainText(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const documentXml = await zip.file('word/document.xml')?.async('string');
  if (!documentXml) return '';
  return unescapeXml(documentXml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, '')).replace(/\n{3,}/g, '\n\n').trim();
}

export async function fillDocxTemplate(arrayBuffer: ArrayBuffer, values: DebtActValues): Promise<Blob> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const map = buildReplacementMap(values);
  const xmlFiles = Object.keys(zip.files).filter((name) => name.startsWith('word/') && name.endsWith('.xml'));

  await Promise.all(
    xmlFiles.map(async (name) => {
      const file = zip.file(name);
      if (!file) return;
      const xml = await file.async('string');
      zip.file(name, fillWordXml(xml, map));
    })
  );

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

const ORG_NAME = '"21-ASR RAQAMLI XIZMATLARI" MCHJ';
const ORG_ADDRESS = "Samarqand viloyati, Urgut tumani, Do'stlik MFY, Navoiy ko'chasi, 2-uy";
const ORG_STIR = '306096905';
const ORG_DISTRICT = 'Urgut tuman';
const ORG_DIRECTOR = 'Suvonov O.';
const ORG_BOSH_BUXGALTER = 'Azimzoda O.';

const FONT = 'Times New Roman';

function actCellBorders() {
  const border = { style: BorderStyle.SINGLE, size: 2, color: '000000' } as const;
  return { top: border, bottom: border, left: border, right: border };
}

function actHeaderCell(text: string) {
  return new TableCell({
    borders: actCellBorders(),
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, font: FONT, size: 20 })],
      }),
    ],
  });
}

function actBodyCell(text: string) {
  return new TableCell({
    borders: actCellBorders(),
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, font: FONT, size: 20 })],
      }),
    ],
  });
}

function borderlessCell(text: string, alignment: (typeof AlignmentType)[keyof typeof AlignmentType]) {
  return new TableCell({
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children: [
      new Paragraph({
        alignment,
        children: [new TextRun({ text, font: FONT, size: 20 })],
      }),
    ],
  });
}

/**
 * 21-ASR firmasining rasmiy "Qarzdorlik Akti" shablonini (jadval bilan) quradi.
 * SUPER_ADMIN o'z Word faylini yuklamagan bo'lsa, tizim shu shablonni ishlatadi.
 */
export async function buildDefaultDebtActDocx(values: DebtActValues): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ORG_NAME, bold: true, font: FONT, size: 26, color: '1F4E79' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [new TextRun({ text: `Manzil: ${ORG_ADDRESS}`, font: FONT, size: 20 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: `STIR: ${ORG_STIR}`, font: FONT, size: 20 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'AKT', bold: true, font: FONT, size: 24 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: "(Hisobotni to'lovini amalga oshirilmaganligi uchun)", italics: true, font: FONT, size: 20 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
            rows: [
              new TableRow({
                children: [
                  borderlessCell(`Sana: ${values.sana} yil`, AlignmentType.LEFT),
                  borderlessCell(ORG_DISTRICT, AlignmentType.RIGHT),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 120 } }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Biz, quyida imzo chekkanlar, ${ORG_NAME} tomonidan ko'rsatiladigan buxgalteriya xizmatlari doirasida, doimiy mijozlar tomonidan xizmat haqi o'z vaqtida to'lanmaganligi va uzluksiz ogohlantirishlarga qaramasdan to'lovni o'z vaqtida amalga oshirmaganligi sababli ushbu akt tuzildi.`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  actHeaderCell('№'),
                  actHeaderCell('Mijoz korxona nomi'),
                  actHeaderCell('STIR'),
                  actHeaderCell('Hisobot turi'),
                  actHeaderCell('Davri'),
                  actHeaderCell('Izoh'),
                  actHeaderCell('Imzo (ruxsat berildi)'),
                ],
              }),
              new TableRow({
                children: [
                  actBodyCell('1'),
                  actBodyCell(values.korxona_nomi),
                  actBodyCell(values.stir),
                  actBodyCell(values.hisobot_turi),
                  actBodyCell(values.davri),
                  actBodyCell(values.izoh),
                  actBodyCell(''),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Mazkur aktga asosan, yuqorida ko'rsatilgan mijozlarning hisobotlari ${values.sana} yil holatiga ko'ra qarzdorlik mavjudligi sababli topshirilmadi. Qarzdorlik bartaraf etilgach, hisobotlar belgilangan tartibda topshiriladi.`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [new TextRun({ text: "Mas'ullar:", bold: true, font: FONT, size: 20 })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: `1. Direktor:\t${ORG_DIRECTOR}\t`, font: FONT, size: 20 }),
              new TextRun({ text: '_________________', font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 280 },
            children: [
              new TextRun({ text: `2. Bosh buxgalter:\t${ORG_BOSH_BUXGALTER}\t`, font: FONT, size: 20 }),
              new TextRun({ text: '_________________', font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Izoh: ', bold: true, italics: true, font: FONT, size: 18 }),
              new TextRun({
                text: "Ushbu Akt ichki nazorat hujjati hisoblanadi va faqat korxona rahbari tomonidan tasdiqlangandan so'ng kuchga ega bo'ladi.",
                italics: true,
                font: FONT,
                size: 18,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

/**
 * Bir nechta qarzdor (hisobot topshirmagan) mijozni bitta jadvalga jamlab,
 * yagona "Umumiy Qarzdorlik Akti" Word hujjatini quradi.
 */
export async function buildCombinedDebtActDocx(rows: DebtActValues[], sana: string): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ORG_NAME, bold: true, font: FONT, size: 26, color: '1F4E79' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [new TextRun({ text: `Manzil: ${ORG_ADDRESS}`, font: FONT, size: 20 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: `STIR: ${ORG_STIR}`, font: FONT, size: 20 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'UMUMIY AKT', bold: true, font: FONT, size: 24 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: "(Qarzdorligi bor va hisobotini topshirmagan mijozlar bo'yicha)", italics: true, font: FONT, size: 20 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
            rows: [
              new TableRow({
                children: [
                  borderlessCell(`Sana: ${sana} yil`, AlignmentType.LEFT),
                  borderlessCell(ORG_DISTRICT, AlignmentType.RIGHT),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 120 } }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Biz, quyida imzo chekkanlar, ${ORG_NAME} tomonidan ko'rsatiladigan buxgalteriya xizmatlari doirasida, quyida ro'yxati keltirilgan mijozlar tomonidan xizmat haqi o'z vaqtida to'lanmaganligi va shu sababli hisobotlari topshirilmaganligi yuzasidan ushbu umumiy akt tuzildi.`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  actHeaderCell('№'),
                  actHeaderCell('Mijoz korxona nomi'),
                  actHeaderCell('STIR/JSHSHR'),
                  actHeaderCell('Hisobot turi'),
                  actHeaderCell('Davri'),
                  actHeaderCell('Izoh'),
                  actHeaderCell('Imzo (ruxsat berildi)'),
                ],
              }),
              ...rows.map((values, idx) => new TableRow({
                children: [
                  actBodyCell(String(idx + 1)),
                  actBodyCell(values.korxona_nomi),
                  actBodyCell(values.stir),
                  actBodyCell(values.hisobot_turi),
                  actBodyCell(values.davri),
                  actBodyCell(values.izoh),
                  actBodyCell(''),
                ],
              })),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Mazkur aktga asosan, yuqorida ko'rsatilgan ${rows.length} ta mijozning hisobotlari ${sana} yil holatiga ko'ra qarzdorlik mavjudligi sababli topshirilmadi. Qarzdorlik bartaraf etilgach, hisobotlar belgilangan tartibda topshiriladi.`,
                font: FONT,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [new TextRun({ text: "Mas'ullar:", bold: true, font: FONT, size: 20 })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: `1. Direktor:\t${ORG_DIRECTOR}\t`, font: FONT, size: 20 }),
              new TextRun({ text: '_________________', font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 280 },
            children: [
              new TextRun({ text: `2. Bosh buxgalter:\t${ORG_BOSH_BUXGALTER}\t`, font: FONT, size: 20 }),
              new TextRun({ text: '_________________', font: FONT, size: 20 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Izoh: ', bold: true, italics: true, font: FONT, size: 18 }),
              new TextRun({
                text: "Ushbu Akt ichki nazorat hujjati hisoblanadi va faqat korxona rahbari tomonidan tasdiqlangandan so'ng kuchga ega bo'ladi.",
                italics: true,
                font: FONT,
                size: 18,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
