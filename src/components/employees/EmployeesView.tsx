import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Trash2,
  Edit,
  MessageSquare,
  Users,
  Briefcase,
  Check,
  Filter,
  UserPlus,
  ArrowRight,
  Sparkles,
  Gift
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { UserRole, Employee, GiftType } from '../../types';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    clients,
    taxReports,
    tasks,
    currentUser,
    addEmployee,
    updateEmployee,
    updateEmployeeAvatar,
    deleteEmployee,
    assignClientsToEmployee,
    switchUserRole,
    openDirectChatWithEmployee,
    setActiveTab,
    registerUser,
    updateUserPassword,
    giveGift,
    deleteGift,
    gifts
  } = useCRM();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [assigningEmployee, setAssigningEmployee] = useState<Employee | null>(null);
  const [passwordResetEmployee, setPasswordResetEmployee] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [giftEmployee, setGiftEmployee] = useState<Employee | null>(null);
  const [giftType, setGiftType] = useState<GiftType>('BONUS');
  const [giftPoints, setGiftPoints] = useState(10);
  const [giftReason, setGiftReason] = useState('');

  // New employee state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 90 ');
  const [role, setRole] = useState<UserRole>('BUXGALTER');
  const [position, setPosition] = useState('Yetakchi Buxgalter');
  const [password, setPassword] = useState('');
  const [selectedClientsForNew, setSelectedClientsForNew] = useState<string[]>([]);
  
  // Assign modal state
  const [selectedClientsForAssign, setSelectedClientsForAssign] = useState<string[]>([]);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const filtered = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search);
    const matchesRole = roleFilter === 'ALL' || e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!password.trim()) {
      alert('Yangi xodim uchun login parol kiritilishi shart!');
      return;
    }

    const createdEmployee = addEmployee({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@21asr.uz`,
      phone: phone.trim(),
      role,
      position: position.trim(),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (employees.length * 1000)}?w=150&auto=format&fit=crop&q=80`,
      assignedClientCount: selectedClientsForNew.length,
      reportCompletionRate: 100,
      status: 'ACTIVE'
    }, selectedClientsForNew);

    registerUser(createdEmployee.id, password.trim());

    setName('');
    setEmail('');
    setPhone('+998 90 ');
    setPassword('');
    setPosition('Yetakchi Buxgalter');
    setSelectedClientsForNew([]);
    setShowAddModal(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>, employeeId?: string) => {
    const file = event.target.files?.[0];
    const targetId = employeeId || editingEmployee?.id;
    if (!file || !targetId) return;

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
      updateEmployeeAvatar(targetId, dataUrl);
      if (editingEmployee && editingEmployee.id === targetId) {
        setEditingEmployee({ ...editingEmployee, avatar: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, {
      name: editingEmployee.name,
      email: editingEmployee.email,
      phone: editingEmployee.phone,
      role: editingEmployee.role,
      position: editingEmployee.position,
    });

    setEditingEmployee(null);
  };

  const handleSaveAssignedClients = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningEmployee) return;

    assignClientsToEmployee(assigningEmployee.id, selectedClientsForAssign);
    setAssigningEmployee(null);
  };

  const handleOpenChat = (employeeId: string) => {
    openDirectChatWithEmployee(employeeId);
    setActiveTab('Chat');
  };

  const handleDeleteEmployee = (emp: Employee) => {
    if (emp.role === 'SUPER_ADMIN') {
      alert('Super Adminni o\'chirib bo\'lmaydi!');
      return;
    }
    if (confirm(`Haqiqatdan ham "${emp.name}" xodimini tizimdan o'chirmoqchimisiz? Unga biriktirilgan barcha korxonalar va hisobotlar Super Adminga qaytariladi.`)) {
      deleteEmployee(emp.id);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetEmployee || !newPassword.trim()) {
      alert('Yangi parolni kiriting!');
      return;
    }

    const ok = updateUserPassword(passwordResetEmployee.id, newPassword.trim());
    if (!ok) {
      alert('Parol yangilanishi muvaffaqiyatsiz tugadi.');
      return;
    }

    alert(`${passwordResetEmployee.name} uchun parol yangilandi.`);
    setPasswordResetEmployee(null);
    setNewPassword('');
  };

  // Stats calculation
  const totalEmployees = employees.length;
  const accountantsCount = employees.filter(e => e.role === 'BUXGALTER').length;
  const auditorsCount = employees.filter(e => e.role === 'NAZORATCHI').length;
  const assignedClientsCount = clients.filter(c => c.accountantId && c.accountantId !== 'emp-1').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Super Admin Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">Xodimlar & Buxgalterlar Jamoasi</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Nazorati
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Tizimdagi barcha xodimlarni, buxgalterlarni faqat Super Admin ro'yxatdan o'tkazadi, tahrirlaydi va ularga mijozlarni biriktiradi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSuperAdmin ? (
            <button
              onClick={() => {
                setSelectedClientsForNew([]);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4" /> Yangi Xodim Qo'shish
            </button>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Xodimlarni faqat Super Admin qo'shishi mumkin</span>
              <button
                onClick={() => switchUserRole('SUPER_ADMIN')}
                className="px-2 py-1 bg-amber-600 text-white rounded-lg font-bold text-[10px] hover:bg-amber-700 cursor-pointer"
              >
                Super Admin bo'lish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Jami Xodimlar</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalEmployees} nafar</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Faol jamoa a'zolari</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Buxgalterlar</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">{accountantsCount} nafar</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Mijozlar hisobotini yuritadi</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Audit / Nazoratchilar</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">{auditorsCount} nafar</div>
          <div className="text-[11px] text-purple-600 font-medium mt-0.5">Soliq va kameral nazorati</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Jami Korxonalar</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{clients.length} ta</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Buxgalterlarga biriktirilgan</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Xodim ismi, lavozimi yoki telefoni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'SUPER_ADMIN', 'DIREKTOR', 'NAZORATCHI', 'BUXGALTER', 'KASSIR'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'Barchasi' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const empClients = clients.filter(c => c.accountantId === emp.id);
          const empReports = taxReports.filter(r => r.accountantId === emp.id && r.status !== 'TALAB_QILINMAYDI');
          const submittedCount = empReports.filter(r => r.status === 'TOPSHIRILDI').length;
          const rate = empReports.length > 0 ? Math.round((submittedCount / empReports.length) * 100) : emp.reportCompletionRate || 100;
          const empTasks = tasks.filter(t => t.assigneeIds?.includes(emp.id) && t.status !== 'BAJARILDI');

          return (
            <div 
              key={emp.id} 
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative group/avatar">
                      <img 
                        src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt={emp.name} 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20" 
                      />
                      {(isSuperAdmin || emp.id === currentUser.id) && (
                        <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/55 text-[9px] font-bold text-white opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleAvatarUpload(e, emp.id)}
                          />
                          JPG/PNG
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        {emp.name}
                        {emp.id === currentUser.id && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            (Siz)
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{emp.position}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        emp.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        emp.role === 'DIREKTOR' ? 'bg-blue-100 text-blue-800' :
                        emp.role === 'NAZORATCHI' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                </div>

                {/* Details Box */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Telefon:</span>
                    <span className="font-semibold text-slate-800">{emp.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">{emp.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Biriktirilgan korxonalar:</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {empClients.length || emp.assignedClientCount || 0} ta
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Faol vazifalar:</span>
                    <span className="font-bold text-slate-800">{empTasks.length} ta</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Reyting:</span>
                    <span className="font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">{emp.rating || 0} ball</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sovgalar:</span>
                    <span className="font-bold text-slate-800">{emp.giftsReceived || 0} ta</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Oylik hisobot topshirish:</span>
                    <span className={rate >= 90 ? 'text-emerald-700' : 'text-amber-700'}>{rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenChat(emp.id)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    title="Shaxsiy chat ochish"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat Ochish</span>
                  </button>

                  <button
                    onClick={() => {
                      setAssigningEmployee(emp);
                      setSelectedClientsForAssign(clients.filter(c => c.accountantId === emp.id).map(c => c.id));
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    title="Mijozlarni biriktirish"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mijozlar ({empClients.length})</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => switchUserRole(emp.role, emp.id)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    <span>Shu profilga o'tish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {isSuperAdmin && emp.role !== 'SUPER_ADMIN' && (
                    <>
                      <button
                        onClick={() => setGiftEmployee(emp)}
                        className="p-2 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
                        title="Sovga berish"
                      >
                        <Gift className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingEmployee(emp)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setPasswordResetEmployee(emp);
                          setNewPassword('');
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                        title="Parolni o'zgartirish"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Yangi Xodim Ro'yxatdan O'tkazish</h3>
                  <p className="text-[10px] text-slate-400">Super Admin tomonidan yangi buxgalter kiritish</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">F.I.O. (Ismi va Familiyasi) *</label>
                <input
                  type="text"
                  placeholder="Masalan: Dilnoza Karimova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Tizimdagi Roli *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                  >
                    <option value="BUXGALTER">Buxgalter</option>
                    <option value="KASSIR">Kassir</option>
                    <option value="NAZORATCHI">Nazoratchi / Audit</option>
                    <option value="DIREKTOR">Direktor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Lavozimi *</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Telefon Raqami *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Email Manzili</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Login Parol *</label>
                <input
                  type="password"
                  placeholder="Super Admin tomonidan beriladigan parol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                  required
                />
              </div>

              {/* Assign Clients Selection */}
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Biriktiriladigan korxonalar (Ixtiyoriy - {selectedClientsForNew.length} ta tanlandi):
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                  {clients.length === 0 ? (
                    <div className="text-center py-3 text-slate-400">Korxonalar mavjud emas</div>
                  ) : (
                    clients.map((cli) => {
                      const isChecked = selectedClientsForNew.includes(cli.id);
                      return (
                        <label
                          key={cli.id}
                          className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? 'bg-emerald-100/70 text-emerald-950 font-bold' : 'hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClientsForNew(prev => [...prev, cli.id]);
                              } else {
                                setSelectedClientsForNew(prev => prev.filter(id => id !== cli.id));
                              }
                            }}
                            className="w-4 h-4 accent-emerald-600 rounded"
                          />
                          <span className="truncate">{cli.name} ({cli.stir})</span>
                          <span className="text-[10px] text-slate-400 ml-auto shrink-0">Hozirgi: {cli.accountantName}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Xodimni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Xodim Ma'lumotlarini Tahrirlash</h3>
              <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <img
                  src={editingEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={editingEmployee.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-200"
                />
                <label className="cursor-pointer rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">
                  <input type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleAvatarUpload(e)} />
                  JPG/PNG rasm yuklash
                </label>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">F.I.O. *</label>
                <input
                  type="text"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Roli</label>
                  <select
                    value={editingEmployee.role}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="BUXGALTER">Buxgalter</option>
                    <option value="KASSIR">Kassir</option>
                    <option value="NAZORATCHI">Nazoratchi</option>
                    <option value="DIREKTOR">Direktor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Lavozimi</label>
                  <input
                    type="text"
                    value={editingEmployee.position}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Telefon</label>
                  <input
                    type="text"
                    value={editingEmployee.phone}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Email</label>
                  <input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordResetEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Parolni Yangilash</h3>
                <p className="text-[10px] text-slate-400">{passwordResetEmployee.name} uchun yangi kirish paroli</p>
              </div>
              <button onClick={() => setPasswordResetEmployee(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Yangi parol</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 4 ta belgi"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordResetEmployee(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Parolni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {giftEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Sovga Berish</h3>
                  <p className="text-[10px] text-slate-400">{giftEmployee.name} ga sovga berish</p>
                </div>
              </div>
              <button onClick={() => setGiftEmployee(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              giveGift(giftEmployee.id, giftType, giftReason, giftPoints, giftReason);
              setGiftEmployee(null);
              setGiftReason('');
              setGiftPoints(10);
            }} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Sovga turi</label>
                <select
                  value={giftType}
                  onChange={(e) => setGiftType(e.target.value as GiftType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                >
                  <option value="BONUS">Bonus</option>
                  <option value="QOSHIMCHA_TATIL">Qo'shimcha Tatil</option>
                  <option value="PREMIYA">Premiya</option>
                  <option value="RAHMAT">Rahmat</option>
                  <option value="YILDAVY_SOVGA">Yildavoy Sovga</option>
                  <option value="BOSHQA">Boshqa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Ballar miqdori</label>
                <input
                  type="number"
                  value={giftPoints}
                  onChange={(e) => setGiftPoints(parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Sababi</label>
                <input
                  type="text"
                  value={giftReason}
                  onChange={(e) => setGiftReason(e.target.value)}
                  placeholder="Masalan: Yaxshi ish uchun"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-purple-600 font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGiftEmployee(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 cursor-pointer"
                >
                  Sovga Berish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Clients Modal */}
      {assigningEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {assigningEmployee.name} ga Korxonalarni Biriktirish
                </h3>
                <p className="text-[10px] text-slate-400">
                  Tanlangan korxonalar hisob-kitobini ushbu buxgalter boshqaradi
                </p>
              </div>
              <button onClick={() => setAssigningEmployee(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignedClients} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl font-bold">
                <span>Jami korxonalar: {clients.length} ta</span>
                <span className="text-emerald-700">Biriktirildi: {selectedClientsForAssign.length} ta</span>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                {clients.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">Tizimda korxonalar topilmadi</div>
                ) : (
                  clients.map((cli) => {
                    const isChecked = selectedClientsForAssign.includes(cli.id);
                    return (
                      <label
                        key={cli.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                          isChecked ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300' : 'hover:bg-white text-slate-700 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClientsForAssign(prev => [...prev, cli.id]);
                            } else {
                              setSelectedClientsForAssign(prev => prev.filter(id => id !== cli.id));
                            }
                          }}
                          className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs truncate">{cli.name}</div>
                          <div className="text-[10px] text-slate-400">STIR: {cli.stir} • {cli.taxType}</div>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                          {cli.accountantName}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningEmployee(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Biriktirishni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
