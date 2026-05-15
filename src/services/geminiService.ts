import { GoogleGenAI, Type } from "@google/genai";
import { SearchState } from "../context/SearchContext";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export interface ChatPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export interface ChatMessage {
  role: "user" | "model" | "system";
  parts: ChatPart[];
}

export async function chatWithCoach(messages: ChatMessage[]): Promise<string> {
  const prompt = `Berperanlah sebagai "Coach AI" (konsultan kesehatan/olahraga gaul dan friendly) di aplikasi bernama "ArenaMabar".
Berikan saran, diagnosa ringan, atau rekomendasi olahraga/pola makan yang sesuai dengan percakapan dengan pengguna.
Bahasa yang digunakan: Gaul, asik, to the point, dan sangat membantu. Gunakan emoji untuk lebih asik. JANGAN terlalu panjang lebar kecuali diminta. Jawab langsung keluhan pengguna.
JIKA pengguna mengirimkan foto makanan/minuman, bantulah "Analisis Nutrisi Pasca-Olahraga". Jelaskan apakah makanan/minuman tersebut mendukung pemulihan tubuh berdasarkan olahraga yang baru saja dilakukan atau kondisinya saat ini.
JIKA pengguna menyebutkan "keluhan fisik" (seperti pegal, sakit, dll), berikan saran "Program Latihan Personalisasi" berupa gerakan pemanasan atau pendinginan spesifik untuk mencegah cedera atau memulihkan kondisinya.

PENTING:
- Aplikasi ArenaMabar ini sudah memiliki fitur pencarian lapangan ("Cari Lapangan") yang terintegrasi dengan peta, dan fitur AI Shopper ("AI Shopper") untuk mencari perlengkapan olahraga.
- JIKA pengguna meminta dicarikan lapangan, GOR, atau tempat olahraga terdekat, Kamu WAJIB menyertakan perintah [SEARCH_LAPANGAN: (nama olahraga)] di akhir pesanmu.
- JIKA pengguna meminta rekomendasi perlengkapan olahraga, gear, sepatu, raket, dll, Kamu WAJIB menyertakan perintah [SEARCH_SHOPPER: (nama olahraga, kategori, atau perlengkapan)] di akhir pesanmu.
Contoh:
"Gas bre, gw cariin raket badminton yang pas buat lo! 🏸 [SEARCH_SHOPPER: raket badminton]"`;

  try {
    // Construct the payload for history. We omit the text prompt from history.
    // Actually we can pass history explicitly to GoogleGenAI
    const chatSession = ai.chats.create({
      model: "gemini-3.1-flash-lite-preview",
      config: {
        systemInstruction: prompt,
      }
    });

    // Or since we already have the `messages` array, we can just pass them as contents.
    // Convert ChatMessage to what generateContent expects:
    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user', // gemini system isn't allowed in standard contents unless it's systemInstruction
      parts: msg.parts
    }));

    // Insert prompt at the beginning or use systemInstruction
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        ...contents
      ],
    });
    return response.text || "Waah maaf, Coach lagi nge-blank nih, coba ulangi lagi ya!";
  } catch (error: any) {
    console.error("Gemini AI failed to chat", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return "Maaf ya, kuota AI lagi limit karena kepenuhan (Error 429). Coba tunggu beberapa saat lagi baru tanya Coach dong!";
    }
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
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analyzeSchema,
      },
    });

    return JSON.parse(response.text!) as CoachPrescription;
  } catch (error: any) {
    console.error("Gemini AI failed to process prescription", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return {
        diagnosis: "Sistem lagi kepenuhan request (Error 429: Rate Limit Exceeded). Tahan bentar ya!",
        recommendedSport: "Olahraga Fleksibel",
        reasoning: "Sementara ini kita rehat sejenak sambil menunggu sistem AI pulih. Nanti coba lagi ya!"
      };
    }
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
    },
    warmUpProtocol: {
      type: Type.STRING,
      description: "Saran gerakan pemanasan atau pendinginan spesifik untuk mencegah cedera JIKA teks mengandung keluhan fisik (seperti pegal, sakit, stres). Jika tidak ada keluhan fisik, kosongkan."
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
  warmUpProtocol?: string;
  results: RecommendationResult[];
}

