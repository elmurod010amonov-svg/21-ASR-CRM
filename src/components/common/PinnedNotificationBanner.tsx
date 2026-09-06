import React from 'react';
import { Gift, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { NotificationItem } from '../../types';

function isForUser(n: NotificationItem, userId: string): boolean {
  if (!n.recipientIds || n.recipientIds.length === 0) return true;
  return n.recipientIds.includes(userId);
}

/**
 * Direktor yoki nazoratchi tomonidan berilgan vazifa/sovga bildirishnomasi.
 * Oddiy toast'dan farqli o'laroq, hodim uni ochib ko'rmaguncha (yoki
 * "Ko'rib chiqdim" tugmasini bosmaguncha) ekran tepasida turaveradi —
 * hech qanday avtomatik yo'qolish (timeout) yo'q.
 */
export const PinnedNotificationBanner: React.FC = () => {
  const { notifications, currentUser, markNotificationAsRead, setActiveTab, setPendingChatRoomId } = useCRM();

  const pinned = notifications.filter((n) => n.pinned && !n.read && isForUser(n, currentUser.id));

  if (pinned.length === 0) return null;

  const goToService = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    if (n.linkModule === 'Chat' && n.relatedId) {
      setPendingChatRoomId(n.relatedId);
    }
    if (n.linkModule) setActiveTab(n.linkModule);
  };

  return (
    <div className="relative z-40 flex flex-col">
      {pinned.map((n) => {
        const isGift = n.type === 'GIFT';
        return (
          <div
            key={n.id}
            className={`flex items-center gap-3 px-4 py-2 border-b ${
              isGift
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-purple-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-700 text-white'
            }`}
          >
            <span className="shrink-0 w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              {isGift ? <Gift className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </span>

            <button
              type="button"
              onClick={() => goToService(n)}
              className="min-w-0 flex-1 text-left cursor-pointer"
              title="Xizmatga o'tish"
            >
              <span className="font-extrabold text-xs">{n.title}</span>
              <span className="ml-2 text-[11px] font-medium opacity-90 truncate">{n.message}</span>
            </button>

            <button
              type="button"
              onClick={() => goToService(n)}
              className="shrink-0 hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold cursor-pointer transition-all"
            >
              Ko'rish <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => markNotificationAsRead(n.id)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold cursor-pointer transition-all"
              title="Ko'rib chiqdim"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ko'rib chiqdim</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
