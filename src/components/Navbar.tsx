import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import React, { useState, useEffect } from "react";
import { Menu, X, Globe, Sun, Moon, UserCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<{ temp: number | null; location: string }>({
    temp: null,
    location: "Loading...",
  });
  const [currentTime, setCurrentTime] = useState("");

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const languages = [
    { code: "id", label: "ID" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "zh", label: "ZH" }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangMenuOpen(false);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false); // Close menu on route change
  }, [location]);

  const fetchWeatherForLocation = async (lat: number, lon: number, isGps: boolean = false) => {
      try {
          // 1. Get City / Location name (using bigdatacloud for better client-side reverse geocoding)
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`
          );
          
          let cityName = "LOC";
          let country = "ID";
          if (geoRes.ok) {
              const geoData = await geoRes.json();
              cityName = geoData.city || geoData.locality || geoData.principalSubdivision || "LOC";
              country = geoData.countryCode || "ID";
          }

          // 2. Get Weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
          );
          const weatherData = await weatherRes.json();
          const temp = Math.round(weatherData.current_weather.temperature);

          setWeatherInfo({
            location: `${cityName}, ${country} ${isGps ? '' : '(IP)'}`,
            temp,
          });
      } catch (e) {
          setWeatherInfo((prev) => ({ ...prev, location: "LOCATION ON" }));
      }
  };

  const fetchFallbackLocation = async () => {
    try {
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      if (res.ok) {
          const data = await res.json();
          const lat = parseFloat(data.latitude);
          const lon = parseFloat(data.longitude);
          fetchWeatherForLocation(lat, lon, false);
      } else {
           setWeatherInfo({ location: "LOCATION OFF", temp: null });
      }
    } catch (err) {
      setWeatherInfo({ location: "LOCATION OFF", temp: null });
    }
  };

  const requestLocation = (manual = false) => {
    setWeatherInfo(prev => ({ ...prev, location: "MENCARI..." }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeatherForLocation(lat, lon, true);
        },
        (error) => {
          fetchFallbackLocation();
          if (manual) {
            if (error.code === error.PERMISSION_DENIED) {
              alert("Akses lokasi ditolak. Izinkan lokasi di browser atau buka aplikasi ini di tab baru agar lebih akurat.");
            } else {
              alert("Gagal mendapatkan lokasi GPS. Mungkin Sinyal GPS lemah atau timeout. Menggunakan lokasi IP asumsian.");
            }
          }
        },
        { enableHighAccuracy: manual, timeout: manual ? 15000 : 10000, maximumAge: manual ? 0 : 60000 }
      );
    } else {
      fetchFallbackLocation();
    }
  };

  useEffect(() => {
    // Update time every minute
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    // Fetch geolocation and weather
    requestLocation(false);

    return () => clearInterval(interval);
  }, []);

  const links = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.find_court"), path: "/lapangan" },
    { name: t("nav.shopper"), path: "/shopper" },
    { name: t("nav.calculator"), path: "/kalkulator" },
    { name: t("nav.coach"), path: "/coach" },
    { name: user ? "PROFIL" : "MASUK", path: user ? "/profile" : "/login" }
  ];

  return (
    <>
      <header className="sticky top-0 w-full flex justify-between items-center px-4 md:px-6 py-4 md:py-6 z-50 bg-[#F8F9FA]/90 dark:bg-zinc-950/90 backdrop-blur-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <div className="w-5 h-5 border-2 border-white dark:border-slate-900 rounded-sm rotate-45" />
          </Link>
          <Link to="/" className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 block">
            ARENAMABAR
          </Link>
        </div>
        
        <nav className="hidden xl:flex bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-full px-4 xl:px-5 py-2 gap-3 xl:gap-6 text-xs font-semibold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] absolute left-1/2 -translate-x-1/2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "transition-colors duration-100 font-semibold text-center uppercase tracking-wide whitespace-nowrap flex items-center justify-center h-full",
                location.pathname === link.path || (link.path === "/lapangan" && location.pathname.startsWith("/radar"))
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-slate-100 dark:bg-zinc-900 border-2 border-slate-200 dark:border-slate-100 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 border-2 border-slate-200 dark:border-slate-100 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{i18n.language.substring(0, 2)}</span>
            </button>
            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] z-50 overflow-hidden flex flex-col w-20">
                {languages.map((l) => (
                  <button 
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className="px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 border-b-2 border-slate-100 dark:border-slate-100 last:border-0 text-left uppercase text-slate-700 dark:text-slate-300"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div 
            onClick={() => requestLocation(true)}
            className="text-right hidden sm:block cursor-pointer group px-2 py-1 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Klik untuk perbarui lokasi"
          >
            <p className="text-[10px] md:text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest group-hover:text-indigo-500 transition-colors">{weatherInfo.location}</p>
            <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100">
              {currentTime} {weatherInfo.temp !== null ? `• ${weatherInfo.temp}°C` : ""}
            </p>
          </div>
          <button 
            className="xl:hidden w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900 dark:text-slate-100" /> : <Menu className="w-5 h-5 text-slate-900 dark:text-slate-100" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-[#F8F9FA] dark:bg-zinc-950 pt-24 px-6 flex flex-col gap-6 transition-colors duration-200">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-2xl font-black py-2 border-b-2",
                location.pathname === link.path || (link.path === "/lapangan" && location.pathname.startsWith("/radar"))
                  ? "text-slate-900 dark:text-slate-100 border-slate-900 dark:border-slate-100"
                  : "text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-100"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          <div 
            onClick={() => {
              requestLocation(true);
            }}
            className="sm:hidden mt-auto mb-8 pt-6 border-t-2 border-slate-200 dark:border-slate-100 cursor-pointer active:opacity-70 transition-opacity"
          >
            <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">{weatherInfo.location} <span className="text-indigo-500 lowercase normal-case">(tap perbarui)</span></p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {currentTime} {weatherInfo.temp !== null ? `• ${weatherInfo.temp}°C` : ""}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
