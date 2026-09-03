export type UserRole = 'SUPER_ADMIN' | 'DIREKTOR' | 'BUXGALTER' | 'KASSIR' | 'NAZORATCHI';

export interface UserPermission {
  chat_monitoring: boolean;
  manage_employees: boolean;
  manage_clients: boolean;
  assign_tasks: boolean;
  edit_reports: boolean;
  view_all_clients: boolean;
  export_data: boolean;
  manage_settings: boolean;
  ai_advanced_tools: boolean;
}

export type GiftType = 'FAXRIY_YORLIQ' | 'PUL_MUKOFOTI' | 'TOVAR_SOVGA' | 'QOSHIMCHA_TATIL' | 'MALAKA_OSHIRISH' | 'BOSHQA';

export interface Gift {
  id: string;
  employeeId: string;
  employeeName: string;
  giftType: GiftType;
  description: string;
  points: number; // Reyting ballari
  givenBy: string; // Kim berdi (DIREKTOR yoki NAZORATCHI)
  givenAt: string;
  reason: string;
}

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  position: string;
  avatar: string;
  status: 'ACTIVE' | 'AWAY' | 'VACATION' | 'INACTIVE';
  assignedClientCount: number;
  reportCompletionRate: number; // percentage e.g. 96%
  completedTasksCount: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
  issuesCount: number;
  lettersCount: number;
  accounting1CCount: number;
  rating: number; // Sovga ballari asosida hisoblangan reyting
  giftsReceived: number; // Qabul qilingan sovgalar soni
}

export type ClientType = 'YATT' | 'YURIDIK';
export type TaxType = 'AYLANMA' | 'QQS' | 'FOYDA' | 'YATT_QATQIY';
export type ClientStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface Client {
  id: string;
  name: string;
  stir: string; // 9 digits INN
  type: ClientType;
  taxType: TaxType;
  phone: string;
  address: string;
  accountantId: string;
  accountantName: string;
  monthlyFee: number;
  contractDate: string;
  status: ClientStatus;
  notes: string;
  tags?: string[];
  assignedReportTypes?: ReportType[];
}

export interface ReportPeriod {
  id: string;
  name: string; // 'Avgust 2026'
  month: number;
  year: number;
  startDate: string; // '2026-08-01'
  deadlineDate: string; // '2026-08-15'
  isCurrent: boolean;
}

export type ReportType = 
  | 'AYLANMA' 
  | 'QQS' 
  | 'FOYDA' 
  | 'JSHDS' 
  | 'INPS' 
  | 'IJARA' 
  | 'YER' 
  | 'MOL_MULK' 
  | 'SUV' 
  | 'AOS' 
  | 'KKS';

export type ReportStatus = 'TOPSHIRILDI' | 'JARAYONDA' | 'TOPSHIRILMAGAN' | 'TALAB_QILINMAYDI';

export interface TaxReport {
  id: string;
  clientId: string;
  clientName: string;
  stir: string;
  reportType: ReportType;
  periodId: string;
  status: ReportStatus;
  submittedAt?: string;
  submittedBy?: string;
  accountantId: string;
  notes?: string;
  proofAttachment?: ProofAttachment;
}

export type Status1C = 'KIRITILGAN' | 'KIRITILMAGAN';

export interface Accounting1CRecord {
  id: string;
  clientId: string;
  clientName: string;
  stir: string;
  periodId: string;
  oborotkaStatus: Status1C;
  oborotkaDate?: string;
  incomingInvoicesCount: number;
  incomingInvoicesEntered: number;
  incomingStatus: Status1C;
  outgoingInvoicesCount: number;
  outgoingInvoicesEntered: number;
  outgoingStatus: Status1C;
  accountantId: string;
  issuesCount: number;
  notes?: string;
  lastUpdated?: string;
}

export type PaymentStatus = 'TOLANGAN' | 'QISMAN' | 'TOLANMAGAN';

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  stir: string;
  monthlyFee: number;
  paidAmount: number;
  debtAmount: number;
  lastPaymentDate?: string;
  nextDueDate: string;
  status: PaymentStatus;
  notes?: string;
  accountantId: string;
}

export type LetterStatus = 'YANGI' | 'OQILGAN' | 'JAVOB_KUTILMOQDA' | 'JAVOB_BERILDI' | 'YOPILGAN';

export interface LetterRecord {
  id: string;
  clientId: string;
  clientName: string;
  stir: string;
  letterNumber: string;
  type: string; // e.g. "Soliq qo'mitasi talabnomasi", "Kameral xabarnoma", "Statistika"
  summary: string;
  receivedDate: string; // e.g. '2026-08-10'
  readAt?: string; // e.g. '2026-08-11 09:34'
  readBy?: string;
  responseDeadline: string; // e.g. '2026-08-15'
  repliedAt?: string;
  status: LetterStatus;
  accountantId: string;
  attachmentUrl?: string;
  attachmentName?: string;
  notes?: string;
}

