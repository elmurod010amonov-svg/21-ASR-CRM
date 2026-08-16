import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Activity,
  Zap,
  Wrench,
  Database
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    employees, 
    switchUserRole, 
    setGlobalSearchOpen, 
    currentPeriod, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    setActiveTab,
    resetToDemoData,
    isDemoMode,
    logoutUser,
    switchToRealMode,
    switchToDemoMode,
    toggleDemoMode,
    scanResult,
    runDatabaseScan,
    updateEmployeeAvatar,

    setIsScannerModalOpen
  } = useCRM();


  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);
  const currentHealth = scanResult?.healthScore ?? 100;
  const issuesCount = scanResult?.totalIssues ?? 0;

  const handleOwnAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || currentUser.id === 'guest') return;

    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || /\.(jpe?g|png)$/i.test(file.name);
    if (!isJpgOrPng) {
      alert('Faqat JPG yoki PNG formatdagi rasm yuklash mumkin.');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Rasm hajmi 3 MB dan oshmasligi kerak.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl) return;
      updateEmployeeAvatar(currentUser.id, dataUrl);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-13 px-3 sm:px-4 md:px-5 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Left: Brand Identity & Fast Search */}
      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
            21
          </div>
          <div className="hidden sm:block min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-slate-900 text-sm whitespace-nowrap tracking-normal">21-ASRCRM</span>
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">PRO</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-1 whitespace-nowrap">Buxgalteriya & Nazorat</p>
          </div>
        </div>

        {/* Global Search Bar button */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-500 transition-all text-xs font-medium w-40 md:w-64 lg:w-72 group shadow-2xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="truncate text-slate-500 text-[11px]">Mijoz, STIR, xat, hisobot...</span>
          <kbd className="ml-auto hidden md:inline-flex px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-white border border-slate-300 rounded text-slate-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Demo/Real Toggle, DB Scanner, Period, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Demo Mode / Real Mode Switch Button (Key User Request) */}
        <div className="flex items-center">
          {isDemoMode ? (
            <button
              onClick={switchToRealMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer animate-pulse"
              title="Demo rejimni o'chirish va real ishchi bazaga o'tish"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Demo O'chirish:</span>
              <span>Reallikka O'tish</span>
            </button>
          ) : (
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
              title="Real ishchi rejim faol. Bazani skanerlash uchun bosing."
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span className="hidden sm:inline">🟢 Real Baza:</span>
              <span className="text-[11px] font-mono">Faol</span>
            </button>
          )}
        </div>

        {/* Database Health Scanner Trigger Button */}
        <button
          onClick={() => {
            runDatabaseScan();
            setIsScannerModalOpen(true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
            issuesCount > 0 
              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          title="Baza diagnostikasi va audit skaneri"
        >
          <Activity className={`w-3.5 h-3.5 ${issuesCount > 0 ? 'text-amber-600 animate-spin' : 'text-emerald-600'}`} />
          <span className="hidden md:inline">Baza Auditi:</span>
          <span className={`font-mono text-[11px] font-black ${
            currentHealth >= 90 ? 'text-emerald-600' : currentHealth >= 70 ? 'text-amber-600' : 'text-rose-600'
          }`}>
            {currentHealth}%
          </span>
          {issuesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-600 text-white">
              {issuesCount}
            </span>
          )}
        </button>

        {/* Active Period & Deadline Countdown */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-bold text-xs">{currentPeriod.name}</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold font-mono text-slate-600">
            15-avgust
          </span>
        </div>

        {/* Dynamic Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setNotifDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition-all shadow-2xs cursor-pointer"
            title="Rolni almashtirish"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline font-semibold text-[11px]">Rol:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
              currentUser.role === 'DIREKTOR' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
              currentUser.role === 'NAZORATCHI' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              currentUser.role === 'KASSIR' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
              'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {currentUser.role}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 animate-in fade-in duration-100">
              <div className="px-2.5 py-1.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800">Foydalanuvchi va Rol Tanlash</div>
                <div className="text-[10px] text-slate-400">Tizimni istalgan rol nomidan tekshirib ko'ring:</div>
              </div>
              <div className="mt-1 space-y-0.5">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      switchUserRole(emp.role, emp.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                      currentUser.id === emp.id ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-slate-900 truncate text-[11px]">{emp.name}</div>
                      <div className="text-[9px] text-slate-400">{emp.position}</div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      emp.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      emp.role === 'DIREKTOR' ? 'bg-blue-100 text-blue-800' :
                      emp.role === 'NAZORATCHI' ? 'bg-amber-100 text-amber-800' :
                      emp.role === 'KASSIR' ? 'bg-cyan-100 text-cyan-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {emp.role === 'SUPER_ADMIN' ? 'Admin' : emp.role === 'DIREKTOR' ? 'Direktor' : emp.role === 'NAZORATCHI' ? 'Audit' : emp.role === 'KASSIR' ? 'Kassir' : 'Buxgalter'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setRoleDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="relative p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Eslatmalar va Xabarnomalar"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-rose-600 rounded-full">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Xabarnomalar Markazi</span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-700 rounded-full">
                      {unreadNotifs.length} yangi
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    Barchasini o'qildi qilish
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-1 divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Hech qanday xabarnoma yo'q</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkModule) setActiveTab(n.linkModule);
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        n.read ? 'hover:bg-slate-50 opacity-75' : 'bg-emerald-50/60 hover:bg-emerald-100/60 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          {n.type === 'DEADLINE' ? <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> :
                           n.type === 'TASK' ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" /> :
                           <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span className="truncate text-[11px]">{n.title}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 shrink-0 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Options */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setRoleDropdownOpen(false);
              setNotifDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-6 h-6 rounded-md object-cover ring-1 ring-emerald-500/40"
            />
            <div className="hidden xl:block text-left pr-1">
              <div className="text-[11px] font-bold text-slate-900 leading-tight truncate max-w-[100px]">{currentUser.name}</div>
              <div className="text-[9px] text-slate-500 leading-none">{currentUser.position}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 animate-in fade-in duration-100">
              <div className="p-2.5 border-b border-slate-100 flex items-center gap-2.5">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-lg object-cover" />
                <div className="overflow-hidden flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="text-[9px] font-semibold text-emerald-600 mt-0.5 font-mono">{currentUser.phone}</div>
                </div>
              </div>
              <div className="p-1 space-y-0.5 text-xs">
                <label className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11px]">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleOwnAvatarUpload}
                  />
                  <User className="w-3.5 h-3.5 text-emerald-600" /> Profil rasmini yuklash (JPG/PNG)
                </label>
                <button
                  onClick={() => {
                    setIsScannerModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11px]"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Baza Diagnostikasi & Skaner
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Xodimlar');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11px]"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" /> Shaxsiy Profilim
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Sozlamalar');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Tizim Sozlamalari
                </button>
                <button
                  onClick={() => {
                    toggleDemoMode();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11px]"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" /> {isDemoMode ? "Real Rejimga O'tish" : "Demo Rejimga O'tish"}
                </button>
                <button
                  onClick={() => {
                    resetToDemoData();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-amber-700 hover:bg-amber-50 cursor-pointer font-medium text-[11px]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Namuna ma'lumotlarni qayta tiklash
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 cursor-pointer font-medium text-[11px]"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Chiqish (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
