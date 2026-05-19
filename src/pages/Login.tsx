import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { UserCircle2, ArrowRight, Loader2 } from "lucide-react";
import FloatingDecorations from "../components/FloatingDecorations";

const PREDEFINED_SPORTS = [
  "Soccer/Futsal", "Basketball", "Badminton", "Tennis", 
  "Volleyball", "Table Tennis", "Golf", "Swimming", 
  "Billiard", "Bowling", "Gym/Fitness"
];

export default function Login() {
  const { user, loading, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    displayName: "",
    favoriteSports: [] as string[]
  });
  const [customSport, setCustomSport] = useState("");
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        setCheckingProfile(true);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            navigate("/");
          } else {
            setProfileData(prev => ({
              ...prev,
              displayName: user.displayName || ""
            }));
            setNeedsSetup(true);
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        } finally {
          setCheckingProfile(false);
        }
      }
    };
    if (!loading) {
      if (user) {
        checkProfile();
      }
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error(error);
    }
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    let sportsToSave = [...profileData.favoriteSports];
    if (customSport.trim() && !sportsToSave.includes(customSport.trim())) {
      sportsToSave.push(customSport.trim());
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: profileData.displayName,
        favoriteSports: sportsToSave,
        updatedAt: serverTimestamp()
      });
      navigate("/");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8F9FA] dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const allDisplayedSports = Array.from(new Set([...PREDEFINED_SPORTS, ...profileData.favoriteSports]));

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#F8F9FA] dark:bg-zinc-950 transition-colors">
      <FloatingDecorations />
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border-[3px] border-slate-900 dark:border-slate-100 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] p-6 sm:p-8 overflow-hidden relative transition-colors">
        {!user || !needsSetup ? (
          <div className="space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 border-2 border-slate-900 dark:border-slate-100 rounded-full flex items-center justify-center mb-2">
              <UserCircle2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">Selamat Datang</h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">Masuk untuk menyimpan profil dan riwayat mabar kamu.</p>
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold px-6 py-4 rounded-xl border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 bg-white rounded-full" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Masuk dengan Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">Lengkapi Profil</h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">Biar mabar makin asik, kenalan dulu yuk!</p>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Nama Panggilan</label>
                <input
                  type="text"
                  required
                  value={profileData.displayName}
                  onChange={e => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full bg-[#F8F9FA] dark:bg-zinc-950 border-2 border-slate-900 dark:border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                  placeholder="Nama kamu..."
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
                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold px-6 py-4 rounded-xl border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Simpan <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