export type KameralStatus = 'OCHIQ' | 'JARAYONDA' | 'JAVOB_BERILDI' | 'KAMCHILIK_ANIQLANDI' | 'YOPILGAN';

export interface KameralAudit {
  id: string;
  clientId: string;
  clientName: string;
  stir: string;
  auditType: string; // e.g. "QQS tafovuti", "Aylanma soliq hisob-kitobi", "Import QQS"
  summary: string;
  receivedDate: string;
  deadlineDate: string;
  status: KameralStatus;
  accountantId: string;
  discrepancyAmount?: number;
  linkedIssueId?: string;
  linkedTaskId?: string;
  notes?: string;
}

export type IssueStatus = 'OCHIQ' | 'JARAYONDA' | 'TUZATILDI' | 'YOPILGAN';
export type IssuePriority = 'YUQORI' | 'ORTA' | 'PAST';

export interface ProofAttachment {
  name: string;
  type: string; // 'image/jpeg' | 'image/png' | 'application/pdf'
  url: string; // Base64 data URL or object URL
  size?: string;
  uploadedAt: string;
  uploadedBy: string;
  comment?: string;
}

export interface IssueRecord {
  id: string;
  clientId: string;
  clientName: string;
  stir: string;
  type: string; // "1C tafovut", "Hisobot xatosi", "Faktura nomuvofiqligi", "Kameral kamchilik"
  description: string;
  creatorName: string;
  accountantId: string;
  accountantName?: string;
  creatorId?: string;
  createdAt: string;
  deadlineDate: string;
  resolvedAt?: string;
  status: IssueStatus;
  priority: IssuePriority;
  notes?: string;
  fileAttachment?: string;
  proofAttachment?: ProofAttachment;
}

export type TaskPriority = 'JUDA_MUHIM' | 'MUHIM' | 'ODDIY';
export type TaskStatus = 'YANGI' | 'QABUL_QILINDI' | 'JARAYONDA' | 'BAJARILDI' | 'KECHIKDI';

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  stir?: string;
  creatorId: string;
  creatorName: string;
  assigneeIds: string[];
  assigneeNames: string[];
  createdAt: string;
  deadlineDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  acceptedBy: string[]; // List of employee IDs who clicked "Qabul qildim"
  completedAt?: string;
  notes?: string;
  fileAttachment?: string;
  proofAttachment?: ProofAttachment;
}

export interface AutomaticReminder {
  id: string;
  category: 'HISOBOT' | 'TOLOV' | 'XAT' | 'KAMERAL' | 'TOPSHIRIQ' | '1C';
  targetDate: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'DANGER';
  isActive: boolean;
  conditionDescription: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachment?: {
    name: string;
    type: 'image' | 'pdf' | 'excel' | 'audio' | 'file';
    size: string;
    url?: string;
  };
  isVoice?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  isGroup: boolean;
  memberIds: string[];
  memberNames: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isGeneralStaffGroup?: boolean;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  objectType: string;
  objectId: string;
  objectName: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  type: 'TASK' | 'DEADLINE' | 'REPORT' | 'LETTER' | 'PAYMENT' | 'KAMERAL' | 'AI_ALERT' | 'CHAT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkModule?: string;
  relatedId?: string;
}

export type AIAgentRole = 
  | 'SOLIQ_MASLAHATCHISI'
  | 'KAMERAL_TAHLILCHI'
  | 'BUXGALTERIYA_AUDITANTI'
  | 'HISOBOT_TEKSHIRUVCHI'
  | 'XODIMLAR_NAZORATCHISI'
  | 'MIJOZ_TAHLILCHISI'
  | 'TOPSHIRIQ_MENEJERI'
  | 'EXCEL_HISOBOT_TAHLILCHI';

export type AIAgentType = 
  | 'GENERAL' 
  | 'HISOBOT' 
  | '1C' 
  | 'TOLOV' 
  | 'XAT' 
  | 'KAMERAL' 
  | 'KAMCHILIK' 
  | 'NAZORAT' 
  | 'XODIM';

export interface AIActionProposal {
  actionType: 'CREATE_TASK' | 'UPDATE_REPORT' | 'UPDATE_1C' | 'CREATE_ISSUE' | 'SEND_REMINDER';
  targetName: string;
  details: Record<string, any>;
  description: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  agentType: AIAgentType;
  text: string;
  timestamp: string;
  proposedAction?: AIActionProposal | null;
  actionStatus?: 'PENDING' | 'EXECUTED' | 'CANCELLED';
}

export interface DatabaseScanIssue {
  id: string;
  category: 'CLIENT' | 'REPORT' | '1C' | 'PAYMENT' | 'LETTER' | 'KAMERAL' | 'TASK' | 'EMPLOYEE';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  affectedEntityId?: string;
  affectedEntityName?: string;
  autoFixable: boolean;
  fixActionName?: string;
}

export interface DatabaseScanResult {
  timestamp: string;
  totalRecords: number;
  healthScore: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: DatabaseScanIssue[];
}
