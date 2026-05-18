import fs from 'fs';
import path from 'path';

const i18nPath = path.join(process.cwd(), 'src/i18n.ts');
let newFile = fs.readFileSync(i18nPath, 'utf8');

const idRepl = `"landing.hero.title_start": "Temukan Lapangan,",
      "landing.hero.title_end": "Mulai Main!",
      "landing.hero.subtitle": "Aplikasi all-in-one untuk anak sports. Cari lapangan terdekat, atur patungan mabar tanpa ribet, dapatkan rekomendasi alat terbaik, sampai ngobrol seru bareng Coach AI cerdas.",
      "landing.hero.btn_find": "Mulai Cari Lapangan",
      "landing.hero.btn_coach": "Ngobrol sama Coach AI",
      
      "landing.features.title": "Fitur Keren di ArenaMabar🔥",
      "landing.features.subtitle": "Banyak fitur AI dan pencarian yang ngebantu mabar kamu.",
      "landing.feature1.title": "Coach AI",
      "landing.feature1.desc": "Konsultasi kondisi fisik, gerakan, nutrisi, langsung tanya ahlinya (buat guest atau user login!).",
      "landing.feature2.title": "Rekomendasi Alat",
      "landing.feature2.desc": "Lagi cari sepatu basket ato raket badminton terbaru? Biar AI kami carikan rekomendasi dan estimasi harganya.",
      "landing.feature3.title": "Cari Lapangan",
      "landing.feature3.desc": "Scan radar di radius sekitar kamu atau cari lokasi spesifik buat nemuin tempat main paling pas.",
      "landing.feature4.title": "Kalkulator Mabar",
      "landing.feature4.desc": "Males hitung manual tagihan patungan per orang? Pakai fitur hitung cepat dan share hasilnya di WA!",

      "landing.benefits.title_start": "Kenapa Harus",
      "landing.benefits.title_end": "Login?",
      "landing.benefits.subtitle": "Banyak banget tambahan fitur yang bisa kamu dapetin biar makin asik mabarnya!",
      "landing.benefits.guest.title": "Guest / Tamu",
      "landing.benefits.guest.desc": "Cocok buat kamu yang pengen langsung sat-set nyobain ArenaMabar tanpa mikir panjang.",
      "landing.benefits.guest.item1": "Akses fitur pencarian lapangan terdekat",
      "landing.benefits.guest.item2": "Dapetin rekomendasi sepatu/raket dari AI",
      "landing.benefits.guest.item3": "Bisa pakai kalkulator patungan buat hitung mabar",
      "landing.benefits.guest.item4": "Konsultasi standar sama Coach AI",
      "landing.benefits.login.title": "Udah Login",
      "landing.benefits.login.badge": "PRO",
      "landing.benefits.login.desc": "Pengalaman maksimal yang dipersonalisasi khusus buat profil dan kesukaan kamu.",
      "landing.benefits.login.item1": "Simpan Lapangan Favorit biar gampang nyarinya lagi",
      "landing.benefits.login.item2": "Simpan Wishlist sepatu / raket incaranmu",
      "landing.benefits.login.item3": "Coach AI bakal kenal siapa nama kamu",
      "landing.benefits.login.item4": "Rekomendasi Coach AI & Rekomendasi Alat disesuaikan otomatis dengan olahraga kesukaanmu",

      "landing.faq.title_start": "Tanya",
      "landing.faq.title_end": "Jawab",
      "landing.faq.subtitle": "Kumpulan pertanyaan yang sering ditanyakan seputar ArenaMabar.",
      "landing.faq.q1": "Apa itu ArenaMabar?",
      "landing.faq.a1": "ArenaMabar adalah all-in-one platform buat kamu yang hobi olahraga. Kamu bisa cari lapangan terdekat, atur patungan mabar dengan hitungan cerdas, cari rekomendasi perlengkapan olahraga, sampai konsultasi interaktif sama Coach AI.",
      "landing.faq.q2": "Apakah aplikasi ini gratis?",
      "landing.faq.a2": "Yap, 100% gratis! Semua fitur termasuk Cari Lapangan, Rekomendasi Alat, Kalkulator Mabar, dan Coach AI bisa kamu pakai sepuasnya.",
      "landing.faq.q3": "Bagaimana cara kerja Kalkulator Mabar?",
      "landing.faq.a3": "Gampang banget! Kamu tinggal foto struk bayar lapangan atau shuttlecock, lalu AI kita bakal baca total bayarannya. Masukin detail lainnya seperti patungan bola bulu tangkis khusus pria, dan klik hitung. Nanti tinggal share rincian patungannya ke grup WA.",
      "landing.faq.q4": "Rekomendasi Alat itu ngambil barang dari mana?",
      "landing.faq.a4": "Rekomendasi Alat mencari barang 100% ORIGINAL dari Shopee Mall atau Official Store melalui pencarian AI. Kami memberikan estimasi kisaran harga termurah hingga termahal sehingga kamu bisa sesuaikan dengan budget.",
      "landing.faq.q5": "Coach AI bisa ngapain aja sekarang?",
      "landing.faq.a5": "Gak cuma konsultasi cedera dan gizi mas bro! Coach AI sekarang juga bisa bantuin kamu nyari lapangan terdekat dari tempatmu, dan nyariin gear atau perlengkapan olahraga langsung dari obrolan!",
      "landing.faq.q6": "Kok lokasiku kadang kurang akurat di radar pencarian?",
      "landing.faq.a6": "Pastikan kamu udah kasih izin akses lokasi (GPS) ke browser. Kalau ditolak, kita terpaksa pakai lokasi IP yang kadang bisa meleset. Kamu bisa ubah sendiri juga via peta!",
      "landing.faq.q7": "Punya masukkan atau nemu bug?",
      "landing.faq.a7": "Langsung curhat aja ke Coach AI! Bisa juga sapa developer dari fitur 'Tanya Coach AI' untuk diskusi.",

      "landing.faq.more.title": "Punya Pertanyaan Lain?",
      "landing.faq.more.desc": "Kalau kamu nemu bug, punya ide fitur baru, atau mau kerjasama, langsung aja sapa Coach AI!",
      "landing.faq.more.btn": "Tanya Coach AI",

      "landing.footer.built_with": "Dibangun dengan",`;

