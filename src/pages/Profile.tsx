import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, LogOut, CheckCircle2 } from "lucide-react";
import FloatingDecorations from "../components/FloatingDecorations";

const PREDEFINED_SPORTS = [
  "Soccer/Futsal", "Basketball", "Badminton", "Tennis", 
  "Volleyball", "Table Tennis", "Golf", "Swimming", 
  "Billiard", "Bowling", "Gym/Fitness"
];

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    displayName: "",
    favoriteSports: [] as string[]
  });
  const [customSport, setCustomSport] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            displayName: data.displayName || "",
            favoriteSports: data.favoriteSports || (data.favoriteSport ? [data.favoriteSport] : [])
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Add pending custom sport if user forgot to press enter
    let sportsToSave = [...profileData.favoriteSports];
    if (customSport.trim() && !sportsToSave.includes(customSport.trim())) {
      sportsToSave.push(customSport.trim());
    }

    setIsSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: profileData.displayName,
        favoriteSports: sportsToSave,
        updatedAt: serverTimestamp()
      });
      setSaved(true);
      if (customSport.trim()) {
        setProfileData(prev => ({...prev, favoriteSports: sportsToSave}));
        setCustomSport("");
      }
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleCustomSportKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const sport = customSport.trim();
      if (sport && !profileData.favoriteSports.includes(sport)) {
        setProfileData(prev => ({
          ...prev,
          favoriteSports: [...prev.favoriteSports, sport]
        }));
      }
      setCustomSport('');
    }
  };

  if (loading || isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8F9FA] dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) return null;

  const allDisplayedSports = Array.from(new Set([...PREDEFINED_SPORTS, ...profileData.favoriteSports]));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F8F9FA] dark:bg-zinc-950 transition-colors py-10 min-h-[calc(100vh-5rem)]">
      <FloatingDecorations />
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-3xl border-[3px] border-slate-900 dark:border-slate-100 p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-full border-2 border-slate-900 bg-indigo-100 flex items-center justify-center text-xl font-bold font-mono">
               {user.email?.charAt(0).toUpperCase()}
             </div>
             <div>
               <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{profileData.displayName || "Pengguna"}</h1>
               <p className="text-xs font-medium text-slate-500 overflow-hidden text-ellipsis max-w-[150px] sm:max-w-full">{user.email}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 transition-colors border-2 border-transparent hover:border-red-600 flex items-center gap-2 font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border-[3px] border-slate-900 dark:border-slate-100 p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative z-10">
          <h2 className="text-xl font-black uppercase tracking-wide mb-6">Edit Profil</h2>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Nama Panggilan</label>
              <input
                type="text"
                required
                value={profileData.displayName}
                onChange={e => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full bg-[#F8F9FA] dark:bg-zinc-950 border-2 border-slate-900 dark:border-slate-100 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Olahraga Favorit</label>
              <div className="flex flex-wrap gap-2">
                {allDisplayedSports.map(sport => {
                  const isSelected = profileData.favoriteSports.includes(sport);
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          favoriteSports: isSelected 
                            ? prev.favoriteSports.filter(s => s !== sport)
                            : [...prev.favoriteSports, sport]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg border-2 font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none ${
                        isSelected
                          ? "bg-indigo-600 border-slate-900 dark:border-slate-100 text-white"
                          : "bg-white dark:bg-zinc-900 border-slate-900 dark:border-slate-100 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={customSport}
                onChange={e => setCustomSport(e.target.value)}
                onKeyDown={handleCustomSportKeyDown}
                className="w-full bg-white dark:bg-zinc-950 border-[3px] border-slate-900 dark:border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-0 mt-2 placeholder:text-slate-400 placeholder:font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                placeholder="Tambah olahraga lain (tekan Enter)..."
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold px-6 py-4 rounded-xl border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Simpan Perubahan <ArrowRight className="w-5 h-5" /></>}
            </button>
            {saved && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mt-4 animate-fade-in">
                <CheckCircle2 className="w-5 h-5" />
                <span>Profil diperbarui!</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
