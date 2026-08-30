import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  ProofAttachment
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

interface CRMContextType {
  // Mode & Health state
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
  toggleDemoMode: () => void;
  switchToRealMode: () => void;
  switchToDemoMode: () => void;
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
  letters: LetterRecord[];
  kameral: KameralAudit[];
  issues: IssueRecord[];
  tasks: TaskRecord[];
  reminders: AutomaticReminder[];
  chatRooms: ChatRoom[];
  chatMessages: ChatMessage[];
  auditLogs: AuditLogRecord[];
  notifications: NotificationItem[];
  activeTab: string;
  selectedClientIdForModal: string | null;
  globalSearchOpen: boolean;
  
  // Navigation & UI controls
  setActiveTab: (tab: string) => void;
  switchUserRole: (role: UserRole, employeeId?: string) => void;
  openClientCard: (clientId: string) => void;
  closeClientCard: () => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setCurrentPeriod: (period: ReportPeriod) => void;
  logoutUser: () => void;
  
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
  createTaxReport: (report: Omit<TaxReport, 'id'>) => void;
  addTaxReport: (report: Omit<TaxReport, 'id'>) => void;
  setClientReportTypes: (clientId: string, reportTypes: ReportType[]) => void;
  bulkSetClientReportTypes: (clientIds: string[], reportTypes: ReportType[]) => void;
  
  // 1C & Invoices
  updateAccounting1C: (id: string, updates: Partial<Accounting1CRecord>) => void;
  toggle1COborotka: (id: string) => void;
  
  // Payments
  recordPayment: (clientId: string, amount: number, notes?: string) => void;
  updatePayment: (id: string, updates: Partial<PaymentRecord>) => void;
  
  // Letters
  markLetterAsRead: (letterId: string) => void;
  updateLetterStatus: (letterId: string, status: any, replyDate?: string, notes?: string) => void;
  createLetter: (letterData: Omit<LetterRecord, 'id'>) => void;
  addLetter: (letterData: Omit<LetterRecord, 'id'>) => void;
  
  // Kameral
  createKameral: (auditData: Omit<KameralAudit, 'id'>) => void;
  addKameral: (auditData: Omit<KameralAudit, 'id'>) => void;
  updateKameralStatus: (id: string, status: any, notes?: string) => void;
  
  // Issues & Deficiencies
  createIssue: (issueData: Omit<IssueRecord, 'id' | 'createdAt'>) => void;
  addIssue: (issueData: Omit<IssueRecord, 'id' | 'createdAt'>) => void;
  resolveIssue: (id: string, notes?: string, proof?: ProofAttachment) => void;
  updateIssueStatus: (id: string, status: IssueStatus, notes?: string, proof?: ProofAttachment) => void;
  
