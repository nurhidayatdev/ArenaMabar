import React, { useState, useEffect, useRef } from "react";
import { Search, Mic, Keyboard, SlidersHorizontal, MapPin, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import { useTranslation } from "react-i18next";
import FloatingDecorations from "../components/FloatingDecorations";

export default function CariLapangan() {
  const { t, i18n } = useTranslation();
  const [activeMode, setActiveMode] = useState<"preference" | "text" | "voice">("preference");
  
  // Preference States
  const [sport, setSport] = useState("Soccer/Futsal");
  const [budget, setBudget] = useState(50000);
  const [distance, setDistance] = useState(5);
  
  // Text State
  const [text, setText] = useState("");
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  
  const { searchState, updateSearchState } = useSearchContext();
  const navigate = useNavigate();

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    let mounted = true;

    const fetchReverseGeocode = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.region;
        if (mounted) {
          updateSearchState({
            latitude: lat,
            longitude: lng,
            userCity: city || null,
            userAddress: data.display_name || null
          });
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        if (mounted) updateSearchState({ latitude: lat, longitude: lng });
      }
    };

    const fetchFallbackLocation = async () => {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const data = await res.json();
        if (mounted) {
          updateSearchState({
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            userCity: data.city || data.region || null,
          });
        }
      } catch (err) {
        console.error("IP Geoloc fallback failed", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchReverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation failed, using IP fallback", error);
          fetchFallbackLocation();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      fetchFallbackLocation();
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = i18n.language === 'id' ? 'id-ID' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        
        if (finalTrans) {
          setTranscript(prev => prev ? prev + ' ' + finalTrans : finalTrans);
        }
        setInterimTranscript(interimTrans);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceError(t("search.voice.denied"));
        }
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setInterimTranscript("");
        
        // Auto submit if we have transcript
        if (transcriptRef.current.trim()) {
          updateSearchState({ vibeText: transcriptRef.current, recommendedSport: null });
          navigate("/radar?tab=venue");
        }
      };
    }

    return () => {
      mounted = false;
    };
  }, []); // Run once on mount to avoid infinite loops

  const handleVoiceToggle = () => {
    setVoiceError(null);
    if (!recognitionRef.current) {
      setVoiceError(t("search.voice.unsupported"));
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      setInterimTranscript("");
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Speech recognition start error", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && activeMode === "text") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    let query = "";
    if (activeMode === "preference") {
      const locationAddonId = searchState.userCity ? ` di ${searchState.userCity}` : '';
      const locationAddonEn = searchState.userCity ? ` in ${searchState.userCity}` : '';

      query = i18n.language === 'id' 
        ? `Cari lapangan ${sport}, budget sekitar Rp${budget.toLocaleString("id-ID")}, maksimal jarak ${distance}km dari lokasi saya${locationAddonId}.`
        : `Find a ${sport} court, budget around Rp${budget.toLocaleString("id-ID")}, maximum distance ${distance}km from my location${locationAddonEn}.`;
    } else if (activeMode === "text") {
      query = text;
    } else if (activeMode === "voice") {
      query = transcript;
    }

    if (query.trim() && !isRecording) {
      updateSearchState({ vibeText: query, recommendedSport: null });
      navigate("/radar?tab=venue");
    }
  };

  return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 relative min-h-[calc(100vh-5rem)] bg-[#F8F9FA] dark:bg-slate-900 transition-colors duration-200">
      <FloatingDecorations />
      {/* Title */}
      <div className="w-full max-w-4xl text-center mb-8 z-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3 uppercase">
          {t("search.title_start")} <span className="text-indigo-600 dark:text-indigo-400">{t("search.title_end")}</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-base max-w-xl mx-auto">
          {t("search.subtitle")}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl flex flex-col z-10 mx-auto">
        
        {/* Single Panel: Options */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-[24px] p-5 sm:p-6 md:p-8 flex flex-col border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-2 sm:mb-4 transition-colors">
          
          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <button
              onClick={() => setActiveMode("preference")}
              className={`w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold text-sm md:text-sm tracking-wide uppercase transition-all border-2 border-slate-900 dark:border-slate-100 ${
                activeMode === "preference" 
                  ? "bg-amber-400 dark:bg-amber-500 text-slate-900 dark:border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] translate-y-0" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" /> {t("search.tab.preference")}
            </button>
            <button
              onClick={() => setActiveMode("text")}
              className={`w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold text-sm md:text-sm tracking-wide uppercase transition-all border-2 border-slate-900 dark:border-slate-100 ${
                activeMode === "text" 
                  ? "bg-amber-400 dark:bg-amber-500 text-slate-900 dark:border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] translate-y-0" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              }`}
            >
              <Keyboard className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" /> {t("search.tab.text")}
            </button>
            <button
              onClick={() => setActiveMode("voice")}
              className={`w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold text-sm md:text-sm tracking-wide uppercase transition-all border-2 border-slate-900 dark:border-slate-100 ${
                activeMode === "voice" 
                  ? "bg-amber-400 dark:bg-amber-500 text-slate-900 dark:border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] translate-y-0" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              }`}
            >
              <Mic className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" /> {t("search.tab.voice")}
            </button>
          </div>

          {/* Preferences Content */}
          {activeMode === "preference" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-3 block tracking-wide">{t("search.pref.sport")}</label>
                  <div className="flex flex-wrap gap-2">
                    {["Soccer/Futsal", "Basketball", "Badminton", "Tennis", "Volleyball", "Table Tennis", "Golf", "Swimming", "Billiard", "Bowling", "Gym/Fitness"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSport(s)}
                        className={`flex-1 sm:flex-none min-w-[30%] px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 border-slate-900 dark:border-slate-100 ${
                          sport === s 
                            ? "bg-indigo-600 text-white dark:border-indigo-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" 
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder={t("search.pref.other_sport", "Atau tulis olahraga lain...")}
                      value={["Soccer/Futsal", "Basketball", "Badminton", "Tennis", "Volleyball", "Table Tennis", "Golf", "Swimming", "Billiard", "Bowling", "Gym/Fitness"].includes(sport) ? "" : sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-900 dark:border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-slate-100 tracking-wide">{t("search.pref.budget")}</label>
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 px-2 sm:px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">Rp {budget.toLocaleString("id-ID")}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer border-2 border-slate-900 dark:border-slate-600 outline-none"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-900 dark:border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-slate-100 tracking-wide">{t("search.pref.distance")}</label>
                    <span className="font-bold text-sm text-fuchsia-600 dark:text-fuchsia-400 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 px-2 sm:px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">{distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer border-2 border-slate-900 dark:border-slate-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Content */}
          {activeMode === "text" && (
            <div className="flex flex-col flex-1 h-full min-h-[250px] mb-4">
              <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-3 block tracking-wide">{t("search.text.label")}</label>
              <textarea
                className="w-full flex-1 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-900 dark:border-slate-100 p-5 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-0 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] resize-none"
                placeholder={t("search.text.placeholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* Voice Content */}
          {activeMode === "voice" && (
            <div className="flex flex-col items-center justify-center flex-1 py-8 gap-8 min-h-[250px] mb-4">
              <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 block text-center tracking-wide">{t("search.voice.label")}</label>
              
              <button
                onClick={handleVoiceToggle}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all border-4 border-slate-900 dark:border-slate-100 ${
                  isRecording 
                  ? "bg-red-500 shadow-none translate-y-1 animate-pulse dark:border-red-500" 
                  : "bg-fuchsia-400 dark:bg-fuchsia-600 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                }`}
              >
                <Mic className={`w-12 h-12 sm:w-14 sm:h-14 stroke-[3] ${isRecording ? "text-white" : "text-slate-900 dark:text-white"}`} />
              </button>

              <div className="w-full max-w-lg text-center mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border-2 border-slate-900 dark:border-slate-100 min-h-[80px] flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                {voiceError ? (
                  <p className="text-red-500 font-bold text-lg">{voiceError}</p>
                ) : isRecording && !transcript && !interimTranscript ? (
                  <p className="text-red-500 font-bold animate-pulse text-lg">{t("search.voice.listening")}</p>
                ) : transcript || interimTranscript ? (
                  <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                    {transcript} <span className="opacity-50">{interimTranscript}</span>
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 font-bold">{t("search.voice.hint")}</p>
                )}
              </div>
            </div>
          )}

          {activeMode !== "voice" && (
            <button
              onClick={handleSubmit}
              className="w-full mt-4 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-2xl border-[3px] border-slate-900 py-4 text-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all active:shadow-none active:translate-y-2 dark:border-slate-900 dark:shadow-[6px_6px_0px_0px_rgba(255, 255, 255,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              {t("search.btn_submit")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

