import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ClientCardModal } from './components/client/ClientCardModal';
import { DatabaseScannerModal } from './components/database/DatabaseScannerModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientList } from './components/client/ClientList';
import { ReportsView } from './components/reports/ReportsView';
import { Accounting1CView } from './components/accounting1c/Accounting1CView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { LettersView } from './components/letters/LettersView';
import { KameralView } from './components/kameral/KameralView';
import { IssuesView } from './components/issues/IssuesView';
import { TasksView } from './components/tasks/TasksView';
import { RemindersView } from './components/reminders/RemindersView';
import { ChatView } from './components/chat/ChatView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ExcelImportView } from './components/excel/ExcelImportView';
import { StatisticsView } from './components/statistics/StatisticsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsView } from './components/settings/SettingsView';

const GuestLoginGate: React.FC = () => {
  const { loginUser } = useCRM();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginUser(identifier.trim(), password);
    if (!ok) {
      setError('Noto‘g‘ri login yoki parol.');
      return;
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30 text-2xl font-black text-white">21</div>
          <h1 className="text-3xl font-black text-white tracking-wide">21-ASR CRM</h1>
          <p className="mt-2 text-sm font-semibold text-white/80">Buxgalteriya va Nazorat Tizimi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/90 mb-1.5">Login / STIR</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Login yoki STIR kiriting"
              autoComplete="username"
              className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-medium text-white placeholder-white/50 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/90 mb-1.5">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-medium text-white placeholder-white/50 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 transition-all"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-xs font-bold text-white">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.98] transition-all"
          >
            Tizimga kirish
          </button>
        </form>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeTab } = useCRM();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Mijozlar':
        return <ClientList />;
      case 'Hisobotlar':
        return <ReportsView />;
      case '1C':
        return <Accounting1CView />;
      case 'Fakturalar':
        return <InvoicesView />;
      case 'To‘lovlar':
        return <PaymentsView />;
      case 'Xatlar':
        return <LettersView />;
      case 'Kameral':
        return <KameralView />;
      case 'Kamchiliklar':
        return <IssuesView />;
      case 'Topshiriqlar':
        return <TasksView />;
      case 'Eslatmalar':
        return <RemindersView />;
      case 'Chat':
        return <ChatView />;
      case 'AI Maslahatchi':
        return <AIAssistantView />;
      case 'Xodimlar':
        return <EmployeesView />;
      case 'Excel Import':
        return <ExcelImportView />;
      case 'Statistika':
        return <StatisticsView />;
      case 'Audit Log':
        return <AuditLogView />;
      case 'Sozlamalar':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col font-sans antialiased overflow-hidden select-none">
      {/* Top Fixed Header Navbar */}
      <Navbar />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50">
          <div className="max-w-[1700px] mx-auto w-full space-y-5">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* 360° Client Card Modal Overlay */}
      <ClientCardModal />

      {/* Instant 360° Global Search Overlay (Ctrl+K) */}
      <GlobalSearchModal />

      {/* Real-time Database Diagnostics & Auto-Fix Modal */}
      <DatabaseScannerModal />
    </div>
  );
};

const AppShell: React.FC = () => {
  const { currentUser } = useCRM();
  return currentUser.id === 'guest' ? <GuestLoginGate /> : <MainContent />;
};

export default function App() {
  return (
    <CRMProvider>
      <AppShell />
    </CRMProvider>
  );
}