export async function fetchRecommendations(searchState: SearchState): Promise<RadarRecommendation> {
  const prompt = `
Pengguna ingin mencari lapangan/komunitas untuk berolahraga dengan kriteria berikut:
- Pencarian pengguna: "${searchState.vibeText}"
${searchState.recommendedSport ? `- Olahraga spesifik: "${searchState.recommendedSport}"` : ''}
${searchState.latitude && searchState.longitude ? `- Koordinat GPS saat ini: Latitude ${searchState.latitude}, Longitude ${searchState.longitude}` : ''}
${searchState.userCity ? `- Lokasi pengguna (Daerah/Kota): ${searchState.userCity}` : ''}
${searchState.userAddress ? `- Alamat pengguna: ${searchState.userAddress}` : ''}

Tolong pahami tempat (radarArea) dan olahraga (sportType) yang diinginkan pengguna.
Buat data JSON terkait preferensi. JANGAN mencari lapangan, cukup identifikasi olahraga dan area saja.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const parsed = JSON.parse(response.text!) as RadarRecommendation;
    parsed.results = []; // Initialize empty array, they will be populated by places API
    return parsed;
  } catch (error: any) {
    console.error("Gemini AI failed to process the request", error);
    
    // Fallback data if API fails or rate limits out
    let fbSportType = "Olahraga";
    if (searchState.recommendedSport) {
        fbSportType = searchState.recommendedSport;
    } else if (searchState.vibeText) {
        fbSportType = "Olahraga"; // Avoid passing the entire long text to badge
    }

    let fbRadarArea = searchState.userCity || searchState.userAddress || "Area Terdekat";

    return {
      radarArea: fbRadarArea,
      sportType: fbSportType,
      warmUpProtocol: "Tarik napas panjang, lakukan peregangan dinamis, dan bersiaplah main!",
      results: []
    };
  }
}

export interface ShopperRecommendation {
  name: string;
  priceRange: string;
  link: string;
  reason: string;
}

const shopperSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nama produk olahraga" },
      priceRange: { type: Type.STRING, description: "Rentang harga asli yang akurat di pasaran (misal: Rp 150.000 - Rp 230.000)" },
      link: { type: Type.STRING, description: "Link pencarian produk di e-commerce seperti Shopee. Wajib sertakan https." },
      reason: { type: Type.STRING, description: "Alasan teknis kenapa produk ini direkomendasikan" }
    },
    required: ["name", "priceRange", "link", "reason"]
  }
};

export async function fetchShopperRecommendations(sport: string, category: string, specificNeeds: string, minBudget: number, maxBudget: number, level: number): Promise<ShopperRecommendation[]> {
  const levelNames = ["Pemula", "Amatir", "Menengah", "Lanjutan", "Profesional"];
  const levelStr = levelNames[level - 1] || "Menengah";
  const needsText = specificNeeds.trim() ? ` Kebutuhan spesifik/gaya main: "${specificNeeds}".` : "";
  const prompt = `Berdasarkan cabang olahraga ${sport}, kategori ${category},${needsText} rentang budget Rp${minBudget.toLocaleString("id-ID")} - Rp${maxBudget.toLocaleString("id-ID")}, dan level permainan ${levelStr}, berikan 4 rekomendasi produk olahraga 100% ORIGINAL terbaik yang relevan beserta alasan teknisnya (mengapa barang ini cocok dengan preferensinya). Pastikan memberikan estimasi rentang harga barang ORIGINAL yang akurat sesuai dengan harga di Shopee Mall / Official Store. Field link harus berisi link search shopee pencarian produknya dengan tambahan kata "Original", e.g. https://shopee.co.id/search?keyword=nama+produk+original`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: shopperSchema,
        temperature: 0.7
      },
    });

    const parsed = JSON.parse(response.text!) as ShopperRecommendation[];
    return parsed;
  } catch (error: any) {
    console.error("Gemini AI failed to process shopper request", error);
    return [];
  }
}

export async function scanStrukDenganGemini(imageBase64: string, mimeType: string): Promise<string> {
  const prompt = "Ekstrak total tagihan akhir dari gambar struk ini, kembalikan hanya angka nominalnya saja tanpa titik atau koma";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        prompt
      ],
    });
    
    // Fallback to extraction via regex if response is present but may have junk
    return response.text ? response.text.replace(/[^0-9]/g, '').trim() : "";
  } catch (error: any) {
    console.error("Gemini failed to scan receipt", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("ERROR_429");
    }
    return "";
  }
}
