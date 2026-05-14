import React from "react";
import { ArrowRight, MapPin, Users, HeartPulse, CheckCircle2, Star, Zap, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import FloatingDecorations from "../components/FloatingDecorations";

import Footer from "../components/Footer";
export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-slate-900 transition-colors duration-200 relative overflow-x-hidden overflow-y-auto w-full">
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
            className="flex flex-col items-center"
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
            <Link to="/lapangan" className="bg-slate-900 dark:bg-slate-100 w-full sm:w-auto text-white dark:text-slate-900 rounded-full border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] px-8 py-3 text-base font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 border-2 border-slate-900 dark:border-slate-100 rounded-2xl rotate-3 mb-5 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.feature1.title")}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t("landing.feature1.desc")}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
               <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 border-2 border-slate-900 dark:border-slate-100 rounded-2xl -rotate-3 mb-5 flex items-center justify-center">
                <Calculator className="w-7 h-7 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.feature2.title")}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t("landing.feature2.desc")}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 border-2 border-slate-900 dark:border-slate-100 rounded-2xl rotate-3 mb-5 flex items-center justify-center">
                <HeartPulse className="w-7 h-7 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-slate-100">{t("landing.feature3.title")}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t("landing.feature3.desc")}</p>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="w-full flex flex-col items-center bg-amber-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-[32px] p-8 md:p-10 border-4 border-slate-900 dark:border-slate-100 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-16 sm:mb-20 transition-colors">
          
          <div className="mb-10 text-center w-full">
            <h2 className="text-3xl font-black mb-3">{t("landing.steps.title")}</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full">
            {[
              { title: t("landing.steps.step1.title"), desc: t("landing.steps.step1.desc"), icon: MapPin, bg: "bg-blue-300 dark:bg-blue-500" },
              { title: t("landing.steps.step2.title"), desc: t("landing.steps.step2.desc"), icon: CheckCircle2, bg: "bg-emerald-300 dark:bg-emerald-500" },
              { title: t("landing.steps.step3.title"), desc: t("landing.steps.step3.desc"), icon: Calculator, bg: "bg-fuchsia-300 dark:bg-fuchsia-500" }
            ].map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-[24px] border-4 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all">
                <div className={`w-14 h-14 rounded-2xl border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center mb-5 rotate-3 ${step.bg}`}>
                  <step.icon className="w-7 h-7 text-slate-900 dark:text-slate-900 stroke-[2.5]" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 font-black flex items-center justify-center mb-3 text-sm">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-black mb-2 dark:text-slate-100">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-400 dark:from-indigo-700 dark:to-fuchsia-700 rounded-[32px] p-8 md:p-10 text-center text-white border-4 border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden mb-16 sm:mb-20">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')" }}></div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
             <HeartPulse className="w-12 h-12 mb-4 mt-2" />
             <h2 className="text-3xl md:text-4xl font-black mb-3 max-w-2xl leading-tight">{t("coach.title")}</h2>
             <p className="text-base font-medium mb-6 max-w-xl opacity-90">{t("coach.subtitle")}</p>
             <Link to="/coach" className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full border-4 border-slate-900 dark:border-slate-100 px-8 py-3 text-base font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all hover:scale-105 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
               {t("landing.hero.btn_coach")} <ArrowRight className="w-5 h-5" />
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
