import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  User,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setGlobalSearchOpen,
    currentPeriod, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    setActiveTab,
    logoutUser,
    scanResult,
    runDatabaseScan,
    updateEmployeeAvatar,
    setIsScannerModalOpen,
    setPendingChatRoomId,
  } = useCRM();


  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => {
    if (n.read) return false;
    if (!n.recipientIds || n.recipientIds.length === 0) return true;
    return n.recipientIds.includes(currentUser.id);
  });
  const myNotifications = notifications.filter(n => {
    if (!n.recipientIds || n.recipientIds.length === 0) return true;
    return n.recipientIds.includes(currentUser.id);
  });
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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white font-extrabold text-sm">
            21
          </div>
          <div className="hidden sm:block min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-neutral-900 text-sm whitespace-nowrap tracking-normal">21-ASR CRM</span>
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-100 text-neutral-700 uppercase">PRO</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-medium leading-none mt-1 whitespace-nowrap">Buxgalteriya & Nazorat</p>
          </div>
        </div>

        {/* Global Search Bar button */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 transition-all text-xs font-semibold w-40 md:w-64 lg:w-72 group cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          <span className="truncate text-neutral-500 text-[11px] font-medium">Mijoz, STIR, xat, hisobot...</span>
          <kbd className="ml-auto hidden md:inline-flex px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-white border border-slate-300 rounded text-slate-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: DB Scanner, Period, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
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

        {/* Current Role Badge (read-only — hech kim boshqa profilga o'ta olmaydi) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-2xs">
          <span className="font-semibold text-[11px]">Rol:</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
            {currentUser.role}
          </span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
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
                    className="text-[10px] text-neutral-700 hover:text-black font-semibold cursor-pointer"
                  >
                    Barchasini o'qildi qilish
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-1 divide-y divide-slate-100">
                {myNotifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Hech qanday xabarnoma yo'q</div>
                ) : (
                  myNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkModule === 'Chat' && n.relatedId) {
                          setPendingChatRoomId(n.relatedId);
                        }
                        if (n.linkModule) setActiveTab(n.linkModule);
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        n.read ? 'hover:bg-neutral-50 opacity-75' : 'bg-neutral-50 hover:bg-neutral-100 font-medium'
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
              setNotifDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-6 h-6 rounded-md object-cover ring-1 ring-neutral-300"
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
                  <div className="text-[9px] font-semibold text-neutral-600 mt-0.5 font-mono">{currentUser.phone}</div>
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
                  <User className="w-3.5 h-3.5 text-neutral-600" /> Profil rasmini yuklash (JPG/PNG)
                </label>
                <button
                  onClick={() => {
                    setIsScannerModalOpen(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11px]"
                >
                  <Activity className="w-3.5 h-3.5 text-neutral-600" /> Baza Diagnostikasi & Skaner
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
