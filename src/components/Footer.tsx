import React from "react";
import { Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t-[3px] border-slate-900 dark:border-slate-100 py-6 px-6 relative z-20 transition-colors duration-200">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-900 dark:text-slate-100 font-bold text-sm">
          Dibuat oleh Nur Hidayat
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com/yayaxnr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center hover:bg-fuchsia-100 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4 text-slate-900 dark:text-slate-100 stroke-[2]" />
          </a>
          <a
            href="https://linkedin.com/in/nurh1dayat"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center hover:bg-blue-100 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4 text-slate-900 dark:text-slate-100 stroke-[2]" />
          </a>
          <a
            href="https://github.com/nurhidayatdev"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            aria-label="Github"
          >
            <Github className="w-4 h-4 text-slate-900 dark:text-slate-100 stroke-[2]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
