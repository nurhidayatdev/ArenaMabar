import React from "react";
import { UserCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginPromptModal({ isOpen, onClose, message = "Kamu harus login untuk menggunakan fitur ini." }: LoginPromptModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[32px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 relative flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-zinc-800 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center mb-4 mt-2">
          <UserCircle2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-2">Login Diperlukan</h3>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all"
          >
            Masuk
          </button>
        </div>
      </div>
    </div>
  );
}
