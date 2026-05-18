import React, { useState, useEffect, useRef } from "react";
import { Camera, Image as ImageIcon, Calculator, RefreshCw, Share2, Upload, Loader2, Info, History, ArrowLeft } from "lucide-react";
import { scanStrukDenganGemini } from "../services/geminiService";
import { useTranslation } from "react-i18next";
import FloatingDecorations from "../components/FloatingDecorations";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, doc, getDocs, setDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

interface CalculationResult {
  totalSewa: number;
  biayaTambahan: number;
  totalKeseluruhan: number;
  jumlahPemain: number;
  biayaPerOrang: number;
}

interface HistoryItem extends CalculationResult {
  id: string;
  savedAt: any;
}

import LoginPromptModal from "../components/LoginPromptModal";

export default function KalkulatorMabar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [totalSewa, setTotalSewa] = useState<string>("");
  const [biayaTambahan, setBiayaTambahan] = useState<string>("");
  const [jumlahPemain, setJumlahPemain] = useState<string>("");
  const [hasil, setHasil] = useState<CalculationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyDocs, setHistoryDocs] = useState<HistoryItem[]>([]);
  const [loginPromptParams, setLoginPromptParams] = useState<{isOpen: boolean, message: string}>({ isOpen: false, message: "" });

  useEffect(() => {
    if (showHistory && user) {
      const loadHistory = async () => {
        try {
          const q = query(
            collection(db, `users/${user.uid}/history_kalkulator`),
            orderBy("savedAt", "desc"),
            limit(20)
          );
          const snap = await getDocs(q);
          const list: HistoryItem[] = [];
          snap.forEach(d => {
            list.push({ id: d.id, ...d.data() } as HistoryItem);
          });
          setHistoryDocs(list);
        } catch (error) {
          console.error("Error loading history:", error);
        }
      };
      loadHistory();
    }
  }, [showHistory, user]);

  const saveToHistory = async (result: CalculationResult) => {
    if (!user) return;
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, `users/${user.uid}/history_kalkulator`, id), {
        ...result,
        savedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error saving history:", err);
    }
  };

  const formatRibuan = (value: string) => {
    if (!value) return "";
    const num = parseInt(value, 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("id-ID");
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse inputs
    const parsedSewa = parseFloat(totalSewa) || 0;
    const parsedTambahan = parseFloat(biayaTambahan) || 0;
    const parsedPemain = parseInt(jumlahPemain) || 1; // Default to 1 to avoid division by zero
    
    const totalKeseluruhan = parsedSewa + parsedTambahan;
    const biayaPerOrang = Math.ceil(totalKeseluruhan / parsedPemain);
    
    const resultObj = {
      totalSewa: parsedSewa,
      biayaTambahan: parsedTambahan,
      totalKeseluruhan,
      jumlahPemain: parsedPemain,
      biayaPerOrang
    };
    
    setHasil(resultObj);
    if (user) {
      saveToHistory(resultObj);
    } else {
      setLoginPromptParams({ isOpen: true, message: "Hasil sudah dihitung! Login sekarang untuk otomatis menyimpan riwayat mabar kamu." });
    }
  };

  const handleReset = () => {
    setTotalSewa("");
    setBiayaTambahan("");
    setJumlahPemain("");
    setHasil(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        // removing the prefix (e.g. data:image/jpeg;base64,)
        const base64Stripped = base64Data.split(",")[1];
        
        try {
          const extractedAmount = await scanStrukDenganGemini(base64Stripped, file.type);
          if (extractedAmount) {
            setTotalSewa(extractedAmount);
          } else {
            setScanError(t("calc.alert.scan_fail", "Gagal membaca nominal dari struk. Pastikan fotonya jelas ya."));
          }
        } catch (err: any) {
          if (err?.message === "ERROR_429") {
            setScanError("Kuota AI habis (Error 429). Silakan tunggu sebentar sebelum mencoba lagi.");
          } else {
            setScanError(t("calc.alert.process_fail", "Terjadi kesalahan saat memproses gambar."));
          }
        }
        setIsScanning(false);
      };
      
      reader.onerror = () => {
        setScanError(t("calc.alert.read_fail", "Gagal membaca file gambar."));
        setIsScanning(false);
      };
    } catch (error) {
      console.error("Scanner error", error);
      setScanError(t("calc.alert.process_fail"));
      setIsScanning(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getWhatsAppShareUrl = () => {
    if (!hasil) return "#";
    
    const formatRupiah = (angka: number) => {
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0
      }).format(angka);
    };

    const text = `${t('calc.wa.template.title')}
${t('calc.wa.template.court')} ${formatRupiah(hasil.totalSewa)}
${t('calc.wa.template.extra')} ${formatRupiah(hasil.biayaTambahan)}
${t('calc.wa.template.total')} ${formatRupiah(hasil.totalKeseluruhan)}
${t('calc.wa.template.players', { count: hasil.jumlahPemain })}
${t('calc.wa.template.per_person', { amount: formatRupiah(hasil.biayaPerOrang) })}

${t('calc.wa.template.transfer')} `;

    const encodedText = encodeURIComponent(text);
    return `https://wa.me/?text=${encodedText}`;
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 relative min-h-[calc(100vh-5rem)] bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-200">
      <FloatingDecorations />
      <div className="w-full max-w-4xl text-center mb-8 z-10 animate-fade-in relative">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-3">
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight m-0">
             {t("calc.title_start")} <span className="text-indigo-600 dark:text-indigo-400">{t("calc.title_end")}</span>
           </h1>
           {user && (
             <button
               onClick={() => setShowHistory(!showHistory)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-bold text-xs uppercase tracking-wide transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 ${
                 showHistory ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100'
               }`}
             >
               {showHistory ? <ArrowLeft className="w-4 h-4" /> : <History className="w-4 h-4" />}
               {showHistory ? 'Kembali' : 'Riwayat'}
             </button>
           )}
        </div>
        {!showHistory && (
          <p className="text-slate-600 dark:text-slate-400 font-bold text-base max-w-xl mx-auto">
            {t("calc.subtitle")}
          </p>
        )}
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-6 items-stretch z-10 animate-fade-in mx-auto">
        {showHistory ? (
          <div className="w-full flex md:flex-row flex-col bg-white dark:bg-zinc-900 rounded-[24px] p-5 sm:p-6 md:p-8 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-colors min-h-[400px]">
            {historyDocs.length > 0 ? (
               <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-2">
                 {historyDocs.map((doc, idx) => (
                   <div key={doc.id} className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-2 relative">
                     <p className="text-xs text-slate-500 font-bold mb-1">
                       {doc.savedAt?.toDate ? doc.savedAt.toDate().toLocaleDateString("id-ID", {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                       }) : 'Baru saja'}
                     </p>
                     <div className="flex justify-between items-center bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Patungan</span>
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatRupiah(doc.totalKeseluruhan)}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">Jumlah Pemain</span>
                        <span className="text-slate-700 dark:text-slate-300">{doc.jumlahPemain} Orang</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">Biaya per Orang</span>
                        <span className="text-green-600 dark:text-green-400">{formatRupiah(doc.biayaPerOrang)}</span>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                   <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2 stroke-[2]" />
                   <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                     Belum ada riwayat perhitungan.
                   </p>
                </div>
            )}
          </div>
        ) : (
          <>
            {/* Form Kalkulator */}
            <div className="w-full flex flex-col bg-white dark:bg-zinc-900 rounded-[24px] p-5 sm:p-6 md:p-8 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-colors">
              <form onSubmit={handleCalculate} className="space-y-6 flex flex-col h-full">
            <div className="flex-1 space-y-6">
              <div className="space-y-2 relative">
                <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-3 block tracking-wide">{t("calc.court_fee")}</label>
                <div className="flex gap-2 h-[52px]">
                  <div className="relative flex-1 h-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 dark:text-slate-400 text-sm">Rp</span>
                    <input
                      type="text"
                      value={formatRibuan(totalSewa)}
                      onChange={(e) => setTotalSewa(e.target.value.replace(/\D/g, ""))}
                      required
                      placeholder={t("calc.placeholder.court_fee")}
                      className="w-full h-full pl-12 pr-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                    />
                  </div>
                  
                  {/* Scan/Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="h-full flex items-center justify-center gap-2 px-4 bg-[#d1fae5] dark:bg-teal-900/60 border-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 rounded-xl hover:bg-[#a7f3d0] dark:hover:bg-teal-800 transition-colors disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                    title="Scan / Upload Struk"
                  >
                    {isScanning ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 stroke-[2.5]" />
                        <Camera className="w-4 h-4 stroke-[2.5] hidden sm:block" />
                      </>
                    )}
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider hidden sm:block">Upload</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-2">
                  <Info className="w-3 h-3 stroke-[2.5]" /> {t("calc.scan_hint")}
                </p>
                {scanError && (
                  <p className="text-[10px] uppercase tracking-wider text-red-500 font-bold mt-1">
                    {scanError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-3 block tracking-wide">{t("calc.extra_fee")} <span className="opacity-70 text-xs">({t("calc.extra_fee_opt")})</span></label>
                <div className="relative h-[52px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 dark:text-slate-400 text-sm">Rp</span>
                  <input
                    type="text"
                    value={formatRibuan(biayaTambahan)}
                    onChange={(e) => setBiayaTambahan(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("calc.placeholder.extra_fee")}
                    className="w-full h-full pl-12 pr-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mt-2">{t("calc.extra_hint")}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-3 block tracking-wide">{t("calc.player_count")}</label>
                <div className="relative h-[52px]">
                  <input
                    type="text"
                    value={formatRibuan(jumlahPemain)}
                    onChange={(e) => setJumlahPemain(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder={t("calc.placeholder.player_count")}
                    className="w-full h-full px-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-auto flex gap-3">
              <button
                type="submit"
                className="flex-1 h-[52px] bg-indigo-600 dark:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all flex justify-center items-center gap-2 border-2 border-slate-900 dark:border-slate-100"
              >
                {t("calc.btn_calculate")}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-[52px] px-5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 font-black rounded-xl border-2 border-slate-900 dark:border-slate-100 hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex justify-center items-center"
                title={t("calc.reset_hint")}
              >
                <RefreshCw className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>

        {/* Hasil & Struk Digital */}
        <div className="w-full flex flex-col">
          {hasil ? (
            <div className="flex-1 flex flex-col justify-between animate-fade-in bg-amber-50 dark:bg-amber-900/10 rounded-[24px] p-5 sm:p-6 md:p-8 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative h-full">
              
              {/* Receipt Header */}
              <div className="flex flex-col items-center border-b-2 border-dashed border-slate-300 dark:border-slate-600 pb-4 mb-4">
                <div className="w-12 h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl flex items-center justify-center mb-3 rotate-3">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">{t("calc.receipt.title")}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-xs">{t("calc.receipt.subtitle")}</p>
              </div>

              {/* Receipt Content */}
              <div className="space-y-3 mb-6 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                  <span>{t("calc.receipt.court_fee")}</span>
                  <span>{formatRupiah(hasil.totalSewa)}</span>
                </div>
                {hasil.biayaTambahan > 0 && (
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                    <span>{t("calc.receipt.extra_fee")}</span>
                    <span>{formatRupiah(hasil.biayaTambahan)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-900 dark:text-slate-100 font-black pt-2 border-t-2 border-slate-200 dark:border-slate-700 text-sm">
                  <span>{t("calc.receipt.total")}</span>
                  <span>{formatRupiah(hasil.totalKeseluruhan)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold pb-3 border-b-2 border-dashed border-slate-300 dark:border-slate-700 text-xs">
                  <span>{t("calc.receipt.player_count")}</span>
                  <span>{hasil.jumlahPemain} Orang</span>
                </div>
                
                {/* Result per person */}
                <div className="text-center bg-green-100 dark:bg-green-900/30 rounded-2xl p-4 border-2 border-green-200 dark:border-green-800 mt-4 relative overflow-hidden">
                  <div className="text-green-800 dark:text-green-400 font-black mb-1 uppercase tracking-wide text-[10px]">{t("calc.receipt.per_person")}</div>
                  <div className="text-2xl sm:text-3xl text-green-700 dark:text-green-300 font-black">{formatRupiah(hasil.biayaPerOrang)}</div>
                </div>
              </div>

              {/* Share Button (WA Green) & Login Trigger */}
              <div className="flex flex-col gap-3">
                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-[52px] bg-[#25D366] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_0px_#128c7e] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#128c7e] transition-all flex justify-center items-center gap-2 border-2 border-[#128c7e]"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413z"/>
                  </svg>
                  {t("calc.receipt.btn_wa")}
                </a>
                
                {!user && (
                   <button
                     onClick={() => navigate("/login")}
                     className="w-full h-[52px] bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex justify-center items-center gap-2"
                   >
                     Login untuk Simpan Riwayat
                   </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-5 sm:p-6 md:p-8 border-[3px] border-dashed border-slate-300 dark:border-slate-100 rounded-[24px] bg-slate-50/50 dark:bg-zinc-900/50">
              <Calculator className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 stroke-[2]" />
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm text-sm">
                {t("calc.empty.desc")}
              </p>
            </div>
          )}
        </div>
        </>
        )}
      </div>

      <LoginPromptModal 
        isOpen={loginPromptParams.isOpen} 
        onClose={() => setLoginPromptParams({ ...loginPromptParams, isOpen: false })} 
        message={loginPromptParams.message} 
      />
    </div>
  );
}
