import { memoryStore } from '../db';

export interface ActionCard {
  label: string;
  url: string;
  type: 'link' | 'call' | 'action';
  icon?: string;
}

export interface ChatResponse {
  answer: string;
  isAllowed: boolean;
  domainCategory: 'msp' | 'slot_booking' | 'moisture_faq' | 'crop_health' | 'weather' | 'schemes' | 'platform_help' | 'off_topic' | 'blocked';
  suggestedActions?: ActionCard[];
  suggestedQuestions?: string[];
}

// 1. Jailbreak and Prompt Injection Blocklist Patterns
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s*prompt/i,
  /you\s+are\s+now\s+(unrestricted|dan|jailbreak)/i,
  /act\s+as\s+(a\s+)?(developer|hacker|girlfriend|terminal|python|c\+\+|linux)/i,
  /forget\s+(your\s+)?(rules|instructions|identity)/i,
  /override\s+safety/i,
  /sudo\s+mode/i,
  /disregard\s+the\s+above/i,
];

// 2. Off-Topic Prohibited Domains
const OFF_TOPIC_PATTERNS = [
  // Programming / Tech (non-agri)
  /\b(javascript|python|typescript|react|html|css|sql|docker|kubernetes|c\+\+|java\b|npm|github|code\b)\b/i,
  // Entertainment / Movies / Celebrities / Pop culture
  /\b(hollywood|bollywood|netflix|movie|cinema|actor|actress|album|song|game|playstation|xbox|fortnite|cricket score|ipl|world cup)\b/i,
  // Politics / Elections / Geopolitics (non-policy)
  /\b(bjp vs congress|election vote for|war in|ukraine|russia|israel|gaza|who is president of)\b/i,
  // Cryptocurrencies / Forex / Stock trading
  /\b(bitcoin|ethereum|crypto|forex|stock option|trading signal|nft)\b/i,
  // Essays / School Cheating / Homework
  /\b(write an essay on|solve this equation|do my homework|write a poem about love)\b/i,
  // Adult / Illicit / Harmful
  /\b(porn|sex|weapon|bomb|explosive|casino|betting|hack a)\b/i,
];

// 3. Permitted Agricultural & KrishiSeva Domain Keywords
const AGRI_DOMAIN_KEYWORDS = [
  'wheat', 'paddy', 'rice', 'mustard', 'cotton', 'maize', 'corn', 'gram', 'chana', 'soybean',
  'barley', 'sunflower', 'sugarcane', 'millet', 'bajra', 'jowar', 'pulses', 'dal', 'oilseed',
  'गेहूं', 'धान', 'चावल', 'सरसों', 'कपास', 'मक्का', 'चना', 'सोयाबीन', 'जौ', 'सूरजमुखी', 'गन्ना', 'बाजरा', 'दाल',
  'ਕਣਕ', 'ਝੋਨਾ', 'ਸਰ੍ਹੋਂ', 'ਨਰਮਾ', 'ਮੱਕੀ', 'ਛੋਲੇ',
  'msp', 'rate', 'price', 'mandi', 'apmc', 'procurement', 'slot', 'booking', 'token', 'queue',
  'ticket', 'weighbridge', 'dbt', 'payment', 'bank', 'pfms', 'j-form', 'receipt', 'centre',
  'krishiseva', 'portal', 'toll-free', 'helpline', 'grievance', 'complaint', 'delay', 'breakdown', 'tractor',
  'न्यूनतम समर्थन मूल्य', 'एमएसपी', 'भाव', 'रेट', 'मंडी', 'स्लॉट', 'बुकिंग', 'टोकन', 'कतार', 'तौल', 'भुगतान',
  'ਮੰਡੀ', 'ਸਲਾਟ', 'ਬੁਕਿੰਗ', 'ਟੋਕਨ', 'ਪੈਸੇ',
  'moisture', 'faq', 'moisture content', 'sun dry', 'grading', 'quality',
  'fertilizer', 'urea', 'dap', 'npk', 'soil', 'irrigation', 'sowing', 'harvest', 'crop', 'field',
  'disease', 'pest', 'fungus', 'rust', 'yellow rust', 'white rust', 'bollworm', 'aphid', 'weed',
  'pesticide', 'insecticide', 'neem', 'organic', 'vermicompost',
  'नमी', 'खाद', 'यूरिया', 'मिट्टी', 'सिंचाई', 'बीज', 'बुवाई', 'कटाई', 'रोग', 'कीट', 'फफूंद', 'दवा', 'कीटनाशक',
  'weather', 'rain', 'temperature', 'frost', 'monsoon', 'forecast',
  'pm-kisan', 'pmfby', 'insurance', 'kcc', 'kisan credit card', 'soil health card', 'subsidy',
  'मौसम', 'बारिश', 'पाला', 'बीमा', 'योजना', 'सब्सिडी', 'कर्ज'
];

