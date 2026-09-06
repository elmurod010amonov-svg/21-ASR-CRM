import { 
  Employee, 
  Client, 
  ReportPeriod, 
  TaxReport, 
  Accounting1CRecord, 
  PaymentRecord, 
  LetterRecord, 
  KameralAudit, 
  IssueRecord, 
  TaskRecord, 
  AutomaticReminder, 
  ChatRoom, 
  ChatMessage, 
  AuditLogRecord, 
  NotificationItem 
} from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Jahongir Amonov',
    role: 'SUPER_ADMIN',
    email: 'jahongir7amonov136@gmail.com',
    phone: '+998 90 123 45 67',
    position: 'Bosh Boshqaruvchi (Super Admin)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    assignedClientCount: 0,
    reportCompletionRate: 0,
    completedTasksCount: 0,
    pendingTasksCount: 0,
    overdueTasksCount: 0,
    issuesCount: 0,
    lettersCount: 0,
    accounting1CCount: 0,
    rating: 0,
    giftsReceived: 0,
  }
];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_PERIODS: ReportPeriod[] = [
  {
    id: 'per-2026-08',
    name: 'Avgust 2026',
    month: 8,
    year: 2026,
    startDate: '2026-08-01',
    deadlineDate: '2026-08-15',
    isCurrent: true,
  },
  {
    id: 'per-2026-07',
    name: 'Iyul 2026',
    month: 7,
    year: 2026,
    startDate: '2026-07-01',
    deadlineDate: '2026-07-15',
    isCurrent: false,
  },
  {
    id: 'per-2026-09',
    name: 'Sentabr 2026',
    month: 9,
    year: 2026,
    startDate: '2026-09-01',
    deadlineDate: '2026-09-15',
    isCurrent: false,
  },
];

export const INITIAL_TAX_REPORTS: TaxReport[] = [];
export const INITIAL_ACCOUNTING_1C: Accounting1CRecord[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_LETTERS: LetterRecord[] = [];
export const INITIAL_KAMERAL: KameralAudit[] = [];
export const INITIAL_ISSUES: IssueRecord[] = [];
export const INITIAL_TASKS: TaskRecord[] = [];

export const INITIAL_REMINDERS: AutomaticReminder[] = [
  {
    id: 'rem-1',
    category: 'HISOBOT',
    targetDate: '10-sana',
    title: 'Hisobot muddatiga 5 kun qoldi',
    message: 'Hurmatli buxgalterlar! Joriy oy soliq hisobotlarini topshirish oxirgi muddati 15-sana.',
    severity: 'INFO',
    isActive: true,
    conditionDescription: 'Har oyning 10-sanasida avtomatik ishga tushadi',
  },
  {
    id: 'rem-2',
    category: 'HISOBOT',
    targetDate: '13-sana',
    title: 'Topshirilmagan hisobotlar ogohlantirishi',
    message: 'Diqqat! Sizda topshirilmagan hisobotlar mavjud. Iltimos, darhol yakunlang.',
    severity: 'WARNING',
    isActive: true,
    conditionDescription: 'Har oyning 13-sanasida topshirilmagan mijozlar uchun',
  },
  {
    id: 'rem-3',
    category: 'HISOBOT',
    targetDate: '15-sana',
    title: 'Bugun hisobotlarning oxirgi kuni!',
    message: 'Bugun soat 23:59 gacha barcha soliq hisobotlari topshirilishi shart.',
    severity: 'DANGER',
    isActive: true,
    conditionDescription: 'Har oyning 15-sanasida ertalab soat 09:00 da',
  },
  {
    id: 'rem-4',
    category: 'HISOBOT',
    targetDate: '16-sana',
    title: 'Hisobot muddati o\'tgan kechikishlar',
    message: 'Topshirilmagan hisobotlar bo\'yicha jarima xavfi mavjud. Rahbariyatga xabar berildi.',
    severity: 'DANGER',
    isActive: true,
    conditionDescription: 'Har oyning 16-sanasida kechikkanlar aniqlanganda',
  },
  {
    id: 'rem-5',
    category: 'TOLOV',
    targetDate: '5-sana',
    title: 'Oylik xizmat to\'lovlari muddati',
    message: 'Mijozlarga oylik xizmat haqqi hisob-fakturalarini taqdim etish va qarzdorlikni tekshirish.',
    severity: 'INFO',
    isActive: true,
    conditionDescription: 'Har oyning 5-sanasida',
  },
];

export const INITIAL_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-general',
    name: 'Umumiy Jamoa Chati',
    isGroup: true,
    isGeneralStaffGroup: true,
    memberIds: ['emp-1'],
    memberNames: ['Jahongir Amonov'],
    lastMessage: '',
    lastMessageTime: '',
    unreadCount: 0,
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
