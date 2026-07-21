import React from 'react';
import { Check, X, Info } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  title?: string;
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-5 md:bottom-5 z-[9999] flex flex-col gap-3 max-w-full md:max-w-sm pointer-events-none mx-auto md:mx-0">
      {toasts.map((t) => {
        let bgClass = "bg-white/95 border-stone-200/80 text-stone-800";
        let borderClass = "border-l-4";
        let iconColor = "";
        let icon = null;

        if (t.type === 'success') {
          borderClass += " border-l-amber-500";
          iconColor = "text-amber-500";
          icon = <Check className="w-5 h-5" />;
        } else if (t.type === 'error') {
          borderClass += " border-l-rose-500";
          iconColor = "text-rose-500";
          icon = <X className="w-5 h-5" />;
        } else {
          borderClass += " border-l-blue-500";
          iconColor = "text-blue-500";
          icon = <Info className="w-5 h-5" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-fadeIn ${bgClass} ${borderClass}`}
            role="alert"
          >
            <div className={`p-1 rounded-lg bg-stone-100 ${iconColor} shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="font-semibold text-sm text-stone-900 leading-tight mb-1">
                  {t.title}
                </h4>
              )}
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {t.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg hover:bg-stone-100 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