const enRepl = `"landing.hero.title_start": "Find Courts,",
      "landing.hero.title_end": "Start Playing!",
      "landing.hero.subtitle": "The all-in-one app for sports enthusiasts. Find nearby courts, split bills easily, get gear recommendations, and consult with a smart AI coach.",
      "landing.hero.btn_find": "Start Finding Courts",
      "landing.hero.btn_coach": "Talk to Coach AI",
      
      "landing.features.title": "Cool Features in ArenaMabar🔥",
      "landing.features.subtitle": "Many AI features and search tools to help you out.",
      "landing.feature1.title": "Coach AI",
      "landing.feature1.desc": "Consult about physical conditions, movement, nutrition directly with the expert (for guests or logged users!).",
      "landing.feature2.title": "Gear Recommendation",
      "landing.feature2.desc": "Looking for the newest basketball shoes or badminton racket? Let our AI find recommendations and estimate the price.",
      "landing.feature3.title": "Find Court",
      "landing.feature3.desc": "Scan radar in your radius or search specific locations to find the best place to play.",
      "landing.feature4.title": "Split Bill Calculator",
      "landing.feature4.desc": "Lazy to calculate manual split bills per person? Use the quick calculate feature and share the result to WA!",

      "landing.benefits.title_start": "Why",
      "landing.benefits.title_end": "Login?",
      "landing.benefits.subtitle": "A lot of extra features you can get to make playing even more fun!",
      "landing.benefits.guest.title": "Guest",
      "landing.benefits.guest.desc": "Perfect for you who want to try ArenaMabar straight away without overthinking.",
      "landing.benefits.guest.item1": "Access nearest court search feature",
      "landing.benefits.guest.item2": "Get shoes/racket recommendations from AI",
      "landing.benefits.guest.item3": "Can use split bill calculator",
      "landing.benefits.guest.item4": "Standard consultation with Coach AI",
      "landing.benefits.login.title": "Logged In",
      "landing.benefits.login.badge": "PRO",
      "landing.benefits.login.desc": "Maximum experience personally tailored to your profile and preferences.",
      "landing.benefits.login.item1": "Save Favorite Courts to easily find them again",
      "landing.benefits.login.item2": "Save Wishlist of shoes/rackets you want",
      "landing.benefits.login.item3": "Coach AI will know your name",
      "landing.benefits.login.item4": "Coach AI & Gear Recommendations tailored automatically to your liked sports",

      "landing.faq.title_start": "Q &",
      "landing.faq.title_end": "A",
      "landing.faq.subtitle": "Collection of frequently asked questions about ArenaMabar.",
      "landing.faq.q1": "What is ArenaMabar?",
      "landing.faq.a1": "ArenaMabar is an all-in-one platform for sports lovers. Find nearby courts, arrange splitting bills, find gear recommendations, and consult interactively with Coach AI.",
      "landing.faq.q2": "Is this app free?",
      "landing.faq.a2": "Yup, 100% free! All features including Find Court, Gear Recommendation, Split Bill Calculator, and Coach AI are free.",
      "landing.faq.q3": "How does the Split Bill Calculator work?",
      "landing.faq.a3": "Very easy! Take a picture of the court/shuttlecock receipt, and our AI will read the total bill. Enter other details, click calculate, and share to WA group.",
      "landing.faq.q4": "Where does Gear Recommendation get its items?",
      "landing.faq.a4": "We search 100% ORIGINAL items from E-Commerce via AI search. We provide cheapest to highest estimates aligning with your budget.",
      "landing.faq.q5": "What can Coach AI do now?",
      "landing.faq.a5": "Not only injury and nutrition consultation! It can now help you find nearby courts and sports gear directly from chat!",
      "landing.faq.q6": "Why is my location sometimes inaccurate in radar?",
      "landing.faq.a6": "Ensure you gave location access (GPS) to the browser. If denied, we use IP location which might be off. You can change it manually on map!",
      "landing.faq.q7": "Have feedback or found a bug?",
      "landing.faq.a7": "Just tell Coach AI! Or chat with developers via 'Ask Coach AI' feature.",

      "landing.faq.more.title": "Any Other Questions?",
      "landing.faq.more.desc": "If you find bugs, have new feature ideas, or want to partner, just greet Coach AI!",
      "landing.faq.more.btn": "Ask Coach AI",

      "landing.footer.built_with": "Built with",`;

