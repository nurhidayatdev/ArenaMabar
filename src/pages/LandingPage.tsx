import React, { useState } from "react";
import { ArrowRight, MapPin, HeartPulse, CheckCircle2, Zap, Calculator, ChevronDown, MessageCircle, BrainCircuit, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import FloatingDecorations from "../components/FloatingDecorations";

import Footer from "../components/Footer";
export default function LandingPage() {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apa itu ArenaMabar?",
      a: "ArenaMabar adalah all-in-one platform buat kamu yang hobi olahraga. Kamu bisa cari lapangan terdekat, atur patungan mabar dengan hitungan cerdas, cari rekomendasi perlengkapan olahraga, sampai konsultasi interaktif sama Coach AI."
    },
    {
      q: "Apakah aplikasi ini gratis?",
      a: "Yap, 100% gratis! Semua fitur termasuk Cari Lapangan, Rekomendasi Alat, Kalkulator Mabar, dan Coach AI bisa kamu pakai sepuasnya."
    },
    {
      q: "Bagaimana cara kerja Kalkulator Mabar?",
      a: "Gampang banget! Kamu tinggal foto struk bayar lapangan atau shuttlecock, lalu AI kita bakal baca total bayarannya. Masukin detail lainnya seperti patungan bola bulu tangkis khusus pria, dan klik hitung. Nanti tinggal share rincian patungannya ke grup WA."
    },
    {
      q: "Rekomendasi Alat itu ngambil barang dari mana?",
      a: "Rekomendasi Alat mencari barang 100% ORIGINAL dari Shopee Mall atau Official Store melalui pencarian AI. Kami memberikan estimasi kisaran harga termurah hingga termahal sehingga kamu bisa sesuaikan dengan budget."
    },
    {
      q: "Coach AI bisa ngapain aja sekarang?",
      a: "Gak cuma konsultasi cedera dan gizi mas bro! Coach AI sekarang juga bisa bantuin kamu nyari lapangan terdekat dari tempatmu, dan nyariin gear atau perlengkapan olahraga langsung dari obrolan!"
    },
    {
      q: "Kok lokasiku kadang kurang akurat di radar pencarian?",
      a: "Pastikan kamu udah kasih izin akses lokasi (GPS) ke browser. Kalau ditolak, kita terpaksa pakai lokasi IP yang kadang bisa meleset. Kamu bisa ubah sendiri juga via peta!"
    },
    {
      q: "Punya masukkan atau nemu bug?",
      a: "Langsung curhat aja ke Coach AI! Bisa juga sapa developer dari fitur 'Tanya Coach AI' untuk diskusi."
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-200 relative overflow-x-hidden overflow-y-auto w-full">
      <FloatingDecorations />
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 dark:bg-indigo-900/40 rounded-full mix-blend-multiply flex filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-200 dark:bg-fuchsia-900/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-teal-200 dark:bg-teal-900/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center z-10 px-4 sm:px-6 flex-1">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-80px)] pb-10 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center relative"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-6">
              {t("landing.hero.title_start")}<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-500 dark:from-indigo-400 dark:to-fuchsia-400">{t("landing.hero.title_end")}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
              {t("landing.hero.subtitle")}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg"
          >
            <Link to="/lapangan" className="bg-indigo-600 dark:bg-indigo-500 w-full sm:w-auto text-white rounded-full border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] px-8 py-3 text-base font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
              {t("landing.hero.btn_find")} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <section className="w-full flex flex-col items-center mb-16 sm:mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">{t("landing.features.title")}</h2>
            <p className="text-base text-slate-600 dark:text-slate-300 font-medium">{t("landing.features.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-indigo-100 dark:bg-indigo-900/40 p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 bg-indigo-200 dark:bg-indigo-800/80 border-2 border-slate-900 dark:border-slate-100 rounded-2xl rotate-3 mb-5 flex items-center justify-center">
                <BrainCircuit className="w-7 h-7 text-indigo-700 dark:text-indigo-200 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.feature1.title")}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t("landing.feature1.desc")}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-amber-100 dark:bg-amber-900/40 p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
               <div className="w-14 h-14 bg-amber-200 dark:bg-amber-800/80 border-2 border-slate-900 dark:border-slate-100 rounded-2xl -rotate-3 mb-5 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-amber-700 dark:text-amber-200 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.feature2.title")}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t("landing.feature2.desc")}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-teal-100 dark:bg-teal-900/40 p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 bg-teal-200 dark:bg-teal-800/80 border-2 border-slate-900 dark:border-slate-100 rounded-2xl rotate-3 mb-5 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-teal-700 dark:text-teal-200 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.feature3.title")}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t("landing.feature3.desc")}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-fuchsia-100 dark:bg-fuchsia-900/40 p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 bg-fuchsia-200 dark:bg-fuchsia-800/80 border-2 border-slate-900 dark:border-slate-100 rounded-2xl -rotate-3 mb-5 flex items-center justify-center">
                <Calculator className="w-7 h-7 text-fuchsia-700 dark:text-fuchsia-200 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.feature4.title")}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t("landing.feature4.desc")}</p>
            </motion.div>
          </div>
        </section>

        {/* MEMBERSHIP BENEFITS SECTION */}
        <section className="w-full flex flex-col items-center mb-16 sm:mb-20 pt-4">
          <div className="mb-10 text-center w-full">
            <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-slate-100">{t("landing.benefits.title_start")} <span className="text-indigo-600 dark:text-indigo-400">{t("landing.benefits.title_end")}</span></h2>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-base max-w-xl mx-auto">
              {t("landing.benefits.subtitle")}
            </p>
          </div>

          <div className="flex flex-col md:flex-row w-full gap-6 md:gap-8 max-w-5xl justify-center items-stretch">
            {/* Guest */}
            <div className="w-full md:w-1/2 bg-white dark:bg-zinc-900 p-8 rounded-[32px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col">
              <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.benefits.guest.title")}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-6 pb-6 border-b-2 border-slate-100 dark:border-slate-800">
                {t("landing.benefits.guest.desc")}
              </p>
              
              <ul className="space-y-4 mb-auto">
                {[
                  t("landing.benefits.guest.item1"),
                  t("landing.benefits.guest.item2"),
                  t("landing.benefits.guest.item3"),
                  t("landing.benefits.guest.item4")
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-600 dark:text-slate-300 font-bold text-sm leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Logged in */}
            <div className="w-full md:w-1/2 bg-indigo-600 dark:bg-indigo-500 p-8 rounded-[32px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] text-white relative overflow-hidden flex flex-col hover:-translate-y-1 transition-transform">
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="w-14 h-14 bg-amber-300 dark:bg-amber-400 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center mb-6 z-10 text-slate-900 rotate-12">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              
              <h3 className="text-2xl font-black mb-2 text-white relative z-10 flex items-center gap-2">
                {t("landing.benefits.login.title")} <span className="bg-amber-300 text-slate-900 text-xs px-2 py-1 rounded-md uppercase tracking-wider font-bold -rotate-6">{t("landing.benefits.login.badge")}</span>
              </h3>
              <p className="text-indigo-100 dark:text-indigo-100 font-bold text-sm mb-6 pb-6 border-b-2 border-white/20 relative z-10">
                {t("landing.benefits.login.desc")}
              </p>
              
              <ul className="space-y-4 mb-8 relative z-10 flex-grow">
                {[
                  t("landing.benefits.login.item1"),
                  t("landing.benefits.login.item2"),
                  t("landing.benefits.login.item3"),
                  t("landing.benefits.login.item4"),
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 font-bold text-sm leading-relaxed text-indigo-50">
                    <Zap className="w-5 h-5 shrink-0 text-amber-300 fill-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="w-full flex flex-col items-center mb-16 sm:mb-20 pt-4">
          <div className="mb-10 text-center w-full">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-tight">
              {t("landing.faq.title_start")} <span className="text-indigo-600 dark:text-indigo-400">{t("landing.faq.title_end")}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-base max-w-xl mx-auto">
              {t("landing.faq.subtitle")}
            </p>
          </div>

          <div className="w-full space-y-4 md:space-y-6 flex flex-col z-10 mb-12">
            {[1,2,3,4,5,6,7].map((idx) => (
              <div 
                key={idx} 
                className={`w-full bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-900 dark:border-slate-100 overflow-hidden transition-all ${openIdx === idx ? "shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-1" : "shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"}`}
              >
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <h3 className="text-base font-bold pr-4 text-slate-900 dark:text-slate-100">{t(`landing.faq.q${idx}`)}</h3>
                  <div className={`w-8 h-8 shrink-0 rounded-full border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center transition-transform duration-300 ${openIdx === idx ? "rotate-180 bg-amber-300 dark:bg-amber-500 text-slate-900" : "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-slate-100"}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${openIdx === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="p-5 pt-0 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    <hr className="border-slate-200 dark:border-slate-700 mb-4" />
                    {t(`landing.faq.a${idx}`)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full bg-indigo-200 dark:bg-indigo-900 text-slate-900 dark:text-slate-100 rounded-[32px] p-6 md:p-8 border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-center flex flex-col items-center transition-colors">
            <MessageCircle className="w-10 h-10 mb-3 text-indigo-700 dark:text-indigo-300" />
            <h2 className="text-xl md:text-2xl font-black mb-2">{t("landing.faq.more.title")}</h2>
            <p className="mb-6 text-sm font-medium max-w-md opacity-80">
              {t("landing.faq.more.desc")}
            </p>
            <Link 
              to="/coach" 
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.5)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-slate-900 dark:border-slate-100 transition-all"
            >
              {t("landing.faq.more.btn")}
            </Link>
          </div>
        </section>

      </div>
      
      <div className="w-full mt-auto">
        <Footer />
      </div>

    </div>
  );
}
