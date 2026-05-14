import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FloatingDecorations from "../components/FloatingDecorations";

export default function FAQ() {
  const { t } = useTranslation();
  
  const faqs = [
    {
      q: "Apa itu ArenaMabar?",
      a: "ArenaMabar adalah all-in-one platform buat kamu yang hobi olahraga. Kamu bisa cari lapangan terdekat, atur patungan dengan teman, sampai konsultasi sama Coach AI."
    },
    {
      q: "Apakah aplikasi ini gratis?",
      a: "Yap, 100% gratis! Semua fitur termasuk Radar Lapangan, Kalkulator Patungan, dan Coach AI bisa kamu pakai tanpa batas."
    },
    {
      q: "Bagaimana cara kerja Kalkulator Mabar?",
      a: "Gampang banget! Kamu tinggal foto struk bayar lapangan, lalu AI kita bakal baca total bayarannya. Masukin jumlah pemain, dan klik hitung. Nanti tinggal share deh rincian patungannya ke grup WA."
    },
    {
      q: "Kok lokasiku kadang kurang akurat di Radar?",
      a: "Pastikan kamu udah kasih izin akses lokasi (GPS) ke browser. Kalau ditolak, kita terpaksa pakai lokasi IP yang kadang bisa meleset (misal kedetek di Jakarta terus). Kamu bisa klik update lokasi di pojok kanan atas."
    },
    {
      q: "Coach AI bisa ngapain aja?",
      a: "Coach AI bisa bantu jawab pertanyaan seputar tips bermain, pencegahan cedera ringan, sampai pola makan untuk atlet. Tapi inget ya, kalau cederanya parah tetap harus ke dokter beneran!"
    },
    {
      q: "Gimana kalau nama lapangan yang kucari ga muncul di Radar?",
      a: "Tenang aja, kamu masih bisa gunakan tab 'Teks Bebas' atau 'Pesan Suara' lalu masukkan sedetail mungkin nama lapangan atau daerah patokan tempatnya."
    },
    {
      q: "Kenapa hasil scan struk patungan sering salah nominal?",
      a: "Hasil scan bisa dipengaruhi oleh pencahayaan, tingkat blur, hingga kualitas tinta pada struk yang difoto. Usahakan foto yang tajam dan tidak gelap. Oh ya, kalau masih gagal, nominalnya masih bisa diubah manual kok!"
    },
    {
      q: "Bisa nggak tagih patungannya di-share selain lewat WA?",
      a: "Saat ini tombol share otomatis dialihkan dan berformat pesan WhatsApp. Tapi jangan khawatir, kamu bisa kok menyalin (copy) tampilan 'Struk Digital' itu kemudian paste ke LINE, Telegram, dll secara manual."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 relative min-h-[calc(100vh-5rem)] bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-200">
      <FloatingDecorations />
      <div className="w-full max-w-4xl text-center mb-8 z-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-3">
          Tanya <span className="text-indigo-600 dark:text-indigo-400">Jawab</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-base max-w-xl mx-auto">
          Kumpulan pertanyaan yang sering ditanyakan seputar ArenaMabar.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-4 md:space-y-6 flex flex-col z-10 mb-12 animate-fade-in">
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className={`w-full bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-900 dark:border-slate-100 overflow-hidden transition-all ${openIdx === idx ? "shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-1" : "shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"}`}
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
              <h3 className="text-base font-bold pr-4 text-slate-900 dark:text-slate-100">{faq.q}</h3>
              <div className={`w-8 h-8 shrink-0 rounded-full border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center transition-transform duration-300 ${openIdx === idx ? "rotate-180 bg-amber-300 dark:bg-amber-500 text-slate-900" : "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-slate-100"}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${openIdx === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-5 pt-0 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                <hr className="border-slate-200 dark:border-slate-700 mb-4" />
                {faq.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-3xl bg-indigo-200 dark:bg-indigo-900 text-slate-900 dark:text-slate-100 rounded-[32px] p-6 md:p-8 border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-center flex flex-col items-center mb-10 transition-colors">
        <MessageCircle className="w-10 h-10 mb-3 text-indigo-700 dark:text-indigo-300" />
        <h2 className="text-xl md:text-2xl font-black mb-2">Punya Pertanyaan Lain?</h2>
        <p className="mb-6 text-sm font-medium max-w-md opacity-80">
          Kalau kamu nemu bug, punya ide fitur baru, atau mau kerjasama, langsung aja sapa Coach AI!
        </p>
        <Link 
          to="/coach" 
          className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.5)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-slate-900 dark:border-slate-100 transition-all"
        >
          Tanya Coach AI
        </Link>
      </div>
    </div>
  );
}
