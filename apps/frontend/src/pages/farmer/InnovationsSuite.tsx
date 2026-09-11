import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Scale,
  Mic,
  Landmark,
  Truck,
  Leaf,
  CloudLightning,
  EyeOff,
  Radio,
  Plane,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Play,
  Download,
  Flame,
  Droplets,
  DollarSign,
  HelpCircle,
  FlaskConical,
  Bug,
  Lock,
  TrendingUp,
  Camera,
  Layers,
  ThermometerSnowflake,
  Gavel,
  QrCode,
  HeartPulse,
  Award,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const InnovationsSuite: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('satellite');
  const [loading, setLoading] = useState<boolean>(false);

  // Tool 1: Satellite Data
  const [satelliteData, setSatelliteData] = useState<any>(null);

  // Tool 2: Weighbridge
  const [wbGross, setWbGross] = useState<number>(4850);
  const [wbReceipt, setWbReceipt] = useState<any>(null);

  // Tool 3: Dialect IVR
  const [selectedDialect, setSelectedDialect] = useState<string>('malwai_punjabi');
  const [ivrResponse, setIvrResponse] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Tool 4: e-NWR Pawn
  const [pawnBags, setPawnBags] = useState<number>(100);
  const [pawnReceipt, setPawnReceipt] = useState<any>(null);

  // Tool 5: Freight Pooling
  const [pools, setPools] = useState<any[]>([]);
  const [joinedPoolMsg, setJoinedPoolMsg] = useState<string | null>(null);

  // Tool 6: Carbon Credits
  const [carbonWallet, setCarbonWallet] = useState<any>(null);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  // Tool 7: Storm Shield
  const [stormData, setStormData] = useState<any>(null);
  const [tarpActive, setTarpActive] = useState<boolean>(false);

  // Tool 8: Jan-Samvaad Whistleblower
  const [wbCategory, setWbCategory] = useState<string>('Illegal Katoti (Extra grain deduction)');
  const [wbDesc, setWbDesc] = useState<string>('');
  const [whistleReport, setWhistleReport] = useState<any>(null);

  // Tool 9: Silo Monitor
  const [siloData, setSiloData] = useState<any>(null);

  // Tool 10: Drone DaaS
  const [pilots, setPilots] = useState<any[]>([]);
  const [droneAcres, setDroneAcres] = useState<number>(5);
  const [droneBooking, setDroneBooking] = useState<any>(null);

  // Tool 11: Fertilizer Analyzer
  const [fertilizerSample, setFertilizerSample] = useState<string>('IFFCO DAP (Di-Ammonium Phosphate)');
  const [fertilizerResult, setFertilizerResult] = useState<any>(null);

  // Tool 12: Pest Acoustic Scan
  const [pestCrop, setPestCrop] = useState<string>('Cotton / Wheat');
  const [pestAudioResult, setPestAudioResult] = useState<any>(null);
  const [isScanningAudio, setIsScanningAudio] = useState<boolean>(false);

  // Tool 13: Blockchain Ledger
  const [blockchainLedger, setBlockchainLedger] = useState<any>(null);

  // Tool 14: Parametric Rain Claim
  const [rainClaimMandi, setRainClaimMandi] = useState<string>('Khanna Grain Market');
  const [rainClaimResult, setRainClaimResult] = useState<any>(null);

  // Tool 15: Mandi Arbitrage
  const [arbitrageData, setArbitrageData] = useState<any>(null);

  // Tool 16: Gate ANPR
  const [anprData, setAnprData] = useState<any>(null);

  // Tool 17: Parali / Stubble Marketplace
  const [stubbleListings, setStubbleListings] = useState<any[]>([]);
  const [stubbleAcres, setStubbleAcres] = useState<number>(10);
  const [stubbleSuccess, setStubbleSuccess] = useState<any>(null);

  // Tool 18: Solar Cold Hub
  const [coldHubs, setColdHubs] = useState<any[]>([]);
  const [coldCrates, setColdCrates] = useState<number>(40);
  const [coldBooking, setColdBooking] = useState<any>(null);

  // Tool 19: Ombudsman AI Lokpal
  const [disputeType, setDisputeType] = useState<string>('Illegal Katoti (Extra grain deduction)');
  const [disputeNotes, setDisputeNotes] = useState<string>('Inspector deducted 2kg per bag citing bogus dust.');
  const [disputeResult, setDisputeResult] = useState<any>(null);

  // Tool 20: Traceability Export QR & Ayushman Shield
  const [traceabilityData, setTraceabilityData] = useState<any>(null);
  const [ayushmanData, setAyushmanData] = useState<any>(null);
  const [greenPassportData, setGreenPassportData] = useState<any>(null);

  // Initial loads
  useEffect(() => {
    loadSatelliteData();
    loadPools();
    loadCarbonWallet();
    loadStormData();
    loadSiloData();
    loadPilots();
    loadBlockchain();
    loadArbitrage();
    loadAnpr();
    loadStubble();
    loadColdHubs();
    loadAyushman();
    loadGreenPassport();
    loadTraceability();
  }, []);

  async function loadBlockchain() {
    try {
      const res = await apiClient.get('/innovations/blockchain/grain-ledger');
      setBlockchainLedger(res.data);
    } catch {}
  }

  async function loadArbitrage() {
    try {
      const res = await apiClient.get('/innovations/mandi-arbitrage/opportunities');
      setArbitrageData(res.data);
    } catch {}
  }

  async function loadAnpr() {
    try {
      const res = await apiClient.get('/innovations/gate-anpr/telemetry');
      setAnprData(res.data);
    } catch {}
  }

  async function loadStubble() {
    try {
      const res = await apiClient.get('/innovations/stubble-marketplace/listings');
      setStubbleListings(res.data || []);
    } catch {}
  }

  async function loadColdHubs() {
    try {
      const res = await apiClient.get('/innovations/cold-storage/hubs');
      setColdHubs(res.data || []);
    } catch {}
  }

  async function loadAyushman() {
    try {
      const res = await apiClient.get('/innovations/kisan-ayushman/policy');
      setAyushmanData(res.data);
    } catch {}
  }

  async function loadGreenPassport() {
    try {
      const res = await apiClient.get('/innovations/green-passport/score');
      setGreenPassportData(res.data);
    } catch {}
  }

  async function loadTraceability() {
    try {
      const res = await apiClient.get('/innovations/traceability-qr/BATCH-WHT-2026-991');
      setTraceabilityData(res.data);
    } catch {}
  }

  // Test Fertilizer Scanner
  async function testFertilizerScan(isAdulterated: boolean) {
    setLoading(true);
    try {
      const payload = isAdulterated
        ? { sample_name: fertilizerSample + ' (Suspected)', red_absorbance: 0.35, green_absorbance: 0.65, blue_absorbance: 0.55, uv_luminescence: 0.25, ph_level: 6.2, electrical_conductivity_mS: 1.8 }
        : { sample_name: fertilizerSample, red_absorbance: 0.72, green_absorbance: 0.45, blue_absorbance: 0.20, uv_luminescence: 0.88, ph_level: 7.5, electrical_conductivity_mS: 4.2 };
      const res = await apiClient.post('/innovations/fertilizer-analyzer/scan', payload);
      setFertilizerResult(res.data);
    } catch {}
    setLoading(false);
  }

  // Test Pest Acoustic Scan
  async function testAcousticScan(withLarvae: boolean) {
    setIsScanningAudio(true);
    setTimeout(async () => {
      try {
        const payload = withLarvae
          ? { crop: pestCrop, freq_peak_khz: 2.2, pulse_interval_ms: 85, decibel_ampl: 48, zero_crossing_rate: 0.48, spectral_centroid_khz: 2.8 }
          : { crop: pestCrop, freq_peak_khz: 0.8, pulse_interval_ms: 450, decibel_ampl: 15, zero_crossing_rate: 0.05, spectral_centroid_khz: 1.2 };
        const res = await apiClient.post('/innovations/pest-acoustics/detect', payload);
        setPestAudioResult(res.data);
      } catch {}
      setIsScanningAudio(false);
    }, 1500);
  }

  // Test Rain Claim
  async function testRainClaim(triggerRain: boolean) {
    setLoading(true);
    try {
      const payload = triggerRain
        ? { mandi_name: rainClaimMandi, radar_dbz: 54, cloud_temp_c: -22, barometric_drop_hpa: 12.0, wind_gust_kmh: 65, stored_grain_tonnes: 14 }
        : { mandi_name: rainClaimMandi, radar_dbz: 18, cloud_temp_c: 12, barometric_drop_hpa: 1.5, wind_gust_kmh: 15, stored_grain_tonnes: 14 };
      const res = await apiClient.post('/innovations/parametric-insurance/claim', payload);
      setRainClaimResult(res.data);
    } catch {}
    setLoading(false);
  }

  // Post Stubble Listing
  async function submitStubbleListing() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/stubble-marketplace/create', { acres: stubbleAcres });
      setStubbleSuccess(res.data);
      loadStubble();
    } catch {}
    setLoading(false);
  }

  // Book Cold Storage
  async function bookColdRoom() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/cold-storage/book', { crates: coldCrates, days: 7 });
      setColdBooking(res.data);
    } catch {}
    setLoading(false);
  }

  // Submit AI Lokpal Dispute
  async function submitLokpalDispute() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/ombudsman-ai/dispute', { dispute_type: disputeType, dispute_notes: disputeNotes });
      setDisputeResult(res.data);
    } catch {}
    setLoading(false);
  }

  async function loadSatelliteData() {
    try {
      const res = await apiClient.get('/innovations/satellite/verify/me');
      setSatelliteData(res.data);
    } catch {
      // fallback
    }
  }

  async function loadPools() {
    try {
      const res = await apiClient.get('/innovations/freight/pools');
      setPools(res.data || []);
    } catch {}
  }

  async function loadCarbonWallet() {
    try {
      const res = await apiClient.get('/innovations/carbon/wallet');
      setCarbonWallet(res.data);
    } catch {}
  }

  async function loadStormData() {
    try {
      const res = await apiClient.get('/innovations/storm-shield/radar');
      setStormData(res.data);
    } catch {}
  }

  async function loadSiloData() {
    try {
      const res = await apiClient.get('/innovations/silo/telemetry/me');
      setSiloData(res.data);
    } catch {}
  }

  async function loadPilots() {
    try {
      const res = await apiClient.get('/innovations/drone/pilots');
      setPilots(res.data || []);
    } catch {}
  }

  // Tool 2: Test Weighbridge
  async function testWeighbridge() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/weighbridge/telemetry', {
        raw_stream: `ST,GS,+${String(wbGross).padStart(6, '0')}kg`,
        tractor_number: 'PB-02-CB-9182',
      });
      setWbReceipt(res.data);
    } catch {}
    setLoading(false);
  }

  // Tool 3: Simulate IVR
  async function simulateIvrCall() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/voice-ivr/simulate-call', {
        dialect: selectedDialect,
      });
      setIvrResponse(res.data);
    } catch {}
    setLoading(false);
  }

  // Tool 4: Apply e-NWR
  async function applyPawnAdvance() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/warehouse/apply-advance', {
        bags_count: pawnBags,
        crop: 'Wheat',
      });
      setPawnReceipt(res.data);
    } catch {}
    setLoading(false);
  }

  // Tool 5: Join Pool
  async function handleJoinPool(poolId: string) {
    try {
      const res = await apiClient.post('/innovations/freight/join-pool', {
        pool_id: poolId,
        quintals: 25,
      });
      setJoinedPoolMsg(`Confirmed! Tractor ETA: ${res.data.eta_pickup}. Saved ₹${res.data.estimated_diesel_saving_inr} in fuel!`);
    } catch {}
  }

  // Tool 6: Submit Stubble Claim
  async function handleCarbonClaim() {
    setLoading(true);
    try {
      await apiClient.post('/innovations/carbon/submit-claim', {
        farm_acres: 5,
        equipment_used: 'Super Seeder Direct Mulching',
      });
      setClaimSuccess(true);
      loadCarbonWallet();
    } catch {}
    setLoading(false);
  }

  // Tool 7: Trigger Tarp
  async function triggerTarp() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/storm-shield/emergency-tarp', {});
      setTarpActive(true);
      alert(`🚨 ${res.data.action}: ${res.data.automated_canopies_extended_sqm} sq.m tarpaulins deployed! Broadcasted alert to ${res.data.sms_alerts_broadcasted_to_farmers_en_route} en-route farmers.`);
    } catch {}
    setLoading(false);
  }

  // Tool 8: Whistleblower submit
  async function submitWhistleblower() {
    if (!wbDesc) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/whistleblower/submit', {
        category: wbCategory,
        description: wbDesc,
      });
      setWhistleReport(res.data);
      setWbDesc('');
    } catch {}
    setLoading(false);
  }

  // Tool 10: Book Drone
  async function bookDrone() {
    setLoading(true);
    try {
      const res = await apiClient.post('/innovations/drone/book-spray', {
        acres: droneAcres,
        pilot_id: 'pilot-01',
      });
      setDroneBooking(res.data);
    } catch {}
    setLoading(false);
  }

  const tabs = [
    { id: 'satellite', label: '1. Satellite SAR Cap', icon: Satellite, badge: 'Space-Agri' },
    { id: 'weighbridge', label: '2. Zero-Trust Scale', icon: Scale, badge: 'IoT Hardware' },
    { id: 'ivr', label: '3. Dialect Voice-IVR', icon: Mic, badge: 'Voice AI' },
    { id: 'warehouse', label: '4. e-NWR Warehouse Loan', icon: Landmark, badge: 'Fintech' },
    { id: 'freight', label: '5. Tractor-Uber Pool', icon: Truck, badge: 'Logistics' },
    { id: 'carbon', label: '6. Stubble Carbon Coins', icon: Leaf, badge: 'Green Credits' },
    { id: 'storm', label: '7. Doppler Storm Shield', icon: CloudLightning, badge: 'Weather AI' },
    { id: 'whistleblower', label: '8. Jan-Samvaad Sting', icon: EyeOff, badge: 'Anti-Bribery' },
    { id: 'silo', label: '9. Micro-Silo Sensor', icon: Radio, badge: 'Spoilage IoT' },
    { id: 'drone', label: '10. Drone-as-a-Service', icon: Plane, badge: 'Precision Ag' },
    { id: 'fertilizer', label: '11. Fertilizer Spectrometer', icon: FlaskConical, badge: 'Lab AI' },
    { id: 'pest', label: '12. Acoustic Pest Scan', icon: Bug, badge: 'Audio AI' },
    { id: 'blockchain', label: '13. Blockchain Ledger', icon: Lock, badge: 'Zero-Trust' },
    { id: 'rainclaim', label: '14. Parametric Rain Claim', icon: Droplets, badge: 'Smart Insurance' },
    { id: 'arbitrage', label: '15. Mandi Arbitrage', icon: TrendingUp, badge: 'MSP Profit' },
    { id: 'anpr', label: '16. ANPR Fast-Track Gate', icon: Camera, badge: '15s Entry' },
    { id: 'stubble', label: '17. Parali Biomass Market', icon: Flame, badge: 'Circular Ag' },
    { id: 'coldroom', label: '18. Solar Cold Storage', icon: ThermometerSnowflake, badge: 'Zero Waste' },
    { id: 'ombudsman', label: '19. AI Lokpal Ombudsman', icon: Gavel, badge: 'Instant Justice' },
    { id: 'passport', label: '20. Green Passport & Health', icon: Award, badge: 'Farmer Welfare' },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6 space-y-6 max-w-6xl">
      {/* 1. HERO HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-dark via-earth-brown to-primary text-white p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-light flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Next-Gen AgriTech Innovations Suite
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white border border-white/20">
              20 Breakthrough Technologies Active
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-black text-white">
            Transforming Indian Agriculture Through Deep-Tech 🌾
          </h1>
          <p className="text-xs sm:text-sm text-primary-pale max-w-3xl leading-relaxed">
            Explore all 20 national agricultural breakthrough innovations—from Sentinel-2 satellite yield caps and acoustic pest diagnostics to blockchain ledgers, e-NWR spot micro-loans, and instant AI Lokpal legal ombudsman.
          </p>
        </div>
      </div>

      {/* 2. TAB SELECTOR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-text-muted hover:text-text-primary border-farmborder dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-extrabold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-surface-2 dark:bg-gray-700 text-text-muted'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE TOOL VIEWPORT */}
      <div className="card-farm p-6 sm:p-8 space-y-6">

        {/* ── TOOL 1: SATELLITE SAR YIELD PRE-VERIFICATION ── */}
        {activeTab === 'satellite' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 1 · Anti-Ghost Billing
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Satellite className="w-6 h-6 text-primary" /> Sentinel-2 & SAR Satellite Yield Cap
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 text-xs font-bold border border-green-300">
                <ShieldCheck className="w-4 h-4" /> Cadastral GIS Verified
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Combines European Space Agency (ESA) Sentinel-2 optical multispectral imagery and Sentinel-1 Synthetic Aperture Radar (SAR) backscatter with state revenue Khasra cadastral records to compute vegetative biomass density and seal a scientific yield cap. Prevents unauthorized trader grain dumping under farmer quotas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800/80 border border-farmborder">
                <span className="text-[10px] text-text-muted uppercase font-bold">Sentinel NDVI Index</span>
                <span className="font-display text-2xl font-black text-green-600 block mt-1">
                  {satelliteData?.spectral_metrics?.ndvi || '0.74'}
                </span>
                <span className="text-[11px] text-text-muted">Dense Vegetative Canopy</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800/80 border border-farmborder">
                <span className="text-[10px] text-text-muted uppercase font-bold">Chlorophyll (NDRE)</span>
                <span className="font-display text-2xl font-black text-primary dark:text-primary-light block mt-1">
                  {satelliteData?.spectral_metrics?.ndre || '0.58'}
                </span>
                <span className="text-[11px] text-text-muted">High Nitrogen Uptake</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800/80 border border-farmborder">
                <span className="text-[10px] text-text-muted uppercase font-bold">Biometric Yield Cap</span>
                <span className="font-display text-2xl font-black text-gold block mt-1">
                  {satelliteData?.biometric_yield_analysis?.max_biometric_yield_cap_quintals || '302'} Qtl
                </span>
                <span className="text-[11px] text-text-muted">Max Legal Procurement</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800/80 border border-farmborder">
                <span className="text-[10px] text-text-muted uppercase font-bold">Anti-Smuggling Risk</span>
                <span className="font-display text-2xl font-black text-emerald-600 block mt-1">
                  0.4% (LOW)
                </span>
                <span className="text-[11px] text-text-muted">No Ghost Billing</span>
              </div>
            </div>

            {/* Polygon Map Simulation */}
            <div className="rounded-2xl bg-gray-900 text-white p-6 relative overflow-hidden border border-gray-700">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                    📡 Khasra Geo-Polygon #{satelliteData?.khasra_number || 'KH-2024-8849/B'}
                  </span>
                  <span className="text-[11px] text-gray-400">Resolution: 10m Ground Pixel</span>
                </div>
                <div className="h-48 rounded-xl bg-gradient-to-br from-green-950/60 via-emerald-900/30 to-gray-900 border border-green-800/50 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center animate-pulse mb-2">
                    <Satellite className="w-8 h-8 text-green-300" />
                  </div>
                  <p className="text-xs font-bold text-green-200">
                    Cadastral Polygon: 12.5 Acres Verified · Tarn Taran (Punjab)
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-md">
                    Spectral Reflection Seal: {satelliteData?.biometric_yield_analysis?.verification_seal_hash || 'SHA256-8A39BF1109E2'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TOOL 2: ZERO-TRUST WEIGHBRIDGE TELEMETRY ── */}
        {activeTab === 'weighbridge' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 2 · Anti-Kanta Tampering
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Scale className="w-6 h-6 text-primary" /> Cryptographic IoT Weighbridge Zero-Trust Shield
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 text-xs font-bold border border-amber-300">
                <ShieldCheck className="w-4 h-4" /> SHA-256 HMAC Telemetry
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Bypasses corrupt weighbridge clerks. Live loadcell voltages are converted to RS-232 serial packets, cryptographically signed with an on-chip hardware security key, paired with an ANPR tractor plate capture, and streamed straight to the ledger.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Simulator Input */}
              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-4">
                <h3 className="font-bold text-sm">IoT Weighbridge Terminal Simulator</h3>
                <div>
                  <label className="text-xs text-text-muted font-bold block mb-1">
                    Tractor + Grain Gross Weight: <strong>{wbGross} kg</strong>
                  </label>
                  <input
                    type="range"
                    min="3000"
                    max="8000"
                    step="50"
                    value={wbGross}
                    onChange={(e) => setWbGross(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[11px] text-text-muted mt-1">
                    <span>3,000 kg</span>
                    <span>Tare ~1,820 kg</span>
                    <span>8,000 kg</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-900 text-green-400 font-mono text-xs space-y-1">
                  <div>RS-232 Stream: ST,GS,+{String(wbGross).padStart(6, '0')}kg</div>
                  <div>ANPR Camera: [PB-02-CB-9182] CONFIDENCE 99.2%</div>
                  <div>Loadcell Baud: 9600 8N1 (Calibration Seal Active)</div>
                </div>

                <button
                  onClick={testWeighbridge}
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Transmit Signed IoT Weight Block
                </button>
              </div>

              {/* Verified Output */}
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    Tamper-Evident Block Receipt
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                    ZERO HUMAN INPUT
                  </span>
                </div>

                {wbReceipt ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-emerald-200/60">
                      <span className="text-text-muted">Gross Weight:</span>
                      <strong className="font-bold">{wbReceipt.weights.gross_weight_kg} kg</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-200/60">
                      <span className="text-text-muted">Tare (Tractor & Trolley):</span>
                      <strong className="font-bold">{wbReceipt.weights.tare_weight_kg} kg</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-200/60">
                      <span className="text-text-muted">Net Verified Grain:</span>
                      <strong className="font-bold text-base text-primary">
                        {wbReceipt.weights.net_produce_weight_kg} kg ({wbReceipt.weights.net_quintals} Qtl)
                      </strong>
                    </div>
                    <div className="pt-2 text-[10px] text-text-muted font-mono break-all">
                      <div>HMAC-SHA256 Signature:</div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {wbReceipt.zero_trust_security.hmac_sha256_signature}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-text-muted">
                    Click "Transmit Signed IoT Weight Block" to execute zero-trust telemetry.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TOOL 3: DIALECT VOICE-IVR ── */}
        {activeTab === 'ivr' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 3 · Digital Rural Inclusion
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Mic className="w-6 h-6 text-primary" /> "Kisan Doot" Dialect Voice-IVR & Audio Mesh
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 text-xs font-bold border border-blue-300">
                100% Feature-Phone Compatible
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Enables smallholder farmers who cannot read or write standard text to book mandi slots and check token positions over a basic phone call or WhatsApp audio voice note in their native dialect.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-bold block">Select Regional Farmer Dialect</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'malwai_punjabi', label: 'ਮਾਲਵਾਈ ਪੰਜਾਬੀ (Malwai Punjabi)' },
                    { id: 'haryanvi', label: 'हरियाणवी (Haryanvi)' },
                    { id: 'bhojpuri', label: 'भोजपुरी (Bhojpuri)' },
                    { id: 'marathi', label: 'मराठी (Latur Marathi)' },
                    { id: 'hindi', label: 'हिंदी (Karnal Hindi)' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDialect(d.id)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        selectedDialect === d.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-farmborder hover:bg-surface-2 dark:hover:bg-gray-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={simulateIvrCall}
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Simulate Dialect Call & Intent Extraction
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-3">
                <span className="text-xs font-bold text-text-muted uppercase">ASR & Booking Output</span>
                {ivrResponse ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-farmborder">
                      <span className="text-[10px] text-text-muted font-bold block">Spoken Dialect Audio:</span>
                      <p className="font-bold text-sm text-text-primary dark:text-white mt-1">
                        "{ivrResponse.dialect_transcription}"
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary dark:text-primary-light">
                      <span className="text-[10px] uppercase font-bold block">Auto-Booked Token:</span>
                      <span className="font-display text-xl font-black block mt-0.5">
                        Token #{ivrResponse.token_number}
                      </span>
                      <p className="text-[11px] mt-1">{ivrResponse.sms_text}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted pt-2">
                      <span>Dialect: {ivrResponse.detected_dialect}</span>
                      <span className="text-green-600 font-bold">✓ SMS Dispatched to Phone</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-text-muted">
                    Pick a dialect and click "Simulate Dialect Call" to test phonetic parsing.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TOOL 4: e-NWR WAREHOUSE PAWN & MICRO-PLEDGE ── */}
        {activeTab === 'warehouse' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 4 · Distress-Sale Shield
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-primary" /> Digital e-NWR Warehouse Pawn & 70% Pledge Advance
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 text-xs font-bold border border-emerald-300">
                NABARD / KCC 4% Subvention
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              If the mandi is congested or harvest moisture is high, store your grain at a nearby WDRA-accredited godown, generate a digital e-NWR, and receive an instant 70% pledge loan directly into your bank account within 2 hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-4">
                <h3 className="font-bold text-sm">Pledge Calculator</h3>
                <div>
                  <label className="text-xs text-text-muted font-bold block mb-1">
                    Grain Bags for Pledge: <strong>{pawnBags} Bags ({(pawnBags * 0.5).toFixed(1)} Qtl)</strong>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="400"
                    step="10"
                    value={pawnBags}
                    onChange={(e) => setPawnBags(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-farmborder space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Crop Value (@ ₹2,275 MSP):</span>
                    <strong>₹{((pawnBags * 0.5) * 2275).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Eligible Instant Advance (70% LTV):</span>
                    <span>₹{Math.round((pawnBags * 0.5) * 2275 * 0.7).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-text-muted text-[11px]">
                    <span>Interest Rate:</span>
                    <span>4.0% p.a. (Govt Subsidized)</span>
                  </div>
                </div>

                <button
                  onClick={applyPawnAdvance}
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  Generate e-NWR & Sanction DBT Advance
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-3">
                <span className="text-xs font-bold text-text-muted uppercase">Digital e-NWR Statement</span>
                {pawnReceipt ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-farmborder">
                      <span className="text-[10px] text-text-muted font-bold">e-NWR Certificate ID:</span>
                      <strong className="font-mono text-sm text-primary block">{pawnReceipt.enwr_id}</strong>
                      <span className="text-[11px] text-text-muted">WDRA Accredited · Fumigation Complete</span>
                    </div>

                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-300 text-green-900 dark:text-green-200">
                      <span className="text-[10px] uppercase font-bold block">DBT Credit Disbursed:</span>
                      <span className="font-display text-2xl font-black block">
                        ₹{pawnReceipt.pledge_credit_advance.approved_advance_amount.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[11px] mt-1">
                        UTR: {pawnReceipt.pledge_credit_advance.utr_number} · Disbursed via PFMS to Aadhaar Bank A/C
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-text-muted">
                    Adjust bags and click "Generate e-NWR" to issue pledge receipt.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TOOL 5: TRACTOR-UBER FREIGHT POOLING ── */}
        {activeTab === 'freight' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 5 · Shared Rural Mobility
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Truck className="w-6 h-6 text-primary" /> Hyperlocal "Kisan Gaddi" Tractor Freight Pooling
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 text-xs font-bold border border-amber-300">
                Saves 35% - 50% Diesel Cost
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Small farmers with 15–25 quintals no longer need to pay ₹3,000 to hire an entire empty trolley. Our route grouping algorithm matches neighbors heading to the same mandi, combines loads into a full 90-quintal convoy, and splits transport costs proportionally.
            </p>

            {joinedPoolMsg && (
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/60 text-green-900 dark:text-green-200 text-xs font-bold border border-green-300">
                ✓ {joinedPoolMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pools.map((pool) => (
                <div key={pool.pool_id} className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary dark:text-primary-light">{pool.village}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/40 dark:bg-gray-700">
                      {pool.scheduled_date}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-text-primary dark:text-white">
                    🚜 {pool.tractor_owner}
                  </h4>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Trolley Capacity: {pool.total_trolley_capacity_qtl} Qtl</span>
                      <strong className="text-green-600">{pool.available_space_qtl} Qtl Available</strong>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pool.fullness_pct}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-farmborder text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Pooled Cost per Quintal:</span>
                      <strong className="text-primary font-bold">₹{pool.pooled_cost_per_quintal}/qtl</strong>
                    </div>
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Est. Farmer Diesel Saving:</span>
                      <span>₹{pool.avg_farmer_saving_inr} Saved</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinPool(pool.pool_id)}
                    className="btn-primary w-full py-2 text-xs font-bold"
                  >
                    Join Shared Convoy (25 Qtl Slot)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TOOL 6: STUBBLE CARBON CREDITS ── */}
        {activeTab === 'carbon' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 6 · Climate & Farmer Profit
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-green-600" /> Parali (Stubble) Carbon Credit Market & Bio-Pellets
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-900 dark:bg-green-950/60 dark:text-green-200 text-xs font-bold border border-green-300">
                1 Coin = ₹100 Direct DBT
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Turns paddy straw from an environmental penalty into an income stream. Farmers who utilize Super Seeders or balers to avoid crop burning get geotagged NASA FIRMS thermal verification and earn Krishi Green Coins redeemable for cash or fertilizer subsidies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder text-center">
                <span className="text-xs text-text-muted font-bold block">Verified Clean Acres</span>
                <span className="font-display text-3xl font-black text-green-600 block mt-1">
                  {carbonWallet?.verified_clean_acres || 12.5} Acres
                </span>
                <span className="text-[11px] text-text-muted">Zero Thermal Anomaly</span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder text-center">
                <span className="text-xs text-text-muted font-bold block">CO₂ Emissions Avoided</span>
                <span className="font-display text-3xl font-black text-primary dark:text-primary-light block mt-1">
                  {carbonWallet?.carbon_credits_earned || 22.5} MT
                </span>
                <span className="text-[11px] text-text-muted">Certified Carbon Standard</span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder text-center">
                <span className="text-xs text-text-muted font-bold block">Green Coin Wallet Value</span>
                <span className="font-display text-3xl font-black text-gold block mt-1">
                  ₹{(carbonWallet?.total_rupee_reward_value || 15000).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-green-600 font-bold">150 Krishi Green Coins</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-text-primary dark:text-white">
                  Claim Carbon Reward for Clean Harvest
                </h4>
                <p className="text-xs text-text-muted mt-1">
                  Submit geotagged proof of Super Seeder operation to receive ₹1,200/acre directly to your KCC account.
                </p>
              </div>

              <button
                onClick={handleCarbonClaim}
                disabled={loading}
                className="btn-primary py-2.5 px-6 text-xs font-bold shrink-0"
              >
                Submit Geotagged Claim
              </button>
            </div>
            {claimSuccess && (
              <div className="p-3 rounded-xl bg-green-100 text-green-900 dark:bg-green-950/60 dark:text-green-200 text-xs font-bold border border-green-300">
                ✓ Claim approved! 9.0 MT Carbon Credits credited to your wallet.
              </div>
            )}
          </div>
        )}

        {/* ── TOOL 7: DOPPLER MANDI STORM SHIELD ── */}
        {activeTab === 'storm' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 7 · Climate Resilience
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <CloudLightning className="w-6 h-6 text-amber-500" /> Doppler Radar "Mandi Storm Shield" & Convoy Rerouter
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200 text-xs font-bold border border-red-300 animate-pulse">
                Storm Squall Line Active (24 km)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Detects approaching thunderstorms, high winds, and hail up to 35 km away. Automatically deploys mechanized yard tarpaulins, reroutes en-route tractor convoys to covered FCI silos, and grants a 48-hour slot extension to prevent grain damage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar Simulation */}
              <div className="rounded-2xl bg-gray-900 text-white p-6 border border-gray-700 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400">IMD DOPPLER RADAR · AMRITSAR</span>
                  <span className="text-red-400 font-bold">ETA: 38 MINS</span>
                </div>

                <div className="h-44 rounded-xl bg-gradient-to-tr from-gray-950 via-blue-950/80 to-red-950/50 border border-blue-800/40 relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-red-500/60 animate-ping absolute" />
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500/80 flex items-center justify-center">
                    <CloudLightning className="w-8 h-8 text-amber-300 animate-bounce" />
                  </div>
                  <span className="absolute bottom-2 left-3 text-[10px] font-mono text-gray-300">
                    Velocity: 38 km/h | Rain Risk: 88%
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-300 pt-1">
                  <span>Open Grain Bags at Mandi: <strong>18,400 Bags</strong></span>
                  <span>Grace Period: <strong>+48 Hours Auto-Granted</strong></span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-4">
                <h3 className="font-bold text-sm">Emergency Mandi Defense Controls</h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-farmborder">
                    <span className="text-[10px] text-text-muted font-bold block">Automated Reroute Point:</span>
                    <strong className="text-primary block mt-0.5">FCI Covered Silo Kot Khalsa (65,000 MT)</strong>
                    <span className="text-[11px] text-text-muted">En-route tractors diverted away from waterlogged open yards.</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-farmborder">
                    <span className="text-[10px] text-text-muted font-bold block">SMS Broadcast Status:</span>
                    <strong className="text-green-600 block mt-0.5">142 Farmers in Transit Alerted</strong>
                  </div>
                </div>

                <button
                  onClick={triggerTarp}
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white"
                >
                  🚨 Trigger Automated Tarpaulins & Siren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOOL 8: JAN-SAMVAAD WHISTLEBLOWER ── */}
        {activeTab === 'whistleblower' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 8 · Anti-Corruption Shield
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <EyeOff className="w-6 h-6 text-primary" /> "Jan-Samvaad" Zero-Trace Anti-Bribery Sting Vault
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 text-xs font-bold border border-purple-300">
                100% Anonymous · EXIF Purged
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Protects farmers against corrupt middlemen, illegal <em>katoti</em> (extra 2–4 kg cut per bag), or cash bribes to pass moisture meters. Reports automatically strip GPS metadata, disguise voice pitch, and route directly to the State Vigilance Bureau and District Magistrate.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-4">
                <h3 className="font-bold text-sm">Anonymous Incident Report</h3>

                <div>
                  <label className="text-xs font-bold block mb-1">Violation Category</label>
                  <select
                    value={wbCategory}
                    onChange={(e) => setWbCategory(e.target.value)}
                    className="input w-full text-xs font-semibold"
                  >
                    <option>Illegal Katoti (Extra grain deduction)</option>
                    <option>Cash Bribe demanded at Quality Counter</option>
                    <option>Weighbridge loadcell scale tampering</option>
                    <option>Delayed unloading / Gate harassment</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Incident Details</label>
                  <textarea
                    rows={3}
                    value={wbDesc}
                    onChange={(e) => setWbDesc(e.target.value)}
                    placeholder="Describe gate number, vehicle, or personnel involved..."
                    className="input w-full text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-[11px] text-purple-900 dark:text-purple-200 space-y-1">
                  <div>✓ Submitter IP and device ID are completely purged.</div>
                  <div>✓ 3 reports on the same counter trigger an automated biometric audit freeze.</div>
                </div>

                <button
                  onClick={submitWhistleblower}
                  disabled={loading || !wbDesc}
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  Submit Encrypted Report to Vigilance
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-3">
                <span className="text-xs font-bold text-text-muted uppercase">Investigation Passkey Vault</span>
                {whistleReport ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300">
                      <span className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-300 block">
                        Case Tracking Code:
                      </span>
                      <strong className="font-mono text-lg text-purple-950 dark:text-white block mt-0.5">
                        {whistleReport.case_id}
                      </strong>
                      <span className="text-[11px] text-purple-800 dark:text-purple-300 block mt-1">
                        Private Access Key: <strong>{whistleReport.private_access_passkey}</strong>
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-farmborder space-y-1 text-[11px]">
                      <div className="font-bold text-text-primary dark:text-white">Escalated Directly To:</div>
                      <div className="text-text-muted">· State Vigilance Bureau Anti-Corruption Cell</div>
                      <div className="text-text-muted">· Office of the District Magistrate (DM)</div>
                      <div className="text-text-muted">· Food & Civil Supplies Audit Board</div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-text-muted">
                    Submit an incident to receive your zero-trace encrypted tracking code.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TOOL 9: IOT MICRO-SILO MONITOR ── */}
        {activeTab === 'silo' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 9 · Post-Harvest Spoilage AI
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Radio className="w-6 h-6 text-primary" /> Solar IoT Micro-Silo Spoilage Early Warning Node
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 text-xs font-bold border border-emerald-300">
                LoRa Wireless Telemetry Active
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Small wireless probes inserted into domestic grain khattis or storage bins measure core temperature, relative humidity, and CO₂ build-up (emitted by multiplying weevil larvae or mould spores). AI warns the farmer 7 days before physical spoiling or foul odour occurs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder text-center">
                <span className="text-xs text-text-muted font-bold block">Internal Core Temp</span>
                <span className="font-display text-3xl font-black text-primary dark:text-primary-light block mt-1">
                  {siloData?.probes?.core_temperature_celsius || '28.4'}°C
                </span>
                <span className="text-[11px] text-green-600 font-bold">Within Safe Range (&lt;32°C)</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder text-center">
                <span className="text-xs text-text-muted font-bold block">Relative Humidity (RH)</span>
                <span className="font-display text-3xl font-black text-blue-600 block mt-1">
                  {siloData?.probes?.relative_humidity_pct || '64.2'}%
                </span>
                <span className="text-[11px] text-text-muted">Equilibrium Moisture: 11.4%</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder text-center">
                <span className="text-xs text-text-muted font-bold block">Grain CO₂ Respiration</span>
                <span className="font-display text-3xl font-black text-emerald-600 block mt-1">
                  {siloData?.probes?.co2_respiration_ppm || '780'} ppm
                </span>
                <span className="text-[11px] text-green-600 font-bold">Zero Insect Activity</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  7-Day Predictive Spoilage Horizon
                </span>
                <h4 className="font-bold text-sm text-text-primary dark:text-white">
                  Safe for 75 Days · No Fungal or Mould Spores Detected
                </h4>
                <p className="text-xs text-text-muted">
                  {siloData?.infestation_risk_ai?.aeration_action_recommended || 'Run solar ventilation blower on Sunday 11:00 AM for 2 hours.'}
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-100 font-bold text-xs shrink-0">
                Battery: 94% · Probe Online
              </div>
            </div>
          </div>
        )}

        {/* ── TOOL 10: DRONE-AS-A-SERVICE ── */}
        {activeTab === 'drone' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-farmborder pb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  Technology 10 · Precision Agritech
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-text-primary dark:text-white flex items-center gap-2">
                  <Plane className="w-6 h-6 text-primary" /> Community Drone-as-a-Service (DaaS) Precision Booking
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-200 text-xs font-bold border border-cyan-300">
                Saves 90% Spray Water
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Allows small farmers to pool their adjoining land polygons into a single flight mission. Certified local Kisan Drone pilots and <em>Drone Didis</em> spray IFFCO Nano Urea and organic bio-pesticides at ₹140/acre (saving ₹310/acre over manual spraying and protecting farmer respiratory health).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Book Community Flight Mission</h3>

                <div>
                  <label className="text-xs font-bold block mb-1">
                    Land Area to Spray: <strong>{droneAcres} Acres</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={droneAcres}
                    onChange={(e) => setDroneAcres(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Flight Duration:</span>
                    <strong>{droneAcres * 6} Minutes (6 mins/acre)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Service Fee (@ ₹140/acre):</span>
                    <strong className="text-primary font-bold">₹{droneAcres * 140} (vs ₹{droneAcres * 450} manual)</strong>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Water Conserved:</span>
                    <span>{droneAcres * 180} Litres</span>
                  </div>
                </div>

                <button
                  onClick={bookDrone}
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  Schedule Precision Spray Mission
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm">Certified Local Pilot Network</h3>

                {pilots.map((pilot) => (
                  <div key={pilot.id} className="p-4 rounded-2xl bg-surface-2 dark:bg-gray-800 border border-farmborder space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-text-primary dark:text-white">{pilot.name}</h4>
                        <span className="text-[11px] text-text-muted">📍 {pilot.village_base} · {pilot.drone_model}</span>
                      </div>
                      <span className="text-xs font-bold text-gold bg-gold/15 px-2 py-0.5 rounded-full">
                        ★ {pilot.rating} ({pilot.missions_completed} missions)
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-text-muted pt-1">
                      <span>License: {pilot.dgca_license}</span>
                      <span className="text-green-600 font-bold">Available Tomorrow 07:00 AM</span>
                    </div>
                  </div>
                ))}

                {droneBooking && (
                  <div className="p-4 rounded-xl bg-green-100 dark:bg-green-950/60 border border-green-300 text-green-900 dark:text-green-200 text-xs space-y-1">
                    <div className="font-bold">✓ Mission Scheduled!</div>
                    <div>Booking ID: {droneBooking.booking_id} · Slot: {droneBooking.scheduled_slot}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 11: SPECTRO-CHEMICAL FERTILIZER SCANNER */}
        {activeTab === 'fertilizer' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Spectro-Chemical Fertilizer Adulteration Scanner 🔬
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Optical light absorbance & electrochemical sensor model trained to detect fake DAP and adulterated Urea before sowing.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                FCO 1985 Certified AI Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-gray-200">Select Fertilizer Sample to Test</label>
                  <select
                    value={fertilizerSample}
                    onChange={(e) => setFertilizerSample(e.target.value)}
                    className="w-full p-3 rounded-xl border border-farmborder bg-surface-2 dark:bg-gray-800 text-sm font-semibold"
                  >
                    <option>IFFCO DAP (Di-Ammonium Phosphate)</option>
                    <option>KRIBHCO Neem Coated Urea (46% N)</option>
                    <option>MOP (Muriate of Potash)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => testFertilizerScan(false)}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Test Genuine Sample</span>
                  </button>
                  <button
                    onClick={() => testFertilizerScan(true)}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Simulate Adulterated Sample</span>
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-900 border border-farmborder/60 space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Spectrometric Lab Report</h4>
                {fertilizerResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{fertilizerResult.sample_tested}</span>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        fertilizerResult.is_safe_to_apply ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {fertilizerResult.diagnostic_result}
                      </span>
                    </div>
                    <div className="text-xs font-semibold p-3 rounded-xl bg-white dark:bg-gray-800 border border-farmborder/50">
                      {fertilizerResult.recommendation}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-surface-1 dark:bg-gray-800">
                        <span className="text-text-muted block text-[10px]">Active Nitrogen:</span>
                        <span className="font-bold">{fertilizerResult.chemical_fingerprint.active_nitrogen_pct}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-1 dark:bg-gray-800">
                        <span className="text-text-muted block text-[10px]">Filler Clay / Sand:</span>
                        <span className="font-bold">{fertilizerResult.chemical_fingerprint.filler_clay_detected_pct}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">Click a test button above to run real-time neural spectrometry analysis.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 12: ACOUSTIC PEST SCANNER */}
        {activeTab === 'pest' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bug className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Acoustic Stem-Borer & Larvae Audio Classifier 🪲
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Hold smartphone mic against crop stem. Neural audio network detects larval chewing clicks inside stalks.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold/20 text-earth-brown dark:text-gold border border-gold/40">
                Ultrasonic Audio AI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary-pale dark:bg-primary-dark/30 border border-primary/20 space-y-2">
                  <div className="text-xs font-bold text-primary dark:text-primary-light flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Acoustic Stem Probe Simulator
                  </div>
                  <p className="text-[11px] text-text-muted">Select sample crop stalk and run 10-second spectral sound analysis.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => testAcousticScan(false)}
                    disabled={isScanningAudio}
                    className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    {isScanningAudio ? 'Listening...' : 'Record Clean Crop'}
                  </button>
                  <button
                    onClick={() => testAcousticScan(true)}
                    disabled={isScanningAudio}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    {isScanningAudio ? 'Listening...' : 'Simulate Stem-Borer'}
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-900 border border-farmborder/60 space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Acoustic Audio Diagnostic</h4>
                {pestAudioResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{pestAudioResult.crop}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        pestAudioResult.diagnosis.includes('HEALTHY') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {pestAudioResult.diagnosis}
                      </span>
                    </div>
                    <div className="text-xs p-3 rounded-xl bg-white dark:bg-gray-800 border border-farmborder/60 font-semibold">
                      💡 {pestAudioResult.spray_recipe}
                    </div>
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Chewing clicks: {pestAudioResult.acoustic_signature.chewing_clicks_per_minute}/min</span>
                      <span>Confidence: {pestAudioResult.confidence_pct}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">Press a button to simulate acoustic stem listening.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 13: BLOCKCHAIN GRAIN LEDGER */}
        {activeTab === 'blockchain' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Blockchain Immutable Grain Ledger ⛓️
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Cryptographically sealed audit trail linking weighbridge telemetry, moisture certificates, and DBT treasury escrow.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                Hyperledger Besu / Polygon
              </span>
            </div>

            {blockchainLedger ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-2 dark:bg-gray-900 flex flex-wrap justify-between items-center text-xs font-mono">
                  <span>Chain ID: {blockchainLedger.chain_id}</span>
                  <span>Blocks Mined: {blockchainLedger.total_immutable_blocks}</span>
                  <span>Farmer Key: {blockchainLedger.farmer_public_key}</span>
                </div>

                <div className="space-y-3">
                  {blockchainLedger.recent_transactions.map((tx: any) => (
                    <div key={tx.block_height} className="p-4 rounded-xl border border-farmborder/60 bg-white dark:bg-gray-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-primary">Block #{tx.block_height} · {tx.transaction_type}</span>
                        <span className="text-[10px] text-text-muted">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] font-mono text-text-muted break-all">
                        Hash: {tx.payload_hash}
                      </div>
                      <div className="flex justify-between text-[11px] text-text-muted">
                        <span>Validator: {tx.consensus_validator}</span>
                        <span className="text-green-600 font-bold">✓ Consensus Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted">Loading blockchain ledger nodes...</p>
            )}
          </div>
        )}

        {/* TOOL 14: PARAMETRIC RAIN CLAIM */}
        {activeTab === 'rainclaim' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Parametric Micro-Insurance Smart Claims 🛡️
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Automatic rain trigger. If rainfall exceeds 15mm during mandi waiting, receive direct compensation within 3 minutes without surveyors.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Zero-Paperwork Payout
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-gray-200">Active Mandi Location</label>
                  <input
                    type="text"
                    value={rainClaimMandi}
                    onChange={(e) => setRainClaimMandi(e.target.value)}
                    className="w-full p-3 rounded-xl border border-farmborder bg-surface-2 dark:bg-gray-800 text-sm font-semibold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => testRainClaim(false)}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-surface-2 dark:bg-gray-700 text-xs font-bold hover:bg-farmborder transition-all"
                  >
                    Simulate Normal Dry Day (0mm)
                  </button>
                  <button
                    onClick={() => testRainClaim(true)}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow"
                  >
                    Simulate 28mm Flash Downpour
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-900 border border-farmborder/60 space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Automated Claim Outcome</h4>
                {rainClaimResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-muted">Radar Rainfall:</span>
                      <span className="text-sm font-black text-primary">{rainClaimResult.measured_rainfall_radar_mm} mm (Trigger: 15mm)</span>
                    </div>
                    <div className={`p-3 rounded-xl text-xs font-bold ${
                      rainClaimResult.instant_claim_amount_inr > 0 ? 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200' : 'bg-surface-1 dark:bg-gray-800 text-text-muted'
                    }`}>
                      {rainClaimResult.instant_claim_amount_inr > 0
                        ? `🎉 ₹${rainClaimResult.instant_claim_amount_inr.toLocaleString()} DIRECT DBT COMPENSATED TO YOUR BANK!`
                        : 'No flooding condition detected. Stored grain is safe.'}
                    </div>
                    <div className="text-[11px] font-mono text-text-muted">
                      Escrow Smart Contract: {rainClaimResult.smart_contract_hash}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">Trigger rain simulator to test instant payout execution.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 15: MANDI ARBITRAGE OPTIMIZER */}
        {activeTab === 'arbitrage' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Pan-India Inter-Mandi Arbitrage & Corridor Optimizer 📊
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Identifies nearby APMCs offering rates significantly above local price, net of diesel, toll, and return freight.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold/20 text-earth-brown dark:text-gold border border-gold/40">
                MSP Arbitrage Engine
              </span>
            </div>

            {arbitrageData && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-2 dark:bg-gray-900 flex justify-between items-center text-xs">
                  <span className="font-bold">Commodity: {arbitrageData.crop}</span>
                  <span className="text-text-muted">Base: {arbitrageData.base_mandi}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {arbitrageData.best_corridors.map((c: any, i: number) => (
                    <div key={i} className="p-5 rounded-2xl border border-farmborder/60 bg-white dark:bg-gray-800 space-y-3 shadow-sm hover:border-primary transition-all">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-text-primary dark:text-white">{c.target_mandi}</h4>
                        <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-950 px-2 py-0.5 rounded-full">
                          +₹{c.rate_delta_inr}/Qtl
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                        <div>Distance: {c.distance_km} km</div>
                        <div>Freight: ₹{c.transit_cost_inr_qtl}/Qtl</div>
                      </div>
                      <div className="p-3 rounded-xl bg-primary-pale dark:bg-primary-dark/30 text-primary dark:text-primary-light font-bold text-xs flex justify-between items-center">
                        <span>Net Extra Profit (100 Qtl):</span>
                        <span className="text-sm font-black">₹{c.net_extra_profit_100qtl.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 16: GATE ANPR FAST-TRACK */}
        {activeTab === 'anpr' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Camera className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Automated ANPR Fast-Track Gate & 500m Geo-Fence 🛰️
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Cuts entry time from 45 minutes to 15 seconds. Automated camera reads tractor number plates and lifts barrier arms immediately.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                15-Second Gate Clearance
              </span>
            </div>

            {anprData && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-2 dark:bg-gray-900 flex justify-between items-center text-xs font-mono">
                  <span>Gate ID: {anprData.gate_id}</span>
                  <span className="text-green-600 font-bold">Status: {anprData.anpr_camera_status}</span>
                  <span>Geo-fence: {anprData.geofence_radius_meters}m</span>
                </div>

                <div className="space-y-3">
                  {anprData.recently_cleared_vehicles.map((v: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl border border-farmborder/60 bg-white dark:bg-gray-800 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <div className="font-bold text-sm text-text-primary dark:text-white">{v.plate_number} ({v.farmer_name})</div>
                        <div className="text-xs text-text-muted">Token: {v.slot_token} · Cleared at: {v.barrier_lifted_time}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-primary text-white block">
                          {v.allocated_bay}
                        </span>
                        <span className="text-[10px] text-green-600 font-bold mt-1 block">
                          Entry Dwell: {v.gate_dwell_seconds} seconds
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 17: PARALI MARKETPLACE */}
        {activeTab === 'stubble' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Crop Stubble (Parali) Circular Economy Marketplace 🌾
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Turn stubble burning into ₹1,800/ton extra profit. Connects farmers with nearby Bio-CNG, paper, and pellet plants.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold/20 text-earth-brown dark:text-gold border border-gold/40">
                Zero Stubble Burning
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-gray-200">Acres of Baled Stubble to List</label>
                  <input
                    type="number"
                    value={stubbleAcres}
                    onChange={(e) => setStubbleAcres(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-farmborder bg-surface-2 dark:bg-gray-800 text-sm font-semibold"
                  />
                </div>

                <button
                  onClick={submitStubbleListing}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow"
                >
                  <Flame className="w-4 h-4" />
                  <span>List Parali for Bio-CNG Pickup</span>
                </button>

                {stubbleSuccess && (
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-200 text-xs font-semibold">
                    ✓ Listing posted! {stubbleSuccess.quantity_bales} bales listed for {stubbleSuccess.buyer_interest}.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Regional Demand Bids</h4>
                {stubbleListings.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-farmborder/60 bg-white dark:bg-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-text-primary dark:text-white">{item.farmer_name} ({item.acres} acres)</span>
                      <span className="text-xs font-bold text-gold">₹{item.price_per_ton_inr}/ton</span>
                    </div>
                    <div className="text-xs text-text-muted">Buyer: {item.buyer_interest}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 18: SOLAR COLD STORAGE */}
        {activeTab === 'coldroom' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ThermometerSnowflake className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Solar Micro-Cold Storage & Grain Dryer Hub ⚡
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Prevent vegetable rot and high grain moisture deductions. Book decentralized cold cubes at ₹1.5/crate/day within 10 km.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                100% Solar Powered
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-gray-200">Crates to Store (Tomatoes/Potatoes)</label>
                  <input
                    type="number"
                    value={coldCrates}
                    onChange={(e) => setColdCrates(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-farmborder bg-surface-2 dark:bg-gray-800 text-sm font-semibold"
                  />
                </div>

                <button
                  onClick={bookColdRoom}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow"
                >
                  <ThermometerSnowflake className="w-4 h-4" />
                  <span>Reserve Cold Hub Cubes (7 Days)</span>
                </button>

                {coldBooking && (
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-200 text-xs font-semibold">
                    ✓ Space reserved! {coldBooking.crates_booked} crates at {coldBooking.temperature_target}. Estimated fee: ₹{coldBooking.estimated_cost_inr}.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Nearby Solar Hubs</h4>
                {coldHubs.map((hub) => (
                  <div key={hub.hub_id} className="p-4 rounded-xl border border-farmborder/60 bg-white dark:bg-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-text-primary dark:text-white">{hub.name}</span>
                      <span className="text-xs font-bold text-blue-600">{hub.temp_celsius || 'Fluidized'}</span>
                    </div>
                    <div className="text-xs text-text-muted">{hub.location}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 19: AI LOKPAL OMBUDSMAN */}
        {activeTab === 'ombudsman' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Gavel className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Instant Virtual Agricultural Ombudsman (AI Lokpal) ⚖️
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Faced illegal katoti deductions or bribery? Submit dispute for instant APMC Act legal citations and a 30-minute video hearing.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                30-Min Fast-Track Resolution
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-gray-200">Dispute Category</label>
                  <select
                    value={disputeType}
                    onChange={(e) => setDisputeType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-farmborder bg-surface-2 dark:bg-gray-800 text-sm font-semibold"
                  >
                    <option>Illegal Katoti (Extra grain deduction)</option>
                    <option>Unlawful Moisture Rejection</option>
                    <option>Delayed Weighment Bottleneck</option>
                    <option>Bribe Demand by Gate Supervisor</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-gray-200">Dispute Details</label>
                  <textarea
                    rows={3}
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-farmborder bg-surface-2 dark:bg-gray-800 text-sm font-medium"
                  />
                </div>

                <button
                  onClick={submitLokpalDispute}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow"
                >
                  <Gavel className="w-4 h-4" />
                  <span>File Emergency Lokpal Petition</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-900 border border-farmborder/60 space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Legal Analysis & Order</h4>
                {disputeResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-primary">{disputeResult.case_number}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                        {disputeResult.ai_legal_analysis.legal_validity}
                      </span>
                    </div>
                    <div className="text-xs p-3 rounded-xl bg-white dark:bg-gray-800 border border-farmborder/60 space-y-1">
                      <div className="font-bold text-red-600">Violation: {disputeResult.ai_legal_analysis.apmc_act_violation}</div>
                      <div className="text-text-muted">{disputeResult.ai_legal_analysis.precedent_judgment}</div>
                      <div className="font-bold text-green-600 pt-1">Penalty: {disputeResult.ai_legal_analysis.penalty_stipulated}</div>
                    </div>
                    <div className="text-xs font-semibold text-primary">
                      ✓ Notice served on accused entity. Video hearing link generated.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">Fill dispute details to obtain instant APMC rulebook analysis.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 20: GREEN PASSPORT & KISAN AYUSHMAN */}
        {activeTab === 'passport' && (
          <div className="card-farm space-y-6 animate-fade-in border-2 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-farmborder/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black font-heading text-text-primary dark:text-white">
                    Kisan CIBIL Agro-Credit Score & Ayushman Accidental Shield 🏆
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Rewarding sustainable farming with higher loan limits, lower interest rates, and automated ₹5 Lakh accidental insurance.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                Triple-A Prime Tier
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Green CIBIL */}
              {greenPassportData && (
                <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-900 border border-farmborder/60 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-text-muted">Kisan Agro-Credit CIBIL</span>
                    <span className="text-xs font-bold text-green-600">{greenPassportData.credit_rating_tier}</span>
                  </div>
                  <div className="text-center py-3">
                    <div className="text-4xl font-black text-primary font-heading">{greenPassportData.kisan_agro_credit_score}</div>
                    <span className="text-xs text-text-muted">Prime Score (Range 300 - 900)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-farmborder/60">
                      <span className="text-text-muted block text-[10px]">Interest Rate Subsidy:</span>
                      <span className="font-bold text-green-600">-{greenPassportData.bank_interest_subsidy_pct}% p.a.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-farmborder/60">
                      <span className="text-text-muted block text-[10px]">Annual Carbon Dividend:</span>
                      <span className="font-bold text-primary">₹{greenPassportData.annual_carbon_dividend_inr.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-text-muted font-mono">Registry: {greenPassportData.verra_registry_serial}</div>
                </div>
              )}

              {/* Right: Ayushman Shield */}
              {ayushmanData && (
                <div className="p-5 rounded-2xl bg-surface-2 dark:bg-gray-900 border border-farmborder/60 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-text-muted">Kisan Ayushman Policy</span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-950 px-2 py-0.5 rounded-full">
                      100% Subsidized
                    </span>
                  </div>
                  <div className="text-center py-3">
                    <div className="text-4xl font-black text-primary font-heading">₹5,00,000</div>
                    <span className="text-xs text-text-muted">Accidental & Hospitalization Shield</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-text-muted">
                    {ayushmanData.benefits.map((b: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-primary pt-2">
                    Emergency Helpline: {ayushmanData.emergency_helpline}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InnovationsSuite;
