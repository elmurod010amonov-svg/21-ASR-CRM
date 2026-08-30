import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Database,
  Receipt,
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
  ChevronRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    taxReports, 
    letters, 
    accounting1C, 
    payments, 
    kameral, 
    issues, 
    tasks, 
    chatRooms 
  } = useCRM();

  // Dynamic badges calculation based on current user role (if accountant, show their pending items, else global)
  const isAccountant = currentUser.role === 'BUXGALTER';
  
  const pendingReportsCount = taxReports.filter(r => 
    r.status === 'TOPSHIRILMAGAN' && (!isAccountant || r.accountantId === currentUser.id)
  ).length;

  const unreadLettersCount = letters.filter(l => 
    (l.status === 'YANGI' || l.status === 'JAVOB_KUTILMOQDA') && (!isAccountant || l.accountantId === currentUser.id)
  ).length;

  const pending1CCount = accounting1C.filter(a => 
    a.oborotkaStatus === 'KIRITILMAGAN' && (!isAccountant || a.accountantId === currentUser.id)
  ).length;

  const debtPaymentsCount = payments.filter(p => 
    p.status === 'TOLANMAGAN' && (!isAccountant || p.accountantId === currentUser.id)
  ).length;

  const activeKameralCount = kameral.filter(k => 
    (k.status === 'OCHIQ' || k.status === 'KAMCHILIK_ANIQLANDI') && (!isAccountant || k.accountantId === currentUser.id)
  ).length;

  const openIssuesCount = issues.filter(i => 
    i.status === 'OCHIQ' && (!isAccountant || i.accountantId === currentUser.id)
  ).length;

  const pendingTasksCount = tasks.filter(t => {
    const hasAssignee = Array.isArray(t.assigneeIds) ? t.assigneeIds.includes(currentUser.id) : false;
    return t.status !== 'BAJARILDI' && (!isAccountant || hasAssignee);
  }).length;

  const unreadChatCount = chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, color: 'text-slate-400' },
    { id: 'Mijozlar', label: 'Mijozlar', icon: Users, badge: null, color: 'text-emerald-400' },
    { id: 'Hisobotlar', label: 'Hisobotlar', icon: FileSpreadsheet, badge: pendingReportsCount, badgeColor: 'bg-rose-500 text-white', color: 'text-blue-400' },
    { id: '1C', label: '1C Nazorati', icon: Database, badge: pending1CCount, badgeColor: 'bg-amber-500 text-white', color: 'text-amber-400' },
    { id: 'Fakturalar', label: 'Fakturalar', icon: Receipt, badge: null, color: 'text-indigo-400' },
    { id: 'To‘lovlar', label: 'To‘lovlar', icon: CreditCard, badge: debtPaymentsCount, badgeColor: 'bg-rose-500 text-white', color: 'text-emerald-400' },
    { id: 'Xatlar', label: 'Xatlar', icon: Mail, badge: unreadLettersCount, badgeColor: 'bg-purple-500 text-white', color: 'text-purple-400' },
    { id: 'Kameral', label: 'Kameral', icon: FileSearch, badge: activeKameralCount, badgeColor: 'bg-rose-500 text-white', color: 'text-rose-400' },
    { id: 'Kamchiliklar', label: 'Kamchiliklar', icon: AlertOctagon, badge: openIssuesCount, badgeColor: 'bg-orange-500 text-white', color: 'text-orange-400' },
    { id: 'Topshiriqlar', label: 'Topshiriqlar', icon: CheckSquare, badge: pendingTasksCount, badgeColor: 'bg-teal-500 text-white', color: 'text-teal-400' },
    { id: 'Eslatmalar', label: 'Eslatmalar', icon: Bell, badge: null, color: 'text-amber-400' },
    { id: 'Chat', label: 'Jamoa Chat', icon: MessageSquare, badge: unreadChatCount, badgeColor: 'bg-emerald-500 text-white', color: 'text-emerald-400' },
    { id: 'AI Maslahatchi', label: 'AI Maslahatchi', icon: Bot, badge: 'AI', badgeColor: 'bg-emerald-600 text-white font-bold', color: 'text-emerald-400' },
    { id: 'Xodimlar', label: 'Xodimlar', icon: UserCheck, badge: null, color: 'text-slate-400' },
    { id: 'Excel Import', label: 'Excel Import', icon: FileUp, badge: null, color: 'text-emerald-400' },
    { id: 'Statistika', label: 'Statistika', icon: BarChart3, badge: null, color: 'text-blue-400' },
    { id: 'Audit Log', label: 'Audit Log', icon: History, badge: null, color: 'text-slate-400' },
    { id: 'Sozlamalar', label: 'Sozlamalar', icon: Settings, badge: null, color: 'text-slate-400' },
  ];

  const canViewRestrictedAdminSections = ['SUPER_ADMIN', 'DIREKTOR'].includes(currentUser.role || '');
  const visibleMenuItems = canViewRestrictedAdminSections
    ? menuItems
    : menuItems.filter(item => item.id !== 'Xodimlar' && item.id !== 'Sozlamalar' && item.id !== 'Audit Log');

  return (
    <aside className="w-56 shrink-0 bg-[#1A1C1E] text-slate-300 border-r border-slate-800 flex flex-col h-[calc(100vh-3.25rem)] select-none">
      {/* User Quick Info Box in Sidebar */}
      <div className="px-3 py-2.5 border-b border-slate-800/90 bg-black/20 flex items-center gap-2.5">
        <div className="relative">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-7 h-7 rounded-md object-cover ring-1 ring-emerald-500/50"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-[#1A1C1E]"></span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</div>
          <div className="text-[10px] text-emerald-400 font-medium leading-none mt-0.5">{currentUser.position}</div>
        </div>
      </div>

      {/* Navigation Links with Scroll */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 dark-scrollbar">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: System Status */}
      <div className="px-3 py-2 border-t border-slate-800 bg-black/30 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-300">Tizim: Faol</span>
        </div>
        <span className="text-[9px] text-slate-400 font-mono">v2.1 HD</span>
      </div>
    </aside>
  );
};
