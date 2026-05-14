/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import CoachAI from "./pages/CoachAI";
import CariLapangan from "./pages/CariLapangan";
import RadarResults from "./pages/RadarResults";
import KalkulatorMabar from "./pages/KalkulatorMabar";
import FAQ from "./pages/FAQ";
import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider } from "./context/ThemeContext";
import AIShopper from "./pages/AIShopper";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function App() {
  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center min-h-screen font-sans bg-slate-50 p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-[32px] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="text-2xl font-black mb-4">Google Maps API Key Required</h2>
          <p className="mb-4 font-medium text-slate-600">To enable accurate field and community searches.</p>
          <p className="font-bold mb-2">Step 1: Get an API Key</p>
          <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener" className="text-indigo-600 font-bold mb-4 inline-block hover:underline">Click here to get it</a>
          <p className="font-bold mb-2">Step 2: Add it in Settings</p>
          <ul className="text-left bg-slate-100 p-4 rounded-xl border-2 border-slate-900 font-medium text-sm gap-2 flex flex-col mb-4">
            <li>1. Open <strong>Settings</strong> (⚙️ gear icon, top-right)</li>
            <li>2. Select <strong>Secrets</strong></li>
            <li>3. Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the name</li>
            <li>4. Paste your API key as the value</li>
          </ul>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">App rebuilds automatically</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <ThemeProvider>
        <Router>
          <SearchProvider>
            <div className="min-h-screen flex flex-col font-sans dark:bg-zinc-950 dark:text-slate-100 transition-colors duration-200">
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/lapangan" element={<CariLapangan />} />
                <Route path="/shopper" element={<AIShopper />} />
                <Route path="/coach" element={<CoachAI />} />
                <Route path="/radar" element={<RadarResults />} />
                <Route path="/kalkulator" element={<KalkulatorMabar />} />
                <Route path="/faq" element={<FAQ />} />
              </Routes>
            </div>
          </SearchProvider>
        </Router>
      </ThemeProvider>
    </APIProvider>
  );
}
