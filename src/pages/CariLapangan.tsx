import React, { useState, useEffect, useRef } from "react";
import { Search, Mic, Keyboard, SlidersHorizontal, MapPin, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";

export default function CariLapangan() {
  const [activeMode, setActiveMode] = useState<"preference" | "text" | "voice">("preference");
  
  // Preference States
  const [sport, setSport] = useState("Basket");
  const [partner, setPartner] = useState("Teman/Rombongan");
  const [budget, setBudget] = useState(50000);
  const [distance, setDistance] = useState(5);
  
  // Text State
  const [text, setText] = useState("");
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  
  const { updateSearchState } = useSearchContext();
  const navigate = useNavigate();

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateSearchState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          // location failed
        }
      );
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'id-ID';

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
          alert('Akses mikrofon ditolak. Mohon izinkan akses mikrofon di browser Anda untuk menggunakan fitur ini.');
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
  }, []);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      alert("Browser Anda tidak mendukung fitur pesan suara.");
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
      query = `Cari lapangan ${sport} untuk main bareng ${partner}, budget sekitar Rp${budget.toLocaleString("id-ID")}, maksimal jarak ${distance}km dari lokasi saya.`;
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
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 relative min-h-[calc(100vh-5rem)]">
      {/* Title */}
      <div className="w-full max-w-4xl text-center mb-8 z-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 uppercase">
          Cari Lapangan <span className="text-indigo-600">Olahraga</span>
        </h1>
        <p className="text-slate-600 font-bold text-base max-w-xl mx-auto">
          Pilih preferensi, ketik tempat impianmu, atau gunakan suara. Biar AI yang cariin!
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl flex flex-col z-10 mx-auto">
        
        {/* Single Panel: Options */}
        <div className="w-full bg-white rounded-[24px] p-5 sm:p-6 md:p-8 flex flex-col border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-2 sm:mb-4">
          
          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <button
              onClick={() => setActiveMode("preference")}
              className={`w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold text-sm md:text-sm tracking-wide uppercase transition-all border-2 border-slate-900 ${
                activeMode === "preference" 
                  ? "bg-amber-400 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] translate-y-0" 
                  : "bg-white text-slate-600 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" /> Preferensi
            </button>
            <button
              onClick={() => setActiveMode("text")}
              className={`w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold text-sm md:text-sm tracking-wide uppercase transition-all border-2 border-slate-900 ${
                activeMode === "text" 
                  ? "bg-amber-400 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] translate-y-0" 
                  : "bg-white text-slate-600 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              }`}
            >
              <Keyboard className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" /> Teks Bebas
            </button>
            <button
              onClick={() => setActiveMode("voice")}
              className={`w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold text-sm md:text-sm tracking-wide uppercase transition-all border-2 border-slate-900 ${
                activeMode === "voice" 
                  ? "bg-amber-400 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] translate-y-0" 
                  : "bg-white text-slate-600 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              }`}
            >
              <Mic className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" /> Pesan Suara
            </button>
          </div>

          {/* Preferences Content */}
          {activeMode === "preference" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-sm font-black uppercase text-slate-900 mb-3 block tracking-wide">Olahraga</label>
                  <div className="flex flex-wrap gap-2">
                    {["Futsal", "Basket", "Badminton", "Tenis", "Mini Soccer", "Voli"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSport(s)}
                        className={`flex-1 sm:flex-none min-w-[30%] px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 border-slate-900 ${
                          sport === s 
                            ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" 
                            : "bg-white text-slate-900 hover:bg-indigo-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-black uppercase text-slate-900 mb-3 block tracking-wide">Bersama Siapa?</label>
                  <div className="flex flex-wrap gap-2">
                    {["Sendiri", "Berdua", "Keluarga", "Teman/Rombongan"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPartner(p)}
                        className={`flex-1 sm:flex-none min-w-[45%] px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 border-slate-900 ${
                          partner === p 
                            ? "bg-fuchsia-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" 
                            : "bg-white text-slate-900 hover:bg-fuchsia-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-slate-900">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wide">Budget / Orang</label>
                    <span className="font-bold text-sm text-indigo-600 bg-white border-2 border-slate-900 px-2 sm:px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">Rp {budget.toLocaleString("id-ID")}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer border-2 border-slate-900 outline-none"
                  />
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-slate-900">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wide">Jarak Maksimal</label>
                    <span className="font-bold text-sm text-fuchsia-600 bg-white border-2 border-slate-900 px-2 sm:px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">{distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer border-2 border-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Content */}
          {activeMode === "text" && (
            <div className="flex flex-col flex-1 h-full min-h-[250px] mb-4">
              <label className="text-sm font-black uppercase text-slate-900 mb-3 block tracking-wide">Deskripsikan Tempat Idealmu</label>
              <textarea
                className="w-full flex-1 bg-white rounded-2xl border-2 border-slate-900 p-5 font-bold text-slate-900 focus:outline-none focus:ring-0 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] resize-none"
                placeholder="Contoh: Cari lapangan badminton terdekat yang murah, ada kantinnya, dan parkiran luas buat motor."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* Voice Content */}
          {activeMode === "voice" && (
            <div className="flex flex-col items-center justify-center flex-1 py-8 gap-8 min-h-[250px] mb-4">
              <label className="text-sm font-black uppercase text-slate-900 block text-center tracking-wide">Tekan untuk Bicara</label>
              
              <button
                onClick={handleVoiceToggle}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all border-4 border-slate-900 ${
                  isRecording 
                  ? "bg-red-500 shadow-none translate-y-1 animate-pulse" 
                  : "bg-fuchsia-400 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                }`}
              >
                <Mic className={`w-12 h-12 sm:w-14 sm:h-14 stroke-[3] ${isRecording ? "text-white" : "text-slate-900"}`} />
              </button>

              <div className="w-full max-w-lg text-center mt-2 bg-slate-50 rounded-2xl p-5 border-2 border-slate-900 min-h-[80px] flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                {isRecording && !transcript && !interimTranscript ? (
                  <p className="text-red-500 font-bold animate-pulse text-lg">Sedang mendengarkan...</p>
                ) : transcript || interimTranscript ? (
                  <p className="text-slate-900 font-bold text-lg">
                    {transcript} <span className="opacity-50">{interimTranscript}</span>
                  </p>
                ) : (
                  <p className="text-slate-500 font-bold">Klik icon mic di atas untuk mulai</p>
                )}
              </div>
            </div>
          )}

          {activeMode !== "voice" && (
            <button
              onClick={handleSubmit}
              className="w-full mt-4 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-2xl border-[3px] border-slate-900 py-4 text-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all active:shadow-none active:translate-y-2"
            >
              Cariin Tempat! 🚀
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