  // Tasks
  createTask: (taskData: Omit<TaskRecord, 'id' | 'createdAt' | 'acceptedBy'>) => void;
  addTask: (taskData: Omit<TaskRecord, 'id' | 'createdAt' | 'acceptedBy'>) => void;
  acceptTask: (taskId: string) => void;
  completeTask: (taskId: string, proof?: ProofAttachment, notes?: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, notes?: string, proof?: ProofAttachment) => void;
  
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
  registerUser: (employeeId: string, password: string) => void;
  updateUserPassword: (employeeId: string, password: string) => boolean;
  loginUser: (identifier: string, password: string) => boolean;
  logAudit: (action: string, objectType: string, objectId: string, objectName: string, oldValue?: string, newValue?: string) => void;
  resetToDemoData: () => void;
  clearDemoClients: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const DEMO_STORAGE_PREFIX = '21ASR_CRM_DEMO_V1';
const REAL_STORAGE_PREFIX = '21ASR_CRM_REAL_V2'; // V2: real mode starts without seeded test clients/services
const MODE_STORAGE_KEY = '21ASR_CRM_ACTIVE_MODE';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode state: default to true (Demo), but respect user preference
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    return savedMode !== null ? savedMode === 'DEMO' : false; // If user requested to turn off demo, default to Real mode!
  });

  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<DatabaseScanResult | null>(null);

  const getPrefix = useCallback((demo: boolean) => demo ? DEMO_STORAGE_PREFIX : REAL_STORAGE_PREFIX, []);

  // Helper loader for initial state with automatic stale-data sanitization
  const loadData = <T,>(key: string, demoFallback: T, realFallback: T): T => {
    const prefix = getPrefix(isDemoMode);
    const saved = localStorage.getItem(`${prefix}_${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out old dummy employees if present in cached localStorage
        if (key === 'employees' && Array.isArray(parsed)) {
          const dummyNames = ['Anvar Aliyev', 'Jamshid Valiyev', 'Dilnoza Karimova', 'Nilufar Umarova', 'Sardorbek Rahimov'];
          const cleaned = parsed.filter((e: any) => !dummyNames.includes(e.name) && (e.id === 'emp-1' || e.id.startsWith('emp-')));
          if (cleaned.length === 0) {
            return (isDemoMode ? demoFallback : realFallback);
          }
          return cleaned as T;
        }
        return parsed;
      } catch (e) {
        console.error(`Error parsing ${key}`, e);
      }
    }
    return isDemoMode ? demoFallback : realFallback;
  };

  const [employees, setEmployees] = useState<Employee[]>(() => 
    loadData('employees', INITIAL_EMPLOYEES, INITIAL_EMPLOYEES)
  );

  // Simple in-memory credential store persisted to localStorage (employeeId -> password)
  const [userCredentials, setUserCredentials] = useState<Record<string,string>>(() => {
    try {
      const raw = localStorage.getItem('21ASR_USER_CREDENTIALS');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  const getSuperAdminPassword = useCallback(() => {
    const envValue = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPER_ADMIN_PASSWORD : undefined;
    const fromEnv = envValue && String(envValue).trim();
    // Ignore placeholder values from .env.example so login never breaks on Vercel
    if (fromEnv && fromEnv !== 'your-admin-password' && fromEnv !== 'CHANGE_ME') {
      return fromEnv;
    }
    return 'Fjahongir0204';
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('21ASR_USER_CREDENTIALS', JSON.stringify(userCredentials));
    } catch (e) {}
  }, [userCredentials]);

  const [currentUser, setCurrentUser] = useState<Employee>(() => ({
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
  }));

  const [clients, setClients] = useState<Client[]>(() => 
    loadData('clients', INITIAL_CLIENTS, [])
  );

  const [periods, setPeriods] = useState<ReportPeriod[]>(() => 
    loadData('periods', INITIAL_PERIODS, INITIAL_PERIODS)
  );

  const [currentPeriod, setCurrentPeriod] = useState<ReportPeriod>(() => 
    periods.find(p => p.isCurrent) || periods[0] || INITIAL_PERIODS[0]
  );

  const [taxReports, setTaxReports] = useState<TaxReport[]>(() => 
    loadData('taxReports', INITIAL_TAX_REPORTS, [])
  );

  const [accounting1C, setAccounting1C] = useState<Accounting1CRecord[]>(() => 
    loadData('accounting1C', INITIAL_ACCOUNTING_1C, [])
  );

  const [payments, setPayments] = useState<PaymentRecord[]>(() => 
    loadData('payments', INITIAL_PAYMENTS, [])
  );

  const [letters, setLetters] = useState<LetterRecord[]>(() => 
    loadData('letters', INITIAL_LETTERS, [])
  );

  const [kameral, setKameral] = useState<KameralAudit[]>(() => 
    loadData('kameral', INITIAL_KAMERAL, [])
  );

  const [issues, setIssues] = useState<IssueRecord[]>(() => 
    loadData('issues', INITIAL_ISSUES, [])
  );

  const [tasks, setTasks] = useState<TaskRecord[]>(() => 
    loadData('tasks', INITIAL_TASKS, [])
  );

  const [reminders, setReminders] = useState<AutomaticReminder[]>(() => 
    loadData('reminders', INITIAL_REMINDERS, [])
  );

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => 
    loadData('chatRooms', INITIAL_CHAT_ROOMS, INITIAL_CHAT_ROOMS)
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => 
    loadData('chatMessages', INITIAL_CHAT_MESSAGES, [])
  );

  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(() => 
    loadData('auditLogs', INITIAL_AUDIT_LOGS, [])
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => 
    loadData('notifications', INITIAL_NOTIFICATIONS, [])
  );

  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedClientIdForModal, setSelectedClientIdForModal] = useState<string | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);

  // One-time cleanup: drop legacy real-mode test seed (V1) so real workspace stays empty
  useEffect(() => {
    try {
      const legacyPrefix = '21ASR_CRM_REAL_V1';
      [
        'clients', 'taxReports', 'accounting1C', 'payments', 'letters',
        'kameral', 'issues', 'tasks', 'chatMessages', 'auditLogs', 'notifications',
      ].forEach((key) => localStorage.removeItem(`${legacyPrefix}_${key}`));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, isDemoMode ? 'DEMO' : 'REAL');
  }, [isDemoMode]);

  const prefix = getPrefix(isDemoMode);

  useEffect(() => {
    localStorage.setItem(`${prefix}_employees`, JSON.stringify(employees));
  }, [employees, prefix]);

  useEffect(() => {
    try {
      localStorage.setItem(`${prefix}_clients`, JSON.stringify(clients));
    } catch (err) {
      console.error('Clients saqlanmadi (localStorage):', err);
    }
  }, [clients, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_taxReports`, JSON.stringify(taxReports));
  }, [taxReports, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_accounting1C`, JSON.stringify(accounting1C));
  }, [accounting1C, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_payments`, JSON.stringify(payments));
  }, [payments, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_letters`, JSON.stringify(letters));
  }, [letters, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_kameral`, JSON.stringify(kameral));
  }, [kameral, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_issues`, JSON.stringify(issues));
  }, [issues, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_tasks`, JSON.stringify(tasks));
  }, [tasks, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_chatMessages`, JSON.stringify(chatMessages));
  }, [chatMessages, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs, prefix]);

  useEffect(() => {
    localStorage.setItem(`${prefix}_notifications`, JSON.stringify(notifications));
  }, [notifications, prefix]);

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
      id: `notif-${Date.now()}`,
      ...item,
      timestamp: 'Hozirgina',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Switch to Real mode
  const switchToRealMode = () => {
    setIsDemoModeState(false);
    localStorage.setItem(MODE_STORAGE_KEY, 'REAL');
    
    // Check if real database exists, if not initialize from current or clean
    const realPrefix = REAL_STORAGE_PREFIX;
    const realClientsRaw = localStorage.getItem(`${realPrefix}_clients`);
    if (!realClientsRaw) {
      // Seed real storage with current dataset and mark as real
      localStorage.setItem(`${realPrefix}_clients`, JSON.stringify(clients));
      localStorage.setItem(`${realPrefix}_taxReports`, JSON.stringify(taxReports));
      localStorage.setItem(`${realPrefix}_accounting1C`, JSON.stringify(accounting1C));
      localStorage.setItem(`${realPrefix}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${realPrefix}_letters`, JSON.stringify(letters));
      localStorage.setItem(`${realPrefix}_kameral`, JSON.stringify(kameral));
      localStorage.setItem(`${realPrefix}_issues`, JSON.stringify(issues));
      localStorage.setItem(`${realPrefix}_tasks`, JSON.stringify(tasks));
      localStorage.setItem(`${realPrefix}_employees`, JSON.stringify(employees));
    }

    logAudit('Rejim almashtirildi', 'System', 'MODE', 'Real Rejimga o\'tildi (Demo o\'chirildi)', 'DEMO', 'REAL');
    addNotification({
      type: 'AI_ALERT',
      title: '🟢 Real Rejim Faollashtirildi',
      message: 'Demo rejim o\'chirildi. Barcha kiritilayotgan korxonalar va hisobotlar real ishchi bazada saqlanmoqda.',
      linkModule: 'Dashboard',
    });
  };

  // Switch to Demo mode
  const switchToDemoMode = () => {
    setIsDemoModeState(true);
    localStorage.setItem(MODE_STORAGE_KEY, 'DEMO');
    logAudit('Rejim almashtirildi', 'System', 'MODE', 'Demo Rejimga o\'tildi', 'REAL', 'DEMO');
    addNotification({
      type: 'AI_ALERT',
      title: '🧪 Demo Rejim Faollashtirildi',
      message: 'Siz hozirda test va namuna korxonalari bilan ishlayapsiz.',
      linkModule: 'Dashboard',
    });
  };

  const toggleDemoMode = () => {
    if (isDemoMode) {
      switchToRealMode();
    } else {
      switchToDemoMode();
    }
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

  const switchUserRole = (role: UserRole, employeeId?: string) => {
    let targetEmployee = employees.find(e => employeeId ? e.id === employeeId : e.role === role);
    if (!targetEmployee) {
      targetEmployee = employees.find(e => e.role === role) || employees[0];
    }
    setCurrentUser(targetEmployee);
    logAudit('Foydalanuvchi roli almashtirildi', 'UserSession', targetEmployee.id, `${targetEmployee.name} (${role})`);
  };

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

    // Auto-generate 1C / Didox Record
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
    const allowedRoles = ['SUPER_ADMIN', 'DIREKTOR', 'BUXGALTER', 'NAZORATCHI'];
    if (!allowedRoles.includes(currentUser.role) || currentUser.id === 'guest') {
      addNotification({ type: 'SYSTEM', title: 'Ruxsat yo\'q', message: 'Mijozni o\'chirish uchun faqat SUPER_ADMIN, DIREKTOR, BUXGALTER yoki NAZORATCHI ruxsatiga ega bo\'ladi.', linkModule: 'Mijozlar' });
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

  // Register credential for an employee (only to be called by Super Admin)
  const registerUser = (employeeId: string, password: string) => {
    setUserCredentials(prev => ({ ...prev, [employeeId]: password }));
    logAudit('Foydalanuvchi ro\'yxatdan o\'tkazildi', 'Auth', `reg-${employeeId}`, `Credentials set for ${employeeId}`);
  };

  const updateUserPassword = (employeeId: string, password: string): boolean => {
    if (!employeeId || !password.trim()) return false;
    setUserCredentials(prev => ({ ...prev, [employeeId]: password.trim() }));
    logAudit('Foydalanuvchi paroli yangilandi', 'Auth', `reset-${employeeId}`, `Credentials reset for ${employeeId}`);
    return true;
  };

  const loginUser = (identifier: string, password: string): boolean => {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const normalizedPhone = (value: string) => value.replace(/\D/g, '');
    const compactName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const adminAliases = new Set([
      'jahongiramonov',
      'jahongir',
      'emp-1',
      'admin',
      'superadmin',
      'super admin',
      'super-admin',
    ]);

    const target = employees.find(e => {
      if (adminAliases.has(normalizedIdentifier) && e.id === 'emp-1') return true;
      const idMatch = e.id.toLowerCase() === normalizedIdentifier;
      const emailMatch = e.email.toLowerCase() === normalizedIdentifier;
      const phoneMatch = normalizedPhone(e.phone) === normalizedPhone(identifier.trim());
      const nameMatch = compactName(e.name) === compactName(normalizedIdentifier);
      return idMatch || emailMatch || phoneMatch || nameMatch;
    });

    if (!target) return false;

    const stored = userCredentials[target.id];
    const adminPassword = getSuperAdminPassword();
    const ok =
      target.id === 'emp-1'
        ? password === stored || password === adminPassword
        : !!stored && stored === password;

    if (ok) {
      setCurrentUser(target);
      setActiveTab('Dashboard');
      logAudit('Foydalanuvchi tizimga kirdi', 'Auth', `login-${target.id}`, target.name);
      addNotification({ type: 'SYSTEM', title: 'Tizimga kirildi', message: `${target.name} sifatida tizimga kirdingiz`, linkModule: 'Dashboard' });
      return true;
    }
    return false;
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

  const updateTaxReportStatus = (reportId: string, status: ReportStatus, notes?: string, proof?: ProofAttachment) => {
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
          proofAttachment: status === 'TOPSHIRILDI' 
            ? (proof || r.proofAttachment) 
            : (status === 'JARAYONDA' || status === 'TOPSHIRILMAGAN' ? undefined : r.proofAttachment),
        };
        logAudit('Soliq hisoboti holati o\'zgartirildi', 'TaxReport', reportId, `${r.clientName} (${r.reportType})`, oldStatus, status);
        return updated;
      }
      return r;
    }));
  };

  const updateAllClientTaxReports = (clientId: string, status: ReportStatus, proof?: ProofAttachment, notes?: string) => {
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
          proofAttachment: status === 'TOPSHIRILDI' 
            ? (proof || r.proofAttachment) 
            : (status === 'JARAYONDA' || status === 'TOPSHIRILMAGAN' ? undefined : r.proofAttachment),
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

  const toggle1COborotka = (id: string) => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    setAccounting1C(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus: Status1C = a.oborotkaStatus === 'KIRITILGAN' ? 'KIRITILMAGAN' : 'KIRITILGAN';
        const updated: Accounting1CRecord = {
          ...a,
          oborotkaStatus: newStatus,
          oborotkaDate: newStatus === 'KIRITILGAN' ? formattedDate : undefined,
          lastUpdated: formattedDate,
        };
        logAudit('1C Oborotka holati almashtirildi', 'Accounting1C', id, a.clientName, a.oborotkaStatus, newStatus);
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

  const updateLetterStatus = (letterId: string, status: any, replyDate?: string, notes?: string) => {
    setLetters(prev => prev.map(l => {
      if (l.id === letterId) {
        const updated = {
          ...l,
          status,
          repliedAt: replyDate || l.repliedAt,
          notes: notes || l.notes,
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
      title: 'Yangi xat keldi',
      message: `${newLetter.clientName} nomiga yangi xat kelib tushdi (${newLetter.type}).`,
      linkModule: 'Xatlar',
      relatedId: newLetter.id,
    });
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

  const updateKameralStatus = (id: string, status: any, notes?: string) => {
    setKameral(prev => prev.map(k => {
      if (k.id === id) {
        const updated = { ...k, status, notes: notes || k.notes };
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
          proofAttachment: proof || i.proofAttachment,
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
      message: newTask.title,
      linkModule: 'Topshiriqlar',
      relatedId: newTask.id,
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
        logAudit('Topshiriq bajarildi', 'Task', taskId, t.title, t.status, 'BAJARILDI');
        return {
          ...t,
          status: 'BAJARILDI',
          completedAt: formatted,
          notes: notes || t.notes,
          proofAttachment: proof || t.proofAttachment,
        };
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

    // Update room last message
    setChatRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          lastMessage: isVoice ? '🎤 Ovozli xabar' : (text || (attachment ? `📎 ${attachment.name}` : 'Xabar')),
          lastMessageTime: 'Hozirgina',
        };
      }
      return r;
    }));
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
    setLetters(INITIAL_LETTERS);
    setKameral(INITIAL_KAMERAL);
    setIssues(INITIAL_ISSUES);
    setTasks(INITIAL_TASKS);
    setReminders(INITIAL_REMINDERS);
    setChatRooms(INITIAL_CHAT_ROOMS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUserCredentials({});
    
    const curPrefix = getPrefix(isDemoMode);
    localStorage.removeItem(`${curPrefix}_employees`);
    localStorage.removeItem(`${curPrefix}_clients`);
    localStorage.removeItem(`${curPrefix}_taxReports`);
    localStorage.removeItem(`${curPrefix}_accounting1C`);
    localStorage.removeItem(`${curPrefix}_payments`);
    localStorage.removeItem(`${curPrefix}_letters`);
    localStorage.removeItem(`${curPrefix}_kameral`);
    localStorage.removeItem(`${curPrefix}_issues`);
    localStorage.removeItem(`${curPrefix}_tasks`);
    localStorage.removeItem(`${curPrefix}_chatMessages`);
    localStorage.removeItem(`${curPrefix}_auditLogs`);
    localStorage.removeItem(`${curPrefix}_notifications`);
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

    const clearDemoClients = () => {
      // Restore initial demo clients and related datasets
      setClients(INITIAL_CLIENTS);
      setTaxReports(INITIAL_TAX_REPORTS);
      setAccounting1C(INITIAL_ACCOUNTING_1C);
      setPayments(INITIAL_PAYMENTS);

      // Remove demo-specific storage keys
      localStorage.removeItem(`${DEMO_STORAGE_PREFIX}_clients`);
      localStorage.removeItem(`${DEMO_STORAGE_PREFIX}_taxReports`);
      localStorage.removeItem(`${DEMO_STORAGE_PREFIX}_accounting1C`);
      localStorage.removeItem(`${DEMO_STORAGE_PREFIX}_payments`);

      logAudit('Demo mijozlar o\'chirildi', 'Admin', `clear-demo-${Date.now()}`, 'Demo mijozlar qayta o\'rnatildi', undefined, 'INITIAL set');
      addNotification({
        type: 'SYSTEM',
        title: '🧹 Demo mijozlar o\'chirildi',
        message: 'Demo rejimida kiritilgan mijozlar o\'chirildi va boshlang\'ich demo ma\'lumotlariga qaytildi.',
        linkModule: 'Mijozlar',
      });
    };

  return (
    <CRMContext.Provider
      value={{
        isDemoMode,
        setIsDemoMode: (val: boolean) => val ? switchToDemoMode() : switchToRealMode(),
        toggleDemoMode,
        switchToRealMode,
        switchToDemoMode,
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
        letters,
        kameral,
        issues,
        tasks,
        reminders,
        chatRooms,
        chatMessages,
        auditLogs,
        notifications,
        activeTab,
        selectedClientIdForModal,
        globalSearchOpen,
        setActiveTab,
        switchUserRole,
        openClientCard,
        closeClientCard,
        setGlobalSearchOpen,
        setCurrentPeriod,
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
        createTaxReport,
        addTaxReport: createTaxReport,
        setClientReportTypes,
        bulkSetClientReportTypes,
        updateAccounting1C,
        toggle1COborotka,
        recordPayment,
        updatePayment,
        markLetterAsRead,
        updateLetterStatus,
        createLetter,
        addLetter: createLetter,
        createKameral,
        addKameral: createKameral,
        updateKameralStatus,
        createIssue,
        addIssue: createIssue,
        resolveIssue,
        updateIssueStatus,
        createTask,
        addTask: createTask,
        acceptTask,
        completeTask,
        updateTaskStatus,
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
        resetToDemoData,
        clearDemoClients,
        logoutUser,
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
