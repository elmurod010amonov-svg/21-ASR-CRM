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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-lg font-extrabold text-white">21</div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-normal whitespace-nowrap">21-ASRCRM</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">Admin kirish</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Login</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
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
    <div className="h-screen bg-[#F1F3F5] text-slate-900 flex flex-col font-sans antialiased overflow-hidden select-none">
      {/* Top Fixed Header Navbar */}
      <Navbar />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 bg-[#F1F3F5]">
          <div className="max-w-[1600px] mx-auto w-full space-y-4">
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
