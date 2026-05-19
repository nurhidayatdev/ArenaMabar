import React, { useState, useEffect, useRef } from "react";
import { Search, Mic, Keyboard, SlidersHorizontal, MapPin, Compass, X, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import FloatingDecorations from "../components/FloatingDecorations";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

export default function CariLapangan() {
  const [activeMode, setActiveMode] = useState<"preference" | "text" | "voice">("preference");
  
  // Preference States
  const [sport, setSport] = useState("Soccer/Futsal");
  const [budget, setBudget] = useState(150000);
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

  const [showMapModal, setShowMapModal] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number} | null>(null);

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
            userAddress: data.display_name || null,
            isLocationGps: true
          });
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        if (mounted) updateSearchState({ latitude: lat, longitude: lng, isLocationGps: true });
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
            isLocationGps: false
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
          setVoiceError("Akses mikrofon ditolak. Mohon izinkan akses mikrofon di browser Anda untuk menggunakan fitur ini.");
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
      setVoiceError("Browser Anda tidak mendukung fitur pesan suara.");
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

      query = `Cari lapangan ${sport}, budget sekitar Rp${budget.toLocaleString("id-ID")}, maksimal jarak ${distance}km dari lokasi saya${locationAddonId}.`;
    } else if (activeMode === "text") {
      query = text;
    } else if (activeMode === "voice") {
      query = transcript;
    }

    if (query.trim() && !isRecording) {
      setPendingQuery(query);
      if (searchState.latitude && searchState.longitude) {
        setTempLocation({ lat: searchState.latitude, lng: searchState.longitude });
      }
      setShowMapModal(true);
    }
  };

  const handleConfirmLocation = () => {
    if (tempLocation) {
      updateSearchState({ 
        vibeText: pendingQuery, 
        recommendedSport: null,
        latitude: tempLocation.lat,
        longitude: tempLocation.lng
      });
    } else {
      updateSearchState({ vibeText: pendingQuery, recommendedSport: null });
    }
    setShowMapModal(false);
    navigate("/radar?tab=venue");
  };

  return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 relative min-h-[calc(100vh-5rem)] bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-200">
      <FloatingDecorations />
      {/* Title */}
      <div className="w-full max-w-4xl text-center mb-8 z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase m-0">
            {"Cari Lapangan"} <span className="text-indigo-600 dark:text-indigo-400">{"Olahraga"}</span>
          </h1>
          <button
            onClick={() => navigate("/radar?tab=venue&showFavorites=true")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-bold text-xs uppercase tracking-wide transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100"
          >
            <Heart className="w-4 h-4 text-rose-500" /> Favorit
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-base max-w-xl mx-auto">
          {"Pilih preferensi, ketik tempat impianmu, atau gunakan suara. Biar AI yang cariin!"}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl flex flex-col z-10 mx-auto">
        
        {/* Single Panel: Options */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-[24px] p-5 sm:p-6 md:p-8 flex flex-col border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-2 sm:mb-4 transition-colors">
          
          {/* Preferences Content */}
          {activeMode === "preference" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 mb-3 block tracking-wide">{"Olahraga"}</label>
                  <div className="flex flex-wrap gap-2">
                    {["Soccer/Futsal", "Basketball", "Badminton", "Tennis", "Volleyball", "Table Tennis", "Golf", "Swimming", "Billiard", "Bowling", "Gym/Fitness"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSport(s)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 border-slate-900 dark:border-slate-100 ${
                          sport === s 
                            ? "bg-indigo-600 text-white dark:border-indigo-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" 
                            : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700"
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
                      className="w-full h-[52px] px-4 py-0 rounded-xl border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-900 dark:border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-slate-100 tracking-wide">{"Maks. Harga / Jam"}</label>
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 px-2 sm:px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">Rp {budget.toLocaleString("id-ID")}</span>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="500000"
                    step="10000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-4 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer border-2 border-slate-900 dark:border-slate-600 outline-none"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-900 dark:border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-slate-100 tracking-wide">{"Jarak Maksimal"}</label>
                    <span className="font-bold text-sm text-fuchsia-600 dark:text-fuchsia-400 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 px-2 sm:px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">{distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-4 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer border-2 border-slate-900 dark:border-slate-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full h-[52px] mt-6 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-xl border-2 border-slate-900 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all active:shadow-none active:translate-y-0 dark:border-slate-100 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          >
            {"Cariin Tempat! \ud83d\ude80"}
          </button>
        </div>

      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[24px] border-[3px] border-slate-900 dark:border-slate-100 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col overflow-hidden">
            <div className="p-4 border-b-2 border-slate-900 dark:border-slate-100 flex justify-between items-center bg-emerald-300 dark:bg-emerald-500">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Validasi Lokasi
              </h3>
              <button 
                onClick={() => setShowMapModal(false)}
                className="p-1 hover:bg-emerald-400 dark:hover:bg-emerald-600 rounded-full transition-colors text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex-1">
              <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mb-4">
                Pastikan posisi ini sudah sesuai dengan lokasi tujuanmu. Kamu bisa menggeser pin lokasi (marker) ke titik yang lebih akurat sebelum lanjut mencari!
              </p>
              <div className="w-full h-64 rounded-xl border-2 border-slate-900 dark:border-slate-100 overflow-hidden mb-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative">
                {tempLocation ? (
                  <Map 
                    defaultZoom={15} 
                    center={tempLocation}
                    onCameraChanged={(ev) => setTempLocation({ lat: ev.detail.center.lat, lng: ev.detail.center.lng })}
                    disableDefaultUI={false}
                    mapTypeControl={false}
                    streetViewControl={false}
                    gestureHandling="greedy"
                    mapId="DEMO_MAP_ID"
                    colorScheme="LIGHT"
                  >
                    <AdvancedMarker 
                      position={tempLocation}
                      draggable={true}
                      onDragEnd={(ev) => {
                        if (ev.latLng) {
                          setTempLocation({ lat: ev.latLng.lat(), lng: ev.latLng.lng() })
                        }
                      }}
                    >
                      <Pin background={"#10b981"} borderColor={"#0f172a"} glyphColor={"#0f172a"} scale={1.2} />
                    </AdvancedMarker>
                  </Map>
                ) : searchState.latitude && searchState.longitude ? (
                  <Map 
                    defaultZoom={15} 
                    defaultCenter={{ lat: searchState.latitude, lng: searchState.longitude }}
                    disableDefaultUI={true}
                    gestureHandling="greedy"
                    mapId="DEMO_MAP_ID"
                    colorScheme="LIGHT"
                  >
                    <AdvancedMarker position={{ lat: searchState.latitude, lng: searchState.longitude }}>
                      <Pin background={"#10b981"} borderColor={"#0f172a"} glyphColor={"#0f172a"} scale={1.2} />
                    </AdvancedMarker>
                  </Map>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-500">
                    <MapPin className="w-8 h-8 animate-bounce mb-2" />
                    <span className="font-bold">Mencari lokasi...</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleConfirmLocation}
                className="w-full h-[52px] bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl border-2 border-slate-900 dark:border-slate-100 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all active:shadow-none active:translate-y-0"
              >
                Lanjut Cari Lapangan! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

