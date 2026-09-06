import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Employee,
  Client,
  ReportPeriod,
  TaxReport,
  Accounting1CRecord,
  PaymentRecord,
  ReceiptRecord,
  InvoiceRecord,
  InvoiceDirection,
  LetterRecord,
  KameralAudit,
  IssueRecord,
  TaskRecord,
  AutomaticReminder,
  ChatRoom,
  ChatMessage,
  AuditLogRecord,
  NotificationItem,
  UserRole,
  ReportStatus,
  ReportType,
  TaxType,
  Status1C,
  DatabaseScanResult,
  DatabaseScanIssue,
  IssueStatus,
  TaskStatus,
  KameralStatus,
  ProofAttachment,
  Gift,
  GiftType
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_CLIENTS,
  INITIAL_PERIODS,
  INITIAL_TAX_REPORTS,
  INITIAL_ACCOUNTING_1C,
  INITIAL_PAYMENTS,
  INITIAL_LETTERS,
  INITIAL_KAMERAL,
  INITIAL_ISSUES,
  INITIAL_TASKS,
  INITIAL_REMINDERS,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import { scanDatabase, autoFixDatabase } from '../utils/dbScanner';
import { idbGetFile, idbSetFile, idbDeleteFile } from '../utils/idbFileStore';
import { apiGet, apiPost, apiPut } from '../utils/apiClient';
import { isSubjectTo1C } from '../utils/oborotka';
import {
  base64ToArrayBuffer,
  buildCombinedDebtActDocx,
  buildDefaultDebtActDocx,
  DebtActValues,
  downloadBlob,
  fillDocxTemplate,
} from '../utils/debtActDocx';

interface CRMContextType {
  // Health state
  scanResult: DatabaseScanResult | null;
  isScannerModalOpen: boolean;
  setIsScannerModalOpen: (open: boolean) => void;
  runDatabaseScan: () => DatabaseScanResult;
  applyDatabaseAutoFix: () => { scanResult: DatabaseScanResult; repairedCount: number };

  // Core entities
  currentUser: Employee;
  employees: Employee[];
  clients: Client[];
  periods: ReportPeriod[];
  currentPeriod: ReportPeriod;
  taxReports: TaxReport[];
  accounting1C: Accounting1CRecord[];
  payments: PaymentRecord[];
  receipts: ReceiptRecord[];
  invoices: InvoiceRecord[];
  letters: LetterRecord[];
  kameral: KameralAudit[];
  issues: IssueRecord[];
  tasks: TaskRecord[];
  reminders: AutomaticReminder[];
  chatRooms: ChatRoom[];
  chatMessages: ChatMessage[];
  auditLogs: AuditLogRecord[];
  notifications: NotificationItem[];
  gifts: Gift[];
  activeTab: string;
  selectedClientIdForModal: string | null;
  globalSearchOpen: boolean;
  pendingChatRoomId: string | null;
  debtActTemplateFile: { base64: string; fileName: string } | null;
  
  // Navigation & UI controls
  setActiveTab: (tab: string) => void;
  openClientCard: (clientId: string) => void;
  closeClientCard: () => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setPendingChatRoomId: (roomId: string | null) => void;
  setCurrentPeriod: (period: ReportPeriod) => void;
  logoutUser: () => void;
  /** null yuborilsa — o'chiriladi va tizim o'zining standart AKT shabloniga qaytadi */
  updateDebtActTemplateFile: (file: { base64: string; fileName: string } | null) => void;
  generateDebtAct: (clientId: string) => Promise<void>;
  /** Qarzdorligi bor va hisobot topshirmagan barcha (Yuridik + YaTT) mijozlar uchun bitta umumiy Akt */
  generateCombinedDebtAct: () => Promise<void>;
  
