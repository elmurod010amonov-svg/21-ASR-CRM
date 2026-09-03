import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { TaskStatus, TaskPriority, TaskRecord, ProofAttachment } from '../../types';
import { ProofUploadModal } from '../common/ProofUploadModal';
import { ProofViewerModal } from '../common/ProofViewerModal';

export const TasksView: React.FC = () => {
  const {
    tasks,
    updateTaskStatus,
    completeTask,
    createTask,
    deleteTask,
    employees,
    clients,
    currentUser,
    openClientCard
  } = useCRM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Proof modals state
  const [taskForProofUpload, setTaskForProofUpload] = useState<TaskRecord | null>(null);
  const [viewingProof, setViewingProof] = useState<{ proof: ProofAttachment; title: string } | null>(null);

  // New task form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([employees[2]?.id || employees[0]?.id || '']);
  const [deadlineDate, setDeadlineDate] = useState('2026-08-15');
  const [priority, setPriority] = useState<TaskPriority>('MUHIM');

  const filtered = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.clientName && t.clientName.toLowerCase().includes(search.toLowerCase())) ||
      t.assigneeNames.some(name => name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedClient = clients.find(c => c.id === selectedClientId);
    const matchedAssignees = employees.filter(e => assigneeIds.includes(e.id));

    createTask({
      title,
      description,
      clientId: matchedClient?.id,
      clientName: matchedClient?.name,
      stir: matchedClient?.stir,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      assigneeIds,
      assigneeNames: matchedAssignees.map(a => a.name),
      deadlineDate,
      priority,
      status: 'YANGI',
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const toggleAssignee = (id: string) => {
    if (assigneeIds.includes(id)) {
      if (assigneeIds.length > 1) {
        setAssigneeIds(assigneeIds.filter(i => i !== id));
      }
    } else {
      setAssigneeIds([...assigneeIds, id]);
    }
  };

  // Called when user completes proof upload
  const handleProofConfirmed = (proof: ProofAttachment, notes?: string) => {
    if (!taskForProofUpload) return;
    completeTask(taskForProofUpload.id, proof, notes);
    setTaskForProofUpload(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">Topshiriqlar & Vazifalar Nazorati</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-extrabold flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> Isbot bilan tasdiqlash majburiy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Jamoaviy topshiriqlar, "Qabul qildim" nazorati va bajarilganlikni JPG/PDF isbot bilan qat'iy tasdiqlash
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Yangi Topshiriq Berish
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Topshiriq nomi, mijoz yoki mas'ul xodim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Holatlar</option>
          <option value="YANGI">Yangi (Kutilmoqda)</option>
          <option value="QABUL_QILINDI">Qabul Qilindi</option>
          <option value="JARAYONDA">Jarayonda</option>
          <option value="BAJARILDI">Bajarildi (Isbotlangan)</option>
          <option value="KECHIKDI">Kechikkan</option>
        </select>
      </div>

      {/* Mandatory proof notice banner */}
      <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs text-teal-900">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-teal-700 shrink-0" />
          <span>
            <strong>Bajarilish intizomi:</strong> Har bir topshiriqni <strong>"Bajarildi"</strong> deb tasdiqlash uchun tizimga soliq kvitansiyasi, 1C skrinshoti yoki to'lov PDF hujjati yuklanishi shart.
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            Topshiriqlar topilmadi.
          </div>
        ) : (
          filtered.map((task) => (
            <div 
              key={task.id} 
              className={`p-5 rounded-2xl bg-white border transition-all shadow-2xs space-y-3 ${
                task.status === 'BAJARILDI' 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{task.title}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      task.priority === 'SHOSHILINCH' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                      task.priority === 'MUHIM' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      task.status === 'BAJARILDI' ? 'bg-emerald-100 text-emerald-800 flex items-center gap-1' :
                      task.status === 'KECHIKDI' ? 'bg-rose-100 text-rose-800' :
                      task.status === 'JARAYONDA' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'QABUL_QILINDI' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status === 'BAJARILDI' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {task.status}
                    </span>
                  </div>

                  {task.clientName && (
                    <div 
                      onClick={() => task.clientId && openClientCard(task.clientId)}
                      className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Mijoz: {task.clientName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">(STIR: {task.stir})</span>
                    </div>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {task.status === 'YANGI' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'QABUL_QILINDI')}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Qabul qildim ✓
                    </button>
                  )}

                  {task.status !== 'BAJARILDI' && task.status !== 'YANGI' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'JARAYONDA')}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Jarayonda
                    </button>
                  )}

                  {/* BAJARILDI BUTTON - OPENS MANDATORY PROOF UPLOAD MODAL */}
                  {task.status !== 'BAJARILDI' && (
                    <button
                      onClick={() => setTaskForProofUpload(task)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                      title="Topshiriqni isbot (JPG/PDF) yuklab tasdiqlash"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Bajarildi (Isbot yuklash) ✓
                    </button>
                  )}

                  {task.status === 'BAJARILDI' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'JARAYONDA')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Qayta ochish
                    </button>
                  )}

                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      O'chirish
                    </button>
                  )}
                </div>
              </div>

              {/* Task Description */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
                {task.description}
              </div>

              {/* Attached Proof Card (If task is completed) */}
              {task.proofAttachment && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                      {task.proofAttachment.type?.includes('pdf') ? (
                        <FileText className="w-4 h-4 text-rose-600" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-emerald-950 truncate flex items-center gap-1.5">
                        <span>Isbot: {task.proofAttachment.name}</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {task.proofAttachment.size || 'Fayl'}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">
                        Yuklagan: {task.proofAttachment.uploadedBy} &bull; {task.proofAttachment.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingProof({
                      proof: task.proofAttachment!,
                      title: task.title
                    })}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" /> Isbotni ko'rish
                  </button>
                </div>
              )}

              {/* Footer info */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-4">
                  <span>Biriktirgan: <strong>{task.creatorName}</strong></span>
                  <span>Mas'ullar: <strong className="text-teal-700">{task.assigneeNames.join(', ')}</strong></span>
                  <span>Deadline: <strong className="text-rose-700">{task.deadlineDate}</strong></span>
                </div>
                {task.completedAt && (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bajarilgan vaqt: {task.completedAt}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MANDATORY PROOF UPLOAD MODAL */}
      <ProofUploadModal
        isOpen={!!taskForProofUpload}
        title="Topshiriq bajarilganligini tasdiqlash"
        subtitle="JPG, PNG skrinshot yoki PDF hujjat yuklanishi shart"
        targetName={taskForProofUpload?.title || ''}
        clientInfo={taskForProofUpload?.clientName ? {
          name: taskForProofUpload.clientName,
          stir: taskForProofUpload.stir || ''
        } : undefined}
        actionLabel="Isbotni biriktirish va Bajarildi deb belgilash ✓"
        onClose={() => setTaskForProofUpload(null)}
        onConfirm={handleProofConfirmed}
      />

      {/* PROOF VIEWER MODAL */}
      <ProofViewerModal
        isOpen={!!viewingProof}
        proof={viewingProof?.proof}
        targetTitle={viewingProof?.title}
        onClose={() => setViewingProof(null)}
      />

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Yangi Topshiriq Berish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Topshiriq nomi *</label>
                <input
                  type="text"
                  placeholder="Masalan: Shartnomalarni 1C ga kiritish"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Mijoz (ixtiyoriy):</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                >
                  <option value="">Umumiy vazifa (Mijozga bog'lanmagan)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.stir})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Mas'ul xodimlarni tanlang (Bir nechta):</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 border rounded-xl">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={assigneeIds.includes(emp.id)}
                        onChange={() => toggleAssignee(emp.id)}
                        className="rounded text-teal-600"
                      />
                      <span>{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Muhimlik darajasi:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  >
                    <option value="ODDIY">Oddiy</option>
                    <option value="MUHIM">Muhim</option>
                    <option value="SHOSHILINCH">Shoshilinch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-bold">Muddati (Deadline):</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Batafsil ko'rsatma:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                  placeholder="Vazifa tafsilotlari..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 cursor-pointer"
                >
                  Biriktirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