const spaRepl = `"landing.hero.title_start": "Encuentra Canchas,",
      "landing.hero.title_end": "¡A Jugar!",
      "landing.hero.subtitle": "La app todo en uno para deportistas. Encuentra canchas, divide cuentas, recomendaciones de equipo y entrenador IA.",
      "landing.hero.btn_find": "Buscar Canchas",
      "landing.hero.btn_coach": "Hablar con Entrenador IA",
      
      "landing.features.title": "Funciones Geniales en ArenaMabar🔥",
      "landing.features.subtitle": "Múltiples funciones de IA y búsqueda.",
      "landing.feature1.title": "Entrenador IA",
      "landing.feature1.desc": "Consulta tu condición física, movimientos, nutrición directamente con un experto.",
      "landing.feature2.title": "Recomendación de Equipo",
      "landing.feature2.desc": "¿Buscas los tenis o raqueta más nuevos? La IA te dará recomendaciones y su precio.",
      "landing.feature3.title": "Buscar Cancha",
      "landing.feature3.desc": "Escanea el radar en tu área para encontrar el mejor lugar.",
      "landing.feature4.title": "Calculadora",
      "landing.feature4.desc": "¿Perezoso para calcular la cuenta por persona? Usa la función rápida y comparte a WA.",

      "landing.benefits.title_start": "¿Por Qué",
      "landing.benefits.title_end": "Iniciar Sesión?",
      "landing.benefits.subtitle": "¡Demasiados beneficios adicionales!",
      "landing.benefits.guest.title": "Invitado",
      "landing.benefits.guest.desc": "Perfecto para probar rápidamente sin pensarlo mucho.",
      "landing.benefits.guest.item1": "Acceso al buscador de canchas cercano",
      "landing.benefits.guest.item2": "Recomendaciones de equipo por IA",
      "landing.benefits.guest.item3": "Calculadora para dividir cuenta",
      "landing.benefits.guest.item4": "Consulta estándar con Entrenador IA",
      "landing.benefits.login.title": "Iniciado",
      "landing.benefits.login.badge": "PRO",
      "landing.benefits.login.desc": "Máxima experiencia personalizada.",
      "landing.benefits.login.item1": "Guarda Canchas Favoritas para fácil acceso",
      "landing.benefits.login.item2": "Guarda Lista de Deseos de equipo",
      "landing.benefits.login.item3": "El Entrenador IA te reconocerá por nombre",
      "landing.benefits.login.item4": "Recomendaciones y Entrenador automatizado a tus gustos",

      "landing.faq.title_start": "Preguntas y",
      "landing.faq.title_end": "Respuestas",
      "landing.faq.subtitle": "Preguntas frecuentes sobre ArenaMabar.",
      "landing.faq.q1": "¿Qué es ArenaMabar?",
      "landing.faq.a1": "ArenaMabar es un plataforma todo-en-uno para entusiastas. Encuentra canchas, calcula costos, encuentra equipo y consulta el Entrenador IA.",
      "landing.faq.q2": "¿Es gratis?",
      "landing.faq.a2": "¡Sí, 100% gratis! Todas las funciones lo son.",
      "landing.faq.q3": "¿Cómo funciona la Calculadora?",
      "landing.faq.a3": "Toma foto del recibo, nuestra IA lo lee y divide. Luego compártelo en WA.",
      "landing.faq.q4": "¿De dónde obtiene el Equipo Recomendado?",
      "landing.faq.a4": "Buscamos equipo 100% ORIGINAL de las tiendas mediante búsqueda IA basándonos en tu presupuesto.",
      "landing.faq.q5": "¿Qué puede hacer el Entrenador IA?",
      "landing.faq.a5": "Además de salud, te ayudará a buscar canchas cercanas y recomendar equipo.",
      "landing.faq.q6": "¿Por qué mi ubicación es imprecisa?",
      "landing.faq.a6": "Asegúrate de conceder acceso al GPS. Si no, usamos tu IP. ¡Puedes cambiar tu ubicación en el mapa!",
      "landing.faq.q7": "¿Algún problema o idea?",
      "landing.faq.a7": "Dile al Entrenador IA. O habla con nosotros por allí.",

      "landing.faq.more.title": "¿Más Preguntas?",
      "landing.faq.more.desc": "¡Dile a nuestro Entrenador IA si tienes sugerencias!",
      "landing.faq.more.btn": "Preguntar Entrenador IA",

      "landing.footer.built_with": "Construido con",`;

