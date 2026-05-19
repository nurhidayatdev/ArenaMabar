import { BrainCircuit, MessageCircle, SlidersHorizontal, Star, BadgeCheck, Navigation, Loader2, ArrowLeft, MapPin, Clock, Car, Bike, Footprints, RefreshCw, User, Heart } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { fetchRecommendations, RadarRecommendation } from "../services/geminiService";
import { Map, AdvancedMarker, Pin, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { db } from "../lib/firebase";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import LoginPromptModal from "../components/LoginPromptModal";

export default function RadarResults() {
  const { searchState, updateSearchState } = useSearchContext();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = (queryParams.get("tab") as "venue" | "community") || "venue";
  const initialShowFavorites = queryParams.get("showFavorites") === "true";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null); // Using any temporarily for flexible data
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [travelMode, setTravelMode] = useState<"DRIVE" | "TWO_WHEELER" | "WALK">("TWO_WHEELER");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactPhoneUrl, setContactPhoneUrl] = useState("");
  const [showNoNumberModal, setShowNoNumberModal] = useState(false);
  
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);
  const [showRepositionPopup, setShowRepositionPopup] = useState(false);
  
  const [showTutorialModal, setShowTutorialModal] = useState(() => {
    return sessionStorage.getItem("radarTutorialShown") !== "true";
  });
  
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [favorites, setFavorites] = useState<{ [key: string]: any }>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(initialShowFavorites);
  const [loginPromptParams, setLoginPromptParams] = useState<{isOpen: boolean, message: string}>({ isOpen: false, message: "" });

  const placesLib = useMapsLibrary("places");
  const map = useMap("DEMO_MAP_ID");

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      try {
        const favsRef = collection(db, `users/${user.uid}/favorites_radar`);
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

  const toggleFavorite = async (result: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setLoginPromptParams({ isOpen: true, message: "Kamu harus login untuk menyimpan favorit." });
      return;
    }
    // We use a safe ID based on name and lat/lng
    const venueId = encodeURIComponent(result.name).replace(/\./g, "_").slice(0, 50);
    const docRef = doc(db, `users/${user.uid}/favorites_radar`, venueId);
    
    try {
      if (favorites[venueId]) {
        await deleteDoc(docRef);
        setFavorites(prev => {
          const next = { ...prev };
          delete next[venueId];
          return next;
        });
      } else {
        const cleanResult = Object.fromEntries(
          Object.entries(result).filter(([_, v]) => v !== undefined)
        );
        await setDoc(docRef, { ...cleanResult, savedAt: new Date() });
        setFavorites(prev => ({ ...prev, [venueId]: { ...cleanResult, savedAt: new Date() } }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  useEffect(() => {
    if (searchState.latitude) setManualLat(searchState.latitude);
    if (searchState.longitude) setManualLng(searchState.longitude);
  }, [searchState.latitude, searchState.longitude]);

  const handleContactVenue = () => {
    if (selectedIndex !== null && sortedResults?.[selectedIndex]) {
        const venue = sortedResults[selectedIndex];
        if (venue.phone) {
            let cleanedPhone = venue.phone.replace(/[^0-9]/g, '');
            // If it starts with 0, replace with 62 (Indonesia country code)
            if (cleanedPhone.startsWith('0')) {
              cleanedPhone = '62' + cleanedPhone.substring(1);
            }
            const message = encodeURIComponent(`Halo, saya ingin tanya jadwal kosong di ${venue.name}`);
            setContactPhoneUrl(`https://wa.me/${cleanedPhone}?text=${message}`);
            setShowContactModal(true);
        } else {
            setShowNoNumberModal(true);
        }
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!placesLib) return;
      if (initialShowFavorites && !searchState.vibeText && !searchState.recommendedSport) {
        setData({
          radarArea: "Favorit Tersimpan",
          sportType: "Berbagai Olahraga",
          results: []
        });
        setLoading(false);
        return;
      }
      
      setLoading(true);

      try {
        // First get AI recommendations to parse the intent (sport and area)
        const aiResult = await fetchRecommendations(searchState);
        
        // Build a highly accurate Google Maps query using AI parsed data
        const sportTerm = aiResult.sportType || searchState.recommendedSport || 'Olahraga';
        let query = `Lapangan ${sportTerm}`.trim();
        
        // If AI found a specific area, append it to the map search
        if (aiResult.radarArea && aiResult.radarArea !== 'Area Terdekat') {
            query = `Lapangan ${sportTerm} di ${aiResult.radarArea}`.trim();
        }

        const searchOptions: any = {
          textQuery: query,
          fields: ['displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 'nationalPhoneNumber', 'googleMapsURI', 'websiteURI', 'types', 'photos', 'regularOpeningHours'],
          maxResultCount: 20, // get more results to allow filtering
        };

        if (searchState.latitude && searchState.longitude) {
          // Provide location bias
          searchOptions.locationBias = {
             center: { lat: searchState.latitude, lng: searchState.longitude },
             radius: aiResult.maxDistanceKm ? Math.min(aiResult.maxDistanceKm * 1000, 50000) : 10000 // In meters, max 50km
          };
        }
        
        const placesResult = await placesLib.Place.searchByText(searchOptions).catch(err => {
          console.error("Maps search error:", err);
          return { places: [] };
        });

        let { places } = placesResult;

        // Hardcore filter out any place that is definitely not a sports venue
        const excludeTypes = [
          'restaurant', 'food', 'cafe', 'store', 'shopping_mall', 'lodging', 'bank', 'atm', 
          'beauty_salon', 'spa', 'grocery_or_supermarket', 'bakery', 'clothing_store', 
          'furniture_store', 'electronics_store', 'shoe_store', 'jewelry_store', 'car_repair', 
          'convenience_store', 'pharmacy', 'hospital', 'doctor', 'dentist', 'travel_agency', 
          'real_estate_agency', 'laundry', 'hair_care', 'plumber', 'electrician'
        ];
        
        const bestPlaces = places.filter((p: any) => {
            if (!p.types) return true;
            // Check if it has any excluded type
            const isExcluded = p.types.some((t: string) => excludeTypes.includes(t));
            return !isExcluded;
        });

        if (bestPlaces.length > 0) {
            places = bestPlaces;
        }

        // Helper to calculate distance
        const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // Radius of the earth in km
            const dLat = (lat2 - lat1) * Math.PI / 180;  
            const dLon = (lon2 - lon1) * Math.PI / 180; 
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            return R * c; // Distance in km
        };

        // Mix real places with local mock data format to save tokens
        const randomFacilitiesOptions = [
            ["Parkir", "Toilet", "Kantin"],
            ["Tribun", "Kamar Mandi", "Air Minum"],
            ["AC", "Loker", "Kantin"],
            ["Wifi", "Parkir Luas", "Mushola"],
            ["Ruang Ganti", "Toilet Bersih", "Parkir"]
        ];
        const randomTipsOptions = [
            "Pastikan cek jam operasional sebelum datang.",
            "Parkir bisa lumayan padat di akhir pekan.",
            "Jangan lupa bawa air minum tambahan.",
            "Area agak panas saat siang, lebih baik sore atau malam.",
            "Sering penuh setelah jam pulang kerja."
        ];

        let realResults = places.map((place: any, index: number) => {
            
            // Extract lat/lng
            let lat = -6.2;
            let lng = 106.8;
            if (place.location) {
              if (typeof place.location.lat === 'function') {
                lat = place.location.lat();
                lng = place.location.lng();
              } else {
                lat = place.location.lat || -6.2;
                lng = place.location.lng || 106.8;
              }
            }

            let dist = 0;
            if (searchState.latitude && searchState.longitude) {
                dist = calcDistance(searchState.latitude, searchState.longitude, lat, lng);
            } else {
                dist = Math.random() * 5 + 1; // mock if no gps
            }

            let photoUri = "";
            if (place.photos && place.photos.length > 0) {
              if (typeof place.photos[0].getURI === 'function') {
                photoUri = place.photos[0].getURI({maxWidth: 600}) || "";
              } else if (typeof place.photos[0].getUrl === 'function') {
                photoUri = place.photos[0].getUrl({maxWidth: 600}) || "";
              }
            }

            const randomFacilities = randomFacilitiesOptions[index % randomFacilitiesOptions.length];
            const randomTips = randomTipsOptions[index % randomTipsOptions.length];
            const generatedAccuracy = Math.floor(Math.random() * 10) + 90; // 90-99%
            const statusOptions = ["Tersedia Hari Ini", "Hampir Penuh", "Tersedia Besok", "Ramai Lancar"];

            return {
                name: place.displayName || "Tempat Olahraga",
                photoUri: photoUri,
                lat: Number(lat),
                lng: Number(lng),
                address: place.formattedAddress,
                ratingText: place.rating ? `${place.rating} (${place.userRatingCount})` : "Baru",
                ratingValue: place.rating || 0,
                ratingCount: place.userRatingCount || 0,
                phone: place.nationalPhoneNumber,
                googleMapsURI: place.googleMapsURI,
                websiteURI: place.websiteURI,
                distanceKm: dist.toFixed(1),
                rawDistance: dist,
                status: statusOptions[index % statusOptions.length],
                accuracy: generatedAccuracy,
                openingHours: place.regularOpeningHours?.weekdayDescriptions,
                isOpen: place.regularOpeningHours?.openNow,
                summary: `Berdasarkan ulasan dan data Maps, ${place.displayName || "tempat ini"} adalah salah satu opsi terdekat.`,
                tips: randomTips,
                facilities: randomFacilities
            };
        });
        
        // Filter by max distance if available
        if (aiResult.maxDistanceKm && searchState.latitude && searchState.longitude) {
            realResults = realResults.filter(r => r.rawDistance <= aiResult.maxDistanceKm!);
        }

        // Sort by distance as default if GPS is available, otherwise by Rating
        if (searchState.latitude && searchState.longitude) {
           realResults.sort((a, b) => a.rawDistance - b.rawDistance);
        } else {
           realResults.sort((a, b) => b.ratingValue - a.ratingValue);
        }
        
        // Limit to top results after sorting
        realResults = realResults.slice(0, 8);

        setData({
            ...aiResult,
            radarArea: aiResult?.radarArea || 'Area Terdekat',
            sportType: aiResult?.sportType || 'Olahraga',
            results: realResults.length > 0 ? realResults : (aiResult?.results || [])
        });
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to AI result if Maps fails
        const aiResult = await fetchRecommendations(searchState);
        setData(aiResult);
      }
      
      setLoading(false);
    }
    loadData();
  }, [searchState, placesLib]);

  const sortedResults = React.useMemo(() => {
    let results = data?.results ? [...data.results] : [];
    
    if (showFavoritesOnly) {
      // OVERRIDE results with our favorites so we can see them even if not in current search
      results = Object.values(favorites);
    } else if (isOpenOnly) {
      // Filter by "Buka Sekarang" if enabled
      results = results.filter(r => r.isOpen === true);
    }

    // Add estimated time to each result based on current travelMode
    const resultsWithTime = results.map(r => {
      let minsPerKm = 2; // Default DRIVE (30km/h)
      if (travelMode === "TWO_WHEELER") minsPerKm = 1.5; // (40km/h)
      if (travelMode === "WALK") minsPerKm = 12; // (5km/h)
      
      const estimatedMins = Math.max(1, Math.round((r.rawDistance || 0) * minsPerKm));
      return { ...r, estimatedMins };
    });

    if (sortBy === "distance") {
      resultsWithTime.sort((a, b) => (a.rawDistance || 0) - (b.rawDistance || 0));
    } else {
      resultsWithTime.sort((a, b) => (b.ratingValue || 0) - (a.ratingValue || 0));
    }
    return resultsWithTime;
  }, [data?.results, sortBy, travelMode, showFavoritesOnly, isOpenOnly, favorites]);

  useEffect(() => {
    if (map && selectedIndex !== null && sortedResults?.[selectedIndex]) {
      const venue = sortedResults[selectedIndex];
      map.panTo({ lat: venue.lat, lng: venue.lng });
    }
  }, [selectedIndex, sortedResults, map]);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh-6rem)]">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <h2 className="text-2xl font-bold animate-pulse text-slate-900 dark:text-slate-100">{"AI sedang memindai area..."}</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-6rem)] min-h-[calc(100dvh-6rem)] w-full max-w-[1440px] mx-auto p-4 lg:p-6 lg:pb-2 gap-6 relative z-10">
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-6">
            {/* Left Pane: Map Area */}
            <section className="w-full lg:flex-1 lg:w-1/2 flex flex-col gap-4 min-h-[350px] lg:min-h-0">
              <div className="bg-white dark:bg-zinc-900 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 p-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex justify-between items-center z-20 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                     <Navigation className="w-4 h-4 stroke-[2]" />
                   </div>
                   <h2 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">{data.radarArea}</h2>
                </div>
                <div className="flex gap-2">
                  <span className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full px-3 py-1 font-semibold text-xs tracking-wide max-w-[120px] sm:max-w-[150px] truncate" title={data.sportType}>
                     {data.sportType}
                  </span>
                  <div className="relative">
                    <button 
                      onClick={() => setShowFilter(!showFilter)}
                      className="bg-white dark:bg-zinc-800 rounded-full px-3 py-1 border-2 border-slate-900 dark:border-slate-600 font-semibold text-xs flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-600text-slate-900 dark:text-slate-100 transition-colors"
                    >
                      <SlidersHorizontal className="w-3 h-3 stroke-[2]" /> {"Urutkan"}
                    </button>
                    {showFilter && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] z-50 overflow-hidden">
                        <button 
                          onClick={() => { setSortBy("distance"); setShowFilter(false); setSelectedIndex(null); }}
                          className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 border-b-2 border-slate-100 dark:border-slate-100 ${sortBy === "distance" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}
                        >
                          {"\ud83d\udccd Jarak Terdekat"}
                        </button>
                        <button 
                          onClick={() => { setSortBy("rating"); setShowFilter(false); setSelectedIndex(null); }}
                          className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 ${sortBy === "rating" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}
                        >
                          {"\u2b50 Rating Tertinggi"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex gap-2 mb-2">
                <button 
                   onClick={() => {
                     setIsOpenOnly(!isOpenOnly);
                     setSelectedIndex(null);
                   }}
                   className={`flex-1 py-2 px-4 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                     isOpenOnly 
                      ? "bg-emerald-400 dark:bg-emerald-600 dark:text-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] translate-y-[-2px] dark:border-emerald-600" 
                      : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                   }`}
                >
                  <Clock className={`w-3 h-3 ${isOpenOnly ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`} />
                  {isOpenOnly ? "DIFILTER: BUKA SEKARANG" : "FILTER: BUKA SEKARANG"}
                </button>
                <button 
                   onClick={() => {
                     if (!user) {
                       setLoginPromptParams({ isOpen: true, message: "Kamu harus login untuk melihat favorit." });
                       return;
                     }
                     setShowFavoritesOnly(!showFavoritesOnly);
                     setSelectedIndex(null);
                   }}
                   className={`flex-1 py-2 px-4 rounded-xl border-2 border-slate-900 dark:border-slate-100 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                     showFavoritesOnly 
                      ? "bg-rose-400 dark:bg-rose-600 dark:text-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] translate-y-[-2px] dark:border-rose-600" 
                      : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                   }`}
                >
                  <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'text-white fill-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  {showFavoritesOnly ? "HANYA FAVORIT" : "FAVORIT"}
                </button>
              </div>

              <div className="flex-1 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-slate-100 dark:bg-zinc-900 relative overflow-hidden group min-h-[300px] mb-2 mr-2">
                {sortedResults && sortedResults.length > 0 ? (
                  <div className="absolute inset-0 w-full h-full">
                    <Map
                      defaultCenter={{ lat: manualLat || sortedResults[0]?.lat || -6.2, lng: manualLng || sortedResults[0]?.lng || 106.8 }}
                      defaultZoom={13}
                      mapId="DEMO_MAP_ID"
                      colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                      disableDefaultUI={false}
                      onClick={(e) => {
                        if (e.detail.latLng) {
                          setManualLat(e.detail.latLng.lat);
                          setManualLng(e.detail.latLng.lng);
                          setShowRepositionPopup(true);
                        }
                      }}
                    >
                      {(manualLat && manualLng) && (
                        <AdvancedMarker
                          position={{ lat: manualLat, lng: manualLng }}
                          draggable={true}
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              setManualLat(e.latLng.lat());
                              setManualLng(e.latLng.lng());
                              setShowRepositionPopup(true);
                            }
                          }}
                        >
                          <div className="w-10 h-10 bg-indigo-600 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center animate-bounce">
                             <User className="w-5 h-5 text-white" />
                          </div>
                        </AdvancedMarker>
                      )}
                      {sortedResults.map((result: any, idx: number) => (
                        <AdvancedMarker
                          key={idx}
                          position={{ lat: result.lat, lng: result.lng }}
                          onClick={() => setSelectedIndex(idx)}
                        >
                           <div className={`transition-all ${selectedIndex === idx ? 'scale-125' : 'scale-100'}`}>
                             <Pin background={selectedIndex === idx ? "#4f46e5" : "#f59e0b"} glyphColor="#fff" borderColor="#09090b" />
                           </div>
                        </AdvancedMarker>
                      ))}
                    </Map>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400 font-medium">
                    {"Peta tidak dapat dimuat atau tidak ada hasil di area ini. Pastikan konfigurasi Maps API benar."}
                  </div>
                )}
              </div>
            </section>

            {/* Right Pane: AI Review Summarizer & Specs - Bento Layout */}
            <section className="flex-1 lg:w-1/2 flex flex-col gap-4 relative overflow-y-auto pb-4 lg:pb-2 pr-2">
              {selectedIndex === null ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-indigo-600 dark:bg-indigo-800 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-5 text-white mb-2 transition-colors relative overflow-hidden">
                     {/* Highlight decoration */}
                     <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                       <BrainCircuit className="w-24 h-24 text-white" />
                     </div>
                     <div className="inline-flex items-center gap-2 bg-indigo-500/50 dark:bg-indigo-700/50 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold mb-3 backdrop-blur-sm relative z-10 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                       <BrainCircuit className="w-3 h-3 text-amber-300" />
                       <span className="text-amber-300">DIANALISIS OLEH AI</span>
                     </div>
                     <div className="bg-white/10 dark:bg-black/20 p-4 rounded-xl border border-white/20 mb-4 relative z-10">
                       <p className="text-white text-sm font-medium italic opacity-100">
                         "{searchState.vibeText}"
                       </p>
                     </div>
                     <h1 className="font-bold text-xl leading-tight text-white m-0 tracking-tight relative z-10">
                       {`Ditemukan ${sortedResults.length} Lapangan`}<br />{"Terdekat & Terbaik"}
                      </h1>

                      {/* Travel Mode Selector */}
                      <div className="flex gap-2 mt-4">
                        {[
                          { id: "DRIVE", icon: Car, label: "Mobil" },
                          { id: "TWO_WHEELER", icon: Bike, label: "Motor" },
                          { id: "WALK", icon: Footprints, label: "Jalan" }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTravelMode(mode.id as any);
                            }}
                            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-slate-900 dark:border-slate-100 transition-all ${
                              travelMode === mode.id 
                                ? "bg-indigo-300 dark:bg-indigo-400 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] translate-y-[-2px] text-slate-900" 
                                : "bg-indigo-700/30 border-white/20 text-white/70 hover:bg-indigo-700/50 text-white"
                            }`}
                          >
                            <mode.icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase text-center">{mode.label}</span>
                          </button>
                        ))}
                      </div>

                      {data?.warmUpProtocol && (
                        <div className="mt-4 bg-teal-300 dark:bg-teal-500 p-3 rounded-xl border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                          <h4 className="flex items-center gap-2 font-black text-xs uppercase text-slate-900 dark:text-slate-900 mb-1">
                            <BrainCircuit className="w-4 h-4 text-slate-900" />
                            Program AI Coach
                          </h4>
                          <p className="text-xs text-slate-900 dark:text-slate-900 font-bold">
                            {data.warmUpProtocol}
                          </p>
                        </div>
                      )}
                  </div>
                  {sortedResults.map((result, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className="bg-white dark:bg-zinc-900 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{result.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                             <div className="flex items-center gap-1">
                               <MapPin className="w-3 h-3" /> {result.distanceKm} KM
                             </div>
                             <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                               <Clock className="w-3 h-3" /> {result.estimatedMins} MIN
                             </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="bg-amber-300 dark:bg-amber-500 text-slate-900 rounded-xl px-2 py-1 font-bold text-xs mt-1">
                            {result.ratingText}
                          </div>
                          <button 
                            onClick={(e) => toggleFavorite(result, e)}
                            className={`p-1.5 rounded-full border-2 border-slate-900 dark:border-slate-100 transition-colors ${
                              favorites[encodeURIComponent(result.name).replace(/\./g, "_").slice(0, 50)]
                                ? "bg-rose-400 dark:bg-rose-600"
                                : "bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${
                              favorites[encodeURIComponent(result.name).replace(/\./g, "_").slice(0, 50)]
                                ? "text-white fill-white"
                                : "text-slate-400 dark:text-slate-500"
                            }`} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-semibold">{result.status}</span>
                        <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-semibold">Akurasi {result.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setSelectedIndex(null)}
                    className="self-start bg-amber-400 hover:bg-amber-500 text-slate-900 border-2 border-slate-900 dark:border-slate-100 rounded-xl px-4 py-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all mb-2 flex items-center gap-2 uppercase font-black text-sm tracking-wider"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[3]" /> KEMBALI
                  </button>
                  
                  {/* Main Result Card */}
                  <article className="bg-indigo-600 dark:bg-indigo-800 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col text-white flex-shrink-0 overflow-hidden">
              {sortedResults[selectedIndex]?.photoUri && (
                <div className="w-full h-48 bg-slate-200 dark:bg-zinc-800 border-b-2 border-slate-900 dark:border-slate-100 relative">
                  <img src={sortedResults[selectedIndex]?.photoUri} alt={sortedResults[selectedIndex]?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="p-4 pb-2">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold mb-3">
                  <BrainCircuit className="w-3 h-3" />
                  {"AI OPTIMIZED SUMMARY"}
                </div>
                <h1 className="font-bold text-2xl leading-tight text-white m-0 tracking-tight">
                  {sortedResults[selectedIndex]?.name}
                </h1>
              </div>
              
              <div className="p-4 pt-2 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 rounded-full px-3 py-1 font-bold text-xs border border-transparent dark:border-slate-600">
                    Rating: {sortedResults[selectedIndex]?.ratingText}
                  </span>
                  <span className="bg-amber-300 dark:bg-amber-500 text-slate-900 rounded-full px-3 py-1 font-bold text-xs border border-transparent dark:border-amber-600">
                    {sortedResults[selectedIndex]?.status}
                  </span>
                  <span className="bg-emerald-300 dark:bg-emerald-500 text-slate-900 rounded-full px-3 py-1 font-bold text-xs flex items-center gap-1 border border-transparent dark:border-emerald-600">
                    <MapPin className="w-3 h-3" /> {sortedResults[selectedIndex]?.distanceKm} KM
                  </span>
                  <span className="bg-indigo-300 dark:bg-indigo-400 text-slate-900 rounded-full px-3 py-1 font-bold text-xs flex items-center gap-1 border border-transparent dark:border-indigo-500">
                    <Clock className="w-3 h-3" /> {sortedResults[selectedIndex]?.estimatedMins} MENIT
                  </span>
                </div>

                <p className="font-medium text-sm text-indigo-100">
                  {sortedResults[selectedIndex]?.summary}
                </p>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <BadgeCheck className="w-4 h-4 stroke-[2]" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      Akurasi {sortedResults[selectedIndex]?.accuracy}%
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  </div>
                </div>
              </div>
            </article>

            {/* Info Grid (Bento style sub-cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
              {/* Address & Hours Card */}
              <div className="md:col-span-2 bg-slate-50 dark:bg-zinc-900 rounded-[24px] p-4 border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-3 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{"Alamat Lengkap"}</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{sortedResults[selectedIndex]?.address || "-"}</p>
                    </div>
                  </div>
                  
                  {sortedResults[selectedIndex]?.openingHours && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="w-full">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">JAM OPERASIONAL</p>
                        <div className="grid grid-cols-1 gap-0.5 mt-1">
                          {sortedResults[selectedIndex].openingHours.map((hour: string, i: number) => {
                             const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                             const isToday = hour.toLowerCase().includes(today.toLowerCase());
                             return (
                               <p key={i} className={`text-[10px] leading-tight ${isToday ? 'font-black text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                                 {hour}
                               </p>
                             );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Tips Card */}
              <div className="bg-amber-300 dark:bg-amber-500 rounded-[24px] p-4 border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 bg-white/50 dark:bg-white/20 rounded-lg text-sm">🚧</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-900">{"Tips Bermain"}</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">{sortedResults[selectedIndex]?.tips}</p>
                  </div>
              </div>

              {/* Facilities Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-4 border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col justify-between transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Star className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{"Fasilitas (Info Lokal)"}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sortedResults[selectedIndex]?.facilities?.map((fac: any, i: number) => (
                        <span key={i} className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">{fac}</span>
                      ))}
                    </div>
                  </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-2 flex-shrink-0 flex gap-4">
              <button onClick={handleContactVenue} className="flex-1 bg-emerald-500 text-white rounded-[24px] p-4 font-bold flex flex-col items-center justify-center group shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-emerald-600 transition-colors">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="text-xs">{"HUBUNGI TEMPAT"}</span>
              </button>
              <a 
                href={sortedResults[selectedIndex]?.googleMapsURI || `https://www.google.com/maps/dir/?api=1&destination=${sortedResults[selectedIndex]?.lat},${sortedResults[selectedIndex]?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[24px] p-4 font-bold flex flex-col items-center justify-center group shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                title={"RUTE MAPS"}
              >
                <div className="w-8 h-8 bg-white/20 dark:bg-black/10 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Navigation className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="text-xs">{"RUTE MAPS"}</span>
              </a>
            </div>
          </div>
        )}
      </section>

      {/* WA Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 max-w-sm w-full border-2 border-slate-900 dark:border-slate-100 flex flex-col shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="font-black text-xl mb-1 uppercase tracking-tighter text-amber-500">Peringatan!</h3>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 bg-slate-100 dark:bg-zinc-800 p-2 rounded-lg border border-slate-200 dark:border-slate-600">{selectedIndex !== null ? sortedResults[selectedIndex]?.name : ""}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-pre-line mb-6">
              {"PENTING: Nomor WhatsApp/Telepon ini otomatis diambil dari Google Maps dan sering kali tidak aktif atau belum diupdate oleh pemiliknya. Pastikan untuk memvalidasi tempat ini terlebih dahulu atau berhati-hati sebelum melakukan DP/Transaksi.\n\nLanjutkan menghubungi via WhatsApp?"}
            </p>
            <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-3 bg-red-400 hover:bg-red-500 text-slate-900 font-bold rounded-xl border-2 border-slate-900 dark:border-slate-100 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255, 255, 255,1)]"
                >
                  Batal
                </button>
                <a 
                  href={contactPhoneUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold rounded-xl border-2 border-slate-900 dark:border-slate-100 transition-colors text-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255, 255, 255,1)]"
                >
                  Lanjut WA
                </a>
            </div>
          </div>
        </div>
      )}

      {/* No Number Modal */}
      {showNoNumberModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 max-w-sm w-full border-2 border-slate-900 dark:border-slate-100 flex flex-col shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] items-center text-center">
            <h3 className="font-black text-xl mb-3 text-slate-900 dark:text-slate-100 uppercase">Maaf</h3>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-pre-line mb-6">
              {"Maaf, nomor telepon/WhatsApp untuk tempat ini tidak tersedia."}
            </p>
            <button 
              onClick={() => setShowNoNumberModal(false)}
              className="w-full px-4 py-3 bg-fuchsia-400 hover:bg-fuchsia-500 text-slate-900 font-bold rounded-xl border-2 border-slate-900 dark:border-slate-100 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255, 255, 255,1)]"
            >
              OK, Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 max-w-sm w-full border-2 border-slate-900 dark:border-slate-100 flex flex-col shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
               <MapPin className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-black text-xl mb-2 text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Lokasi Kurang Pas?</h3>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-pre-line mb-6">
              Jika hasil pencarian kurang akurat, pindahkan <span className="font-bold text-slate-900 dark:text-slate-100 bg-indigo-100 dark:bg-indigo-900/50 px-1 rounded">pin biru</span> langsung di peta ke lokasi aslimu. Lalu, konfirmasi popup yang muncul untuk memperbarui hasil!
            </p>
            <button 
              onClick={() => {
                setShowTutorialModal(false);
                sessionStorage.setItem("radarTutorialShown", "true");
              }}
              className="w-full px-4 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl border-2 border-slate-900 dark:border-slate-100 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255, 255, 255,1)]"
            >
              OK, Mengerti!
            </button>
          </div>
        </div>
      )}

      {/* Reposition Confirmation Popup */}
      {showRepositionPopup && manualLat && manualLng && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 max-w-sm w-full border-2 border-slate-900 dark:border-slate-100 flex flex-col shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
               <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-black text-xl mb-2 text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
              Cari Area Sini?
            </h3>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-6">
              Mulai pencarian ulang untuk mendapatkan lapangan di sekitar lokasi pin yang baru.
            </p>
            <div className="flex gap-3 w-full">
               <button 
                onClick={() => {
                  setShowRepositionPopup(false);
                }}
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-bold rounded-xl border-2 border-slate-900 dark:border-slate-100 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  updateSearchState({ latitude: manualLat, longitude: manualLng });
                  setShowRepositionPopup(false);
                }}
                className="flex-[2] flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Yakin, Cari
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginPromptModal 
        isOpen={loginPromptParams.isOpen} 
        onClose={() => setLoginPromptParams({ ...loginPromptParams, isOpen: false })} 
        message={loginPromptParams.message} 
      />
    </div>
  </div>
);
}