  // Client Operations
  addClient: (clientData: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Employee Operations
  addEmployee: (employeeData: Omit<Employee, 'id'>, assignClientIds?: string[]) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateEmployeeAvatar: (employeeId: string, avatarUrl: string) => void;
  assignClientsToEmployee: (employeeId: string, clientIds: string[]) => void;

  // Tax Report Operations
  updateTaxReportStatus: (reportId: string, status: ReportStatus, notes?: string, proof?: ProofAttachment) => void;
  updateAllClientTaxReports: (clientId: string, status: ReportStatus, proof?: ProofAttachment, notes?: string) => void;
  /** Mijoz uchun kassir to'lov kiritganmi (hisobotni "Topshirildi" deb belgilash shu shartga bog'liq) */
  canMarkReportSubmitted: (clientId: string) => boolean;
  createTaxReport: (report: Omit<TaxReport, 'id'>) => void;
  addTaxReport: (report: Omit<TaxReport, 'id'>) => void;
  setClientReportTypes: (clientId: string, reportTypes: ReportType[]) => void;
  bulkSetClientReportTypes: (clientIds: string[], reportTypes: ReportType[]) => void;
  
  // 1C & Invoices
  updateAccounting1C: (id: string, updates: Partial<Accounting1CRecord>) => void;
  /** untilDate berilsa — KIRITILGAN + shu sanagacha; berilmasa — bekor (KIRITILMAGAN) */
  toggle1COborotka: (id: string, untilDate?: string) => void;
  
  // Payments
  recordPayment: (clientId: string, amount: number, notes?: string) => void;
  updatePayment: (id: string, updates: Partial<PaymentRecord>) => void;

  // Receipts (Cheklar)
  addReceipt: (clientId: string, cashAmount: number, terminalAmount: number, date?: string, notes?: string) => void;
  updateReceipt: (id: string, updates: Partial<Pick<ReceiptRecord, 'cashAmount' | 'terminalAmount' | 'date' | 'notes'>>) => void;
  deleteReceipt: (id: string) => void;

  // Invoices (Fakturalar)
  addInvoice: (clientId: string, direction: InvoiceDirection, date: string, notes?: string) => void;
  deleteInvoice: (id: string) => void;
  
  // Letters
  markLetterAsRead: (letterId: string) => void;
  updateLetterStatus: (letterId: string, status: any, replyDate?: string, notes?: string, proof?: ProofAttachment) => void;
  createLetter: (letterData: Omit<LetterRecord, 'id'>) => void;
  addLetter: (letterData: Omit<LetterRecord, 'id'>) => void;
  deleteLetter: (id: string) => void;

  // Reminders (Eslatmalar)
  addReminder: (reminderData: Omit<AutomaticReminder, 'id'>) => void;
  deleteReminder: (id: string) => void;

  // Kameral
  createKameral: (auditData: Omit<KameralAudit, 'id'>) => void;
  addKameral: (auditData: Omit<KameralAudit, 'id'>) => void;
  updateKameralStatus: (id: string, status: any, notes?: string, proof?: ProofAttachment) => void;
  
  // Issues & Deficiencies
  createIssue: (issueData: Omit<IssueRecord, 'id' | 'createdAt'>) => void;
  addIssue: (issueData: Omit<IssueRecord, 'id' | 'createdAt'>) => void;
  resolveIssue: (id: string, notes?: string, proof?: ProofAttachment) => void;
  updateIssueStatus: (id: string, status: IssueStatus, notes?: string, proof?: ProofAttachment) => void;
  deleteIssue: (id: string) => void;
  
  // Tasks
  createTask: (taskData: Omit<TaskRecord, 'id' | 'createdAt' | 'acceptedBy'>) => void;
  addTask: (taskData: Omit<TaskRecord, 'id' | 'createdAt' | 'acceptedBy'>) => void;
  acceptTask: (taskId: string) => void;
  completeTask: (taskId: string, proof?: ProofAttachment, notes?: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, notes?: string, proof?: ProofAttachment) => void;
  deleteTask: (id: string) => void;

  // Gifts
  giveGift: (employeeId: string, giftType: GiftType, description: string, points: number, reason: string) => void;
  deleteGift: (giftId: string) => void;
  
  // Chat & Communication
  sendChatMessage: (roomId: string, text: string, attachment?: any, isVoice?: boolean) => void;
  createChatRoom: (name: string, memberIds: string[], isGroup?: boolean) => string;
  openDirectChatWithEmployee: (employeeId: string) => string;
  deleteChatMessage: (messageId: string) => void;
  clearChatRoom: (roomId: string) => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  
  // Import & Persistence
  importClientsFromExcel: (newClients: Partial<Client>[], updateExisting: boolean) => { added: number; updated: number; skipped: number };
  registerUser: (employeeId: string, password: string) => Promise<void>;
  updateUserPassword: (employeeId: string, password: string) => Promise<boolean>;
  loginUser: (identifier: string, password: string) => Promise<boolean>;
  logAudit: (action: string, objectType: string, objectId: string, objectName: string, oldValue?: string, newValue?: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const REAL_STORAGE_PREFIX = '21ASR_CRM_REAL_V3';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<DatabaseScanResult | null>(null);

  // Helper loader for initial state with automatic stale-data sanitization
  const loadData = <T,>(key: string, fallback: T): T => {
    const saved = localStorage.getItem(`${REAL_STORAGE_PREFIX}_${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out old dummy employees if present in cached localStorage
        if (key === 'employees' && Array.isArray(parsed)) {
          const dummyNames = ['Anvar Aliyev', 'Jamshid Valiyev', 'Dilnoza Karimova', 'Nilufar Umarova', 'Sardorbek Rahimov'];
          const cleaned = parsed.filter((e: any) => !dummyNames.includes(e.name) && (e.id === 'emp-1' || e.id.startsWith('emp-')));
          if (cleaned.length === 0) {
            return fallback;
          }
          return cleaned as T;
        }
        return parsed;
      } catch (e) {
        console.error(`Error parsing ${key}`, e);
      }
    }
    return fallback;
  };

  const [employees, setEmployees] = useState<Employee[]>(() => 
    loadData('employees', INITIAL_EMPLOYEES)
  );

  // Mijozlar/xodimlar endi Mongo'da saqlanadi — parol tekshiruvi ham serverda
  // (/api/auth/login, /api/auth/register) amalga oshadi, brauzerda plaintext
  // parol umuman saqlanmaydi. Bu ref debtActTemplateFile'dagi kabi — server'dan
  // birinchi marta yuklab olinmagunicha clients/employees'ni serverga qayta
  // yozib yubormaslik uchun.
  const coreDataHydrated = useRef(false);

  const guestUser: Employee = {
    id: 'guest',
    name: 'Tashrifchi',
    role: 'BUXGALTER',
    email: '',
    phone: '',
    position: 'Mehmon',
    avatar: '/assets/guest-avatar.png',
    status: 'INACTIVE',
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
  };

  // Sahifa yangilanganda (F5) sessiya saqlanib qolishi uchun — oxirgi kirgan xodim ID'si bo'yicha tiklanadi
  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    try {
      const savedUserId = localStorage.getItem('21ASR_CURRENT_USER_ID');
      if (savedUserId) {
        const found = employees.find(e => e.id === savedUserId);
        if (found) return found;
      }
    } catch (e) {
      // ignore storage errors
    }
    return guestUser;
  });

  // Joriy foydalanuvchi ID'sini saqlab boramiz — sahifa yangilanganda shu orqali sessiya tiklanadi
  useEffect(() => {
    try {
      localStorage.setItem('21ASR_CURRENT_USER_ID', currentUser.id);
    } catch (e) {
      // ignore storage errors
    }
  }, [currentUser.id]);

  const [clients, setClients] = useState<Client[]>(() => 
    loadData('clients', INITIAL_CLIENTS)
  );

  const [periods, setPeriods] = useState<ReportPeriod[]>(() => 
    loadData('periods', INITIAL_PERIODS)
  );

  const [currentPeriod, setCurrentPeriod] = useState<ReportPeriod>(() => 
    periods.find(p => p.isCurrent) || periods[0] || INITIAL_PERIODS[0]
  );

  const [taxReports, setTaxReports] = useState<TaxReport[]>(() => 
    loadData('taxReports', INITIAL_TAX_REPORTS)
  );

  const [accounting1C, setAccounting1C] = useState<Accounting1CRecord[]>(() => 
    loadData('accounting1C', INITIAL_ACCOUNTING_1C)
  );

  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    loadData('payments', INITIAL_PAYMENTS)
  );

  const [receipts, setReceipts] = useState<ReceiptRecord[]>(() =>
    loadData('receipts', [])
  );

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() =>
    loadData('invoices', [])
  );

  const [letters, setLetters] = useState<LetterRecord[]>(() => 
    loadData('letters', INITIAL_LETTERS)
  );

  const [kameral, setKameral] = useState<KameralAudit[]>(() => 
    loadData('kameral', INITIAL_KAMERAL)
  );

  const [issues, setIssues] = useState<IssueRecord[]>(() => 
    loadData('issues', INITIAL_ISSUES)
  );

  const [tasks, setTasks] = useState<TaskRecord[]>(() => 
    loadData('tasks', INITIAL_TASKS)
  );

  const [reminders, setReminders] = useState<AutomaticReminder[]>(() => 
    loadData('reminders', INITIAL_REMINDERS)
  );

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => 
    loadData('chatRooms', INITIAL_CHAT_ROOMS)
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => 
    loadData('chatMessages', INITIAL_CHAT_MESSAGES)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(() => 
    loadData('auditLogs', INITIAL_AUDIT_LOGS)
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => 
    loadData('notifications', INITIAL_NOTIFICATIONS)
  );

  const [gifts, setGifts] = useState<Gift[]>(() => 
    loadData('gifts', [])
  );

  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedClientIdForModal, setSelectedClientIdForModal] = useState<string | null>(null);
  const [pendingChatRoomId, setPendingChatRoomId] = useState<string | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);
  // Word shablon fayli (base64) — localStorage kvotasidan katta bo'lishi mumkin, shuning uchun IndexedDB'da saqlanadi.
  // Boshlang'ich holat null; haqiqiy qiymat pastdagi hydration effekti orqali asinxron yuklanadi.
  const [debtActTemplateFile, setDebtActTemplateFile] = useState<{ base64: string; fileName: string } | null>(null);
  const debtActTemplateFileHydrated = useRef(false);

  // Drop old seeded demo caches so the workspace starts empty
  useEffect(() => {
    try {
      ['21ASR_CRM_REAL_V1', '21ASR_CRM_REAL_V2'].forEach((legacyPrefix) => {
        [
          'clients', 'taxReports', 'accounting1C', 'payments', 'letters',
          'kameral', 'issues', 'tasks', 'chatMessages', 'auditLogs', 'notifications',
          'employees', 'periods', 'reminders', 'chatRooms', 'gifts',
        ].forEach((key) => localStorage.removeItem(`${legacyPrefix}_${key}`));
      });
    } catch {
      // ignore storage errors
    }
  }, []);


  // Akt Word shablon faylini IndexedDB'dan yuklash (eski localStorage'dagi nusxadan bir martalik migratsiya bilan)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let file = await idbGetFile<{ base64: string; fileName: string }>('debtActTemplateFile');
        if (!file) {
          const legacy = localStorage.getItem('21ASR_DEBT_ACT_TEMPLATE_FILE');
          if (legacy) {
            try {
              const parsed = JSON.parse(legacy);
              if (parsed) {
                file = parsed;
                await idbSetFile('debtActTemplateFile', parsed);
              }
            } catch {
              // legacy yozuv buzilgan — e'tiborsiz qoldiramiz
            }
            localStorage.removeItem('21ASR_DEBT_ACT_TEMPLATE_FILE');
          }
        }
        if (!cancelled && file) {
          setDebtActTemplateFile(file);
        }
      } catch (e) {
        console.error('Akt shabloni fayli IndexedDB dan o\'qib bo\'lmadi:', e);
      } finally {
        if (!cancelled) debtActTemplateFileHydrated.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Akt Word shablon faylini IndexedDB'ga saqlash (hydration tugagunicha yozmaymiz — aks holda mavjud faylni null bilan ustidan yozib yuboradi)
  useEffect(() => {
    if (!debtActTemplateFileHydrated.current) return;
    (async () => {
      try {
        if (debtActTemplateFile) {
          await idbSetFile('debtActTemplateFile', debtActTemplateFile);
        } else {
          await idbDeleteFile('debtActTemplateFile');
        }
      } catch (e) {
        console.error('Akt shabloni fayli saqlanmadi:', e);
        addNotification({
          type: 'SYSTEM',
          title: 'Xatolik',
          message: 'Qarzdorlik akti Word shabloni brauzer xotirasiga saqlanmadi. Fayl hajmini kichraytirib qayta yuklang.',
          linkModule: 'Sozlamalar',
        });
      }
    })();
  }, [debtActTemplateFile]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(`${REAL_STORAGE_PREFIX}_clients`, JSON.stringify(clients));
    } catch (err) {
      console.error('Clients saqlanmadi (localStorage):', err);
    }
  }, [clients]);

  // Mijozlar va xodimlarni serverdan (Mongo) yuklab olish — bu ikkalasi endi
  // barcha xodimlar uchun umumiy (shared) ma'lumot. Yuklanmagunicha pastdagi
  // sinxronlash effektlari ishlamaydi (aks holda bo'sh massiv serverni tozalab
  // qo'yishi mumkin edi) — xuddi debtActTemplateFile hydration patterni kabi.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [serverClients, serverEmployees] = await Promise.all([
          apiGet<Client[]>('/api/clients'),
          apiGet<Employee[]>('/api/employees'),
        ]);
        if (cancelled) return;
        setClients(serverClients);
        setEmployees(serverEmployees);
        // Joriy foydalanuvchini eng yangi ma'lumot bilan yangilaymiz (roli/ruxsatlari
        // o'zgargan bo'lishi mumkin), agar hali ham mavjud bo'lsa
        setCurrentUser(prev => {
          if (prev.id === 'guest') return prev;
          const fresh = serverEmployees.find(e => e.id === prev.id);
          return fresh || prev;
        });
      } catch (err) {
        console.error('Mijozlar/xodimlarni serverdan yuklab bo\'lmadi:', err);
        addNotification({
          type: 'SYSTEM',
          title: 'Serverga ulanib bo\'lmadi',
          message: 'Mijozlar va xodimlar ro\'yxati oxirgi saqlangan (lokal) nusxadan ko\'rsatilmoqda. Internetni tekshirib, sahifani yangilang.',
          linkModule: 'Dashboard',
        });
      } finally {
        if (!cancelled) coreDataHydrated.current = true;
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Har qanday o'zgarishdan keyin (yangi mijoz, tahrirlash, xodimga sovg'a
  // berish va h.k.) butun massivni serverga sinxronlaymiz — hydratsiya
  // tugamaguncha yubormaymiz.
  useEffect(() => {
    if (!coreDataHydrated.current) return;
    const timer = window.setTimeout(() => {
      apiPut('/api/clients', clients).catch(err => console.error('Mijozlar serverga saqlanmadi:', err));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [clients]);

  useEffect(() => {
    if (!coreDataHydrated.current) return;
    const timer = window.setTimeout(() => {
      apiPut('/api/employees', employees).catch(err => console.error('Xodimlar serverga saqlanmadi:', err));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_taxReports`, JSON.stringify(taxReports));
  }, [taxReports]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_accounting1C`, JSON.stringify(accounting1C));
  }, [accounting1C]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_receipts`, JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_letters`, JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_kameral`, JSON.stringify(kameral));
  }, [kameral]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_issues`, JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_chatMessages`, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${REAL_STORAGE_PREFIX}_gifts`, JSON.stringify(gifts));
  }, [gifts]);

  // Helper to log audit
  const logAudit = (action: string, objectType: string, objectId: string, objectName: string, oldValue?: string, newValue?: string) => {
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: AuditLogRecord = {
      id: `aud-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      objectType,
      objectId,
      objectName,
      oldValue,
      newValue,
      timestamp: formattedTime,
      ipAddress: '195.158.30.1',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to add notification
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...item,
      timestamp: 'Hozirgina',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };


  // Run Database Scanner
  const runDatabaseScan = (): DatabaseScanResult => {
    const result = scanDatabase({
      clients,
      taxReports,
      accounting1C,
      payments,
      letters,
      kameral,
      issues,
      tasks,
      employees,
      currentPeriod,
    });
    setScanResult(result);
    return result;
  };

  // Apply 1-Click Database Auto-Fix
  const applyDatabaseAutoFix = (): { scanResult: DatabaseScanResult; repairedCount: number } => {
    const { fixedState, repairedCount } = autoFixDatabase({
      clients,
      taxReports,
      accounting1C,
      payments,
      letters,
      kameral,
      issues,
      tasks,
      employees,
      currentPeriod,
    });

    setClients(fixedState.clients);
    setTaxReports(fixedState.taxReports);
    setAccounting1C(fixedState.accounting1C);
    setPayments(fixedState.payments);
    setLetters(fixedState.letters);
    setKameral(fixedState.kameral);
    setIssues(fixedState.issues);
    setTasks(fixedState.tasks);
    setEmployees(fixedState.employees);

    // Re-run scan on newly fixed state
    const newScan = scanDatabase({
      clients: fixedState.clients,
      taxReports: fixedState.taxReports,
      accounting1C: fixedState.accounting1C,
      payments: fixedState.payments,
      letters: fixedState.letters,
      kameral: fixedState.kameral,
      issues: fixedState.issues,
      tasks: fixedState.tasks,
      employees: fixedState.employees,
      currentPeriod,
    });

    setScanResult(newScan);

    logAudit('Baza kamchiliklari tuzatildi', 'DatabaseAutoFix', `fix-${Date.now()}`, `Jami ${repairedCount} ta tafovut va kamchilik avtomatik to'g'irlandi.`);
    addNotification({
      type: 'AI_ALERT',
      title: '✅ Baza Kamchiliklari To\'g\'irlandi',
      message: `Jami ${repairedCount} ta texnik kamchilik, STIR formatlari, bog'lanishlar va hisob-kitoblar avtomatik tuzatildi. Baza salomatligi: ${newScan.healthScore}%`,
      linkModule: 'Settings',
    });

    return { scanResult: newScan, repairedCount };
  };

  // Run initial scan on first mount (deferred to avoid setState during render loops)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      runDatabaseScan();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openClientCard = (clientId: string) => {
    setSelectedClientIdForModal(clientId);
  };

  const closeClientCard = () => {
    setSelectedClientIdForModal(null);
  };

  const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const newId = `cli-${Date.now()}`;
    const newClient: Client = {
      id: newId,
      ...clientData,
    };

    setClients(prev => [newClient, ...prev]);
    logAudit('Yangi mijoz qo\'shildi', 'Client', newId, newClient.name, undefined, `STIR: ${newClient.stir}`);

    // Auto-generate standard or custom-configured tax reports for this client
    const defaultReportTypes: ReportType[] = (clientData.assignedReportTypes && clientData.assignedReportTypes.length > 0)
      ? clientData.assignedReportTypes
      : (newClient.taxType === 'QQS' 
          ? ['QQS', 'FOYDA', 'JSHDS', 'INPS']
          : (newClient.taxType === 'FOYDA' 
              ? ['FOYDA', 'JSHDS', 'INPS']
              : ['AYLANMA', 'JSHDS', 'INPS']));

    newClient.assignedReportTypes = defaultReportTypes;

    const newReports: TaxReport[] = defaultReportTypes.map((rt, idx) => ({
      id: `rep-${Date.now()}-${idx}`,
      clientId: newClient.id,
      clientName: newClient.name,
      stir: newClient.stir,
      reportType: rt,
      periodId: currentPeriod.id,
      status: 'TOPSHIRILMAGAN',
      accountantId: newClient.accountantId,
    }));
    setTaxReports(prev => [...newReports, ...prev]);

    // Auto-generate 1C / Didox Record — faqat oylik to'lovi 1 000 000 so'mdan yuqori mijozlar uchun
    if (isSubjectTo1C(newClient.monthlyFee)) {
      const new1CRecord: Accounting1CRecord = {
        id: `ac-${Date.now()}`,
        clientId: newClient.id,
        clientName: newClient.name,
        stir: newClient.stir,
        periodId: currentPeriod.id,
        oborotkaStatus: 'KIRITILMAGAN',
        incomingInvoicesCount: 0,
        incomingInvoicesEntered: 0,
        incomingStatus: 'KIRITILGAN',
        outgoingInvoicesCount: 0,
        outgoingInvoicesEntered: 0,
        outgoingStatus: 'KIRITILGAN',
        accountantId: newClient.accountantId,
        issuesCount: 0,
        lastUpdated: new Date().toLocaleDateString('uz-UZ'),
      };
      setAccounting1C(prev => [new1CRecord, ...prev]);
    }

    // Auto-generate Monthly Payment Record
    const newPaymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      clientId: newClient.id,
      clientName: newClient.name,
      stir: newClient.stir,
      monthlyFee: newClient.monthlyFee,
      paidAmount: 0,
      debtAmount: newClient.monthlyFee,
      nextDueDate: '2026-08-15',
      status: 'TOLANMAGAN',
      accountantId: newClient.accountantId,
    };
    setPayments(prev => [newPaymentRecord, ...prev]);

    addNotification({
      type: 'REPORT',
      title: 'Yangi mijoz bazaga qo\'shildi',
      message: `"${newClient.name}" korxonasi va uning avgust oyi hisobotlari ro'yxatga olindi.`,
      linkModule: 'Mijozlar',
      relatedId: newClient.id,
    });

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        logAudit('Mijoz ma\'lumotlari yangilandi', 'Client', id, updated.name);
        return updated;
      }
      return c;
    }));

    // Cascade name/stir updates to other linked modules
    if (updates.name || updates.stir || updates.accountantId) {
      const targetClient = clients.find(c => c.id === id);
      if (targetClient) {
        const newName = updates.name || targetClient.name;
        const newStir = updates.stir || targetClient.stir;
        const newAccId = updates.accountantId || targetClient.accountantId;
        const newAccName = updates.accountantName || targetClient.accountantName;

        setTaxReports(prev => prev.map(r => r.clientId === id ? { ...r, clientName: newName, stir: newStir, accountantId: newAccId, accountantName: newAccName } : r));
        setAccounting1C(prev => prev.map(a => a.clientId === id ? { ...a, clientName: newName, stir: newStir } : a));
        setPayments(prev => prev.map(p => p.clientId === id ? { ...p, clientName: newName, stir: newStir } : p));
        setLetters(prev => prev.map(l => l.clientId === id ? { ...l, clientName: newName, stir: newStir } : l));
        setKameral(prev => prev.map(k => k.clientId === id ? { ...k, clientName: newName, stir: newStir } : k));
        setIssues(prev => prev.map(i => i.clientId === id ? { ...i, clientName: newName, stir: newStir } : i));
      }
    }
  };

  const deleteClient = (id: string) => {
    const target = clients.find(c => c.id === id);
    if (!target) return;
    const allowedRoles = ['SUPER_ADMIN', 'DIREKTOR', 'NAZORATCHI', 'BUXGALTER'];
    if (!allowedRoles.includes(currentUser.role) || currentUser.id === 'guest') {
      addNotification({ type: 'SYSTEM', title: 'Ruxsat yo\'q', message: 'Mijozni o\'chirish uchun faqat SUPER_ADMIN, DIREKTOR, NAZORATCHI yoki BUXGALTER ruxsatiga ega bo\'lish kerak.', linkModule: 'Mijozlar' });
      return;
    }
    setClients(prev => prev.filter(c => c.id !== id));
    logAudit('Mijoz o\'chirildi', 'Client', id, target.name, 'Mavjud', 'O\'chirildi');
  };

  const addEmployee = (employeeData: Omit<Employee, 'id'>, assignClientIds?: string[]): Employee => {
    const newId = `emp-${Date.now()}`;
    const assignedCount = assignClientIds ? assignClientIds.length : 0;
    const newEmp: Employee = {
      id: newId,
      completedTasksCount: 0,
      pendingTasksCount: 0,
      overdueTasksCount: 0,
      issuesCount: 0,
      lettersCount: 0,
      accounting1CCount: 0,
      assignedClientCount: assignedCount,
      reportCompletionRate: 100,
      ...employeeData,
    };
    
    setEmployees(prev => [...prev, newEmp]);

    // If clients are assigned, reassign them
    if (assignClientIds && assignClientIds.length > 0) {
      setClients(prev => prev.map(c => {
        if (assignClientIds.includes(c.id)) {
          return { ...c, accountantId: newId, accountantName: newEmp.name };
        }
        return c;
      }));
    }

    // Add new employee to general staff group chat
    setChatRooms(prev => prev.map(r => {
      if (r.id === 'room-general' || r.isGeneralStaffGroup) {
        return {
          ...r,
          memberIds: Array.from(new Set([...r.memberIds, newId])),
          memberNames: Array.from(new Set([...r.memberNames, newEmp.name])),
        };
      }
      return r;
    }));

    // Create a 1-on-1 private chat between Super Admin and this new employee
    const directRoomId = `room-direct-${newId}`;
    const directRoom: ChatRoom = {
      id: directRoomId,
      name: newEmp.name,
      isGroup: false,
      memberIds: [currentUser.id, newId],
      memberNames: [currentUser.name, newEmp.name],
      lastMessage: 'Yangi xodim bilan shaxsiy muloqot xonasi yaratildi.',
      lastMessageTime: 'Hozirgina',
      unreadCount: 0,
    };
    setChatRooms(prev => [directRoom, ...prev]);

    // Send initial direct welcome message
    const welcomeMsg: ChatMessage = {
      id: `msg-dir-${Date.now()}`,
      roomId: directRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      text: `Assalomu alaykum ${newEmp.name}! 21-ASR CRM jamoasiga xush kelibsiz. Ish bo'yicha savollar yoki topshiriqlarni shu yerda yozishingiz mumkin.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };
    setChatMessages(prev => [...prev, welcomeMsg]);

    addNotification({
      type: 'SYSTEM',
      title: `Yangi xodim qo'shildi: ${newEmp.name}`,
      message: `${newEmp.position} (${newEmp.role}) sifatida tizimga kiritildi.`,
      linkModule: 'Xodimlar',
    });

    logAudit('Yangi xodim qo\'shildi', 'Employee', newId, newEmp.name, undefined, `${newEmp.role} - ${newEmp.position}`);
    return newEmp;
  };

  // Foydalanuvchi paroli endi serverda (bcrypt bilan xeshlangan) saqlanadi —
  // brauzerda plaintext parol umuman ushlanmaydi.
  const registerUser = async (employeeId: string, password: string) => {
    try {
      await apiPost('/api/auth/register', { employeeId, password });
      logAudit('Foydalanuvchi ro\'yxatdan o\'tkazildi', 'Auth', `reg-${employeeId}`, `Credentials set for ${employeeId}`);
    } catch (err) {
      console.error('registerUser xatolik:', err);
      addNotification({ type: 'SYSTEM', title: 'Xatolik', message: 'Parol serverga saqlanmadi. Qayta urinib ko\'ring.', linkModule: 'Xodimlar' });
    }
  };

  const updateUserPassword = async (employeeId: string, password: string): Promise<boolean> => {
    if (!employeeId || !password.trim()) return false;
    try {
      await apiPost('/api/auth/register', { employeeId, password: password.trim() });
      logAudit('Foydalanuvchi paroli yangilandi', 'Auth', `reset-${employeeId}`, `Credentials reset for ${employeeId}`);
      return true;
    } catch (err) {
      console.error('updateUserPassword xatolik:', err);
      return false;
    }
  };

  const loginUser = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const target = await apiPost<Employee>('/api/auth/login', { identifier, password });
      setCurrentUser(target);
      setActiveTab('Dashboard');
      logAudit('Foydalanuvchi tizimga kirdi', 'Auth', `login-${target.id}`, target.name);
      addNotification({ type: 'SYSTEM', title: 'Tizimga kirildi', message: `${target.name} sifatida tizimga kirdingiz`, linkModule: 'Dashboard' });
      return true;
    } catch (err) {
      return false;
    }
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    // Update name in clients if employee name changed
    if (updates.name) {
      setClients(prev => prev.map(c => c.accountantId === id ? { ...c, accountantName: updates.name! } : c));
    }
    logAudit('Xodim ma\'lumotlari yangilandi', 'Employee', id, updates.name || id);
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;
    if (target.role === 'SUPER_ADMIN' && employees.filter(e => e.role === 'SUPER_ADMIN').length <= 1) {
      // Super admin cannot be deleted
      return;
    }

    // Reassign all clients, reports, 1C, payments, letters to Super Admin
    setClients(prev => prev.map(c => {
      if (c.accountantId === id) {
        return { ...c, accountantId: 'emp-1', accountantName: 'Jahongir Amonov' };
      }
      return c;
    }));

    setTaxReports(prev => prev.map(r => r.accountantId === id ? { ...r, accountantId: 'emp-1' } : r));
    setAccounting1C(prev => prev.map(a => a.accountantId === id ? { ...a, accountantId: 'emp-1' } : a));
    setPayments(prev => prev.map(p => p.accountantId === id ? { ...p, accountantId: 'emp-1' } : p));
    setLetters(prev => prev.map(l => l.accountantId === id ? { ...l, accountantId: 'emp-1' } : l));
    setKameral(prev => prev.map(k => k.accountantId === id ? { ...k, accountantId: 'emp-1' } : k));

    // Remove direct chat rooms
    setChatRooms(prev => prev.filter(r => !(!r.isGroup && r.memberIds.includes(id))));
    
    // Remove from group chats
    setChatRooms(prev => prev.map(r => ({
      ...r,
      memberIds: r.memberIds.filter(mId => mId !== id),
      memberNames: r.memberNames.filter(mName => mName !== target.name),
    })));

    setEmployees(prev => prev.filter(e => e.id !== id));

    // If currently logged in as this employee, revert to Super Admin
    if (currentUser.id === id) {
      const superAdmin = employees.find(e => e.id === 'emp-1') || INITIAL_EMPLOYEES[0];
      setCurrentUser(superAdmin);
    }

    logAudit('Xodim o\'chirildi', 'Employee', id, target.name, 'Faol', 'O\'chirildi (Mijozlar Super Adminga qaytarildi)');
  };

  const assignClientsToEmployee = (employeeId: string, clientIds: string[]) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    setClients(prev => prev.map(c => {
      if (clientIds.includes(c.id)) {
        return { ...c, accountantId: employeeId, accountantName: emp.name };
      } else if (c.accountantId === employeeId) {
        return { ...c, accountantId: 'emp-1', accountantName: 'Jahongir Amonov' };
      }
      return c;
    }));

    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return { ...e, assignedClientCount: clientIds.length };
      }
      return e;
    }));

    logAudit('Mijozlar biriktirildi', 'Employee', employeeId, emp.name, undefined, `${clientIds.length} ta mijoz biriktirildi`);
  };

  const updateDebtActTemplateFile = (file: { base64: string; fileName: string } | null) => {
    setDebtActTemplateFile(file);
  };

  const generateDebtAct = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const payment = payments.find(p => p.clientId === clientId);
    
    if (!client || !payment) {
      addNotification({
        type: 'SYSTEM',
        title: 'Xatolik',
        message: 'Mijoz yoki to\'lov ma\'lumotlari topilmadi.',
        linkModule: 'To\'lovlar'
      });
      return;
    }

    if (payment.debtAmount <= 0) {
      addNotification({
        type: 'SYSTEM',
        title: 'Xatolik',
        message: 'Bu mijozning qarzdorligi yo\'q.',
        linkModule: 'To\'lovlar'
      });
      return;
    }

    const today = new Date().toLocaleDateString('uz-UZ');

    // Ushbu mijozning topshirilmagan hisobotlari — Akt jadvalidagi "Hisobot turi" va "Davri" uchun
    const unpaidReports = taxReports.filter(r => r.clientId === clientId && r.status === 'TOPSHIRILMAGAN');
    const hisobotTuri = unpaidReports.length > 0
      ? [...new Set(unpaidReports.map(r => r.reportType))].join(', ')
      : 'Belgilanmagan';
    const davri = unpaidReports.length > 0
      ? [...new Set(unpaidReports.map(r => periods.find(p => p.id === r.periodId)?.name || r.periodId))].join(', ')
      : currentPeriod.name;

    const qarzMiqdoriStr = payment.debtAmount.toLocaleString('uz-UZ') + ' so\'m';

    const values: DebtActValues = {
      korxona_nomi: client.name,
      stir: client.stir,
      manzil: client.address || 'Ko\'rsatilmagan',
      qarz_miqdori: qarzMiqdoriStr,
      oylik_tolov: payment.monthlyFee.toLocaleString('uz-UZ') + ' so\'m',
      tolangan: payment.paidAmount.toLocaleString('uz-UZ') + ' so\'m',
      sana: today,
      hisobot_turi: hisobotTuri,
      davri,
      izoh: `To'lov qilinmagan ${qarzMiqdoriStr}`,
    };

    const safeName = client.name.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'Mijoz';

    try {
      let blob: Blob;
      let fileName: string;

      if (debtActTemplateFile?.base64) {
        blob = await fillDocxTemplate(base64ToArrayBuffer(debtActTemplateFile.base64), values);
      } else {
        blob = await buildDefaultDebtActDocx(values);
      }
      fileName = `Qarzdorlik_Akt_${safeName}_${today}.docx`;

      downloadBlob(blob, fileName);

      logAudit('Qarzdorlik akti yuklab olindi', 'DebtAct', clientId, client.name);
      addNotification({
        type: 'SYSTEM',
        title: '✅ Qarzdorlik akti yuklab olindi',
        message: `${client.name} uchun qarzdorlik akti Word formatida yaratildi.`,
        linkModule: 'To\'lovlar'
      });
    } catch (error) {
      console.error('Qarzdorlik akti yaratilmadi:', error);
      addNotification({
        type: 'SYSTEM',
        title: 'Xatolik',
        message: 'Qarzdorlik akti yaratilmadi. Shablon .docx faylini qayta yuklang.',
        linkModule: 'Sozlamalar'
      });
    }
  };

  const generateCombinedDebtAct = async () => {
    const debtorClients = clients.filter(c => {
      const payment = payments.find(p => p.clientId === c.id);
      if (!payment || payment.debtAmount <= 0) return false;
      return taxReports.some(r => r.clientId === c.id && r.status === 'TOPSHIRILMAGAN');
    });

    if (debtorClients.length === 0) {
      addNotification({
        type: 'SYSTEM',
        title: 'Xatolik',
        message: "Qarzdorligi bor va hisobot topshirmagan (Yuridik yoki YaTT) mijoz topilmadi.",
        linkModule: 'To\'lovlar'
      });
      return;
    }

    const today = new Date().toLocaleDateString('uz-UZ');

    const rows: DebtActValues[] = debtorClients.map(client => {
      const payment = payments.find(p => p.clientId === client.id)!;
      const unpaidReports = taxReports.filter(r => r.clientId === client.id && r.status === 'TOPSHIRILMAGAN');
      const hisobotTuri = unpaidReports.length > 0
        ? [...new Set(unpaidReports.map(r => r.reportType))].join(', ')
        : 'Belgilanmagan';
      const davri = unpaidReports.length > 0
        ? [...new Set(unpaidReports.map(r => periods.find(p => p.id === r.periodId)?.name || r.periodId))].join(', ')
        : currentPeriod.name;
      const qarzMiqdoriStr = payment.debtAmount.toLocaleString('uz-UZ') + ' so\'m';

      return {
        korxona_nomi: client.name,
        stir: client.stir,
        manzil: client.address || 'Ko\'rsatilmagan',
        qarz_miqdori: qarzMiqdoriStr,
        oylik_tolov: payment.monthlyFee.toLocaleString('uz-UZ') + ' so\'m',
        tolangan: payment.paidAmount.toLocaleString('uz-UZ') + ' so\'m',
        sana: today,
        hisobot_turi: hisobotTuri,
        davri,
        izoh: `To'lov qilinmagan ${qarzMiqdoriStr}`,
      };
    });

    try {
      const blob = await buildCombinedDebtActDocx(rows, today);
      const fileName = `Umumiy_Qarzdorlik_Akti_${today.replace(/\./g, '-')}.docx`;
      downloadBlob(blob, fileName);

      logAudit('Umumiy qarzdorlik akti yuklab olindi', 'DebtAct', 'ALL', `${debtorClients.length} ta mijoz`);
      addNotification({
        type: 'SYSTEM',
        title: '✅ Umumiy qarzdorlik akti yuklab olindi',
        message: `${debtorClients.length} ta qarzdor va hisobot topshirmagan mijoz uchun umumiy akt yaratildi.`,
        linkModule: 'To\'lovlar'
      });
    } catch (error) {
      console.error('Umumiy qarzdorlik akti yaratilmadi:', error);
      addNotification({
        type: 'SYSTEM',
        title: 'Xatolik',
        message: 'Umumiy qarzdorlik akti yaratilmadi.',
        linkModule: 'To\'lovlar'
      });
    }
  };

  /** Kassir mijoz uchun to'lov kiritmagan bo'lsa, hisobotni "Topshirildi" deb belgilashga yo'l qo'ymaydi */
  const canMarkReportSubmitted = (clientId: string): boolean => {
    const payment = payments.find(p => p.clientId === clientId);
    return !!payment && payment.status !== 'TOLANMAGAN';
  };

  const blockUnpaidSubmission = (clientId: string, clientName: string) => {
    addNotification({
      type: 'SYSTEM',
      title: 'Hisobotni topshirildi deb belgilab bo\'lmaydi',
      message: `"${clientName}" uchun hali kassir tomonidan to'lov kiritilmagan. Avval "To'lovlar" bo'limida to'lovni qayd eting, so'ng hisobotni topshirildi deb belgilashingiz mumkin bo'ladi.`,
      linkModule: 'To\'lovlar',
    });
  };

  const updateTaxReportStatus = (reportId: string, status: ReportStatus, proof?: ProofAttachment, notes?: string) => {
    if (status === 'TOPSHIRILDI') {
      const report = taxReports.find(r => r.id === reportId);
      if (report && !canMarkReportSubmitted(report.clientId)) {
        blockUnpaidSubmission(report.clientId, report.clientName);
        return;
      }
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;

    setTaxReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const oldStatus = r.status;
        const updated: TaxReport = {
          ...r,
          status,
          submittedAt: status === 'TOPSHIRILDI' ? formattedDate : undefined,
          submittedBy: status === 'TOPSHIRILDI' ? (r.submittedBy || currentUser.name) : (status === 'JARAYONDA' || status === 'TOPSHIRILMAGAN' ? undefined : r.submittedBy),
          notes: notes !== undefined ? notes : r.notes,
          proofAttachment: proof !== undefined ? proof : r.proofAttachment,
        };
        logAudit('Soliq hisoboti holati o\'zgartirildi', 'TaxReport', reportId, `${r.clientName} (${r.reportType})`, oldStatus, status);
        return updated;
      }
      return r;
    }));
  };

  const updateAllClientTaxReports = (clientId: string, status: ReportStatus, proof?: ProofAttachment, notes?: string) => {
    if (status === 'TOPSHIRILDI' && !canMarkReportSubmitted(clientId)) {
      const client = clients.find(c => c.id === clientId);
      blockUnpaidSubmission(clientId, client?.name || 'Mijoz');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;

    setTaxReports(prev => prev.map(r => {
      if (r.clientId === clientId && r.status !== 'TALAB_QILINMAYDI') {
        const updated: TaxReport = {
          ...r,
          status,
          submittedAt: status === 'TOPSHIRILDI' ? formattedDate : undefined,
          submittedBy: status === 'TOPSHIRILDI' ? (r.submittedBy || currentUser.name) : (status === 'JARAYONDA' || status === 'TOPSHIRILMAGAN' ? undefined : r.submittedBy),
          notes: notes !== undefined ? notes : r.notes,
          proofAttachment: proof !== undefined ? proof : r.proofAttachment,
        };
        return updated;
      }
      return r;
    }));
    logAudit('Mijozning barcha hisobotlari yangilandi', 'TaxReport', clientId, `Barcha hisobotlar: ${status}`);
  };

  const createTaxReport = (report: Omit<TaxReport, 'id'>) => {
    const newReport: TaxReport = {
      id: `rep-${Date.now()}`,
      ...report,
    };
    setTaxReports(prev => [newReport, ...prev]);
    logAudit('Yangi hisobot talabi qo\'shildi', 'TaxReport', newReport.id, `${newReport.clientName} - ${newReport.reportType}`);
  };

  const setClientReportTypes = (clientId: string, reportTypes: ReportType[]) => {
    const targetClient = clients.find(c => c.id === clientId);
    if (!targetClient) return;

    // Determine derived tax type if needed
    let updatedTaxType: TaxType = targetClient.taxType;
    if (reportTypes.includes('QQS')) {
      updatedTaxType = 'QQS';
    } else if (reportTypes.includes('FOYDA') && !reportTypes.includes('AYLANMA')) {
      updatedTaxType = 'FOYDA';
    } else if (reportTypes.includes('AYLANMA')) {
      updatedTaxType = 'AYLANMA';
    }

    setClients(prev => prev.map(c => c.id === clientId ? {
      ...c,
      assignedReportTypes: reportTypes,
      taxType: updatedTaxType,
    } : c));

    // Synchronize taxReports for current period
    setTaxReports(prev => {
      // Find existing reports for this client and current period
      const currentClientReports = prev.filter(r => r.clientId === clientId && r.periodId === currentPeriod.id);
      const otherReports = prev.filter(r => !(r.clientId === clientId && r.periodId === currentPeriod.id));

      const updatedClientReports: TaxReport[] = [];

      reportTypes.forEach((rt, idx) => {
        const existing = currentClientReports.find(r => r.reportType === rt);
        if (existing) {
          updatedClientReports.push({
            ...existing,
            status: existing.status === 'TALAB_QILINMAYDI' ? 'TOPSHIRILMAGAN' : existing.status,
            clientName: targetClient.name,
            stir: targetClient.stir,
            accountantId: targetClient.accountantId,
          });
        } else {
          updatedClientReports.push({
            id: `rep-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
            clientId: targetClient.id,
            clientName: targetClient.name,
            stir: targetClient.stir,
            reportType: rt,
            periodId: currentPeriod.id,
            status: 'TOPSHIRILMAGAN',
            accountantId: targetClient.accountantId,
          });
        }
      });

      return [...otherReports, ...updatedClientReports];
    });

    addNotification({
      type: 'REPORT',
      title: 'Hisobot shakllari o\'zgartirildi',
      message: `"${targetClient.name}" uchun ${reportTypes.length} ta hisobot shakli belgilandi: ${reportTypes.join(', ')}`,
      linkModule: 'SoliqHisoboti',
      relatedId: clientId,
    });

    logAudit(
      'Mijoz hisobot shakllari belgilandi (Admin)', 
      'Client', 
      clientId, 
      targetClient.name, 
      targetClient.assignedReportTypes?.join(', ') || targetClient.taxType, 
      reportTypes.join(', ')
    );
  };

  const bulkSetClientReportTypes = (clientIds: string[], reportTypes: ReportType[]) => {
    clientIds.forEach(id => {
      setClientReportTypes(id, reportTypes);
    });
    logAudit(
      'Ommaviy hisobot shakllari belgilandi (Admin)', 
      'Client', 
      'bulk', 
      `${clientIds.length} ta mijoz`, 
      undefined, 
      reportTypes.join(', ')
    );
  };

  const updateAccounting1C = (id: string, updates: Partial<Accounting1CRecord>) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    setAccounting1C(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...updates, lastUpdated: formattedDate };
        logAudit('1C holati yangilandi', 'Accounting1C', id, a.clientName, a.oborotkaStatus, updates.oborotkaStatus || a.oborotkaStatus);
        return updated;
      }
      return a;
    }));
  };

  const toggle1COborotka = (id: string, untilDate?: string) => {
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    setAccounting1C(prev => prev.map(a => {
      if (a.id === id) {
        // untilDate berilsa — kiritilgan (shu sanagacha); aks holda bekor
        const markingEntered = Boolean(untilDate);
        const newStatus: Status1C = markingEntered ? 'KIRITILGAN' : 'KIRITILMAGAN';
        const updated: Accounting1CRecord = {
          ...a,
          oborotkaStatus: newStatus,
          oborotkaDate: markingEntered ? untilDate : undefined,
          lastUpdated: todayISO,
        };
        logAudit(
          '1C Oborotka holati almashtirildi',
          'Accounting1C',
          id,
          a.clientName,
          a.oborotkaStatus,
          markingEntered ? `KIRITILGAN (gacha: ${untilDate})` : 'KIRITILMAGAN'
        );
        return updated;
      }
      return a;
    }));
  };

  const recordPayment = (clientId: string, amount: number, notes?: string) => {
    if (currentUser.role !== 'KASSIR') {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat kassir to\'lov summasini qo\'shishi yoki o\'zgartirishi mumkin.',
        linkModule: 'To\'lovlar',
      });
      return;
    }

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];

    setPayments(prev => prev.map(p => {
      if (p.clientId === clientId) {
        const newPaid = p.paidAmount + amount;
        const newDebt = Math.max(0, p.monthlyFee - newPaid);
        const newStatus = newDebt === 0 ? 'TOLANGAN' : newPaid > 0 ? 'QISMAN' : 'TOLANMAGAN';
        
        const updated: PaymentRecord = {
          ...p,
          paidAmount: newPaid,
          debtAmount: newDebt,
          status: newStatus,
          lastPaymentDate: formattedDate,
          notes: notes || p.notes,
        };

        logAudit('To\'lov qabul qilindi', 'Payment', p.id, p.clientName, `${p.paidAmount} so'm`, `${newPaid} so'm (+${amount} so'm)`);
        
        addNotification({
          type: 'PAYMENT',
          title: 'To\'lov muvaffaqiyatli qabul qilindi',
          message: `${p.clientName} hisobidan ${amount.toLocaleString()} so'm to'lov qabul qilindi. Qoldiq qarz: ${newDebt.toLocaleString()} so'm.`,
          linkModule: 'To\'lovlar',
        });

        return updated;
      }
      return p;
    }));
  };

  const updatePayment = (id: string, updates: Partial<PaymentRecord>) => {
    if (currentUser.role !== 'KASSIR') {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat kassir to\'lov summasini o\'zgartirishi mumkin.',
        linkModule: 'To\'lovlar',
      });
      return;
    }

    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        logAudit('To\'lov ma\'lumoti tahrirlandi', 'Payment', id, p.clientName);
        return updated;
      }
      return p;
    }));
  };

  const addReceipt = (clientId: string, cashAmount: number, terminalAmount: number, date?: string, notes?: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newReceipt: ReceiptRecord = {
      id: `chek-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      stir: client.stir,
      date: date || new Date().toISOString().split('T')[0],
      cashAmount,
      terminalAmount,
      totalAmount: cashAmount + terminalAmount,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      notes,
    };

    setReceipts(prev => [newReceipt, ...prev]);
    logAudit('Chek yozildi', 'Receipt', newReceipt.id, client.name, undefined, `Jami: ${newReceipt.totalAmount.toLocaleString()} so'm (Naqd: ${cashAmount.toLocaleString()}, Terminal: ${terminalAmount.toLocaleString()})`);
  };

  const updateReceipt = (id: string, updates: Partial<Pick<ReceiptRecord, 'cashAmount' | 'terminalAmount' | 'date' | 'notes'>>) => {
    setReceipts(prev => prev.map(r => {
      if (r.id === id) {
        const cashAmount = updates.cashAmount ?? r.cashAmount;
        const terminalAmount = updates.terminalAmount ?? r.terminalAmount;
        const updated: ReceiptRecord = {
          ...r,
          ...updates,
          cashAmount,
          terminalAmount,
          totalAmount: cashAmount + terminalAmount,
        };
        logAudit('Chek tahrirlandi', 'Receipt', id, r.clientName, `Jami: ${r.totalAmount.toLocaleString()} so'm`, `Jami: ${updated.totalAmount.toLocaleString()} so'm`);
        return updated;
      }
      return r;
    }));
  };

  const deleteReceipt = (id: string) => {
    const target = receipts.find(r => r.id === id);
    if (!target) return;
    setReceipts(prev => prev.filter(r => r.id !== id));
    logAudit('Chek o\'chirildi', 'Receipt', id, target.clientName, `Jami: ${target.totalAmount.toLocaleString()} so'm`, undefined);
  };

  const addInvoice = (clientId: string, direction: InvoiceDirection, date: string, notes?: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newInvoice: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      stir: client.stir,
      direction,
      date,
      enteredBy: currentUser.id,
      enteredByName: currentUser.name,
      notes,
    };

    setInvoices(prev => [newInvoice, ...prev]);
    logAudit(
      direction === 'KIRIM' ? 'Kirim faktura qo\'shildi' : 'Chiqim faktura qo\'shildi',
      'Invoice',
      newInvoice.id,
      client.name,
      undefined,
      `Sana: ${date}`
    );
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find(i => i.id === id);
    if (!target) return;
    setInvoices(prev => prev.filter(i => i.id !== id));
    logAudit('Faktura o\'chirildi', 'Invoice', id, target.clientName, `${target.direction} - ${target.date}`, undefined);
  };

  const markLetterAsRead = (letterId: string) => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    
    const target = letters.find(l => l.id === letterId);
    if (target) {
      setLetters(prev => prev.map(l => {
        if (l.id === letterId) {
          return {
            ...l,
            status: l.status === 'YANGI' ? 'OQILGAN' : l.status,
            readAt: formatted,
            readBy: currentUser.name,
          };
        }
        return l;
      }));

      logAudit('Soliq xati o\'qildi', 'Letter', letterId, `${target.clientName} (${target.letterNumber})`, 'YANGI', `O'qildi (${formatted})`);
    }
  };

  const updateLetterStatus = (letterId: string, status: any, replyDate?: string, notes?: string, proof?: ProofAttachment) => {
    setLetters(prev => prev.map(l => {
      if (l.id === letterId) {
        const updated = {
          ...l,
          status,
          repliedAt: replyDate || l.repliedAt,
          notes: notes || l.notes,
          proofAttachment: proof || l.proofAttachment,
        };
        logAudit('Xat holati o\'zgartirildi', 'Letter', letterId, `${l.clientName} - ${l.letterNumber}`, l.status, status);
        return updated;
      }
      return l;
    }));
  };

  const createLetter = (letterData: Omit<LetterRecord, 'id'>) => {
    const newLetter: LetterRecord = {
      id: `let-${Date.now()}`,
      ...letterData,
    };
    setLetters(prev => [newLetter, ...prev]);
    logAudit('Yangi xat kiritildi', 'Letter', newLetter.id, `${newLetter.clientName} - ${newLetter.letterNumber}`);
    addNotification({
      type: 'LETTER',
      title: 'Yangi xat kiritildi',
      message: `${newLetter.clientName}: ${newLetter.letterNumber}`,
      linkModule: 'Xatlar',
      relatedId: newLetter.id,
    });
  };

  const deleteLetter = (id: string) => {
    const target = letters.find(l => l.id === id);
    if (!target) return;

    // Faqat SUPER_ADMIN o'chira oladi
    if (currentUser.role !== 'SUPER_ADMIN') {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat SUPER_ADMIN xatlarni o\'chira oladi.',
        linkModule: 'Xatlar'
      });
      return;
    }

    setLetters(prev => prev.filter(l => l.id !== id));
    logAudit('Xat o\'chirildi', 'Letter', id, `${target.clientName} - ${target.letterNumber}`, 'Mavjud', 'O\'chirildi');
    addNotification({
      type: 'SYSTEM',
      title: 'Xat o\'chirildi',
      message: `${target.clientName} dan ${target.letterNumber} raqamli xat o\'chirildi.`,
      linkModule: 'Xatlar'
    });
  };

  const addReminder = (reminderData: Omit<AutomaticReminder, 'id'>) => {
    const newReminder: AutomaticReminder = {
      id: `rem-${Date.now()}`,
      ...reminderData,
    };
    setReminders(prev => [newReminder, ...prev]);
    logAudit('Yangi eslatma qo\'shildi', 'Reminder', newReminder.id, newReminder.title);
    addNotification({
      type: 'SYSTEM',
      title: 'Yangi eslatma qo\'shildi',
      message: newReminder.title,
      linkModule: 'Eslatmalar',
      relatedId: newReminder.id,
    });
  };

  const deleteReminder = (id: string) => {
    const target = reminders.find(r => r.id === id);
    if (!target) return;

    if (currentUser.role !== 'SUPER_ADMIN') {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat SUPER_ADMIN eslatmalarni o\'chira oladi.',
        linkModule: 'Eslatmalar'
      });
      return;
    }

    setReminders(prev => prev.filter(r => r.id !== id));
    logAudit('Eslatma o\'chirildi', 'Reminder', id, target.title, 'Mavjud', 'O\'chirildi');
  };

  const createKameral = (auditData: Omit<KameralAudit, 'id'>) => {
    const newKameral: KameralAudit = {
      id: `kam-${Date.now()}`,
      ...auditData,
    };
    setKameral(prev => [newKameral, ...prev]);
    logAudit('Kameral tekshiruv ishi ochildi', 'Kameral', newKameral.id, `${newKameral.clientName} - ${newKameral.auditType}`);
    addNotification({
      type: 'KAMERAL',
      title: 'Yangi kameral tekshiruv',
      message: `${newKameral.clientName}: ${newKameral.auditType} bo'yicha kameral xabarnoma.`,
      linkModule: 'Kameral',
      relatedId: newKameral.id,
    });
  };

  const updateKameralStatus = (id: string, status: any, notes?: string, proof?: ProofAttachment) => {
    setKameral(prev => prev.map(k => {
      if (k.id === id) {
        const updated = { ...k, status, notes: notes || k.notes, proofAttachment: proof || k.proofAttachment };
        logAudit('Kameral holati o\'zgartirildi', 'Kameral', id, `${k.clientName} - ${k.auditType}`, k.status, status);
        return updated;
      }
      return k;
    }));
  };

  const createIssue = (issueData: Omit<IssueRecord, 'id' | 'createdAt'>) => {
    const now = new Date();
    const formatted = now.toISOString().split('T')[0];
    const newIssue: IssueRecord = {
      id: `iss-${Date.now()}`,
      createdAt: formatted,
      ...issueData,
    };
    setIssues(prev => [newIssue, ...prev]);
    logAudit('Yangi kamchilik qayd etildi', 'Issue', newIssue.id, `${newIssue.clientName} - ${newIssue.type}`);
    addNotification({
      type: 'DEADLINE',
      title: 'Yangi kamchilik kiritildi',
      message: `${newIssue.clientName}: ${newIssue.type}`,
      linkModule: 'Kamchiliklar',
      relatedId: newIssue.id,
    });
  };

  const resolveIssue = (id: string, notes?: string, proof?: ProofAttachment) => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;

    setIssues(prev => prev.map(i => {
      if (i.id === id) {
        const updated: IssueRecord = {
          ...i,
          status: 'TUZATILDI',
          resolvedAt: formatted,
          notes: notes || i.notes,
          proofAttachment: proof,
        };
        logAudit('Kamchilik tuzatildi deb belgilandi', 'Issue', id, `${i.clientName} - ${i.type}`, 'OCHIQ', 'TUZATILDI');
        return updated;
      }
      return i;
    }));
  };

  const updateIssueStatus = (id: string, status: IssueStatus, notes?: string, proof?: ProofAttachment) => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    setIssues(prev => prev.map(i => {
      if (i.id === id) {
        const updated: IssueRecord = {
          ...i,
          status,
          resolvedAt: status === 'TUZATILDI' ? formatted : i.resolvedAt,
          notes: notes || i.notes,
          proofAttachment: proof !== undefined ? proof : i.proofAttachment,
        };
        logAudit('Kamchilik holati yangilandi', 'Issue', id, `${i.clientName} - ${i.type}`, i.status, status);
        return updated;
      }
      return i;
    }));
  };

  const deleteIssue = (id: string) => {
    const target = issues.find(i => i.id === id);
    if (!target) return;

    if (currentUser.role !== 'SUPER_ADMIN') {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat SUPER_ADMIN kamchiliklarni o\'chira oladi.',
        linkModule: 'Kamchiliklar'
      });
      return;
    }

    setIssues(prev => prev.filter(i => i.id !== id));
    logAudit('Kamchilik o\'chirildi', 'Issue', id, `${target.clientName} - ${target.type}`, 'Mavjud', 'O\'chirildi');
    addNotification({
      type: 'SYSTEM',
      title: 'Kamchilik o\'chirildi',
      message: `${target.clientName} dan ${target.type} kamchiligi o\'chirildi.`,
      linkModule: 'Kamchiliklar'
    });
  };

  const createTask = (taskData: Omit<TaskRecord, 'id' | 'createdAt' | 'acceptedBy'>) => {
    const now = new Date();
    const formatted = now.toISOString().split('T')[0];
    const newTask: TaskRecord = {
      id: `tsk-${Date.now()}`,
      createdAt: formatted,
      acceptedBy: [],
      ...taskData,
    };
    setTasks(prev => [newTask, ...prev]);
    logAudit('Yangi topshiriq biriktirildi', 'Task', newTask.id, newTask.title, undefined, `${newTask.assigneeNames.join(', ')}`);
    addNotification({
      type: 'TASK',
      title: 'Sizga yangi topshiriq berildi',
      message: `${currentUser.name}: ${newTask.title}${newTask.description ? `\n${newTask.description}` : ''}`,
      linkModule: 'Topshiriqlar',
      relatedId: newTask.id,
      recipientIds: newTask.assigneeIds.filter(id => id !== currentUser.id),
      // Direktor yoki nazoratchi bergan vazifa hodim ko'rib chiqmaguncha ekran tepasida qolaveradi
      pinned: ['SUPER_ADMIN', 'DIREKTOR', 'NAZORATCHI'].includes(currentUser.role),
    });
  };

  const acceptTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const alreadyAccepted = t.acceptedBy.includes(currentUser.id);
        const updatedAccepted = alreadyAccepted ? t.acceptedBy : [...t.acceptedBy, currentUser.id];
        const updatedStatus = t.status === 'YANGI' ? 'QABUL_QILINDI' : t.status;
        logAudit('Topshiriq qabul qilindi', 'Task', taskId, t.title, t.status, 'Qabul qilindi');
        return {
          ...t,
          acceptedBy: updatedAccepted,
          status: updatedStatus,
        };
      }
      return t;
    }));
  };

  const completeTask = (taskId: string, proof?: ProofAttachment, notes?: string) => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated: TaskRecord = {
          ...t,
          status: 'BAJARILDI',
          completedAt: formatted,
          notes: notes || t.notes,
          proofAttachment: proof,
        };
        logAudit('Topshiriq bajarildi', 'Task', taskId, t.title, t.status, 'BAJARILDI');
        return updated;
      }
      return t;
    }));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus, notes?: string, proof?: ProofAttachment) => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logAudit('Topshiriq holati yangilandi', 'Task', taskId, t.title, t.status, status);
        return {
          ...t,
          status,
          completedAt: status === 'BAJARILDI' ? formatted : t.completedAt,
          notes: notes || t.notes,
          proofAttachment: proof !== undefined ? proof : t.proofAttachment,
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    if (currentUser.role !== 'SUPER_ADMIN') {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat SUPER_ADMIN vazifalarni o\'chira oladi.',
        linkModule: 'Topshiriqlar'
      });
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== id));
    logAudit('Vazifa o\'chirildi', 'Task', id, target.title, 'Mavjud', 'O\'chirildi');
    addNotification({
      type: 'SYSTEM',
      title: 'Vazifa o\'chirildi',
      message: `${target.title} vazifasi o\'chirildi.`,
      linkModule: 'Topshiriqlar'
    });
  };

  const giveGift = (employeeId: string, giftType: GiftType, description: string, points: number, reason: string) => {
    const canGive = ['SUPER_ADMIN', 'DIREKTOR', 'NAZORATCHI'].includes(currentUser.role);
    if (!canGive) {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat SUPER_ADMIN, DIREKTOR va NAZORATCHI sovga bera oladi.',
        linkModule: 'Xodimlar',
        recipientIds: [currentUser.id],
      });
      return;
    }

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      addNotification({
        type: 'SYSTEM',
        title: 'Xatolik',
        message: 'Hodim topilmadi.',
        linkModule: 'Xodimlar',
        recipientIds: [currentUser.id],
      });
      return;
    }

    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;

    const newGift: Gift = {
      id: `gift-${Date.now()}`,
      employeeId,
      employeeName: employee.name,
      giftType,
      description,
      points,
      givenBy: currentUser.name,
      givenAt: formatted,
      reason,
    };

    setGifts(prev => [newGift, ...prev]);

    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        const updatedRating = (e.rating || 0) + points;
        const updatedGifts = (e.giftsReceived || 0) + 1;
        return {
          ...e,
          rating: updatedRating,
          giftsReceived: updatedGifts,
        };
      }
      return e;
    }));

    logAudit('Sovga berildi', 'Gift', newGift.id, `${employee.name} - ${giftType}`, undefined, `+${points} ball`);
    addNotification({
      type: 'GIFT',
      title: '🎁 Sizga sovga berildi',
      message: `${currentUser.name} sizga ${description || giftType} sovgasi berdi (+${points} ball). Sabab: ${reason}`,
      linkModule: 'Xodimlar',
      relatedId: newGift.id,
      recipientIds: [employeeId],
      // Sovga faqat SUPER_ADMIN/DIREKTOR/NAZORATCHI tomonidan beriladi — hodim ko'rib chiqmaguncha ekran tepasida qolaveradi
      pinned: true,
    });
  };

  const deleteGift = (giftId: string) => {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return;

    if (currentUser.role !== 'SUPER_ADMIN') {
      addNotification({
        type: 'SYSTEM',
        title: 'Ruxsat yo\'q',
        message: 'Faqat SUPER_ADMIN sovga o\'chira oladi.',
        linkModule: 'Xodimlar'
      });
      return;
    }

    setGifts(prev => prev.filter(g => g.id !== giftId));

    setEmployees(prev => prev.map(e => {
      if (e.id === gift.employeeId) {
        const updatedRating = Math.max(0, (e.rating || 0) - gift.points);
        const updatedGifts = Math.max(0, (e.giftsReceived || 0) - 1);
        return {
          ...e,
          rating: updatedRating,
          giftsReceived: updatedGifts,
        };
      }
      return e;
    }));

    logAudit('Sovga o\'chirildi', 'Gift', giftId, `${gift.employeeName} - ${gift.giftType}`, `+${gift.points} ball`, 'O\'chirildi');
    addNotification({
      type: 'SYSTEM',
      title: 'Sovga o\'chirildi',
      message: `${gift.employeeName} dan ${gift.giftType} sovgasi o\'chirildi.`,
      linkModule: 'Xodimlar'
    });
  };

  const sendChatMessage = (roomId: string, text: string, attachment?: any, isVoice?: boolean) => {
    const now = new Date();
    const formatted = `${now.toLocaleDateString('uz-UZ')} ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: formatted,
      isRead: false,
      attachment,
      isVoice,
    };
    setChatMessages(prev => [...prev, newMessage]);

    const room = chatRooms.find(r => r.id === roomId);
    const preview = isVoice ? '🎤 Ovozli xabar' : (text || (attachment ? `📎 ${attachment.name}` : 'Xabar'));

    // Update room last message
    setChatRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          lastMessage: preview,
          lastMessageTime: 'Hozirgina',
        };
      }
      return r;
    }));

    // Admin / Direktor / Nazoratchi yozganda — a'zolarga ekran bildirishnomasi
    const isManager = ['SUPER_ADMIN', 'DIREKTOR', 'NAZORATCHI'].includes(currentUser.role);
    if (isManager && room) {
      const recipients = room.memberIds.filter(id => id !== currentUser.id);
      if (recipients.length > 0) {
        addNotification({
          type: 'CHAT',
          title: `Yangi chat: ${currentUser.name}`,
          message: `${room.name}: ${preview}`,
          linkModule: 'Chat',
          relatedId: roomId,
          recipientIds: recipients,
        });
      }
    }
  };

  const createChatRoom = (name: string, memberIds: string[], isGroup = false): string => {
    const uniqueMemberIds = Array.from(new Set([...memberIds, currentUser.id]));
    const memberNames = employees.filter(e => uniqueMemberIds.includes(e.id)).map(e => e.name);
    const newRoomId = `room-${Date.now()}`;
    const newRoom: ChatRoom = {
      id: newRoomId,
      name,
      isGroup,
      memberIds: uniqueMemberIds,
      memberNames,
      lastMessage: 'Yangi chat boshlandi',
      lastMessageTime: 'Hozirgina',
      unreadCount: 0,
    };
    setChatRooms(prev => [newRoom, ...prev]);
    return newRoomId;
  };

  const openDirectChatWithEmployee = (employeeId: string): string => {
    const target = employees.find(e => e.id === employeeId);
    if (!target) return 'room-general';

    // Check if room already exists
    const existing = chatRooms.find(r => !r.isGroup && r.memberIds.includes(currentUser.id) && r.memberIds.includes(employeeId));
    if (existing) {
      return existing.id;
    }

    // Create new direct room
    const newRoomId = `room-direct-${Date.now()}`;
    const newRoom: ChatRoom = {
      id: newRoomId,
      name: target.name,
      isGroup: false,
      memberIds: [currentUser.id, employeeId],
      memberNames: [currentUser.name, target.name],
      lastMessage: 'Yangi suhbat boshlandi',
      lastMessageTime: 'Hozirgina',
      unreadCount: 0,
    };
    setChatRooms(prev => [newRoom, ...prev]);
    return newRoomId;
  };

  const deleteChatMessage = (messageId: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const clearChatRoom = (roomId: string) => {
    setChatMessages(prev => prev.filter(m => m.roomId !== roomId));
    setChatRooms(prev => prev.map(r => r.id === roomId ? { ...r, lastMessage: 'Xabarlar tozalandi', lastMessageTime: 'Hozirgina' } : r));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateEmployeeAvatar = (employeeId: string, avatarUrl: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return { ...e, avatar: avatarUrl };
      }
      return e;
    }));
    if (currentUser.id === employeeId) {
      setCurrentUser(prev => ({ ...prev, avatar: avatarUrl }));
    }
    logAudit('Profil rasmi yangilandi', 'Employee', employeeId, currentUser.name);
  };

  const importClientsFromExcel = (newClientsData: Partial<Client>[], updateExisting: boolean) => {
    let added = 0;
    let updated = 0;
    let skipped = 0;

    const existingStirMap = new Map<string, Client>();
    clients.forEach(c => existingStirMap.set(c.stir.trim(), c));

    const updatedClientsList = [...clients];

    newClientsData.forEach((item, index) => {
      const stir = (item.stir || '').trim();
      if (!stir || !item.name) {
        skipped++;
        return;
      }

      let mappedAccountant = item.accountantName || item.accountantId || 'Jahongir Amonov';
      let mappedAccountantId = item.accountantId || 'emp-1';

      if (!item.accountantId && item.accountantName) {
        const match = employees.find(emp => emp.name.toLowerCase() === String(item.accountantName).toLowerCase());
        if (match) {
          mappedAccountantId = match.id;
          mappedAccountant = match.name;
        }
      }

      if (existingStirMap.has(stir)) {
        if (updateExisting) {
          const existingClient = existingStirMap.get(stir)!;
          const idx = updatedClientsList.findIndex(c => c.id === existingClient.id);
          if (idx !== -1) {
            updatedClientsList[idx] = {
              ...updatedClientsList[idx],
              name: item.name || updatedClientsList[idx].name,
              monthlyFee: item.monthlyFee !== undefined ? item.monthlyFee : updatedClientsList[idx].monthlyFee,
              phone: item.phone || updatedClientsList[idx].phone,
              taxType: item.taxType || updatedClientsList[idx].taxType,
              type: item.type || updatedClientsList[idx].type,
              accountantId: mappedAccountantId,
              accountantName: mappedAccountant || updatedClientsList[idx].accountantName,
            };
            updated++;
          }
        } else {
          skipped++;
        }
      } else {
        const newClient: Client = {
          id: `cli-${Date.now()}-${index}`,
          name: item.name,
          stir: stir,
          type: item.type || (stir.startsWith('5') ? 'YATT' : 'YURIDIK'),
          taxType: item.taxType || 'AYLANMA',
          phone: item.phone || '+998 90 000 00 00',
          address: item.address || 'O\'zbekiston',
          accountantId: mappedAccountantId,
          accountantName: mappedAccountant,
          monthlyFee: item.monthlyFee || 2000000,
          contractDate: '2024-08-01',
          status: 'ACTIVE',
          notes: item.notes || 'Excel orqali import qilingan mijoz.',
        };
        updatedClientsList.unshift(newClient);
        existingStirMap.set(stir, newClient);
        added++;
      }
    });

    setClients(updatedClientsList);
    logAudit('Excel import bajarildi', 'ExcelImport', `imp-${Date.now()}`, `Qo'shildi: ${added}, Yangilandi: ${updated}, O'tkazildi: ${skipped}`);
    
    addNotification({
      type: 'REPORT',
      title: 'Excel import yakunlandi',
      message: `${added} ta yangi mijoz qo'shildi, ${updated} ta mijoz yangilandi.`,
      linkModule: 'Mijozlar',
    });

    return { added, updated, skipped };
  };

  const resetToDemoData = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setCurrentUser(INITIAL_EMPLOYEES[0]);
    setClients(INITIAL_CLIENTS);
    setPeriods(INITIAL_PERIODS);
    setCurrentPeriod(INITIAL_PERIODS[0]);
    setTaxReports(INITIAL_TAX_REPORTS);
    setAccounting1C(INITIAL_ACCOUNTING_1C);
    setPayments(INITIAL_PAYMENTS);
    setReceipts([]);
    setInvoices([]);
    setLetters(INITIAL_LETTERS);
    setKameral(INITIAL_KAMERAL);
    setIssues(INITIAL_ISSUES);
    setTasks(INITIAL_TASKS);
    setReminders(INITIAL_REMINDERS);
    setChatRooms(INITIAL_CHAT_ROOMS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);

    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_employees`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_clients`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_taxReports`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_accounting1C`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_payments`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_receipts`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_invoices`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_letters`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_kameral`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_issues`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_tasks`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_chatMessages`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_auditLogs`);
    localStorage.removeItem(`${REAL_STORAGE_PREFIX}_notifications`);
    localStorage.removeItem('21ASR_USER_CREDENTIALS');
  };

  const logoutUser = () => {
    const guest: Employee = {
      id: 'guest',
      name: 'Tashrifchi',
      role: 'BUXGALTER',
      email: '',
      phone: '',
      position: 'Mehmon',
      avatar: '/assets/guest-avatar.png',
      status: 'INACTIVE',
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
    };

    setCurrentUser(guest);
    setActiveTab('Dashboard');
    logAudit('Foydalanuvchi chiqdi', 'Auth', `logout-${Date.now()}`, guest.name);
    addNotification({
      type: 'SYSTEM',
      title: 'Siz tizimdan chiqdingiz',
      message: 'Sessiya tugatildi. Iltimos, tizimga kirish uchun xodimni tanlang.',
      linkModule: 'Dashboard',
    });
  };

  return (
    <CRMContext.Provider
      value={{
        scanResult,
        isScannerModalOpen,
        setIsScannerModalOpen,
        runDatabaseScan,
        applyDatabaseAutoFix,

        currentUser,
        employees,
        clients,
        periods,
        currentPeriod,
        taxReports,
        accounting1C,
        payments,
        receipts,
        invoices,
        letters,
        kameral,
        issues,
        tasks,
        reminders,
        chatRooms,
        chatMessages,
        auditLogs,
        notifications,
        gifts,
        activeTab,
        selectedClientIdForModal,
        globalSearchOpen,
        pendingChatRoomId,
        debtActTemplateFile,
        setActiveTab,
        openClientCard,
        closeClientCard,
        setGlobalSearchOpen,
        setPendingChatRoomId,
        setCurrentPeriod,
        logoutUser,
        updateDebtActTemplateFile,
        generateDebtAct,
        generateCombinedDebtAct,
        giveGift,
        deleteGift,
        addClient,
        updateClient,
        deleteClient,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        registerUser,
        updateUserPassword,
        loginUser,
        assignClientsToEmployee,
        updateTaxReportStatus,
        updateAllClientTaxReports,
        canMarkReportSubmitted,
        createTaxReport,
        addTaxReport: createTaxReport,
        setClientReportTypes,
        bulkSetClientReportTypes,
        updateAccounting1C,
        toggle1COborotka,
        recordPayment,
        updatePayment,
        addReceipt,
        updateReceipt,
        deleteReceipt,
        addInvoice,
        deleteInvoice,
        markLetterAsRead,
        updateLetterStatus,
        createLetter,
        addLetter: createLetter,
        deleteLetter,
        addReminder,
        deleteReminder,
        createKameral,
        addKameral: createKameral,
        updateKameralStatus,
        createIssue,
        addIssue: createIssue,
        resolveIssue,
        updateIssueStatus,
        deleteIssue,
        createTask,
        addTask: createTask,
        acceptTask,
        completeTask,
        updateTaskStatus,
        deleteTask,
        sendChatMessage,
        createChatRoom,
        openDirectChatWithEmployee,
        deleteChatMessage,
        clearChatRoom,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        importClientsFromExcel,
        updateEmployeeAvatar,
        logAudit,
        addNotification,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
