import React from "react";
import { Instagram, Linkedin, Github, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-zinc-950 border-t-4 border-slate-900 dark:border-slate-100 py-6 px-6 relative z-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center rotate-3 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
             <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl italic text-slate-900 dark:text-slate-100">ArenaMabar</span>
        </div>

        <div className="text-center text-slate-700 dark:text-slate-300 font-bold text-sm bg-slate-100 dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
          &copy; {new Date().getFullYear()} ArenaMabar by Nur Hidayat. All rights reserved.
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com/yayaxnr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5 text-slate-800 dark:text-slate-200 stroke-[2.5]" />
          </a>
          <a
            href="https://linkedin.com/in/nurh1dayat"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5 text-slate-800 dark:text-slate-200 stroke-[2.5]" />
          </a>
          <a
            href="https://github.com/nurhidayatdev"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            aria-label="Github"
          >
            <Github className="w-5 h-5 text-slate-800 dark:text-slate-200 stroke-[2.5]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
