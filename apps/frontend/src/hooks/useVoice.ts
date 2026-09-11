import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { language } = useLanguageStore();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Map language code to BCP 47
    const langMap: Record<string, string> = {
      hi: 'hi-IN',
      en: 'en-IN',
      pa: 'pa-Guru-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
    };

    recognition.lang = langMap[language] || 'hi-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback('Listening... Speak now 🌾');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleIntent(text.toLowerCase());
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback('Could not hear clearly. Try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]);

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  function handleIntent(text: string) {
    if (text.includes('slot') || text.includes('book') || text.includes('बुकिंग') || text.includes('स्लॉट') || text.includes('ਟਿਕਟ')) {
      const msg = 'Navigating to Slot Booking. Choose your mandi centre and visit date.';
      setFeedback(msg);
      speak('खोल रहे हैं स्लॉट बुकिंग');
      navigate('/farmer/book-slot');
    } else if (text.includes('queue') || text.includes('token') || text.includes('कतार') || text.includes('टोकन') || text.includes('ਲਾਈਨ')) {
      const msg = 'Opening Live Queue. Tracking your token position.';
      setFeedback(msg);
      speak('खोल रहे हैं लाइव कतार');
      navigate('/farmer/queue');
    } else if (text.includes('msp') || text.includes('rate') || text.includes('भाव') || text.includes('दाम') || text.includes('ਕੈਲਕੁਲੇਟਰ')) {
      const msg = 'Opening MSP Middleman Calculator.';
      setFeedback(msg);
      speak('खोल रहे हैं MSP कैलकुलेटर');
      navigate('/farmer/msp-calculator');
    } else if (text.includes('payment') || text.includes('money') || text.includes('पैसा') || text.includes('भुगतान') || text.includes('ਖਾਤਾ')) {
      const msg = 'Opening Payments & DBT Status.';
      setFeedback(msg);
      speak('खोल रहे हैं भुगतान विवरण');
      navigate('/farmer/payments');
    } else if (text.includes('mandi') || text.includes('centre') || text.includes('मंडी') || text.includes('केंद्र')) {
      const msg = 'Showing nearby procurement centres.';
      setFeedback(msg);
      speak('खोल रहे हैं खरीद केंद्र');
      navigate('/farmer/centres');
    } else if (text.includes('weather') || text.includes('rain') || text.includes('मौसम') || text.includes('बारिश')) {
      const msg = 'Opening 7-day weather forecast.';
      setFeedback(msg);
      speak('खोल रहे हैं मौसम पूर्वानुमान');
      navigate('/farmer/weather');
    } else {
      const msg = `Heard: "${text}". Try saying "Book slot", "Check queue", or "MSP rates".`;
      setFeedback(msg);
      speak('कमांड समझ नहीं आई। कहें: स्लॉट बुक करें या लाइव टोकन देखें');
    }
  }

  function toggleListening() {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser. Please try Chrome/Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  }

  return { isListening, transcript, feedback, toggleListening };
}
