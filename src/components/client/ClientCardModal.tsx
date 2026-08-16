import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  FileText, 
  Database, 
  Receipt, 
  CreditCard, 
  Mail, 
  FileSearch, 
  AlertOctagon, 
  CheckSquare, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  MapPin, 
  User, 
  DollarSign, 
  Calendar,
  Plus,
  ArrowUpRight,
  Send,
  Eye,
  Sliders
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ReportStatus, Status1C, ProofAttachment, TaxReport, ReportType } from '../../types';
import { ProofUploadModal } from '../common/ProofUploadModal';
import { ProofViewerModal } from '../common/ProofViewerModal';
import { ClientReportFormsConfigModal } from '../common/ClientReportFormsConfigModal';

export const ClientCardModal: React.FC = () => {
  const { 
    selectedClientIdForModal, 
    closeClientCard, 
    clients, 
    taxReports, 
    accounting1C, 
    payments, 
    letters, 
    kameral, 
    issues, 
    tasks, 
    auditLogs, 
    updateTaxReportStatus, 
    toggle1COborotka, 
    recordPayment, 
    markLetterAsRead,
    createTask,
    createIssue,
    currentUser,
    setClientReportTypes,
    updateClient
  } = useCRM();

  const client = selectedClientIdForModal ? clients.find(c => c.id === selectedClientIdForModal) : undefined;

  const [activeTab, setActiveTab] = useState<string>('Umumiy');
  const [showReportConfigModal, setShowReportConfigModal] = useState<boolean>(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentNotesInput, setPaymentNotesInput] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editForm, setEditForm] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    address: client?.address || '',
    monthlyFee: String(client?.monthlyFee || 0),
    notes: client?.notes || '',
    type: client?.type || 'YURIDIK',
    taxType: client?.taxType || 'AYLANMA',
  });

  // New task quick form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('2026-08-15');
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Tax report proof modal states
  const [reportForProof, setReportForProof] = useState<TaxReport | null>(null);
  const [selectedProofForView, setSelectedProofForView] = useState<{
    proof: ProofAttachment;
    title: string;
  } | null>(null);

  if (!selectedClientIdForModal || !client) return null;

  // Filtered data for this client
  const clientReports = taxReports.filter(r => r.clientId === client.id);
  const client1C = accounting1C.find(a => a.clientId === client.id);
  const clientPayment = payments.find(p => p.clientId === client.id);
  const clientLetters = letters.filter(l => l.clientId === client.id);
  const clientKameral = kameral.filter(k => k.clientId === client.id);
  const clientIssues = issues.filter(i => i.clientId === client.id);
  const clientTasks = tasks.filter(t => t.clientId === client.id);
  const clientLogs = auditLogs.filter(l => l.objectName.includes(client.name) || l.objectId === client.id);

  // 360 Health indicators
  const reportsSubmitted = clientReports.filter(r => r.status === 'TOPSHIRILDI').length;
  const reportsTotalRequired = clientReports.filter(r => r.status !== 'TALAB_QILINMAYDI').length;
  const reportsHealth = reportsTotalRequired === 0 ? 'NEUTRAL' : reportsSubmitted === reportsTotalRequired ? 'GOOD' : 'WARNING';

  const oneCHealth = client1C?.oborotkaStatus === 'KIRITILGAN' ? 'GOOD' : 'BAD';
  const paymentHealth = clientPayment?.status === 'TOLANGAN' ? 'GOOD' : clientPayment?.status === 'QISMAN' ? 'WARNING' : 'BAD';
  const letterHealth = clientLetters.some(l => l.status === 'YANGI' || l.status === 'JAVOB_KUTILMOQDA') ? 'WARNING' : 'GOOD';
  const kameralHealth = clientKameral.some(k => k.status === 'KAMCHILIK_ANIQLANDI' || k.status === 'OCHIQ') ? 'BAD' : 'GOOD';
  const issuesHealth = clientIssues.some(i => i.status === 'OCHIQ') ? 'BAD' : 'GOOD';

  const tabs = [
    { id: 'Umumiy', label: '1. Umumiy (360°)', icon: Building2 },
    { id: 'Hisobotlar', label: `2. Hisobotlar (${clientReports.length})`, icon: FileText },
    { id: '1C', label: '3. 1C Nazorati', icon: Database },
    { id: 'Fakturalar', label: '4. Fakturalar', icon: Receipt },
    { id: 'To‘lovlar', label: '5. To‘lovlar', icon: CreditCard },
    { id: 'Xatlar', label: `6. Xatlar (${clientLetters.length})`, icon: Mail },
    { id: 'Kameral', label: `7. Kameral (${clientKameral.length})`, icon: FileSearch },
    { id: 'Kamchiliklar', label: `8. Kamchiliklar (${clientIssues.length})`, icon: AlertOctagon },
    { id: 'Topshiriqlar', label: `9. Topshiriqlar (${clientTasks.length})`, icon: CheckSquare },
    { id: 'Tarix', label: '10. Tarix & Audit', icon: History },
  ];

  const canManagePayments = currentUser.role === 'KASSIR';
  const canEditClient = ['SUPER_ADMIN', 'DIREKTOR', 'BUXGALTER', 'NAZORATCHI'].includes(currentUser.role);

  React.useEffect(() => {
    if (client) {
      setEditForm({
        name: client.name,
        phone: client.phone,
        address: client.address,
        monthlyFee: String(client.monthlyFee || 0),
        notes: client.notes || '',
        type: client.type,
        taxType: client.taxType,
      });
    }
  }, [client]);

  const handleClientEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    if (!canEditClient) {
      alert('Faqat admin yoki mas’ul buxgalter mijoz ma’lumotlarini tahrirlay oladi.');
      return;
    }

    updateClient(client.id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      monthlyFee: Number(editForm.monthlyFee) || 0,
      notes: editForm.notes.trim(),
      type: editForm.type as any,
      taxType: editForm.taxType as any,
    });

    setIsEditingClient(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePayments) {
      alert('Faqat kassir to\'lov summasini qo\'shishi va o\'zgartirishi mumkin.');
      return;
    }
    const amount = parseInt(paymentAmountInput.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) return;
    recordPayment(client.id, amount, paymentNotesInput);
    setPaymentAmountInput('');
    setPaymentNotesInput('');
    setShowPaymentForm(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    createTask({
      title: taskTitle,
      description: `${client.name} bo'yicha maxsus vazifa`,
      clientId: client.id,
      clientName: client.name,
      stir: client.stir,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      assigneeIds: [client.accountantId],
      assigneeNames: [client.accountantName],
      deadlineDate: taskDeadline,
      priority: 'MUHIM',
      status: 'YANGI',
    });
    setTaskTitle('');
    setShowTaskForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Client Identity */}
        <div className="flex items-start justify-between p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Building2 className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-white">{client.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300">
                  <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    STIR: <strong className="text-emerald-400">{client.stir}</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${client.type === 'YATT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                    {client.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-800 text-slate-200 border border-slate-700">
                    Soliq turi: {client.taxType}
                  </span>
                  <span className="text-slate-400">
                    Mas'ul: <strong className="text-white">{client.accountantName}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEditClient && (
              <button
                onClick={() => setIsEditingClient(!isEditingClient)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                {isEditingClient ? 'Bekor qilish' : 'Tahrirlash'}
              </button>
            )}
            <button
              onClick={closeClientCard}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 10 TAB Bar */}
        <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-slate-50 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
          {/* TAB 1: UMUMIY 360° VIEW */}
          {activeTab === 'Umumiy' && (
            <div className="space-y-6">
              {isEditingClient && (
                <form onSubmit={handleClientEditSubmit} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-sm">Mijoz ma’lumotlarini tahrirlash</h4>
                    <span className="text-[10px] text-slate-500">Admin nazorati</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomi</label>
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Telefon</label>
                      <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Turi</label>
                      <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
                        <option value="YURIDIK">Yuridik</option>
                        <option value="YATT">YaTT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Soliq turi</label>
                      <select value={editForm.taxType} onChange={(e) => setEditForm({ ...editForm, taxType: e.target.value as any })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs">
                        <option value="AYLANMA">AYLANMA</option>
                        <option value="QQS">QQS</option>
                        <option value="FOYDA">FOYDA</option>
                        <option value="YATT_QATQIY">YATT_QATQIY</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Manzil</label>
                      <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Oylik to'lov</label>
                      <input type="number" value={editForm.monthlyFee} onChange={(e) => setEditForm({ ...editForm, monthlyFee: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">STIR</label>
                      <input value={client.stir} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-100 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Izoh</label>
                    <textarea rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditingClient(false)} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer">Bekor qilish</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-[11px] cursor-pointer">Saqlash</button>
                  </div>
                </form>
              )}

              {/* 360 Health Status Cards Strip */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Mijozning 360° Umumiy Holati</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    reportsHealth === 'GOOD' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' :
                    reportsHealth === 'WARNING' ? 'bg-amber-50/80 border-amber-200 text-amber-900' :
                    'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hisobotlar</div>
                    <div className="text-lg font-black mt-1">
                      {reportsHealth === 'GOOD' ? '🟢 Topshirilgan' : reportsHealth === 'WARNING' ? '🟡 Jarayonda' : '🔴 Qolgan'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{reportsSubmitted}/{reportsTotalRequired} topshirildi</div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    oneCHealth === 'GOOD' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">1C Oborotka</div>
                    <div className="text-lg font-black mt-1">
                      {oneCHealth === 'GOOD' ? '🟢 Kiritilgan' : '🔴 Kiritilmagan'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{client1C?.oborotkaDate || 'Sana belgilanmagan'}</div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    paymentHealth === 'GOOD' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' :
                    paymentHealth === 'WARNING' ? 'bg-amber-50/80 border-amber-200 text-amber-900' :
                    'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">To‘lov Holati</div>
                    <div className="text-lg font-black mt-1">
                      {paymentHealth === 'GOOD' ? '🟢 To‘langan' : paymentHealth === 'WARNING' ? '🟡 Qisman' : '🔴 Qarz'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{clientPayment?.debtAmount ? `${clientPayment.debtAmount.toLocaleString()} so'm qarz` : 'Qarz yo\'q'}</div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    letterHealth === 'GOOD' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-purple-50/80 border-purple-200 text-purple-900'
                  }`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Soliq Xatlari</div>
                    <div className="text-lg font-black mt-1">
                      {clientLetters.length === 0 ? '⚪ Xat yo‘q' : letterHealth === 'GOOD' ? '🟢 Javob berildi' : '🟡 Kutilmoqda'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{clientLetters.length} ta xat mavjud</div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    kameralHealth === 'GOOD' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kameral</div>
                    <div className="text-lg font-black mt-1">
                      {clientKameral.length === 0 ? '⚪ Muammo yo‘q' : kameralHealth === 'GOOD' ? '🟢 Yopilgan' : '🔴 Kamchilik bor'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{clientKameral.length} ta tekshiruv</div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    issuesHealth === 'GOOD' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-orange-50/80 border-orange-200 text-orange-900'
                  }`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kamchiliklar</div>
                    <div className="text-lg font-black mt-1">
                      {issuesHealth === 'GOOD' ? '🟢 Bartaraf' : '🔴 Ochiq'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{clientIssues.filter(i => i.status === 'OCHIQ').length} ta ochiq kamchilik</div>
                  </div>
                </div>
              </div>

              {/* Client Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact & Contract Card */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aloqa va Shartnoma</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Telefon:</span>
                      <span className="font-semibold text-slate-900">{client.phone}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Manzil:</span>
                      <span className="font-semibold text-slate-900 text-right truncate max-w-[220px]">{client.address}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Mas'ul buxgalter:</span>
                      <span className="font-bold text-emerald-700">{client.accountantName}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> Oylik xizmat haqqi:</span>
                      <span className="font-black text-slate-900">{client.monthlyFee.toLocaleString()} so'm</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Shartnoma sanasi:</span>
                      <span className="font-semibold text-slate-900">{client.contractDate}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Quick Actions Card */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Izoh va Eslatmalar</h4>
                    <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                      {client.notes || "Hech qanday qo'shimcha izoh kiritilmagan."}
                    </p>
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {client.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTab('Hisobotlar')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Hisobotlarni topshirish
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('Topshiriqlar');
                        setShowTaskForm(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Topshiriq berish
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('To‘lovlar');
                        setShowPaymentForm(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      To'lov yozish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISOBOTLAR */}
          {activeTab === 'Hisobotlar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Soliq Hisobotlari (Avgust 2026)</h3>
                  <p className="text-xs text-slate-500">Mijoz uchun talab etiladigan oylik hisobotlar holati</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportConfigModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Hisobot Shakllarini Sozlash (Admin)</span>
                </button>
              </div>

              {/* Admin Assigned Forms Info Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <span className="font-medium text-slate-700">
                    Admin tomonidan belgilangan soliq shakllari ({clientReports.length} ta):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {clientReports.map(r => (
                      <span key={r.id} className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono font-bold text-slate-800 text-[10px]">
                        {r.reportType}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportConfigModal(true)}
                  className="text-indigo-600 font-bold hover:underline shrink-0 text-xs cursor-pointer"
                >
                  O'zgartirish ✎
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Hisobot Turi</th>
                      <th className="p-3">Holati</th>
                      <th className="p-3">Topshirgan Shaxs</th>
                      <th className="p-3">Sana & Vaqt</th>
                      <th className="p-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">Hisobotlar kiritilmagan</td>
                      </tr>
                    ) : (
                      clientReports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono">
                              {report.reportType}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              report.status === 'TOPSHIRILDI' ? 'bg-emerald-100 text-emerald-800' :
                              report.status === 'JARAYONDA' ? 'bg-amber-100 text-amber-800' :
                              report.status === 'TALAB_QILINMAYDI' ? 'bg-slate-100 text-slate-600' :
                              'bg-rose-100 text-rose-800 animate-pulse'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{report.submittedBy || '—'}</td>
                          <td className="p-3 text-slate-500">
                            {report.submittedAt ? (
                              <div className="flex items-center gap-1.5">
                                <span>{report.submittedAt}</span>
                                {report.proofAttachment && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProofForView({
                                      proof: report.proofAttachment!,
                                      title: `${client.name} — ${report.reportType} hisoboti isboti`,
                                    })}
                                    className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer"
                                    title="Isbot hujjatini ko'rish (JPG/PDF)"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ) : '—'}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {report.status !== 'TOPSHIRILDI' ? (
                                <button
                                  onClick={() => setReportForProof(report)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer shadow-xs flex items-center gap-1"
                                >
                                  <span>Topshirildi ✓</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setReportForProof(report)}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] cursor-pointer"
                                  title="Isbot hujjatini almashtirish"
                                >
                                  Isbot
                                </button>
                              )}
                              {report.status !== 'JARAYONDA' && report.status !== 'TOPSHIRILDI' && (
                                <button
                                  onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] cursor-pointer"
                                >
                                  Jarayonda
                                </button>
                              )}
                              {report.status === 'TOPSHIRILDI' && (
                                <button
                                  onClick={() => updateTaxReportStatus(report.id, 'JARAYONDA')}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                                >
                                  Qaytarish
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: 1C NAZORATI */}
          {activeTab === '1C' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">1C Buxgalteriya Bazasining Holati</h3>
                    <p className="text-xs text-slate-500">Oborotka va elektron fakturalarni 1C ga o'tkazish nazorati</p>
                  </div>
                  {client1C && (
                    <button
                      onClick={() => toggle1COborotka(client1C.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        client1C.oborotkaStatus === 'KIRITILGAN'
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {client1C.oborotkaStatus === 'KIRITILGAN' ? 'Kiritilmagan deb belgilash' : '1C Oborotka Kiritildi'}
                    </button>
                  )}
                </div>

                {client1C ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-xs text-slate-500">Oborotka Holati</div>
                      <div className="font-bold text-sm text-slate-900">
                        {client1C.oborotkaStatus === 'KIRITILGAN' ? '🟢 Kiritilgan' : '🔴 Kiritilmagan'}
                      </div>
                      <div className="text-[11px] text-slate-400">Oxirgi yangilanish: {client1C.lastUpdated || '—'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-xs text-slate-500">Kirim Fakturalar (Didox → 1C)</div>
                      <div className="font-bold text-sm text-slate-900">
                        {client1C.incomingInvoicesEntered} / {client1C.incomingInvoicesCount} ta kiritildi
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600">
                        {client1C.incomingStatus === 'KIRITILGAN' ? 'To\'liq' : 'Qolgan'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-xs text-slate-500">Chiqim Fakturalar (1C → Didox)</div>
                      <div className="font-bold text-sm text-slate-900">
                        {client1C.outgoingInvoicesEntered} / {client1C.outgoingInvoicesCount} ta kiritildi
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600">
                        {client1C.outgoingStatus === 'KIRITILGAN' ? 'To\'liq' : 'Qolgan'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">1C yozuvi mavjud emas</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FAKTURALAR */}
          {activeTab === 'Fakturalar' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Didox / Elektron Fakturalar Hisoboti</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kirim fakturalar soni: <strong>{client1C?.incomingInvoicesCount || 0} ta</strong> &bull; 
                  Chiqim fakturalar soni: <strong>{client1C?.outgoingInvoicesCount || 0} ta</strong>
                </p>
                <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  Didox API ulagichi tayyor holatda. Fakturalar ro'yxati 1C ga avtomatik solishtiriladi.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TO‘LOVLAR */}
          {activeTab === 'To‘lovlar' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Buxgalteriya Xizmat To'lovlari</h3>
                    <p className="text-xs text-slate-500">Mijozning shartnoma bo'yicha to'lov intizomi</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    + To'lov Qabul Qilish
                  </button>
                </div>

                {showPaymentForm && (
                  <form onSubmit={handleRecordPayment} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-slate-800">To'lovni qayd qilish</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Summa (so'm)... masalan 2500000"
                        value={paymentAmountInput}
                        onChange={(e) => setPaymentAmountInput(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Izoh (masalan: Avgust oyi bank orqali)"
                        value={paymentNotesInput}
                        onChange={(e) => setPaymentNotesInput(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className="px-3 py-1 text-xs rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        Saqlash
                      </button>
                    </div>
                  </form>
                )}

                {clientPayment && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400">Oylik Shartnoma:</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{clientPayment.monthlyFee.toLocaleString()} so'm</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700">To'langan:</span>
                      <div className="font-bold text-emerald-900 text-sm mt-0.5">{clientPayment.paidAmount.toLocaleString()} so'm</div>
                    </div>
                    <div className={`p-3 rounded-xl border ${clientPayment.debtAmount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={clientPayment.debtAmount > 0 ? 'text-rose-700' : 'text-slate-400'}>Qoldiq Qarz:</span>
                      <div className="font-bold text-rose-900 text-sm mt-0.5">{clientPayment.debtAmount.toLocaleString()} so'm</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400">Keyingi To'lov:</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{clientPayment.nextDueDate}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: XATLAR */}
          {activeTab === 'Xatlar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Soliq Idorasi va Davlat Organlari Xatlari</h3>
              </div>

              {clientLetters.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                  Ushbu mijoz nomiga rasmiy xatlar mavjud emas.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientLetters.map((l) => (
                    <div 
                      key={l.id} 
                      className={`p-4 rounded-xl border bg-white space-y-2 transition-all ${
                        l.status === 'YANGI' ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{l.letterNumber}</span>
                            <span className="text-xs text-slate-500 font-medium">({l.type})</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              l.status === 'YANGI' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                              l.status === 'OQILGAN' ? 'bg-blue-100 text-blue-800' :
                              l.status === 'JAVOB_BERILDI' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{l.summary}</p>
                        </div>

                        {l.status === 'YANGI' && (
                          <button
                            onClick={() => markLetterAsRead(l.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> O'qildi
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>Kelgan sana: <strong>{l.receivedDate}</strong></span>
                        <span>O'qilgan: <strong className="text-blue-700">{l.readAt || 'Hali o\'qilmagan'}</strong> ({l.readBy || '—'})</span>
                        <span>Javob muddati: <strong className="text-rose-700">{l.responseDeadline}</strong></span>
                        {l.repliedAt && <span className="text-emerald-700">Javob berildi: <strong>{l.repliedAt}</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: KAMERAL */}
          {activeTab === 'Kameral' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Kameral Soliq Tekshiruvlari</h3>
              {clientKameral.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                  Ushbu mijoz bo'yicha kameral tekshiruvlar yo'q.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientKameral.map((k) => (
                    <div key={k.id} className="p-4 bg-white rounded-xl border border-rose-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{k.auditType}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          {k.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{k.summary}</p>
                      {k.discrepancyAmount && (
                        <div className="text-xs font-bold text-rose-700">
                          Tafovut summasi: {k.discrepancyAmount.toLocaleString()} so'm
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>Kelgan sana: {k.receivedDate}</span>
                        <span>Deadline: <strong className="text-rose-700">{k.deadlineDate}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: KAMCHILIKLAR */}
          {activeTab === 'Kamchiliklar' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Kamchiliklar va Tafovutlar</h3>
              {clientIssues.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                  Kamchiliklar mavjud emas.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientIssues.map((i) => (
                    <div key={i.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{i.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          i.status === 'TUZATILDI' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {i.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{i.description}</p>
                      <div className="text-[10px] text-slate-400">
                        Yaratdi: {i.creatorName} &bull; Deadline: {i.deadlineDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: TOPSHIRIQLAR */}
          {activeTab === 'Topshiriqlar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Mijoz Bo'yicha Topshiriqlar</h3>
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
                >
                  + Yangi Topshiriq
                </button>
              </div>

              {showTaskForm && (
                <form onSubmit={handleCreateTask} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-slate-800">Topshiriq berish</div>
                  <input
                    type="text"
                    placeholder="Topshiriq nomi..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="date"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(false)}
                        className="px-3 py-1 text-xs rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        Biriktirish
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {clientTasks.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                  Ushbu mijozga biriktirilgan topshiriqlar yo'q.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientTasks.map((t) => (
                    <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{t.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{t.description}</p>
                      <div className="text-[10px] text-slate-400">
                        Mas'ul: {t.assigneeNames.join(', ')} &bull; Deadline: {t.deadlineDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: TARIX & AUDIT */}
          {activeTab === 'Tarix' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Mijoz Tarixi va Barcha O'zgarishlar Jurnali</h3>
              <div className="bg-white rounded-xl border border-slate-200 p-3 divide-y divide-slate-100 max-h-80 overflow-y-auto text-xs">
                {clientLogs.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Ushbu mijoz bo'yicha audit yozuvlari topilmadi.</div>
                ) : (
                  clientLogs.map((log) => (
                    <div key={log.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <div className="text-slate-600">
                        Xodim: <strong>{log.userName}</strong> ({log.userRole})
                      </div>
                      {log.oldValue && log.newValue && (
                        <div className="text-[11px] text-slate-500">
                          O'zgarish: <span className="line-through text-rose-600">{log.oldValue}</span> &rarr; <span className="font-semibold text-emerald-700">{log.newValue}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>21-ASR Mijoz 360° Karta Boshqaruvi</span>
          <button
            onClick={closeClientCard}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>

      {/* Proof Upload Modal for Tax Report */}
      {reportForProof && (
        <ProofUploadModal
          isOpen={!!reportForProof}
          title="Soliq Hisoboti Topshirilganligini Tasdiqlash"
          subtitle="Qat'iy qoida: Soliq portali kvitansiyasi yoki skrinshoti (JPG, PNG yoki PDF) majburiy"
          targetName={`${reportForProof.reportType} hisoboti`}
          targetLabel="Soliq Hisoboti Shakli:"
          clientInfo={{
            name: client.name,
            stir: client.stir,
          }}
          actionLabel="Isbotni yuklash va Topshirildi deb tasdiqlash"
          onClose={() => setReportForProof(null)}
          onConfirm={(proof, notes) => {
            updateTaxReportStatus(reportForProof.id, 'TOPSHIRILDI', notes, proof);
            setReportForProof(null);
          }}
        />
      )}

      {/* Proof Viewer Modal */}
      {selectedProofForView && (
        <ProofViewerModal
          isOpen={!!selectedProofForView}
          proof={selectedProofForView.proof}
          targetTitle={selectedProofForView.title}
          onClose={() => setSelectedProofForView(null)}
        />
      )}

      {/* Admin Report Forms Config Modal */}
      {showReportConfigModal && client && (
        <ClientReportFormsConfigModal
          isOpen={showReportConfigModal}
          onClose={() => setShowReportConfigModal(false)}
          client={client}
          currentAssignedReports={client.assignedReportTypes}
          onSave={(reportTypes) => {
            setClientReportTypes(client.id, reportTypes);
            setShowReportConfigModal(false);
          }}
        />
      )}
    </div>
  );
};
