import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Database,
  Receipt,
  Banknote,
  CreditCard,
  Mail,
  FileSearch,
  AlertOctagon,
  CheckSquare,
  Bell,
  MessageSquare,
  Bot,
  UserCheck,
  FileUp,
  BarChart3,
  History,
  Settings,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

import { isOborotkaActive, isSubjectTo1C } from '../../utils/oborotka';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    taxReports,
    letters,
    accounting1C,
    clients,
    payments,
    kameral,
    issues,
    tasks,
    chatRooms
  } = useCRM();

  // Mijozlar endi bitta buxgalterga emas, balki barcha xodimlarga umumiy —
  // shuning uchun bildirishnoma sonlari ham "mas'ul buxgalter"ga qarab
  // cheklanmaydi, hamma uchun bir xil (tashkilot bo'yicha umumiy) ko'rsatiladi.
  const isAccountant = currentUser.role === 'BUXGALTER';

  const pendingReportsCount = taxReports.filter(r =>
    r.status === 'TOPSHIRILMAGAN'
  ).length;

  const unreadLettersCount = letters.filter(l =>
    (l.status === 'YANGI' || l.status === 'JAVOB_KUTILMOQDA')
  ).length;

  const pending1CCount = accounting1C.filter(a => {
    if (isOborotkaActive(a)) return false;
    const client = clients.find(c => c.id === a.clientId);
    return client ? isSubjectTo1C(client.monthlyFee) : false;
  }).length;

  const debtPaymentsCount = payments.filter(p =>
    p.status === 'TOLANMAGAN'
  ).length;

  const activeKameralCount = kameral.filter(k =>
    (k.status === 'OCHIQ' || k.status === 'KAMCHILIK_ANIQLANDI')
  ).length;

  const openIssuesCount = issues.filter(i =>
    i.status === 'OCHIQ'
  ).length;

  const pendingTasksCount = tasks.filter(t => {
    const hasAssignee = Array.isArray(t.assigneeIds) ? t.assigneeIds.includes(currentUser.id) : false;
    return t.status !== 'BAJARILDI' && (!isAccountant || hasAssignee);
  }).length;

  const unreadChatCount = chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'Mijozlar', label: 'Mijozlar', icon: Users, badge: null },
    { id: 'Hisobotlar', label: 'Hisobotlar', icon: FileSpreadsheet, badge: pendingReportsCount },
    { id: '1C', label: '1C Nazorati', icon: Database, badge: pending1CCount },
    { id: 'Fakturalar', label: 'Fakturalar', icon: Receipt, badge: null },
    { id: 'To‘lovlar', label: 'To‘lovlar', icon: CreditCard, badge: debtPaymentsCount },
    { id: 'Cheklar', label: 'Chek Tahrirlash', icon: Banknote, badge: null },
    { id: 'Xatlar', label: 'Xatlar', icon: Mail, badge: unreadLettersCount },
    { id: 'Kameral', label: 'Kameral', icon: FileSearch, badge: activeKameralCount },
    { id: 'Kamchiliklar', label: 'Kamchiliklar', icon: AlertOctagon, badge: openIssuesCount },
    { id: 'Topshiriqlar', label: 'Topshiriqlar', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'Eslatmalar', label: 'Eslatmalar', icon: Bell, badge: null },
    { id: 'Chat', label: 'Jamoa Chat', icon: MessageSquare, badge: unreadChatCount },
    { id: 'AI Maslahatchi', label: 'AI Maslahatchi', icon: Bot, badge: 'AI' },
    { id: 'Xodimlar', label: 'Xodimlar', icon: UserCheck, badge: null },
    { id: 'Excel Import', label: 'Excel Import', icon: FileUp, badge: null },
    { id: 'Statistika', label: 'Statistika', icon: BarChart3, badge: null },
    { id: 'Audit Log', label: 'Audit Log', icon: History, badge: null },
    { id: 'Sozlamalar', label: 'Sozlamalar', icon: Settings, badge: null },
  ];

  // NAZORATCHI DIREKTOR bilan bir xil funksiyalarga ega bo'lishi kerak
  const canViewRestrictedAdminSections = ['SUPER_ADMIN', 'DIREKTOR', 'NAZORATCHI'].includes(currentUser.role || '');
  // To'lovlar bo'limi rahbariyat (Direktor/Super Admin/Nazoratchi) va
  // to'lovlarni bevosita kirituvchi Kassir uchun ko'rinadi
  const canViewPayments = ['SUPER_ADMIN', 'DIREKTOR', 'NAZORATCHI', 'KASSIR'].includes(currentUser.role || '');
  const visibleMenuItems = menuItems.filter(item => {
    if (!canViewRestrictedAdminSections && ['Xodimlar', 'Sozlamalar', 'Audit Log'].includes(item.id)) return false;
    if (!canViewPayments && item.id === 'To‘lovlar') return false;
    return true;
  });

  return (
    <aside className="w-56 shrink-0 bg-white text-neutral-600 border-r border-neutral-200 flex flex-col h-[calc(100vh-3.25rem)] select-none">
      {/* User Quick Info Box in Sidebar */}
      <div className="px-3 py-2.5 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2.5">
        <div className="relative">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-7 h-7 rounded-md object-cover ring-1 ring-neutral-300"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-neutral-800 rounded-full ring-1 ring-white"></span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="text-xs font-bold text-neutral-900 truncate leading-tight">{currentUser.name}</div>
          <div className="text-[10px] text-neutral-500 font-medium leading-none mt-0.5">{currentUser.position}</div>
        </div>
      </div>

      {/* Navigation Links with Scroll */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[#f0f0f0] text-black'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black' : 'text-neutral-500'}`} />
                <span className={`truncate ${isActive ? 'text-black font-bold' : ''}`}>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && item.badge !== 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold shrink-0 ${
                  isActive ? 'bg-neutral-200 text-neutral-800' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: System Status */}
      <div className="px-3 py-2 border-t border-neutral-200 bg-neutral-50 text-[10px] text-neutral-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800"></span>
          <span className="font-medium text-neutral-600">Tizim: Faol</span>
        </div>
        <span className="text-[9px] text-neutral-500 font-mono">v2.1 HD</span>
      </div>
    </aside>
  );
};
