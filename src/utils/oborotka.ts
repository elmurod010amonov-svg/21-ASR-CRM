import { Accounting1CRecord } from '../types';

/** Oborotka "shu sanagacha topshirilgan" — muddat o'tmagan bo'lsa faol */
export function isOborotkaActive(record: Accounting1CRecord | null | undefined): boolean {
  if (!record || record.oborotkaStatus !== 'KIRITILGAN') return false;
  if (!record.oborotkaDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return record.oborotkaDate >= today;
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** 1C nazoratiga tortiladigan minimal oylik to'lov chegarasi — shundan past mijozlar 1C bo'limida shakllanmaydi */
export const ONE_C_MIN_MONTHLY_FEE = 1_000_000;

/** Mijoz 1C nazoratiga tortiladimi — oylik to'lovi shu chegaradan yuqori bo'lsagina */
export function isSubjectTo1C(monthlyFee: number): boolean {
  return monthlyFee > ONE_C_MIN_MONTHLY_FEE;
}
