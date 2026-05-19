import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Loader2, ExternalLink, ArrowLeft, AlertCircle, ArrowDownAZ, ArrowUpAZ, Heart } from "lucide-react";
import { fetchShopperRecommendations, ShopperRecommendation } from "../services/geminiService";
import FloatingDecorations from "../components/FloatingDecorations";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import LoginPromptModal from "../components/LoginPromptModal";

export default function ShopperResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const state = location.state as {
    sport: string;
    category: string;
    specificNeeds: string;
    minBudget: number;
    maxBudget: number;
    level: number;
    showFavorites?: boolean;
  } | null;

  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ShopperRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"default" | "lowest" | "highest" | "favorites">(state?.showFavorites ? "favorites" : "default");
  const [favorites, setFavorites] = useState<{ [key: string]: any }>({});
  const [loginPromptParams, setLoginPromptParams] = useState<{isOpen: boolean, message: string}>({ isOpen: false, message: "" });

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      try {
        const favsRef = collection(db, `users/${user.uid}/favorites_shopper`);
        const snapshot = await getDocs(favsRef);
        const favsMap: { [key: string]: any } = {};
        snapshot.forEach((doc) => {
          favsMap[doc.id] = doc.data();
        });
        setFavorites(favsMap);
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
    loadFavorites();
  }, [user]);

  const toggleFavorite = async (item: ShopperRecommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setLoginPromptParams({ isOpen: true, message: "Kamu harus login untuk menyimpan favorit." });
      return;
    }
    const itemId = encodeURIComponent(item.name).replace(/\./g, "_").slice(0, 50);
    const docRef = doc(db, `users/${user.uid}/favorites_shopper`, itemId);
    
    try {
      if (favorites[itemId]) {
        await deleteDoc(docRef);
        setFavorites(prev => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      } else {
        const cleanItem = Object.fromEntries(
          Object.entries(item).filter(([_, v]) => v !== undefined)
        );
        await setDoc(docRef, { ...cleanItem, savedAt: new Date() });
        setFavorites(prev => ({ ...prev, [itemId]: { ...cleanItem, savedAt: new Date() } }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filteredAndSortedRecommendations = useMemo(() => {
    let result = [...recommendations];
    
    if (filterType === "favorites") {
       // OVERRIDE result with our favorites so we can see them even if not in current recommendations
       result = Object.values(favorites);
    }

    return result.sort((a, b) => {
      if (filterType === "default" || filterType === "favorites") return 0;
      
      const getPrice = (str: string) => {
        const match = str.match(/\d[.\d]*/);
        if (!match) return 0;
        return parseInt(match[0].replace(/\./g, ''));
      };
      
      const priceA = getPrice(a.priceRange);
      const priceB = getPrice(b.priceRange);
      
      return filterType === "lowest" ? priceA - priceB : priceB - priceA;
    });
  }, [recommendations, filterType, favorites]);

  useEffect(() => {
    if (!state) {
      navigate('/shopper');
      return;
    }

    const fetchData = async () => {
      if (state.showFavorites && !state.sport) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const res = await fetchShopperRecommendations(
          state.sport, 
          state.category, 
          state.specificNeeds, 
          state.minBudget, 
          state.maxBudget, 
          state.level
        );
        setRecommendations(res);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError(t("shop.error_msg", "Terjadi kesalahan saat mencari perlengkapan."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [state, navigate, t]);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-200 min-h-[calc(100vh-5rem)] relative overflow-hidden">
      <FloatingDecorations />
      
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center z-10">
        
        <div className="w-full flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/shopper')}
            className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-white dark:bg-zinc-900 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-black text-sm uppercase tracking-wide hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-y-0 active:shadow-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> {t("shop.btn_back", "Kembali")}
          </button>
          <div className="text-right">
            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{"Rekomendasi"} <span className="text-orange-500">{"Alat"}</span></h1>
          </div>
        </div>

        {error ? (
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center w-full max-w-2xl mt-12 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">{t("shop.results.oops", "Oops!")}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-bold">{error}</p>
            <button 
              onClick={() => navigate('/shopper')}
              className="mt-6 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl border-2 border-slate-900 font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-y-0 active:shadow-none hover:-translate-y-1"
            >
              {t("shop.results.try_again", "Coba Lagi")}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mt-12 py-20">
            <Loader2 className="w-16 h-16 animate-spin text-orange-500 mb-6" />
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">{"Mencari Gear Terbaik..."}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md text-base md:text-lg">{"Tunggu sebentar, AI sedang memilih produk tervalidasi yang paling pas buat kamu di E-Commerce!"}</p>
          </div>
        ) : (
          <div className="w-full mt-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
               <div className="py-4 px-6 bg-orange-100 dark:bg-zinc-900 rounded-[20px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    <span className="font-black uppercase tracking-wide opacity-50 block text-xs mb-1">{t("shop.results.search_label", "Pencarian")}</span>
                    {t("shop.results.found_msg_1", "Menemukan rekomendasi ")} <span className="text-orange-600 dark:text-orange-400 font-black">{state?.category} {state?.sport}</span> {t("shop.results.found_msg_2", " untuk level ")} <span className="text-orange-600 dark:text-orange-400 font-black">{t(`shop.level.${state?.level}`)}</span>.
                  </p>
               </div>
               
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setFilterType(prev => prev === "lowest" ? "default" : "lowest")}
                   className={`flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-wide transition-all ${filterType === "lowest" ? "bg-orange-500 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 shadow-none hover:bg-slate-50 dark:hover:bg-zinc-800"}`}
                 >
                   <ArrowDownAZ className="w-4 h-4 hidden sm:block" /> {t("shop.filter.lowest", "Termurah")}
                 </button>
                 <button 
                   onClick={() => setFilterType(prev => prev === "highest" ? "default" : "highest")}
                   className={`flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-wide transition-all ${filterType === "highest" ? "bg-orange-500 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 shadow-none hover:bg-slate-50 dark:hover:bg-zinc-800"}`}
                 >
                   <ArrowUpAZ className="w-4 h-4 hidden sm:block" /> {t("shop.filter.highest", "Termahal")}
                 </button>
                 <button 
                   onClick={() => {
                     if (!user) {
                       setLoginPromptParams({ isOpen: true, message: "Kamu harus login untuk melihat favorit." });
                       return;
                     }
                     setFilterType(prev => prev === "favorites" ? "default" : "favorites");
                   }}
                   className={`flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-3 rounded-xl border-2 font-black text-xs uppercase tracking-wide transition-all ${filterType === "favorites" ? "bg-rose-400 dark:bg-rose-600 text-slate-100 border-rose-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 shadow-none hover:bg-slate-50 dark:hover:bg-zinc-800"}`}
                 >
                   <Heart className={`w-4 h-4 ${filterType === "favorites" ? 'text-white fill-white' : ''}`} /> FAVORIT
                 </button>
               </div>
             </div>

             <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedRecommendations.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[24px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] p-4 sm:p-5 flex flex-col transition-all hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 relative">
                   <div className="w-10 h-10 bg-orange-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-3 border-2 border-slate-900 dark:border-slate-600">
                      <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                   </div>
                   <button 
                      onClick={(e) => toggleFavorite(item, e)}
                      className={`absolute top-4 right-4 p-2 rounded-full border-2 border-slate-900 dark:border-slate-100 transition-colors z-20 ${
                        favorites[encodeURIComponent(item.name).replace(/\./g, "_").slice(0, 50)]
                          ? "bg-rose-400 dark:bg-rose-600"
                          : "bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700"
                      }`}
                   >
                      <Heart className={`w-4 h-4 ${
                        favorites[encodeURIComponent(item.name).replace(/\./g, "_").slice(0, 50)]
                          ? "text-white fill-white"
                          : "text-slate-400 dark:text-slate-500"
                      }`} />
                   </button>
                   <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight mb-2 pr-10">{item.name}</h3>
                   <p className="font-black text-emerald-600 dark:text-emerald-400 mb-3 text-sm sm:text-base bg-emerald-50 dark:bg-emerald-900/20 py-1.5 px-2.5 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 inline-block w-fit">{item.priceRange}</p>
                   <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 mb-4 flex-1">
                     <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                       {item.reason}
                     </p>
                   </div>
                   <a 
                     href={item.link} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="mt-auto w-full py-3 bg-orange-500 hover:bg-orange-600 text-slate-900 rounded-xl border-[3px] border-slate-900 dark:border-slate-100 font-black text-xs sm:text-sm uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none transition-all dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                   >
                     {"Cek di E-Commerce"} <ExternalLink className="w-4 h-4" />
                   </a>
                </div>
              ))}
             </div>
          </div>
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
