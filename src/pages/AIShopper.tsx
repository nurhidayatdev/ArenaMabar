import React, { useState, useEffect } from "react";
import { ArrowRight, Heart } from "lucide-react";
import FloatingDecorations from "../components/FloatingDecorations";
import { useNavigate } from "react-router-dom";

const formatRupiah = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseRupiah = (value: string) => {
  const numericString = value.replace(/[^0-9]/g, "");
  return numericString ? parseInt(numericString, 10) : 0;
};

export default function AIShopper() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [sport, setSport] = useState(t("shop.sport.badminton", "Badminton"));
  const [category, setCategory] = useState("Raket");
  const [customCategory, setCustomCategory] = useState("");
  const [specificNeeds, setSpecificNeeds] = useState("");
  const [minBudget, setMinBudget] = useState(100000);
  const [maxBudget, setMaxBudget] = useState(2000000);
  const [level, setLevel] = useState(3); // 1 to 5
  
  const OTHER_STRING = "Lainnya...";
  const sports = [
    t("shop.sport.soccer", "Sepakbola/Futsal"), 
    t("shop.sport.basketball", "Basket"), 
    t("shop.sport.badminton", "Badminton"), 
    t("shop.sport.tennis", "Tenis"), 
    t("shop.sport.volleyball", "Voli"), 
    t("shop.sport.table_tennis", "Tenis Meja"), 
    t("shop.sport.golf", "Golf"), 
    t("shop.sport.swimming", "Renang"), 
    t("shop.sport.billiard", "Biliar"), 
    t("shop.sport.bowling", "Bowling"), 
    t("shop.sport.gym", "Gym/Fitness"), 
    t("shop.sport.running", "Lari"), 
    OTHER_STRING
  ];
  const sportCategories: Record<string, string[]> = {
    [t("shop.sport.soccer", "Sepakbola/Futsal")]: ["Sepatu Bola/Futsal", "Jersey", "Bola", "Deker", "Sarung", "Tas"],
    [t("shop.sport.badminton", "Badminton")]: ["Raket", "Sepatu Badminton", "Jersey", "Kok", "Grip", "Tas"],
    [t("shop.sport.basketball", "Basket")]: ["Sepatu Basket", "Jersey", "Bola Basket", "Protektor", "Tas"],
    [t("shop.sport.tennis", "Tenis")]: ["Raket", "Sepatu Tenis", "Bola Tenis", "Pakaian", "Tas"],
    [t("shop.sport.volleyball", "Voli")]: ["Sepatu Voli", "Jersey", "Bola Voli", "Knee Pad", "Tas"],
    [t("shop.sport.table_tennis", "Tenis Meja")]: ["Bet", "Bola Ping Pong", "Meja/Net", "Sepatu Ping Pong", "Tas"],
    [t("shop.sport.golf", "Golf")]: ["Stik Golf", "Bola Golf", "Sepatu Golf", "Pakaian", "Sarung Tangan", "Tas"],
    [t("shop.sport.swimming", "Renang")]: ["Pakaian Renang", "Kacamata Renang", "Topi Renang", "Papan Seluncur"],
    [t("shop.sport.billiard", "Biliar")]: ["Stik Biliar", "Bola Biliar", "Meja Biliar", "Kapur"],
    [t("shop.sport.bowling", "Bowling")]: ["Bola Bowling", "Sepatu Bowling", "Tas Bowling"],
    [t("shop.sport.gym", "Gym/Fitness")]: ["Sepatu Training", "Pakaian Gym", "Dumbbell", "Matras", "Sarung Tangan"],
    [t("shop.sport.running", "Lari")]: ["Sepatu Lari", "Pakaian Lari", "Smartwatch/Tracker", "Botol Minum", "Tas Pinggang"],
  };
  sportCategories[OTHER_STRING] = ["Sepatu", "Pakaian", "Alat Spesifik", "Aksesori", "Tas"];
  const currentCategories = sportCategories[sport] || sportCategories[OTHER_STRING];
  
  const levels = ["Pemula", "Amatir", "Menengah", "Lanjutan", "Profesional"];


  // Update category when sport changes if it's not in the new list
  useEffect(() => {
    if (!currentCategories.includes(category) && !customCategory) {
      setCategory(currentCategories[0]);
    }
  }, [sport, currentCategories, category, customCategory]);

  const handleSearch = async () => {
    const selectedCat = customCategory.trim() || category;
    navigate('/shopper-results', {
      state: {
        sport,
        category: selectedCat,
        specificNeeds,
        minBudget,
        maxBudget,
        level
      }
    });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 py-8 relative min-h-[calc(100vh-5rem)] bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-200">
      <FloatingDecorations />
      
      <div className="w-full max-w-4xl text-center mb-8 z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase m-0">
            {"Rekomendasi"} <span className="text-orange-500">{"Alat"}</span>
          </h1>
          <button
            onClick={() => navigate('/shopper-results', { state: { showFavorites: true, sport: '', category: '', specificNeeds: '', minBudget: 0, maxBudget: 0, level: '' } })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-bold text-xs uppercase tracking-wide transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100"
          >
            <Heart className="w-4 h-4 text-rose-500" /> Favorit
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-base max-w-xl mx-auto px-4">
          {t("shop.subtitle", { sport })}
        </p>
      </div>

      <div className="w-full max-w-3xl flex flex-col z-10 mx-auto">
        
        {/* form is now full width and centered */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-[24px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-5 sm:p-6 md:p-8 transition-colors flex flex-col">
        
        {/* Navigation / Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep 
                    ? "w-12 bg-orange-500" 
                    : i + 1 < currentStep 
                      ? "w-4 bg-emerald-500" 
                      : "w-4 bg-slate-200 dark:bg-zinc-700"
                }`} 
              />
            ))}
          </div>
          <span className="font-black text-sm text-slate-500 dark:text-slate-400">
            {`LANGKAH ${currentStep} / ${totalSteps }`}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-start">
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-tight">{"Pilih Olahraga"}</h2>
              <div className="flex flex-wrap gap-2">
                {sports.filter(s => s !== OTHER_STRING).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSport(s); }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 border-slate-900 dark:border-slate-100 ${
                      sport === s
                        ? "bg-emerald-500 text-white dark:border-emerald-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                        : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder={"Atau tulis olahraga lain..."}
                  value={sports.filter(s => s !== OTHER_STRING).includes(sport) ? "" : sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full h-[52px] px-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-tight">{"Kategori & Kebutuhan"}</h2>
              <div className="mb-5">
                <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-3 block tracking-wide">{"PILIH KATEGORI ALAT"}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentCategories.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCategory(c); setCustomCategory(""); }}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 border-slate-900 dark:border-slate-100 ${
                        category === c && !customCategory
                          ? "bg-indigo-600 text-white dark:border-indigo-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                          : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => { setCustomCategory(e.target.value); setCategory(""); }}
                  placeholder={t("shop.step2.other", { sport })}
                  className="w-full h-[52px] px-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-tight">{"Level Permainan"}</h2>
               <div className="flex flex-wrap gap-2">
                 {levels.map((lvl, index) => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(index + 1)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 border-slate-900 dark:border-slate-100 ${
                        level === index + 1
                          ? "bg-indigo-600 text-white dark:border-indigo-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                          : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {lvl}
                    </button>
                 ))}
               </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-tight">{"Rentang Budget"}</h2>
              <div className="bg-slate-50 dark:bg-zinc-800 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-5">
                <div>
                  <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-2 block tracking-wide">{"PILIH PRESET BUDGET"}</label>
                  <select 
                    onChange={(e) => {
                       if(e.target.value) {
                          const [min, max] = e.target.value.split("-");
                          setMinBudget(parseInt(min));
                          setMaxBudget(parseInt(max));
                       }
                    }}
                    className="w-full h-[52px] px-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] appearance-none cursor-pointer"
                  >
                    <option value="">{"-- Ketik manual atau pilih preset --"}</option>
                    <option value="100000-500000">Rp 100.000 - Rp 500.000</option>
                    <option value="500000-1000000">Rp 500.000 - Rp 1.000.000</option>
                    <option value="1000000-2000000">Rp 1.000.000 - Rp 2.000.000</option>
                    <option value="2000000-5000000">Rp 2.000.000 - Rp 5.000.000</option>
                    <option value="5000000-15000000">Rp 5.000.000 - Rp 15.000.000</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:flex-1">
                    <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-2 block tracking-wide">{"BUDGET MINIMAL"}</label>
                    <div className="relative h-[52px]">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 dark:text-slate-400 text-sm">Rp</span>
                      <input
                        type="text"
                        value={formatRupiah(minBudget)}
                        onChange={(e) => setMinBudget(parseRupiah(e.target.value))}
                        className="w-full h-full pl-12 pr-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                      />
                    </div>
                  </div>
                  <div className="hidden sm:block text-xl font-black text-slate-400 mt-6">-</div>
                  <div className="w-full sm:flex-1">
                    <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-2 block tracking-wide">{"BUDGET MAKSIMAL"}</label>
                    <div className="relative h-[52px]">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 dark:text-slate-400 text-sm">Rp</span>
                      <input
                        type="text"
                        value={formatRupiah(maxBudget)}
                        onChange={(e) => setMaxBudget(parseRupiah(e.target.value))}
                        className="w-full h-full pl-12 pr-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-auto pt-4 border-t-2 border-slate-100 dark:border-slate-800">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`w-1/3 h-[52px] rounded-xl border-2 font-black text-sm uppercase tracking-wide transition-all active:translate-y-0 active:shadow-none focus:outline-none flex items-center justify-center ${
              currentStep === 1 
                ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed" 
                : "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            }`}
          >
            {"Kembali"}
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="w-2/3 h-[52px] bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl border-2 border-slate-900 dark:border-slate-100 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all active:shadow-none active:translate-y-0 focus:outline-none"
            >
              {"Lanjut"} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSearch}
              className="w-2/3 h-[52px] bg-orange-500 hover:bg-orange-600 text-slate-900 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all active:shadow-none active:translate-y-0"
            >
              <>{"CARI GEAR!"}</>
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
