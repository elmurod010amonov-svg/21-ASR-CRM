import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Gift, X, ArrowRight } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { NotificationItem } from '../../types';

function isForUser(n: NotificationItem, userId: string): boolean {
  if (!n.recipientIds || n.recipientIds.length === 0) return true;
  return n.recipientIds.includes(userId);
}

export const NotificationToasts: React.FC = () => {
  const {
    notifications,
    currentUser,
    markNotificationAsRead,
    setActiveTab,
    setPendingChatRoomId,
  } = useCRM();

  const [toasts, setToasts] = useState<NotificationItem[]>([]);
  const [detail, setDetail] = useState<NotificationItem | null>(null);
  const seenIdsRef = React.useRef<Set<string>>(new Set());
  const initializedRef = React.useRef(false);

  useEffect(() => {
    const mine = notifications.filter((n) => isForUser(n, currentUser.id) && !n.read);

    if (!initializedRef.current) {
      mine.forEach((n) => seenIdsRef.current.add(n.id));
      initializedRef.current = true;
      return;
    }

    const fresh = mine.filter((n) => !seenIdsRef.current.has(n.id));
    if (fresh.length === 0) return;

    fresh.forEach((n) => seenIdsRef.current.add(n.id));
    setToasts((prev) => [...fresh, ...prev].slice(0, 4));
  }, [notifications, currentUser.id]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.slice(0, -1));
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const openNotification = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    setDetail(n);
    setToasts((prev) => prev.filter((t) => t.id !== n.id));
  };

  const goToService = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    if (n.linkModule === 'Chat' && n.relatedId) {
      setPendingChatRoomId(n.relatedId);
    }
    if (n.linkModule) setActiveTab(n.linkModule);
    setDetail(null);
  };

  const iconFor = (n: NotificationItem) => {
    if (n.type === 'CHAT') return <MessageSquare className="w-4 h-4" />;
    if (n.type === 'TASK') return <CheckCircle2 className="w-4 h-4" />;
    if (n.type === 'GIFT') return <Gift className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  return (
    <>
      <div className="fixed top-16 right-4 z-[80] flex flex-col gap-2 w-[min(100vw-2rem,22rem)] pointer-events-none">
        {toasts.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => openNotification(n)}
            className="pointer-events-auto text-left bg-white border border-neutral-200 shadow-lg rounded-xl p-3 hover:border-neutral-400 transition-all animate-in slide-in-from-right-4 fade-in duration-200"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                {iconFor(n)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-neutral-900 truncate">{n.title}</div>
                <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2">{n.message}</p>
                <div className="text-[10px] text-neutral-400 mt-1 font-mono">{n.timestamp}</div>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts((prev) => prev.filter((t) => t.id !== n.id));
                }}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/30">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
                  {iconFor(detail)}
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900">Bildirishnoma</div>
                  <div className="text-[10px] text-neutral-500 font-mono">{detail.timestamp}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="text-base font-extrabold text-neutral-900">{detail.title}</h3>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{detail.message}</p>
              {detail.linkModule && (
                <div className="text-[11px] text-neutral-500">
                  Xizmat: <strong className="text-neutral-800">{detail.linkModule}</strong>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-neutral-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
              >
                Yopish
              </button>
              {detail.linkModule && (
                <button
                  type="button"
                  onClick={() => goToService(detail)}
                  className="px-3 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer inline-flex items-center gap-1.5"
                >
                  Xizmatga o'tish <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