const zhRepl = `"landing.hero.title_start": "寻找球场，",
      "landing.hero.title_end": "开始运动！",
      "landing.hero.subtitle": "体育爱好者全能应用。寻找附近球场、轻松 AA 制、智能教练以及装备推荐！",
      "landing.hero.btn_find": "寻找球场",
      "landing.hero.btn_coach": "交谈 AI",
      
      "landing.features.title": "强大的功能🔥",
      "landing.features.subtitle": "多项智能功能和工具。",
      "landing.feature1.title": "AI 教练",
      "landing.feature1.desc": "为您提供身体和技术提示（访客或登录用户！）。",
      "landing.feature2.title": "装备推荐",
      "landing.feature2.desc": "寻找最新球鞋？让 AI 提供建议和价格预测。",
      "landing.feature3.title": "寻找球场",
      "landing.feature3.desc": "通过雷达或指定位置找到打球最佳地点。",
      "landing.feature4.title": "计算器",
      "landing.feature4.desc": "懒得计算？扫收据一键分配账单发 WA。",

      "landing.benefits.title_start": "为什么要",
      "landing.benefits.title_end": "登录？",
      "landing.benefits.subtitle": "你可以获取许多特权体验！",
      "landing.benefits.guest.title": "访客",
      "landing.benefits.guest.desc": "快速直接尝试。",
      "landing.benefits.guest.item1": "访问球场查找功能",
      "landing.benefits.guest.item2": "获取 AI 装备推荐",
      "landing.benefits.guest.item3": "使用账单计算",
      "landing.benefits.guest.item4": "与 AI 教练进行标准咨询",
      "landing.benefits.login.title": "已登录",
      "landing.benefits.login.badge": "专业",
      "landing.benefits.login.desc": "根据你的偏好个性化体验。",
      "landing.benefits.login.item1": "保存收藏夹以便后续访问",
      "landing.benefits.login.item2": "保存心愿单装备",
      "landing.benefits.login.item3": "AI 教练可以识别您的名字",
      "landing.benefits.login.item4": "推荐与喜好相匹配",

      "landing.faq.title_start": "答疑",
      "landing.faq.title_end": "环节",
      "landing.faq.subtitle": "ArenaMabar 常见问题解答。",
      "landing.faq.q1": "什么是 ArenaMabar？",
      "landing.faq.a1": "是一体化体育运动平台，供你查找场地、智能拼单计算、获取装备推荐等。",
      "landing.faq.q2": "它是免费的吗？",
      "landing.faq.a2": "是的，所有功能完全免费使用。",
      "landing.faq.q3": "计算器怎么用？",
      "landing.faq.a3": "只需拍照，AI 自动读取并分割账单。随后转 WA 输出。",
      "landing.faq.q4": "装备推荐物品来源哪里？",
      "landing.faq.a4": "从主流电商平台搜获 100% 正品估计以迎合您的预算。",
      "landing.faq.q5": "AI 教练新功能有什么？",
      "landing.faq.a5": "不仅解答受伤疲劳，还能直接给你场地和装备。",
      "landing.faq.q6": "为何定位偶尔偏移？",
      "landing.faq.a6": "若拒绝了 GPS 授权我们会使用 IP 地址，这可能会有偏移，请直接从地图修改定位。",
      "landing.faq.q7": "寻找了 bug？",
      "landing.faq.a7": "直接跟 AI 教练交谈提供反馈！",

      "landing.faq.more.title": "更多问题？",
      "landing.faq.more.desc": "如果您有任何新功能想法，去告诉 AI 教练！",
      "landing.faq.more.btn": "询问 AI 教练",

      "landing.footer.built_with": "开发",`;

const replaceRange = (str: string, startStr: string, endStr: string, newStr: string) => {
  const startIdx = str.indexOf(startStr);
  const endIdx = str.indexOf(endStr, startIdx);
  if (startIdx === -1 || endIdx === -1) return str;
  return str.substring(0, startIdx) + newStr + str.substring(endIdx);
};

newFile = replaceRange(newFile, 
  '"landing.hero.title_start":', 
  '// KalkulatorMabar', 
  idRepl + '\n\n      // KalkulatorMabar'
);

newFile = replaceRange(newFile, 
  '"landing.hero.title_start":', 
  '"calc.title_start":', 
  enRepl + '\n\n      // KalkulatorMabar\n      "calc.title_start":'
);

newFile = replaceRange(newFile, 
  '"landing.hero.title_start":', 
  '"calc.title":', 
  spaRepl + '\n\n      "calc.title":'
);

newFile = replaceRange(newFile, 
  '"landing.hero.title_start":', 
  '"calc.title":', 
  zhRepl + '\n\n      "calc.title":'
);

fs.writeFileSync(i18nPath, newFile, 'utf8');
console.log('Done!');
