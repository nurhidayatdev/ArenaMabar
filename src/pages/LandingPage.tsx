import React from "react";
import { ArrowRight, MapPin, Users, HeartPulse, CheckCircle2, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import Footer from "../components/Footer";
export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] relative overflow-x-hidden overflow-y-auto w-full">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center z-10 px-4 sm:px-6 flex-1">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-80px)] pb-10 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Cari Lapangan Cepat,<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-500">Langsung Gas Mabar!</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
              Temukan lapangan kosong terdekat dan dapatkan panduan latihan AI khusus untukmu, semua dalam satu genggaman tanpa ribet login.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg"
          >
            <Link to="/lapangan" className="bg-slate-900 w-full sm:w-auto text-white rounded-full border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] px-8 py-3 text-base font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              Mulai Cari <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <section className="w-full flex flex-col items-center mb-16 sm:mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Kenapa Memilih ArenaMabar?</h2>
            <p className="text-base text-slate-600 font-medium">Fitur cerdas yang memahami kebutuhan olahragamu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 bg-indigo-100 border-2 border-slate-900 rounded-2xl rotate-3 mb-5 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-indigo-600 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900">Radar Lapangan</h3>
              <p className="text-sm text-slate-600 font-medium">Pendeteksi ketersediaan lapangan olahraga terdekat lengkap dengan rute, rating, dan kontak booking langsung.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 bg-teal-100 border-2 border-slate-900 rounded-2xl rotate-3 mb-5 flex items-center justify-center">
                <HeartPulse className="w-7 h-7 text-teal-600 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900">Personal AI Coach</h3>
              <p className="text-sm text-slate-600 font-medium">Bicarakan masalah otot atau posturmu, dapatkan rekomendasi gerakan dan pola makan spesifik dari pelatih kecerdasan buatan.</p>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="w-full flex flex-col items-center bg-slate-900 text-white rounded-[32px] p-8 md:p-10 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(203,213,225,1)] mb-16 sm:mb-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] opacity-30"></div>
          
          <div className="mb-10 text-center z-10 w-full">
            <h2 className="text-3xl font-black mb-3">Cara Kerja ArenaMabar</h2>
            <p className="text-base text-slate-300 font-medium max-w-2xl mx-auto">Kami mendesain alur sesederhana mungkin. Kurang dari 2 menit kamu sudah bisa menemukan solusi.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full z-10">
            {[
              { title: "Izinkan Akses Lokasi", desc: "Klik izinkan GPS agar kami bisa mendeteksi area sekitar tempat tinggalmu dengan akurat.", icon: MapPin, color: "text-blue-400" },
              { title: "Ketik Apa yang Kamu Cari", desc: "Tuliskan 'Cari lapangan badminton' atau 'Mau mabar futsal', serahkan sisanya pada sistem kami.", icon: Zap, color: "text-amber-400" },
              { title: "Pilih & Hubungi", desc: "Dapatkan daftar rekomendasi. Lihat detail, rating, rute, dan langsung chat untuk reservasi.", icon: CheckCircle2, color: "text-emerald-400" }
            ].map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center text-center p-5 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
                <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-5 shadow-inner ${step.color}`}>
                  <step.icon className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center mb-3 text-xs">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 font-medium text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-400 rounded-[32px] p-8 md:p-10 text-center text-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden mb-16 sm:mb-20">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')" }}></div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
             <HeartPulse className="w-12 h-12 mb-4 mt-2" />
             <h2 className="text-3xl md:text-4xl font-black mb-3 max-w-2xl leading-tight">Tanya Langsung ke Coach AI</h2>
             <p className="text-base font-medium mb-6 max-w-xl opacity-90">Bingung mulai olahraga dari mana? Ada keluhan otot? Tanya langsung ke asisten AI kita. Gratis!</p>
             <Link to="/coach" className="bg-slate-900 text-white rounded-full border-4 border-slate-900 px-8 py-3 text-base font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
               Ngobrol dengan Coach <ArrowRight className="w-5 h-5" />
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
