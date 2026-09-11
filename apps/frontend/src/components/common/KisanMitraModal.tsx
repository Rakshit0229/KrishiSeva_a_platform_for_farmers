import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  User,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Globe2,
} from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';

interface ActionCard {
  label: string;
  url: string;
  type: 'link' | 'call' | 'action';
  icon?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isAllowed?: boolean;
  domainCategory?: string;
  suggestedActions?: ActionCard[];
  suggestedQuestions?: string[];
}

export const KisanMitraModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useLanguageStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      isAllowed: true,
      domainCategory: 'platform_help',
      text:
        language === 'hi'
          ? 'नमस्ते किसान साथी! 🙏 मैं आपका कृषिसेवा AI "कृषि मित्र" हूँ।\n\nमैं 100% कृषि, 2026 सरकारी MSP दरों, मंडी स्लॉट बुकिंग, नमी (FAQ) मानकों, ट्रैक्टर ब्रेकडाउन सहायता और सरकारी योजनाओं (PM-KISAN) के लिए समर्पित हूँ। आप बोलकर या लिखकर पूछ सकते हैं।'
          : language === 'pa'
          ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! 🙏 ਮੈਂ ਤੁਹਾਡਾ ਕ੍ਰਿਸ਼ੀ ਸੇਵਾ AI "ਕਿਸਾਨ ਮਿੱਤਰ" ਹਾਂ।\n\nਮੈਂ ਸਿਰਫ਼ ਖੇਤੀਬਾੜੀ, 2026 ਸਰਕਾਰੀ MSP ਰੇਟਾਂ, ਮੰਡੀ ਸਲਾਟ ਬੁਕਿੰਗ, ਦਾਣਾ ਨਮੀ (FAQ) ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਹਾਂ।'
          : 'Namaste Farmer Friend! 🙏 I am your AI Kisan Mitra assistant.\n\nI am strictly dedicated to Indian agriculture, official 2026 MSP rates, mandi slot booking, grain moisture (FAQ) norms, tractor breakdown protocol, and government farmer welfare schemes.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Check 2026 MSP Rates', url: '/msp-calculator', type: 'link', icon: '🌾' },
        { label: 'Book Mandi Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
        { label: 'Live Mandi Congestion', url: '/farmer/mandi-heatmap', type: 'link', icon: '🗺️' },
      ],
      suggestedQuestions: [
        'What is the MSP for Wheat and Mustard this season?',
        'How do I book a mandi slot and get my QR token?',
        'What is the maximum moisture allowed for wheat?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Speech Recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap: Record<string, string> = {
      hi: 'hi-IN',
      pa: 'pa-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      en: 'en-IN',
    };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSendQuery(transcript);
    };

    recognition.start();
  };

  // Text-to-speech with cancel
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove markdown bold/asterisks for natural speech
      const cleanText = text.replace(/[*_#•]/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langMap: Record<string, string> = {
        hi: 'hi-IN',
        pa: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        en: 'en-IN',
      };
      utterance.lang = langMap[language] || 'en-IN';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Client-side fallback if backend is offline
  const clientFallbackResponse = (q: string): Partial<Message> => {
    const query = q.toLowerCase();

    // Check for off-topic non-agri keywords
    const isOffTopic = /\b(python|javascript|code|coding|movie|bollywood|actor|crypto|bitcoin|election|cricket|game|essay)\b/i.test(query);
    if (isOffTopic) {
      return {
        text: 'I apologize, but I am KrishiSeva’s AI Kisan Mitra. I am strictly restricted to answering questions regarding agriculture, crops, MSP rates, mandi slot bookings, and government farmer schemes. I cannot assist with non-farming topics.',
        isAllowed: false,
        domainCategory: 'off_topic',
        suggestedQuestions: [
          'What is the current MSP for Wheat and Mustard?',
          'How do I book a mandi slot?',
          'What to do if tractor breaks down on the highway?',
        ],
        suggestedActions: [
          { label: 'View MSP Rates', url: '/msp-calculator', type: 'link', icon: '🌾' },
          { label: 'Book Mandi Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
          { label: 'Helpline 1800-180-1551', url: 'tel:18001801551', type: 'call', icon: '📞' },
        ],
      };
    }

    if (query.includes('msp') || query.includes('rate') || query.includes('price') || query.includes('भाव') || query.includes('रेट')) {
      return {
        text: '🌾 **Official 2026 MSP Rates (Per Quintal):**\n• Wheat (गेहूं): ₹2,425\n• Mustard (सरसों): ₹5,950\n• Paddy (धान): ₹2,300\n• Gram (चना): ₹5,650\n• Cotton (कपास): ₹7,121\n• Maize (मक्का): ₹2,090\n\n100% payment is credited via PFMS Direct Benefit Transfer (DBT) within 72 hours.',
        isAllowed: true,
        domainCategory: 'msp',
        suggestedActions: [
          { label: 'Open MSP Calculator', url: '/msp-calculator', type: 'link', icon: '⚖️' },
          { label: 'Book Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
        ],
      };
    }

    if (query.includes('slot') || query.includes('book') || query.includes('स्लॉट')) {
      return {
        text: '📅 **Mandi Slot Booking:** Click "Book Slot" in the menu, pick your local APMC centre, choose your date/time, and get your digital QR ticket with live queue tracking to avoid tractor lines!',
        isAllowed: true,
        domainCategory: 'slot_booking',
        suggestedActions: [
          { label: 'Book Slot Now', url: '/farmer/book-slot', type: 'link', icon: '📅' },
          { label: 'Live Mandi Heatmap', url: '/farmer/mandi-heatmap', type: 'link', icon: '🗺️' },
        ],
      };
    }

    if (query.includes('moisture') || query.includes('faq') || query.includes('नमी')) {
      return {
        text: '💧 **FAQ Moisture Limits:** Wheat maximum permissible is 12.0%, Paddy is 17.0%, Mustard is 8.0%. Sun-dry grain on clean tarpaulins for 2 days to avoid price deductions.',
        isAllowed: true,
        domainCategory: 'moisture_faq',
        suggestedActions: [
          { label: 'Check Crop Scanner', url: '/farmer/dashboard', type: 'link', icon: '📷' },
        ],
      };
    }

    if (query.includes('breakdown') || query.includes('delay') || query.includes('late') || query.includes('देरी')) {
      return {
        text: '🚨 **Tractor Breakdown Grace Protocol:** KrishiSeva grants an automatic 2-hour grace period for highway transit breakdowns. Tap "Report Mandi Transit Delay" on your Dashboard to hold your token position!',
        isAllowed: true,
        domainCategory: 'platform_help',
        suggestedActions: [
          { label: 'Go to Farmer Dashboard', url: '/farmer/dashboard', type: 'link', icon: '🚜' },
          { label: 'Call Mandi Gate 1800-180-1551', url: 'tel:18001801551', type: 'call', icon: '📞' },
        ],
      };
    }

    return {
      text: 'I can assist you with official MSP rates, mandi slot booking, FAQ moisture standards, 72-hour DBT payments, or tractor breakdown grace periods. How may I help your farm today?',
      isAllowed: true,
      domainCategory: 'platform_help',
      suggestedActions: [
        { label: 'Calculate MSP Earnings', url: '/msp-calculator', type: 'link', icon: '⚖️' },
        { label: 'Book Mandi Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
      ],
    };
  };

  const handleSendQuery = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Domain-Restricted Backend API
      const res = await apiClient.post('/chat/message', {
        message: textToSend,
        language,
      });

      const data = res.data;
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.answer,
        isAllowed: data.isAllowed,
        domainCategory: data.domainCategory,
        suggestedActions: data.suggestedActions,
        suggestedQuestions: data.suggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(data.answer);
    } catch {
      // Offline fallback
      const fallback = clientFallbackResponse(textToSend);
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: fallback.text || 'Unable to connect to service. Please check your internet connection.',
        isAllowed: fallback.isAllowed !== false,
        domainCategory: fallback.domainCategory || 'platform_help',
        suggestedActions: fallback.suggestedActions,
        suggestedQuestions: fallback.suggestedQuestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (confirm('Clear chat conversation history?')) {
      stopSpeaking();
      setMessages([
        {
          id: 'init-fresh',
          sender: 'ai',
          isAllowed: true,
          domainCategory: 'platform_help',
          text: 'Conversation cleared. How can I assist you with your farming or mandi slot today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: '2026 MSP Rates', url: '/msp-calculator', type: 'link', icon: '🌾' },
            { label: 'Book Slot', url: '/farmer/book-slot', type: 'link', icon: '📅' },
          ],
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full shadow-2xl border border-farmborder dark:border-gray-800 flex flex-col h-[650px] max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/20 flex items-center justify-center text-gold-light border border-gold/40 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-white">AI Kisan Mitra (कृषि मित्र)</h3>
                <span className="text-[10px] uppercase font-bold bg-gold/25 text-gold-light px-2 py-0.5 rounded-full border border-gold/40">
                  Govt AI
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-pale">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-300" /> Domain-Restricted: 100% Farming Only
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* In-Modal Language Selector */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl border border-white/20 text-xs">
              <Globe2 className="w-3.5 h-3.5 text-gold-light" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="hi" className="text-gray-900">हिंदी</option>
                <option value="pa" className="text-gray-900">ਪੰਜਾਬੀ</option>
                <option value="en" className="text-gray-900">English</option>
                <option value="mr" className="text-gray-900">मराठी</option>
                <option value="te" className="text-gray-900">తెలుగు</option>
                <option value="ta" className="text-gray-900">தமிழ்</option>
              </select>
            </div>

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              title="Clear Chat"
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Scope Banner */}
        <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Active Guardrails: Non-agricultural queries will be automatically declined.
          </span>
          <a
            href="tel:18001801551"
            className="inline-flex items-center gap-1 text-primary dark:text-primary-light font-bold hover:underline"
          >
            <PhoneCall className="w-3 h-3" /> Kisan Call: 1800-180-1551
          </a>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FBFBFA] dark:bg-gray-950">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                  m.sender === 'user'
                    ? 'bg-primary text-white shadow-sm'
                    : m.isAllowed === false
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-primary dark:text-primary-light border border-primary/20 shadow-sm'
                }`}
              >
                {m.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : m.isAllowed === false ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : m.isAllowed === false
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-800 rounded-bl-none'
                    : 'bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100 border border-farmborder dark:border-gray-800 rounded-bl-none'
                }`}
              >
                {/* Out of domain warning banner */}
                {m.isAllowed === false && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 font-bold text-[11px] mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                    Off-Topic Query Declined
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Interactive Action Badges */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2 border-t border-farmborder/50 dark:border-gray-800">
                    {m.suggestedActions.map((act, i) => (
                      act.type === 'call' ? (
                        <a
                          key={i}
                          href={act.url}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{act.label}</span>
                        </a>
                      ) : (
                        <Link
                          key={i}
                          to={act.url}
                          onClick={() => {
                            stopSpeaking();
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white dark:bg-primary/20 dark:text-primary-light font-bold text-xs border border-primary/30 transition-all group"
                        >
                          <span>{act.icon || '🔗'}</span>
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )
                    ))}
                  </div>
                )}

                {/* Suggested Questions Recovery Chips */}
                {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Try asking instead:
                    </span>
                    <div className="flex flex-col gap-1">
                      {m.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendQuery(q)}
                          className="text-left text-[11px] text-primary dark:text-primary-light hover:underline bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/15 transition-colors"
                        >
                          👉 {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls: Audio Play/Stop & Copy */}
                <div className="flex items-center justify-between gap-2 pt-1 opacity-70 text-[10px] border-t border-black/5 dark:border-white/5">
                  <span>{m.timestamp}</span>
                  {m.sender === 'ai' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="hover:opacity-100 flex items-center gap-1 text-text-muted hover:text-text-primary"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {isSpeaking ? (
                        <button
                          onClick={stopSpeaking}
                          className="hover:opacity-100 text-red-500 font-bold flex items-center gap-1 animate-pulse"
                          title="Stop voice"
                        >
                          <VolumeX className="w-3.5 h-3.5" /> Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => speakText(m.text)}
                          className="hover:opacity-100 text-primary dark:text-primary-light flex items-center gap-1"
                          title="Listen aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Read
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 max-w-[80%] mr-auto animate-pulse">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin text-gold" />
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-farmborder text-xs text-text-muted flex items-center gap-2">
                <span>Checking KrishiSeva database & safety guardrails...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Topic Pills */}
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-farmborder/60 dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-text-muted text-[11px] shrink-0 font-medium">Quick Topics:</span>
          <button
            onClick={() => handleSendQuery('What is the MSP rate for Wheat this season?')}
            className="px-2.5 py-1 rounded-full bg-surface-2 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-text-muted shrink-0 text-xs transition-colors border border-farmborder/50"
          >
            🌾 2026 Wheat MSP
          </button>
          <button
            onClick={() => handleSendQuery('What is the maximum moisture level for Paddy FAQ?')}
            className="px-2.5 py-1 rounded-full bg-surface-2 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-text-muted shrink-0 text-xs transition-colors border border-farmborder/50"
          >
            💧 Moisture Limits
          </button>
          <button
            onClick={() => handleSendQuery('How to book an APMC mandi slot?')}
            className="px-2.5 py-1 rounded-full bg-surface-2 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-text-muted shrink-0 text-xs transition-colors border border-farmborder/50"
          >
            📅 Book Mandi Slot
          </button>
          <button
            onClick={() => handleSendQuery('Tractor breakdown on highway, what to do?')}
            className="px-2.5 py-1 rounded-full bg-surface-2 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-text-muted shrink-0 text-xs transition-colors border border-farmborder/50"
          >
            🚨 Tractor Breakdown
          </button>
          <button
            onClick={() => handleSendQuery('How to identify and treat yellow rust in wheat?')}
            className="px-2.5 py-1 rounded-full bg-surface-2 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-text-muted shrink-0 text-xs transition-colors border border-farmborder/50"
          >
            🌱 Crop Pest Doctor
          </button>
          <button
            onClick={() => handleSendQuery('What are the benefits of PM-KISAN and KCC?')}
            className="px-2.5 py-1 rounded-full bg-surface-2 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-text-muted shrink-0 text-xs transition-colors border border-farmborder/50"
          >
            🏛️ PM-KISAN & Schemes
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-farmborder dark:border-gray-800 flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-surface-2 dark:bg-gray-800 hover:bg-primary/20 text-primary dark:text-primary-light'
            }`}
            title={isListening ? 'Listening...' : 'Speak in your language'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder={
              language === 'hi'
                ? 'कृषि, MSP, मंडी स्लॉट या फसल स्वास्थ्य के बारे में पूछें...'
                : language === 'pa'
                ? 'ਖੇਤੀਬਾੜੀ, MSP ਰੇਟ, ਜਾਂ ਮੰਡੀ ਸਲਾਟ ਬਾਰੇ ਪੁੱਛੋ...'
                : 'Ask AI Kisan Mitra about agriculture, MSP, mandi slots...'
            }
            className="flex-1 bg-surface-2 dark:bg-gray-800/80 border border-farmborder/60 dark:border-gray-700 rounded-full px-4 py-2.5 text-xs sm:text-sm text-text-primary dark:text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
          />

          <button
            onClick={() => handleSendQuery()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
