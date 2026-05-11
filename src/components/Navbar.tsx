import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<{ temp: number | null; location: string }>({
    temp: null,
    location: "MENDETEKSI...",
  });
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setIsMobileMenuOpen(false); // Close menu on route change
  }, [location]);

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // 1. Get City / Location name
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`
            );
            const geoData = await geoRes.json();
            const cityName = geoData.city || geoData.locality || "ANDA";
            const country = geoData.countryCode || "ID";

            // 2. Get Weather
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            const weatherData = await weatherRes.json();
            const temp = Math.round(weatherData.current_weather.temperature);

            setWeatherInfo({
              location: `${cityName}, ${country}`,
              temp,
            });
          } catch (e) {
            setWeatherInfo((prev) => ({ ...prev, location: "LOKASI AKTIF" }));
          }
        },
        () => {
          setWeatherInfo({ location: "LOKASI MATI", temp: null });
        }
      );
    } else {
      setWeatherInfo({ location: "TIDAK DIDUKUNG", temp: null });
    }

    return () => clearInterval(interval);
  }, []);

  const links = [
    { name: "Beranda", path: "/" },
    { name: "Cari Lapangan", path: "/lapangan" },
    { name: "Coach AI", path: "/coach" },
  ];

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-6 py-4 md:py-6 z-50 bg-[#F8F9FA]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45" />
          </Link>
          <Link to="/" className="text-lg md:text-xl font-bold tracking-tight text-slate-900 block">
            ARENAMABAR
          </Link>
        </div>
        
        <nav className="hidden lg:flex bg-white border-2 border-slate-900 rounded-full px-5 py-2 gap-6 text-xs font-semibold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] absolute left-1/2 -translate-x-1/2">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "transition-colors duration-100 font-semibold text-center uppercase tracking-wide",
                location.pathname === link.path || (link.path === "/lapangan" && location.pathname.startsWith("/radar"))
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] md:text-xs font-bold uppercase text-slate-400 tracking-widest">{weatherInfo.location}</p>
            <p className="text-xs md:text-sm font-bold text-slate-900">
              {currentTime} {weatherInfo.temp !== null ? `• ${weatherInfo.temp}°C` : ""}
            </p>
          </div>
          <button 
            className="lg:hidden w-10 h-10 bg-white border-2 border-slate-900 rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#F8F9FA] pt-24 px-6 flex flex-col gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-2xl font-black py-2 border-b-2",
                location.pathname === link.path || (link.path === "/lapangan" && location.pathname.startsWith("/radar"))
                  ? "text-slate-900 border-slate-900"
                  : "text-slate-400 border-slate-200"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
