import {
  Calendar,
  Ticket,
  Scale,
  CreditCard,
  Sparkles,
  Calculator,
  Compass,
  Mic,
  ShieldCheck,
  FlaskConical,
  Bug,
  Lock,
  Droplets,
  TrendingUp,
  Camera,
  Flame,
  ThermometerSnowflake,
  Gavel,
  Award,
  Satellite,
} from 'lucide-react';
import { FeatureDetail } from '../components/common/FeatureDetailModal';

export const differentiatorsData: FeatureDetail[] = [
  {
    id: 'slot-booking',
    icon: Calendar,
    title: 'Advance Slot Booking',
    desc: 'Eliminate chaotic 6–18 hour mandi queues with scheduled arrival windows and token passes.',
    badge: 'Zero Waiting',
    route: '/farmer/book-slot',
    actionText: 'Book a Mandi Slot Now',
    howItWorks: {
      overview: 'Farmers can reserve their preferred 2-hour arrival window from their smartphone before leaving the village. The APMC system guarantees entry without roadside tractor gridlocks.',
      steps: [
        {
          stepNumber: 1,
          title: 'Pick Date & Mandi Centre',
          desc: 'Select your registered local APMC mandi and view open date slots with live capacity gauges.',
        },
        {
          stepNumber: 2,
          title: 'Declare Quantity & Tractor',
          desc: 'Specify your estimated quintals and vehicle plate for automated weighbridge recognition.',
        },
        {
          stepNumber: 3,
          title: 'Instant QR Pass & SMS',
          desc: 'Receive your verified digital QR token pass on WhatsApp and SMS with fast-track entry privileges.',
        },
      ],
      realWorldBenefit: 'Saves 6 to 18 hours of waiting in open tractor lines under heat or rain, saving an estimated ₹800–₹1,500 in diesel idling costs per harvest trip.',
      stats: [
        { label: 'Wait Time Cut', value: '85%' },
        { label: 'Gate Entry SLA', value: '< 10 Mins' },
      ],
    },
  },
  {
    id: 'live-queue',
    icon: Ticket,
    title: 'Live Queue Token (SSE)',
    desc: 'Real-time live queue tracking on your phone with audible arrival chime and gate status.',
    badge: 'Real-time',
    route: '/farmer/queue',
    actionText: 'Track Live Gate Queue',
    howItWorks: {
      overview: 'Server-Sent Events (SSE) push live weighbridge progress, token turnover, and exact turnaround times directly to your mobile browser without manual page refreshing.',
      steps: [
        {
          stepNumber: 1,
          title: 'Auto-Check In at Gate',
          desc: 'Tractor ANPR camera or guard scans your QR ticket to activate your spot in the live queue.',
        },
        {
          stepNumber: 2,
          title: 'Track Tokens in Real-Time',
          desc: 'Watch your token climb on your phone screen with dynamic countdowns to your weighing bay.',
        },
        {
          stepNumber: 3,
          title: 'Audible Chime Alert',
          desc: 'Hear a chime alert and receive a push SMS when you are within 2 tokens of weighbridge entry.',
        },
      ],
      realWorldBenefit: 'Allows farmers to rest in the Kisan shed or have lunch instead of standing anxiously beside their tractors.',
      stats: [
        { label: 'Real-Time Latency', value: '< 200ms' },
        { label: 'Battery Overhead', value: 'Near Zero' },
      ],
    },
  },
  {
    id: 'crop-scanner',
    icon: Sparkles,
    title: 'AI Crop Quality Pre-Scanner',
    desc: 'Analyze grain moisture and FAQ compliance right from your phone camera before travelling.',
    badge: 'AI Powered',
    route: '/farmer/crop-scanner',
    actionText: 'Launch AI Crop Camera',
    howItWorks: {
      overview: 'Runs a trained convolutional neural network directly on your smartphone to measure grain moisture, foreign matter, and broken grain percentage with ICAR precision.',
      steps: [
        {
          stepNumber: 1,
          title: 'Snap a Photo of Grain',
          desc: 'Place a handful of wheat or paddy on a clean surface and capture an image with your phone camera.',
        },
        {
          stepNumber: 2,
          title: 'Neural Quality Analysis',
          desc: 'Our neural regressor evaluates colour reflectance, texture, moisture index, and defect ratio in 1.2 seconds.',
        },
        {
          stepNumber: 3,
          title: 'Drying Recommendation',
          desc: 'Get immediate guidance on whether your crop meets FAQ standards or needs 1–2 days of sun drying.',
        },
      ],
      realWorldBenefit: 'Prevents distress rejections and unfair quality cutbacks at the mandi gate, saving farmers up to ₹150/quintal in arbitrary deductions.',
      stats: [
        { label: 'Moisture Accuracy', value: '±0.4%' },
        { label: 'Inference Speed', value: '1.2s' },
      ],
    },
  },
  {
    id: 'fertilizer-analyzer',
    icon: FlaskConical,
    title: 'Fertilizer Adulteration Scanner',
    desc: 'Detect counterfeit DAP and adulterated Urea using optical spectrometry before applying to soil.',
    badge: 'Lab AI',
    route: '/farmer/innovations',
    actionText: 'Test Fertilizer Sample',
    howItWorks: {
      overview: 'Neural spectrometry model trained on 4,000+ laboratory chemical samples to detect sand, clay, salt, and biuret contamination in chemical fertilizers.',
      steps: [
        {
          stepNumber: 1,
          title: 'Dissolve Sample in Water',
          desc: 'Dissolve a small scoop of fertilizer in clean water and record light absorbance through the vial.',
        },
        {
          stepNumber: 2,
          title: 'Neural Chemical Fingerprint',
          desc: 'Model computes active Nitrogen %, P₂O₅ purity, and filler clay percentage against FCO 1985 benchmarks.',
        },
        {
          stepNumber: 3,
          title: 'Safety Seal & Dealer Report',
          desc: 'Get an instant safety verdict. Flagged adulterated batches generate an automated notice to the Quality Inspector.',
        },
      ],
      realWorldBenefit: 'Saves farmers from ₹15,000–₹40,000 in lost crop yields caused by fake fertilizers during critical vegetative growth stages.',
      stats: [
        { label: 'Adulteration Detection', value: '99.4%' },
        { label: 'Standards Compliance', value: 'FCO 1985' },
      ],
    },
  },
  {
    id: 'pest-acoustics',
    icon: Bug,
    title: 'Acoustic Stem-Borer Audio Scan',
    desc: 'Hold your phone against crop stems. Neural audio AI detects hidden larval chewing inside stalks.',
    badge: 'Audio AI',
    route: '/farmer/innovations',
    actionText: 'Start Stem Audio Probe',
    howItWorks: {
      overview: 'Captures micro-acoustic stem vibrations using the smartphone microphone to isolate the ultrasonic chewing frequency of pink bollworms and stem borers before visible crop damage.',
      steps: [
        {
          stepNumber: 1,
          title: 'Hold Phone Against Stem',
          desc: 'Place the microphone against a standing crop stalk in your field for 10 seconds.',
        },
        {
          stepNumber: 2,
          title: 'Spectral Frequency Classifier',
          desc: 'Deep learning audio model analyzes peak kHz, pulse intervals, and chewing click rates.',
        },
        {
          stepNumber: 3,
          title: 'Targeted Bio-Spray Recipe',
          desc: 'Receive precise neem or biological pesticide dosages 7 days before economic damage threshold is crossed.',
        },
      ],
      realWorldBenefit: 'Halves expensive chemical pesticide spraying costs by targeting only actively infested field clusters early.',
      stats: [
        { label: 'Audio Detection', value: '98.8%' },
        { label: 'Early Warning', value: '7 Days Prior' },
      ],
    },
  },
  {
    id: 'enwr-loans',
    icon: CreditCard,
    title: 'e-NWR 3-Min Warehouse Loans',
    desc: 'Pledge stored grain receipts for instant 70% bank cash via UPI without distress selling.',
    badge: 'Instant Cash',
    route: '/farmer/innovations',
    actionText: 'Check e-NWR Loan Limit',
    howItWorks: {
      overview: 'Converts electronic Negotiable Warehouse Receipts (WDRA accredited) into immediate bank credit, allowing farmers to hold grain till market prices rise.',
      steps: [
        {
          stepNumber: 1,
          title: 'Deposit at Mandi Silo',
          desc: 'Unload grain at any government certified silo hub and receive a cryptographic electronic receipt.',
        },
        {
          stepNumber: 2,
          title: 'Pledge Bags via App',
          desc: 'Select how many bags you want to pledge. The system calculates 70% spot value based on MSP.',
        },
        {
          stepNumber: 3,
          title: 'Instant Bank Disbursal',
          desc: 'Funds transfer directly into your Aadhaar-linked bank account within 3 minutes at subsidized 7% interest.',
        },
      ],
      realWorldBenefit: 'Permanently ends distress selling to local commission agents and moneylenders who charge 24–36% annualized interest.',
      stats: [
        { label: 'Disbursal Speed', value: '< 3 Mins' },
        { label: 'Interest Rate', value: '7% p.a.' },
      ],
    },
  },
  {
    id: 'blockchain-ledger',
    icon: Lock,
    title: 'Blockchain Immutable Grain Ledger',
    desc: 'Tamper-proof consortium audit trail hashing weighbridge slips, moisture tests, and DBT payments.',
    badge: 'Zero-Trust',
    route: '/farmer/innovations',
    actionText: 'Inspect Grain Ledger',
    howItWorks: {
      overview: 'Every procurement step is cryptographically hashed to a distributed Hyperledger/Polygon ledger, making records unalterable by corrupt mandi officials.',
      steps: [
        {
          stepNumber: 1,
          title: 'Telemetry Encryption',
          desc: 'Raw weighbridge readings are signed with hardware private keys at the load cell sensor.',
        },
        {
          stepNumber: 2,
          title: 'Multi-Node Consensus',
          desc: 'APMC, FCI, and State Food civil supplies nodes validate the transaction block independently.',
        },
        {
          stepNumber: 3,
          title: 'Public Verification',
          desc: 'Farmers view their transaction block hash on their digital passbook with complete audit transparency.',
        },
      ],
      realWorldBenefit: 'Eliminates fake procurement slips, ghost billing, and post-weighment weight deduction scams completely.',
      stats: [
        { label: 'Consensus Nodes', value: 'State + FCI' },
        { label: 'Tamper Risk', value: '0.00%' },
      ],
    },
  },
  {
    id: 'parametric-rain',
    icon: Droplets,
    title: 'Parametric Rain Smart Claims',
    desc: 'Automatic 15mm rainfall trigger pays out direct compensation in 3 minutes without surveyors.',
    badge: 'Weather Shield',
    route: '/farmer/innovations',
    actionText: 'View Weather Insurance',
    howItWorks: {
      overview: 'Connected to IMD Doppler weather radar. If unseasonal rainfall exceeds 15mm while a farmer has grain waiting in open mandi platforms, instant compensation triggers automatically.',
      steps: [
        {
          stepNumber: 1,
          title: 'Doppler Radar Tracking',
          desc: 'High-frequency radar monitors precipitation levels over the 1 km² mandi perimeter 24/7.',
        },
        {
          stepNumber: 2,
          title: '15mm Trigger Activation',
          desc: 'When rain crosses the 15mm threshold, the smart contract verifies all active yard tokens.',
        },
        {
          stepNumber: 3,
          title: 'Instant PFMS DBT Transfer',
          desc: 'Compensation funds disburse immediately into the farmer’s bank account without insurance paperwork.',
        },
      ],
      realWorldBenefit: 'Protects hard-earned harvest from sudden cloudbursts and rain damage without waiting 8 months for insurance surveyors.',
      stats: [
        { label: 'Settlement Time', value: '3 Minutes' },
        { label: 'Paperwork Needed', value: '0 Pages' },
      ],
    },
  },
  {
    id: 'mandi-arbitrage',
    icon: TrendingUp,
    title: 'Pan-India Mandi Arbitrage',
    desc: 'Detects higher prices in nearby district mandis net of diesel and toll expenses for maximum profit.',
    badge: 'Profit Engine',
    route: '/farmer/innovations',
    actionText: 'Find Best Mandi Rate',
    howItWorks: {
      overview: 'Calculates real-time price spreads across 500+ APMC mandis, subtracting return transport costs to suggest whether moving grain 100 km earns extra net profit.',
      steps: [
        {
          stepNumber: 1,
          title: 'Live Price Scraping',
          desc: 'Monitors real-time mandi prices across all surrounding districts continuously.',
        },
        {
          stepNumber: 2,
          title: 'Net Margin Computation',
          desc: 'Deducts diesel, driver batta, and toll expenses based on your truck tonnage.',
        },
        {
          stepNumber: 3,
          title: 'Return Freight Matching',
          desc: 'Pairs your vehicle with return-trip freight loads so you never run empty tractors back.',
        },
      ],
      realWorldBenefit: 'Empowers farmers to capture ₹500–₹900/quintal price premiums, generating ₹50,000–₹75,000 in additional net profit on a 100-quintal harvest.',
      stats: [
        { label: 'Extra Profit / 100 Qtl', value: 'Up to ₹75,000' },
        { label: 'Mandis Monitored', value: '500+' },
      ],
    },
  },
  {
    id: 'anpr-gate',
    icon: Camera,
    title: '15-Second ANPR Fast Gate',
    desc: 'Camera reads tractor number plates and lifts barrier arms immediately without highway jams.',
    badge: '15s Entry',
    route: '/farmer/innovations',
    actionText: 'View Fast Gate Telemetry',
    howItWorks: {
      overview: 'High-speed Automatic Number Plate Recognition (ANPR) linked to 500m geo-fencing verifies incoming tractors and automatically directs them to open unloading bays.',
      steps: [
        {
          stepNumber: 1,
          title: '500m Geo-Fence Approach',
          desc: 'As your tractor approaches within 500 meters of the mandi gate, your arrival is broadcasted.',
        },
        {
          stepNumber: 2,
          title: 'High-Speed Plate Recognition',
          desc: 'Optical camera matches vehicle registration with active slot tokens in under 400 milliseconds.',
        },
        {
          stepNumber: 3,
          title: 'Automated Barrier Lift',
          desc: 'Barrier lifts automatically and displays your designated unloading bay on the overhead LED board.',
        },
      ],
      realWorldBenefit: 'Eliminates 2-kilometer tractor tailbacks on national highways and cuts mandi entrance dwell from 45 minutes to 15 seconds.',
      stats: [
        { label: 'Gate Clearance Time', value: '15 Seconds' },
        { label: 'Plate Match Accuracy', value: '99.4%' },
      ],
    },
  },
  {
    id: 'stubble-market',
    icon: Flame,
    title: 'Parali Biomass Circular Market',
    desc: 'Sell crop stubble to Bio-CNG and pellet plants at ₹1,800/ton instead of burning fields.',
    badge: 'Circular Ag',
    route: '/farmer/innovations',
    actionText: 'List Parali for Pickup',
    howItWorks: {
      overview: 'Bridges the gap between farmers with harvested straw and commercial green energy buyers (like GAIL, IOCL, and NTPC) who collect baled stubble from the field.',
      steps: [
        {
          stepNumber: 1,
          title: 'Post Stubble Quantity',
          desc: 'Enter your harvest acres and bale type directly from your phone.',
        },
        {
          stepNumber: 2,
          title: 'Automated Bio-Plant Matching',
          desc: 'Nearby bio-CNG plants place competitive pickup bids per ton.',
        },
        {
          stepNumber: 3,
          title: 'Field Gate Collection',
          desc: 'Buyer trucks arrive at your farm to load bales and disburse payments directly into your account.',
        },
      ],
      realWorldBenefit: 'Transforms an environmental hazard into ₹15,000–₹35,000 in pure supplementary revenue per farm.',
      stats: [
        { label: 'Stubble Value', value: '₹1,800 / Ton' },
        { label: 'Burning Penalties', value: '₹0 (Zero Risk)' },
      ],
    },
  },
  {
    id: 'ombudsman-ai',
    icon: Gavel,
    title: 'Virtual AI Lokpal Ombudsman',
    desc: 'Instant APMC Act legal citations and 30-minute expedited video hearings for unfair deductions.',
    badge: 'Instant Justice',
    route: '/farmer/innovations',
    actionText: 'File Lokpal Petition',
    howItWorks: {
      overview: 'A digital judicial dispute mechanism that applies the statutory APMC rulebook and weighbridge audit logs to hold corrupt traders and officials accountable in real time.',
      steps: [
        {
          stepNumber: 1,
          title: 'Submit Dispute Notes',
          desc: 'Select dispute category (e.g. illegal katoti, bribe demand, delayed weighment) with brief notes.',
        },
        {
          stepNumber: 2,
          title: 'AI Statutory Analysis',
          desc: 'System references APMC Act sections and Supreme Court precedents, drafting a formal summary notice.',
        },
        {
          stepNumber: 3,
          title: '30-Min Video Hearing',
          desc: 'Generates a secure hearing room connecting the farmer, District Agricultural Officer, and APMC Secretary.',
        },
      ],
      realWorldBenefit: 'Ends fear of local mandi cartels and ensures immediate refund of unlawful deductions before grain leaves the yard.',
      stats: [
        { label: 'Hearing Turnaround', value: '30 Minutes' },
        { label: 'Legal Backing', value: 'APMC Act Sec 32' },
      ],
    },
  },
];
