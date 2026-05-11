import { GoogleGenAI, Type } from "@google/genai";
import { SearchState } from "../context/SearchContext";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const analyzeSchema = {
  type: Type.OBJECT,
  properties: {
    diagnosis: { type: Type.STRING, description: "Diagnosis AI tentang kondisi user, e.g. 'Kamu kelamaan duduk! Otot punggung bawahmu kaku...'" },
    recommendedSport: { type: Type.STRING, description: "Olahraga yang paling direkomendasikan, e.g. 'Badminton'" },
    reasoning: { type: Type.STRING, description: "Alasan kenapa olahraga ini cocok, e.g. 'Gerakan melompat dan mengayun raket sangat bagus...'" }
  },
  required: ["diagnosis", "recommendedSport", "reasoning"]
};

export interface CoachPrescription {
  diagnosis: string;
  recommendedSport: string;
  reasoning: string;
}

export interface ChatMessage {
  role: "user" | "model" | "system";
  parts: { text: string }[];
}

export async function chatWithCoach(messages: ChatMessage[]): Promise<string> {
  const prompt = `Berperanlah sebagai "Coach AI" (konsultan kesehatan/olahraga gaul dan friendly) di aplikasi bernama "ArenaMabar".
Berikan saran, diagnosa ringan, atau rekomendasi olahraga/pola makan yang sesuai dengan percakapan dengan pengguna.
Bahasa yang digunakan: Gaul, asik, to the point, dan sangat membantu. Gunakan emoji untuk lebih asik. JANGAN terlalu panjang lebar kecuali diminta. Jawab langsung keluhan pengguna.

PENTING:
- Aplikasi ArenaMabar ini sudah memiliki fitur pencarian lapangan ("Cari Lapangan") dan komunitas ("Cari Komunitas") yang terintegrasi dengan peta.
- JIKA pengguna meminta dicarikan lapangan, GOR, atau tempat olahraga terdekat, JANGAN menyuruh mereka mencari sendiri. Kamu WAJIB menyertakan perintah [SEARCH_LAPANGAN: (nama olahraga)] di akhir pesanmu.
Contoh:
"Gas bre, gw cariin GOR Badminton terdekat dari lkasi lo sekarang! 🏸 [SEARCH_LAPANGAN: badminton]"

Ini adalah riwayat percakapan:
${JSON.stringify(messages, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });
    return response.text || "Waah maaf, Coach lagi nge-blank nih, coba ulangi lagi ya!";
  } catch (error) {
    console.error("Gemini AI failed to chat", error);
    return "Maaf ya, Coach lagi ada gangguan sinyal nih, coba tanya lagi dong!";
  }
}


export async function fetchPrescription(vibeText: string): Promise<CoachPrescription> {
  const prompt = `
Pengguna memberikan input terkait gaya hidup atau keluhan fisik mereka hari ini: "${vibeText}"

Berperanlah sebagai "Coach AI" (konsultan kesehatan/olahraga gaul). 
Berikan diagnosis kondisi tubuh mereka saat ini dan rekomendasikan SATU jenis olahraga yang paling tepat, lengkap dengan alasannya.
Bahasa yang digunakan: Gaul tapi profesional, to the point.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analyzeSchema,
      },
    });

    return JSON.parse(response.text!) as CoachPrescription;
  } catch (error) {
    console.error("Gemini AI failed to process prescription", error);
    return {
      diagnosis: "Kamu sepertinya kurang gerak hari ini dan butuh kardio seru buat meregangkan otot.",
      recommendedSport: "Badminton",
      reasoning: "Gerakan melompat dan mengayun raket sangat bagus untuk memperbaiki postur tubuh dan membakar kalori secara fun."
    };
  }
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    radarArea: {
      type: Type.STRING,
      description: "Nama area sesuai lokasi GPS atau kota, misal 'Area Makassar'",
    },
    sportType: {
      type: Type.STRING,
      description: "Tipe olahraga prioritas, misal 'Futsal', 'Badminton'",
    },
    maxDistanceKm: {
      type: Type.NUMBER,
      description: "Maksimal jarak dalam kilometer yang diminta user, jika ada di teks.",
    }
  },
  required: ["radarArea", "sportType"]
};

export interface RecommendationResult {
  name: string;
  rating: string;
  status: string;
  summary: string;
  tips: string;
  accuracy: number;
  facilities: string[];
  distanceKm: string;
  lat: number;
  lng: number;
}

export interface CommunityResult {
  name: string;
  description: string;
  platform: string;
  linkType: string;
  linkUrl: string;
}

export interface RadarRecommendation {
  radarArea: string;
  sportType: string;
  maxDistanceKm?: number;
  results: RecommendationResult[];
}

export async function fetchRecommendations(searchState: SearchState): Promise<RadarRecommendation> {
  const prompt = `
Pengguna ingin mencari lapangan/komunitas untuk berolahraga dengan kriteria berikut:
- Pencarian pengguna: "${searchState.vibeText}"
${searchState.recommendedSport ? `- Olahraga spesifik: "${searchState.recommendedSport}"` : ''}
${searchState.latitude && searchState.longitude ? `- Koordinat GPS saat ini: Latitude ${searchState.latitude}, Longitude ${searchState.longitude}` : ''}

Tolong pahami tempat (radarArea) dan olahraga (sportType) yang diinginkan pengguna.
Buat data JSON terkait preferensi. JANGAN mencari lapangan, cukup identifikasi olahraga dan area saja.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const parsed = JSON.parse(response.text!) as RadarRecommendation;
    parsed.results = []; // Initialize empty array, they will be populated by places API
    return parsed;
  } catch (error) {
    console.error("Gemini AI failed to process the request", error);
    // Fallback data if API fails or no API key
    return {
      radarArea: "Area Makassar",
      sportType: "Futsal",
      results: []
    };
  }
}
