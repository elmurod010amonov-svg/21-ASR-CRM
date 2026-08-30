import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  ShieldCheck, 
  Users, 
  User, 
  Clock, 
  Sparkles,
  Paperclip,
  CheckCheck,
  Plus,
  Trash2,
  Smile,
  Mic,
  FileText,
  UserPlus,
  Info,
  ChevronRight,
  X
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ChatRoom } from '../../types';

export const ChatView: React.FC = () => {
  const { 
    chatRooms, 
    chatMessages, 
    currentUser, 
    employees, 
    sendChatMessage,
    createChatRoom,
    openDirectChatWithEmployee,
    deleteChatMessage,
    clearChatRoom,
    setActiveTab
  } = useCRM();

  const [activeRoomId, setActiveRoomId] = useState<string>(() => chatRooms[0]?.id || 'room-general');
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [newGroupMode, setNewGroupMode] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [chatFilter, setChatFilter] = useState<'ALL' | 'GROUPS' | 'DIRECT'>('ALL');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure active room always exists
  const activeRoom: ChatRoom = chatRooms.find(r => r.id === activeRoomId) || chatRooms[0] || {
    id: 'room-general',
    name: 'Umumiy Jamoa Chati',
    isGroup: true,
    memberIds: [currentUser.id],
    memberNames: [currentUser.name],
    lastMessage: '',
    lastMessageTime: '',
    unreadCount: 0
  };

  const roomMessages = chatMessages.filter(m => m.roomId === activeRoom?.id);

  // Filter messages by search query if any
  const displayedMessages = searchQuery.trim()
    ? roomMessages.filter(m => 
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : roomMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages.length, activeRoomId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(activeRoom.id, inputText);
    setInputText('');
  };

  const handleQuickEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendChatMessage(activeRoom.id, `Hujjat yuborildi: ${file.name}`, {
        name: file.name,
        type: file.type || 'file',
        size: `${Math.round(file.size / 1024)} KB`
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceNote = () => {
    sendChatMessage(activeRoom.id, '🎤 Ovozli xabar yozib yuborildi (0:14)', undefined, true);
  };

  const handleStartDirectChat = (empId: string) => {
    const roomId = openDirectChatWithEmployee(empId);
    setActiveRoomId(roomId);
    setShowNewChatModal(false);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;

    const roomId = createChatRoom(groupName.trim(), selectedMembers, true);
    setActiveRoomId(roomId);
    setShowNewChatModal(false);
    setGroupName('');
    setSelectedMembers([]);
    setNewGroupMode(false);
  };

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Filter chat rooms
  const filteredRooms = chatRooms.filter(room => {
    if (chatFilter === 'GROUPS') return room.isGroup;
    if (chatFilter === 'DIRECT') return !room.isGroup;
    return true;
  });

  const otherEmployees = employees.filter(e => e.id !== currentUser.id);

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col md:flex-row bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Left Column: Chat Rooms & Contacts List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/70 shrink-0">
        {/* Header in chats */}
        <div className="p-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">Jamoa Chati</h2>
            </div>
            <button
              onClick={() => {
                setShowNewChatModal(true);
                setNewGroupMode(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
              title="Yangi suhbat yoki guruh ochish"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi Chat</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold mb-2">
            <button
              onClick={() => setChatFilter('ALL')}
              className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                chatFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Barchasi ({chatRooms.length})
            </button>
            <button
              onClick={() => setChatFilter('GROUPS')}
              className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                chatFilter === 'GROUPS' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Guruhlar
            </button>
            <button
              onClick={() => setChatFilter('DIRECT')}
              className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
                chatFilter === 'DIRECT' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Shaxsiy
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Suhbat yoki xabarlarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Room items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
          {filteredRooms.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Ushbu toifada suhbatlar topilmadi.
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = activeRoom?.id === room.id;
              const memberCount = room.memberNames?.length || room.memberIds?.length || 1;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ${
                    isActive ? 'bg-emerald-50/80 border border-emerald-200 shadow-2xs' : 'hover:bg-white/80'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    room.isGroup ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {room.isGroup ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs truncate ${isActive ? 'font-black text-emerald-950' : 'font-bold text-slate-900'}`}>
                        {room.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{room.lastMessageTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{room.lastMessage || 'Xabarlar...'}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <span>{room.isGroup ? `${memberCount} a'zo` : 'Shaxsiy'}</span>
                    </div>
                  </div>

                  {room.unreadCount && room.unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                      {room.unreadCount}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}

          {/* Quick Notice if only Super Admin exists */}
          {otherEmployees.length === 0 && (
            <div className="m-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Yangi xodimlar yo'q</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed mb-2">
                Hozircha tizimda faqat Super Admin mavjud. Xodimlar bo'limiga o'tib, yangi buxgalterlarni qo'shishingiz mumkin.
              </p>
              <button
                onClick={() => setActiveTab('Xodimlar')}
                className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Xodimlarni Qo'shish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat History & Input */}
      <div className="flex-1 flex flex-col bg-slate-50/30 min-w-0">
        {/* Chat Active Header */}
        <div className="p-3.5 px-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              activeRoom?.isGroup ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {activeRoom?.isGroup ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-slate-900 truncate">{activeRoom?.name}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>
                  {activeRoom?.isGroup 
                    ? `${activeRoom.memberNames?.length || activeRoom.memberIds?.length || 1} nafar xodim faol` 
                    : 'To\'g\'ridan-to\'g\'ri shaxsiy muloqot'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <button
                onClick={() => {
                  if (confirm(`"${activeRoom?.name}" xonasidagi barcha xabarlarni tozalashni xohlaysizmi?`)) {
                    clearChatRoom(activeRoom.id);
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium border border-slate-200 transition-all cursor-pointer"
                title="Xabarlar tarixini tozalash"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tozalash</span>
              </button>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Online
            </span>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedMessages.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Ushbu xonada hali xabarlar yo'q</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                Birinchi bo'lib savol bering, topshiriq biriktiring yoki jamoaga xabar qoldiring!
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleQuickEmoji('Assalomu alaykum! ')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 shadow-2xs cursor-pointer"
                >
                  👋 "Assalomu alaykum!"
                </button>
                <button
                  onClick={() => handleQuickEmoji('Hisobotlar tayyormi? ')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 shadow-2xs cursor-pointer"
                >
                  📊 "Hisobotlar tayyormi?"
                </button>
              </div>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`group flex gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mt-1"
                  />

                  <div className="space-y-0.5 min-w-0">
                    <div className={`text-[10px] font-bold text-slate-500 px-1 flex items-center gap-1.5 ${isMe ? 'justify-end text-right' : 'justify-start'}`}>
                      <span>{msg.senderName}</span>
                      <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-slate-100 text-slate-600 uppercase">
                        {msg.senderRole}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed relative ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-2xs'
                      }`}
                    >
                      {/* Message Content */}
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                      {/* Attachment if present */}
                      {msg.attachment && (
                        <div className={`mt-2 p-2 rounded-xl flex items-center gap-2 border text-xs ${
                          isMe ? 'bg-emerald-700/60 border-emerald-500/50 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
                          <div className="flex-1 truncate font-medium">{msg.attachment.name}</div>
                          <span className="text-[10px] opacity-75 shrink-0">{msg.attachment.size}</span>
                        </div>
                      )}

                      {/* Footer time & read status */}
                      <div className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                      </div>

                      {/* Delete action button on hover */}
                      {(isMe || isSuperAdmin) && (
                        <button
                          onClick={() => deleteChatMessage(msg.id)}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xs hover:bg-rose-700 cursor-pointer"
                          title="Xabarni o'chirish"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">Tezkor:</span>
          {['👍', '👋', '📊', '📑', '✅', '⚡', '🔔', '🚀', '🤝', '💡'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleQuickEmoji(emoji)}
              className="p-1 px-1.5 rounded-lg hover:bg-slate-200 text-xs transition-colors cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleSimulatedFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer shrink-0"
            title="Fayl yoki hujjat biriktirish"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleVoiceNote}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-all cursor-pointer shrink-0"
            title="Ovozli xabar yuborish"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={`${activeRoom?.name} ga xabar yozing... (Enter bosing)`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <span>Yuborish</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {newGroupMode ? 'Yangi Guruh Yaratish' : 'Yangi Suhbat Boshlash'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Jamoa a'zosi bilan 1-on-1 yoki guruh chati</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="flex p-0.5 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNewGroupMode(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !newGroupMode ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Shaxsiy Suhbat
              </button>
              <button
                type="button"
                onClick={() => setNewGroupMode(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  newGroupMode ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Yangi Guruh Ochish
              </button>
            </div>

            {!newGroupMode ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Muloqot qilmoqchi bo'lgan xodimni tanlang:</p>
                <div className="max-h-64 overflow-y-auto space-y-1.5 p-1">
                  {otherEmployees.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tizimda boshqa xodimlar topilmadi. Super Admin avval Xodimlar bo'limidan xodimlarni qo'shishi kerak.
                    </div>
                  ) : (
                    otherEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => handleStartDirectChat(emp.id)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 truncate">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{emp.position}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                            {emp.role}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGroup} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guruh Nomi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: QQS va Soliq Audit Guruhi"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">A'zolarni tanlang:</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 p-1 border border-slate-200 rounded-xl">
                    {otherEmployees.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Boshqa xodimlar mavjud emas.
                      </div>
                    ) : (
                      otherEmployees.map((emp) => {
                        const isChecked = selectedMembers.includes(emp.id);
                        return (
                          <label
                            key={emp.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                              isChecked ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers(prev => [...prev, emp.id]);
                                } else {
                                  setSelectedMembers(prev => prev.filter(id => id !== emp.id));
                                }
                              }}
                              className="w-4 h-4 accent-emerald-600 rounded"
                            />
                            <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-xs truncate">{emp.name} ({emp.position})</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewChatModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={!groupName.trim()}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Guruhni Yaratish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
