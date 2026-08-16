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

export default function App() {
  return (
    <CRMProvider>
      <MainContent />
    </CRMProvider>
  );
}