export function evaluateDomainGuardrails(query: string): {
  isAllowed: boolean;
  reason?: 'injection' | 'off_topic';
  matchedCategory?: string;
} {
  const normalized = query.trim().toLowerCase();

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isAllowed: false, reason: 'injection' };
    }
  }

  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isAllowed: false, reason: 'off_topic' };
    }
  }

  const hasAgriMatch = AGRI_DOMAIN_KEYWORDS.some(kw => normalized.includes(kw.toLowerCase()));
  const isAgriGreeting = /^(hello|hi|namaste|sat sri akal|ram ram|kisan|help|sahayata|namaskar|kheti|kisan)\b/i.test(normalized);

  if (hasAgriMatch || isAgriGreeting) {
    return { isAllowed: true };
  }

  return { isAllowed: false, reason: 'off_topic' };
}

export function generateDomainResponse(query: string, language: string = 'en'): ChatResponse {
  const guardrail = evaluateDomainGuardrails(query);
  const q = query.toLowerCase();

  if (!guardrail.isAllowed) {
    const refusalTexts: Record<string, string> = {
      hi: 'क्षमा करें, मैं कृषिसेवा का समर्पित AI "कृषि मित्र" हूँ। मुझे केवल भारतीय किसानों, कृषि, फसलों, न्यूनतम समर्थन मूल्य (MSP), मंडी स्लॉट बुकिंग, और सरकारी योजनाओं की जानकारी देने के लिए अधिकृत किया गया है। मैं अन्य सामान्य या तकनीकी विषयों पर सहायता नहीं कर सकता।',
      pa: 'ਮਾਫ਼ ਕਰਨਾ ਜੀ, ਮੈਂ ਕ੍ਰਿਸ਼ੀ ਸੇਵਾ ਦਾ ਅਧਿਕਾਰਤ AI "ਕਿਸਾਨ ਮਿੱਤਰ" ਹਾਂ। ਮੈਂ ਸਿਰਫ਼ ਖੇਤੀਬਾੜੀ, ਫ਼ਸਲਾਂ, ਸਰਕਾਰੀ MSP ਰੇਟਾਂ, ਮੰਡੀ ਸਲਾਟ ਬੁਕਿੰਗ ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਸੰਬੰਧੀ ਹੀ ਜਾਣਕਾਰੀ ਦੇ ਸਕਦਾ ਹਾਂ।',
      mr: 'क्षमस्व, मी कृषी सेवेचा अधिकृत AI "कृषी मित्र" आहे. मी केवळ शेतकरी, पिके, हमीभाव (MSP), बाजार समिती स्लॉट बुकिंग आणि कृषी योजनांशी संबंधित प्रश्नांची उत्तरे देऊ शकतो.',
      te: 'క్షమించండి, నేను కృషి సేవా యొక్క అధికారిక AI "కిసాన్ మిత్ర" ని. నేను కేవలం వ్యవసాయం, పంటలు, MSP మద్దతు ధరలు మరియు మండి స్లాట్ బుకింగ్ సంబంధిత సమాచారాన్ని మాత్రమే అందించగలను.',
      ta: 'மன்னிக்கவும், நான் கிருஷி சேவாவின் அதிகாரப்பூர்வ AI "கிசான் மித்ரா" ஆவேன். நான் விவசாயம், பயிர்கள், MSP விலைகள் மற்றும் மண்டி முன்பதிவு தொடர்பான கேள்விகளுக்கு மட்டுமே பதிலளிக்க முடியும்.',
      en: 'I apologize, but I am KrishiSeva’s dedicated AI Kisan Mitra. I am strictly restricted to assisting farmers with agriculture, crop health, official MSP rates, mandi slot booking, and government agricultural welfare schemes. I cannot answer queries outside the agricultural domain.',
    };

    return {
      answer: refusalTexts[language] || refusalTexts['en'],
      isAllowed: false,
      domainCategory: 'off_topic',
      suggestedQuestions: [
        'What is the current MSP for Wheat and Mustard?',
        'How do I book a mandi procurement slot?',
        'What is the FAQ moisture limit for grain weighment?',
      ],
      suggestedActions: [
        { label: 'View MSP Rates', url: '/msp-calculator', type: 'link', icon: '🌾' },
        { label: 'Book Mandi Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
        { label: 'Kisan Helpline 1800-180-1551', url: 'tel:18001801551', type: 'call', icon: '📞' },
      ],
    };
  }

  // 1. MSP INQUIRIES
  if (q.includes('msp') || q.includes('rate') || q.includes('price') || q.includes('भाव') || q.includes('रेट') || q.includes('ਮੁੱਲ')) {
    const wheatRate = memoryStore.msp_rates.find(r => r.crop_type === 'wheat')?.msp_price || 2425;
    const mustardRate = memoryStore.msp_rates.find(r => r.crop_type === 'mustard')?.msp_price || 5950;
    const paddyRate = memoryStore.msp_rates.find(r => r.crop_type === 'paddy')?.msp_price || 2300;
    const cottonRate = memoryStore.msp_rates.find(r => r.crop_type === 'cotton')?.msp_price || 7121;
    const maizeRate = memoryStore.msp_rates.find(r => r.crop_type === 'maize')?.msp_price || 2090;
    const gramRate = memoryStore.msp_rates.find(r => r.crop_type === 'gram')?.msp_price || 5650;

    let answer = '🌾 **Official 2025–26 Minimum Support Price (MSP) Rates (Per Quintal):**\n\n' +
      '• **Wheat (गेहूं):** ₹' + wheatRate + '/Qtl (Rabi 2026)\n' +
      '• **Mustard (सरसों):** ₹' + mustardRate + '/Qtl\n' +
      '• **Paddy Common (धान):** ₹' + paddyRate + '/Qtl\n' +
      '• **Gram / Chana (चना):** ₹' + gramRate + '/Qtl\n' +
      '• **Cotton Long Staple (कपास):** ₹' + cottonRate + '/Qtl\n' +
      '• **Maize (मक्का):** ₹' + maizeRate + '/Qtl\n\n' +
      'Under KrishiSeva, 100% MSP value is transferred directly into your Aadhaar-linked bank account within 72 hours of digital weighbridge certification.';

    if (language === 'hi') {
      answer = '🌾 **सरकारी न्यूनतम समर्थन मूल्य (MSP दरें 2025–26):**\n\n' +
        '• **गेहूं (Wheat):** ₹' + wheatRate + ' प्रति क्विंटल\n' +
        '• **सरसों (Mustard):** ₹' + mustardRate + ' प्रति क्विंटल\n' +
        '• **धान (Paddy):** ₹' + paddyRate + ' प्रति क्विंटल\n' +
        '• **चना (Gram):** ₹' + gramRate + ' प्रति क्विंटल\n' +
        '• **कपास (Cotton):** ₹' + cottonRate + ' प्रति क्विंटल\n' +
        '• **मक्का (Maize):** ₹' + maizeRate + ' प्रति क्विंटल\n\n' +
        'कृषिसेवा में तौल पूर्ण होने के 72 घंटे के भीतर पूरी राशि सीधे आपके बैंक खाते (PFMS DBT) में जमा होती है। बिचौलियों का कोई कमीशन नहीं कटता।';
    }

    return {
      answer,
      isAllowed: true,
      domainCategory: 'msp',
      suggestedActions: [
        { label: 'Open MSP Calculator', url: '/msp-calculator', type: 'link', icon: '⚖️' },
        { label: 'Book Procurement Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
      ],
      suggestedQuestions: [
        'How does KrishiSeva protect against middleman cuts?',
        'What moisture is allowed for Mustard at ₹5,950?',
      ],
    };
  }

  // 2. MANDI SLOT BOOKING & TOKENS
  if (q.includes('slot') || q.includes('book') || q.includes('token') || q.includes('स्लॉट') || q.includes('बुकिंग') || q.includes('ਟੋਕਨ')) {
    const answer = language === 'hi'
      ? '📅 **मंडी स्लॉट कैसे बुक करें?**\n\n1. ऊपर मेनू में **"Book Slot" (स्लॉट बुक करें)** पर क्लिक करें।\n2. अपनी निकटतम APMC मंडी (जैसे अमृतसर सेंट्रल, लुधियाना, हिसार) चुनें।\n3. फसल का प्रकार और अनुमानित मात्रा (क्विंटल) दर्ज करें।\n4. अपनी सुविधानुसार तारीख और समय स्लॉट (उदा. सुबह 10:00 - 12:00) चुनें।\n5. अपना डिजिटल **QR टोकन पास** प्राप्त करें। आप घर बैठे लाइव टोकन डिस्प्ले बोर्ड देख सकते हैं ताकि लाइन में खड़े न होना पड़े!'
      : '📅 **How to Book a Mandi Slot in KrishiSeva:**\n\n1. Click **"Book Slot"** in the navigation bar.\n2. Select your nearest APMC Procurement Centre (e.g., Amritsar Central, Ludhiana, Hisar).\n3. Choose your crop and estimated quantity in quintals.\n4. Select your preferred date and arrival time window.\n5. Instantly download your **QR Token Pass** on mobile. You will receive live token tracking via SMS so you only arrive when your turn is close!';

    return {
      answer,
      isAllowed: true,
      domainCategory: 'slot_booking',
      suggestedActions: [
        { label: 'Book Slot Now', url: '/farmer/book-slot', type: 'link', icon: '📅' },
        { label: 'Live Mandi Heatmap', url: '/farmer/mandi-heatmap', type: 'link', icon: '🗺️' },
        { label: 'My Bookings & QR Passes', url: '/farmer/my-bookings', type: 'link', icon: '🎟️' },
      ],
      suggestedQuestions: [
        'What documents do I need to bring to the mandi?',
        'Can I reschedule my slot if my tractor breaks down?',
      ],
    };
  }

  // 3. MOISTURE & FAQ GRADING
  if (q.includes('moisture') || q.includes('faq') || q.includes('dry') || q.includes('drying') || q.includes('नमी') || q.includes('ਸੁਕਾਉਣਾ')) {
    const answer = language === 'hi'
      ? '💧 **सरकारी FAQ (Fair Average Quality) नमी मानक:**\n\n' +
        '• **गेहूं (Wheat):** अधिकतम **12.0%** (14.5% तक मामूली कटौती संभव, >14.5% अस्वीकृत)\n' +
        '• **धान (Paddy):** अधिकतम **17.0%**\n' +
        '• **सरसों (Mustard):** अधिकतम **8.0%**\n' +
        '• **मक्का (Maize):** अधिकतम **14.0%**\n\n' +
        '💡 **किसान सलाह:** अपनी ट्रॉली लोड करने से पहले तिरपाल (tarpaulin) पर 2–3 दिन तेज धूप में अनाज को सुखाएं। आप पोर्टल के **AI Crop Scanner** से घर बैठे मोबाइल कैमरे से अनुमानित नमी और ग्रेड जान सकते हैं!'
      : '💧 **Official FAQ Moisture Standards for Zero Deduction:**\n\n' +
        '• **Wheat:** Maximum **12.0%** (12–14.5% conditional, >14.5% rejected)\n' +
        '• **Paddy:** Maximum **17.0%**\n' +
        '• **Mustard:** Maximum **8.0%**\n' +
        '• **Maize:** Maximum **14.0%**\n\n' +
        '💡 **Farmer Tip:** Always spread grain on clean tarpaulins for 2 days of sun drying before transporting. Use the **AI Crop Scanner** on KrishiSeva to check moisture with your phone camera before leaving home!';

    return {
      answer,
      isAllowed: true,
      domainCategory: 'moisture_faq',
      suggestedActions: [
        { label: 'AI Crop Quality Scanner', url: '/farmer/dashboard', type: 'link', icon: '📷' },
        { label: 'Book Mandi Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
      ],
      suggestedQuestions: [
        'What if moisture is higher than 12% in wheat?',
        'Where do weighbridges test moisture?',
      ],
    };
  }

  // 4. CROP HEALTH, DISEASES & PESTS
  if (q.includes('disease') || q.includes('pest') || q.includes('rust') || q.includes('worm') || q.includes('aphid') || q.includes('रोग') || q.includes('कीट') || q.includes('फफूंद') || q.includes('दवा')) {
    let answer = '🌱 **Agricultural Crop Protection Advisory:**\n\n' +
      '• **Yellow Rust in Wheat (पीला रतुआ):** Look for linear yellow powdery pustules on leaves. Spray Propiconazole 25% EC (Tilt) @ 1 ml/litre of water.\n' +
      '• **White Rust in Mustard (सफेद रतुआ):** Spray Mancozeb 75 WP @ 2g/litre of water immediately upon spotting white blisters.\n' +
      '• **Pink Bollworm in Cotton (गुलाबी सुंडी):** Deploy pheromone traps (5/acre) and spray Emamectin Benzoate 5% SG @ 0.5g/litre.\n' +
      '• **Organic Pest Control:** Spray 5% Neem Seed Kernel Extract (NSKE) or Jeevamrut to protect beneficial insects.\n\n' +
      'For field inspection, contact your Block Agriculture Development Officer (ADO) or call Kisan Call Centre at 1800-180-1551.';

    if (language === 'hi') {
      answer = '🌱 **फसल सुरक्षा एवं कीट-रोग विशेषज्ञ सलाह:**\n\n' +
        '• **गेहूं का पीला रतुआ (Yellow Rust):** पत्तियों पर पीले पाउडर की धारियां दिखने पर तुरंत प्रोपिकोनाजोल 25% EC (टिल्ट) 1 मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।\n' +
        '• **सरसों का सफेद रतुआ (White Rust):** पत्तियों के नीचे सफेद फफोले दिखने पर मैंकोजेब 75 WP 2 ग्राम प्रति लीटर पानी का छिड़काव करें।\n' +
        '• **कपास की गुलाबी सुंडी (Pink Bollworm):** खेत में 5 फेरोमोन ट्रैप प्रति एकड़ लगाएं तथा इमामेक्टिन बेंजोएट 5% SG 0.5 ग्राम/लीटर का छिड़काव करें।\n' +
        '• **जैविक नियंत्रण:** 5% नीम अर्क या जीवामृत का छिड़काव रस चूसक कीटों से प्राकृतिक सुरक्षा देता है।\n\n' +
        'अधिक सहायता के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) या किसान कॉल सेंटर 1800-180-1551 पर संपर्क करें।';
    }

    return {
      answer,
      isAllowed: true,
      domainCategory: 'crop_health',
      suggestedActions: [
        { label: 'Kisan Call Centre 1800-180-1551', url: 'tel:18001801551', type: 'call', icon: '📞' },
        { label: 'View Mandi Heatmap', url: '/farmer/mandi-heatmap', type: 'link', icon: '🗺️' },
      ],
      suggestedQuestions: [
        'How to prevent aphid attacks on mustard in foggy weather?',
        'What is the recommended dosage of DAP and Urea per acre for wheat?',
      ],
    };
  }

  // 5. BREAKDOWN / TRANSIT DELAY GRACE
  if (q.includes('breakdown') || q.includes('delay') || q.includes('late') || q.includes('puncture') || q.includes('ट्रैक्टर') || q.includes('खराब') || q.includes('देरी')) {
    const answer = language === 'hi'
      ? '🚨 **हाईवे पर ट्रैक्टर ब्रेकडाउन या जाम में फंसने पर क्या करें?**\n\n' +
        '1. **चिंता न करें, आपका टोकन रद्द नहीं होगा!** KrishiSeva में किसानों के लिए स्वचालित **2 घंटे की आपातकालीन ग्रेस अवधि (Grace Period)** दी जाती है।\n' +
        '2. अपने किसान डैशबोर्ड पर जाकर **"Report Mandi Transit Delay"** बटन दबाएं।\n' +
        '3. मंडी गेट ऑपरेटर को तुरंत ऑटो-अलर्ट भेजा जाएगा और आपका टोकन सुरक्षित रहेगा।\n' +
        '4. यदि मरम्मत में अधिक समय लगे, तो आप बिना किसी पेनल्टी के अपना स्लॉट उसी दिन शाम या अगले दिन के लिए रीशेड्यूल कर सकते हैं।'
      : '🚨 **Tractor Breakdown / Highway Transit Delay Protocol:**\n\n' +
        '1. **Do not panic — your slot token will NOT be cancelled!** KrishiSeva includes an automatic **2-Hour Grace Period** for highway transit emergencies.\n' +
        '2. Go to your **Farmer Dashboard** and click **"Report Mandi Transit Delay"**.\n' +
        '3. An instant electronic alert is pushed to the Mandi Gate Incharge so your queue position is held.\n' +
        '4. If repairs take longer, you can reschedule your slot to an afternoon or next-day window with zero penalty!';

    return {
      answer,
      isAllowed: true,
      domainCategory: 'platform_help',
      suggestedActions: [
        { label: 'Go to Farmer Dashboard', url: '/farmer/dashboard', type: 'link', icon: '🚜' },
        { label: 'Call Mandi Helpline', url: 'tel:18001801551', type: 'call', icon: '📞' },
      ],
      suggestedQuestions: [
        'How do I view my live token position while traveling?',
        'Can another farmer use my slot if I am delayed?',
      ],
    };
  }

  // 6. GOVERNMENT SCHEMES & SUBSIDIES
  if (q.includes('scheme') || q.includes('pm-kisan') || q.includes('pmfby') || q.includes('kcc') || q.includes('योजना') || q.includes('सब्सिडी') || q.includes('बीमा')) {
    const answer = language === 'hi'
      ? '🏛️ **प्रमुख सरकारी किसान कल्याण योजनाएं:**\n\n' +
        '1. **PM-KISAN (पीएम-किसान):** पात्र किसानों को सालाना ₹6,000 की प्रत्यक्ष वित्तीय सहायता (₹2,000 की 3 समान किस्तों में) सीधे बैंक खाते में।\n' +
        '2. **PMFBY (फसल बीमा):** प्राकृतिक आपदाओं (सूखा, बाढ़, ओलावृष्टि) से फसल नुकसान पर व्यापक बीमा कवर। रबी फसलों पर मात्र 1.5% और खरीफ पर 2% प्रीमियम।\n' +
        '3. **Kisan Credit Card (KCC):** 7% की रियायती ब्याज दर पर कृषि ऋण, समय पर भुगतान करने पर 3% अतिरिक्त ब्याज छूट (प्रभावी दर 4%)।\n' +
        '4. **कृषि यंत्र सब्सिडी (SMAM):** ट्रैक्टर, हैप्पी सीडर और सुपर सीडर पर 40% से 50% सरकारी अनुदान।'
      : '🏛️ **Key Government Farmer Welfare Schemes:**\n\n' +
        '1. **PM-KISAN:** ₹6,000/year direct financial support paid in 3 four-monthly installments of ₹2,000 directly via DBT.\n' +
        '2. **PMFBY (Crop Insurance):** Comprehensive safety net against flood, drought, hail, and unseasonal rain. Farmer premium is only 1.5% for Rabi and 2.0% for Kharif.\n' +
        '3. **Kisan Credit Card (KCC):** Farm credit at low interest. Effective interest rate is only 4% per annum upon timely repayment.\n' +
        '4. **Agricultural Machinery Subsidy (SMAM):** Up to 50% capital subsidy on Happy Seeders, Super Seeders, and farm equipment to end stubble burning.';

    return {
      answer,
      isAllowed: true,
      domainCategory: 'schemes',
      suggestedActions: [
        { label: 'Check Income Certificate', url: '/farmer/dashboard', type: 'link', icon: '📜' },
        { label: 'Kisan Call Centre 1800-180-1551', url: 'tel:18001801551', type: 'call', icon: '📞' },
      ],
      suggestedQuestions: [
        'How is PM-KISAN linked with KrishiSeva?',
        'How to file a grievance if DBT payment is delayed?',
      ],
    };
  }

  // 7. DEFAULT GREETING / ASSISTANCE
  const defaultAnswer = language === 'hi'
    ? '🙏 **नमस्ते किसान साथी!** मैं कृषिसेवा का AI कृषि मित्र हूँ।\n\nमैं आपकी निम्नलिखित विषयों में पूर्ण सहायता कर सकता हूँ:\n1. 🌾 **2026 सरकारी MSP दरें** (गेहूं, सरसों, धान, मक्का, चना आदि)\n2. 📅 **APMC मंडी स्लॉट बुकिंग** एवं लाइव टोकन कतार स्थिति\n3. 💧 **अनाज में नमी (FAQ) मानक** एवं रिजेक्शन से बचाव के उपाय\n4. 🚜 **ट्रैक्टर ब्रेकडाउन आपातकालीन ग्रेस प्रोटोकॉल** (2 घंटे की छूट)\n5. 💳 **72-घंटे PFMS DBT भुगतान ट्रैकिंग** एवं ई-जे-फॉर्म डाउनलोड\n6. 🏛️ **सरकारी योजनाएं** (PM-KISAN, PMFBY, KCC)\n\nकृपया अपना प्रश्न पूछें या नीचे दिए गए त्वरित विकल्पों में से चुनें!'
    : '🙏 **Namaste Farmer Friend!** I am your AI Kisan Mitra assistant on KrishiSeva.\n\nI can assist you with:\n1. 🌾 **Official 2026 MSP Rates** (Wheat, Mustard, Paddy, Maize, Gram, Cotton)\n2. 📅 **Mandi Slot Booking** & Live Token Queue Tracking\n3. 💧 **Grain Moisture (FAQ) Norms** to prevent weighbridge deductions\n4. 🚜 **Highway Tractor Breakdown Protocol** (Instant 2-hour grace period)\n5. 💳 **72-Hour Direct Bank Credit (DBT)** status & J-Form receipts\n6. 🏛️ **Government Farmer Schemes** (PM-KISAN, PMFBY crop insurance)\n\nHow may I help your farm today?';

  return {
    answer: defaultAnswer,
    isAllowed: true,
    domainCategory: 'platform_help',
    suggestedActions: [
      { label: 'Calculate MSP Earnings', url: '/msp-calculator', type: 'link', icon: '⚖️' },
      { label: 'Book Mandi Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
      { label: 'Live Mandi Heatmap', url: '/farmer/mandi-heatmap', type: 'link', icon: '🗺️' },
      { label: 'Kisan Helpline 1800-180-1551', url: 'tel:18001801551', type: 'call', icon: '📞' },
    ],
    suggestedQuestions: [
      'What is the MSP rate for Wheat this season?',
      'How to dry grain to reach 12% moisture?',
      'What should I do if my tractor breaks down on the way?',
    ],
  };
}
