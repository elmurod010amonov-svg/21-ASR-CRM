import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  ArrowUpRight, 
  User, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sliders
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientType, TaxType, ReportType, Client } from '../../types';
import { ClientReportFormsConfigModal, ALL_TAX_REPORTS } from '../common/ClientReportFormsConfigModal';

export const ClientList: React.FC = () => {
  const { 
    clients, 
    employees, 
    taxReports, 
    accounting1C, 
    payments, 
    letters, 
    kameral, 
    openClientCard, 
    addClient,
    setClientReportTypes,
    currentUser,
    deleteClient
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterTaxType, setFilterTaxType] = useState<string>('ALL');
  const [filterAccountant, setFilterAccountant] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientForConfigForms, setClientForConfigForms] = useState<Client | null>(null);

  // Add Client Form state
  const [name, setName] = useState('');
  const [stir, setStir] = useState('');
  const [type, setType] = useState<ClientType>('YURIDIK');
  const [taxType, setTaxType] = useState<TaxType>('AYLANMA');
  const [selectedAddReports, setSelectedAddReports] = useState<ReportType[]>(['AYLANMA', 'JSHDS', 'INPS']);
  const [accountantId, setAccountantId] = useState(employees[2]?.id || '');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('Toshkent sh.');
  const [monthlyFee, setMonthlyFee] = useState('2000000');
  const [notes, setNotes] = useState('');
  const [stirError, setStirError] = useState('');

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.stir.includes(searchTerm) ||
        c.phone.includes(searchTerm) ||
        c.accountantName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'ALL' || c.type === filterType;
      const matchesTax = filterTaxType === 'ALL' || c.taxType === filterTaxType;
      const matchesAcc = filterAccountant === 'ALL' || c.accountantId === filterAccountant;

      return matchesSearch && matchesType && matchesTax && matchesAcc;
    });
  }, [clients, searchTerm, filterType, filterTaxType, filterAccountant]);

  const canDeleteClient = currentUser.id !== 'guest' && currentUser.role !== 'KASSIR';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanStir = stir.trim();
    if (cleanStir.length !== 9 || !/^\d+$/.test(cleanStir)) {
      setStirError('STIR aniq 9 xonali raqam bo\'lishi shart!');
      return;
    }
    if (clients.some(c => c.stir === cleanStir)) {
      setStirError('Bu STIR raqami bo\'yicha mijoz allaqachon mavjud!');
      return;
    }
    setStirError('');

    const assignedEmp = employees.find(e => e.id === accountantId);

    addClient({
      name,
      stir: cleanStir,
      type,
      taxType,
      accountantId,
      accountantName: assignedEmp?.name || 'Tayinlanmagan',
      phone,
      address,
      contractDate: new Date().toISOString().split('T')[0],
      monthlyFee: parseInt(monthlyFee.replace(/\D/g, ''), 10) || 1500000,
      notes,
      tags: [type, taxType],
      assignedReportTypes: selectedAddReports,
    });

    // Reset & close
    setName('');
    setStir('');
    setPhone('+998 ');
    setNotes('');
    setSelectedAddReports(['AYLANMA', 'JSHDS', 'INPS']);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900">Mijozlar Boshqaruvi</h1>
          <p className="text-[11px] text-slate-500">Tashkilot va YaTT larning to'liq bazasi, mas'ul buxgalterlar va 360° holat nazorati</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Yangi Mijoz Qo'shish
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 shadow-2xs flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Nomi, 9 xonali STIR, telefon yoki buxgalter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs outline-none focus:border-emerald-500 focus:bg-slate-600 transition-all font-medium text-white placeholder:text-slate-400"
          />
        </div>

        {/* Type selector */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-300 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Turlar (YaTT / Yuridik)</option>
          <option value="YURIDIK">Yuridik shaxs (MCHJ, XK)</option>
          <option value="YATT">YaTT (Yakka tadbirkor)</option>
        </select>

        {/* Tax type selector */}
        <select
          value={filterTaxType}
          onChange={(e) => setFilterTaxType(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-300 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Soliq Turlari</option>
          <option value="QQS_FOYDA">QQS + Foyda solig'i</option>
          <option value="AYLANMA_SOLIQ">Aylanma soliq (4%)</option>
          <option value="JISMONIY_YATT">YaTT qat'iy soliq</option>
        </select>

        {/* Accountant selector */}
        <select
          value={filterAccountant}
          onChange={(e) => setFilterAccountant(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-300 outline-none cursor-pointer"
        >
          <option value="ALL">Barcha Mas'ullar</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      {/* Clients Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-dense">
            <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2">Korxona Nomi & STIR</th>
                <th className="px-3 py-2">Turi & Soliq</th>
                <th className="px-3 py-2">Mas'ul Buxgalter</th>
                <th className="px-3 py-2">Telefon & Oylik To'lov</th>
                <th className="px-3 py-2 text-center">360° Holat (Hisobot | 1C | To'lov | Xat | Kameral)</th>
                <th className="px-3 py-2 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 font-sans">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Qidiruv natijasida mijoz topilmadi.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const clientReports = taxReports.filter(r => r.clientId === client.id && r.status !== 'TALAB_QILINMAYDI');
                  const reportsDone = clientReports.every(r => r.status === 'TOPSHIRILDI');
                  const client1C = accounting1C.find(a => a.clientId === client.id);
                  const is1CDone = client1C?.oborotkaStatus === 'KIRITILGAN';
                  const clientPay = payments.find(p => p.clientId === client.id);
                  const isPaid = clientPay?.status === 'TOLANGAN';
                  const clientL = letters.filter(l => l.clientId === client.id);
                  const hasNewLetter = clientL.some(l => l.status === 'YANGI');
                  const clientK = kameral.filter(k => k.clientId === client.id);
                  const hasKameralIssue = clientK.some(k => k.status === 'KAMCHILIK_ANIQLANDI' || k.status === 'OCHIQ');

                  return (
                    <tr
                      key={client.id}
                      onClick={() => openClientCard(client.id)}
                      className="hover:bg-slate-700/50 transition-colors cursor-pointer group"
                    >
                      {/* Name & STIR */}
                      <td className="px-3 py-2">
                        <div className="font-bold text-white group-hover:text-emerald-400 text-xs">{client.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-slate-400 bg-slate-700 border border-slate-600 px-1 py-0.2 rounded text-[10px] font-semibold">
                            STIR: {client.stir}
                          </span>
                        </div>
                      </td>

                      {/* Type & Tax */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                            client.type === 'YATT' ? 'bg-amber-900/50 text-amber-400 border-amber-700' : 'bg-blue-900/50 text-blue-400 border-blue-700'
                          }`}>
                            {client.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">
                            {client.taxType}
                          </span>
                        </div>
                      </td>

                      {/* Accountant */}
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-300 text-xs">{client.accountantName}</div>
                      </td>

                      {/* Phone & Fee */}
                      <td className="px-3 py-2 font-mono">
                        <div className="text-slate-300 text-[11px]">{client.phone}</div>
                        <div className="font-bold text-emerald-400 text-[10px] mt-0.5">
                          {(client.monthlyFee || 0).toLocaleString()} so'm/oy
                        </div>
                      </td>

                      {/* 360 Health Dots */}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5 text-xs">
                          {/* Reports dot */}
                          <span 
                            title={reportsDone ? "Barcha hisobotlar topshirildi" : "Hisobotlar kutilmoqda"} 
                            className={`w-2.5 h-2.5 rounded-full ${reportsDone ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}
                          />
                          {/* 1C dot */}
                          <span 
                            title={is1CDone ? "1C oborotka kiritilgan" : "1C oborotka kiritilmagan"} 
                            className={`w-2.5 h-2.5 rounded-full ${is1CDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          />
                          {/* Payment dot */}
                          <span 
                            title={isPaid ? "To'lov amalga oshirilgan" : "Qarzdorlik mavjud"} 
                            className={`w-2.5 h-2.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          />
                          {/* Letters dot */}
                          <span 
                            title={hasNewLetter ? "Yangi o'qilmagan xat bor" : "Xatlar yo'q yoki javob berilgan"} 
                            className={`w-2.5 h-2.5 rounded-full ${hasNewLetter ? 'bg-purple-500 animate-bounce' : 'bg-slate-300'}`}
                          />
                          {/* Kameral dot */}
                          <span 
                            title={hasKameralIssue ? "Kameral muammo bor" : "Kameral toza"} 
                            className={`w-2.5 h-2.5 rounded-full ${hasKameralIssue ? 'bg-rose-600' : 'bg-slate-300'}`}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setClientForConfigForms(client)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Admin: Hisobot shakllarini sozlash"
                          >
                            <Sliders className="w-3 h-3 text-slate-600" />
                            <span>Shakllar</span>
                          </button>
                          {canDeleteClient && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`"${client.name}" mijozini o'chirishni xohlaysizmi?`)) {
                                  deleteClient(client.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Mijozni o'chirish"
                            >
                              O'chirish
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openClientCard(client.id)}
                            className="inline-flex items-center gap-0.5 text-emerald-700 font-bold hover:translate-x-0.5 transition-transform text-[11px] p-1 cursor-pointer"
                          >
                            360° <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Jami: <strong className="text-white">{filteredClients.length} ta</strong> / {clients.length} ta</span>
          <span className="text-[10px] text-slate-500 font-sans">360° to'liq kartani ko'rish uchun istalgan qator ustiga bosing</span>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Yangi Mijoz Qo'shish</span>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Korxona yoki YaTT Nomi *</label>
                <input
                  type="text"
                  placeholder="Masalan: 'ASIA LOGISTICS' MCHJ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">9 xonali STIR *</label>
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="308192847"
                    value={stir}
                    onChange={(e) => setStir(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tashkiliy Turi *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClientType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="YURIDIK">Yuridik shaxs (MCHJ / XK)</option>
                    <option value="YATT">YaTT</option>
                  </select>
                </div>
              </div>

              {stirError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
                  {stirError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Soliq Tizimi *</label>
                  <select
                    value={taxType}
                    onChange={(e) => {
                      const newTax = e.target.value as TaxType;
                      setTaxType(newTax);
                      if (newTax === 'QQS') {
                        setSelectedAddReports(['QQS', 'FOYDA', 'JSHDS', 'INPS']);
                      } else if (newTax === 'FOYDA') {
                        setSelectedAddReports(['FOYDA', 'JSHDS', 'INPS']);
                      } else {
                        setSelectedAddReports(['AYLANMA', 'JSHDS', 'INPS']);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option value="AYLANMA">Aylanma soliq (4%)</option>
                    <option value="QQS">QQS (12%)</option>
                    <option value="FOYDA">Foyda solig'i (15%)</option>
                    <option value="YATT_QATQIY">YaTT qat'iy soliq</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mas'ul Buxgalter *</label>
                  <select
                    value={accountantId}
                    onChange={(e) => setAccountantId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.position})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Required Report Forms Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    Topshirishi shart bo'lgan hisobot shakllari (Admin):
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold font-mono">
                    {selectedAddReports.length} ta shakl
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAX_REPORTS.map((r) => {
                    const isChecked = selectedAddReports.includes(r.type);
                    return (
                      <button
                        key={r.type}
                        type="button"
                        onClick={() => {
                          setSelectedAddReports(prev => 
                            prev.includes(r.type) ? prev.filter(t => t !== r.type) : [...prev, r.type]
                          );
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {r.type} {isChecked ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon Raqami</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Oylik To'lov (so'm)</label>
                  <input
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manzil & Izoh</label>
                <textarea
                  rows={2}
                  placeholder="Yuridik manzil va boshqa muhim qaydlar..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Mijozni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Report Forms Config Modal */}
      {clientForConfigForms && (
        <ClientReportFormsConfigModal
          isOpen={!!clientForConfigForms}
          onClose={() => setClientForConfigForms(null)}
          client={clientForConfigForms}
          currentAssignedReports={clientForConfigForms.assignedReportTypes}
          onSave={(reportTypes) => {
            setClientReportTypes(clientForConfigForms.id, reportTypes);
            setClientForConfigForms(null);
          }}
        />
      )}
    </div>
  );
};
