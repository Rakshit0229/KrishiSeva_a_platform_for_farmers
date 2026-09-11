import { pool, memoryStore, getIsPgConnected } from './index';

export const INITIAL_MSP_RATES = [
  { id: '30000000-0000-0000-0000-000000000001', crop_type: 'wheat', season: 'rabi', year: 2026, rate_per_quintal: 2425.00, effective_from: '2026-04-01' },
  { id: '30000000-0000-0000-0000-000000000002', crop_type: 'paddy', season: 'kharif', year: 2025, rate_per_quintal: 2300.00, effective_from: '2025-10-01' },
  { id: '30000000-0000-0000-0000-000000000003', crop_type: 'maize', season: 'kharif', year: 2025, rate_per_quintal: 2090.00, effective_from: '2025-10-01' },
  { id: '30000000-0000-0000-0000-000000000004', crop_type: 'mustard', season: 'rabi', year: 2026, rate_per_quintal: 5950.00, effective_from: '2026-04-01' },
  { id: '30000000-0000-0000-0000-000000000005', crop_type: 'gram', season: 'rabi', year: 2026, rate_per_quintal: 5650.00, effective_from: '2026-04-01' },
  { id: '30000000-0000-0000-0000-000000000006', crop_type: 'soybean', season: 'kharif', year: 2025, rate_per_quintal: 4892.00, effective_from: '2025-10-01' },
  { id: '30000000-0000-0000-0000-000000000007', crop_type: 'cotton', season: 'kharif', year: 2025, rate_per_quintal: 7121.00, effective_from: '2025-10-01' },
  { id: '30000000-0000-0000-0000-000000000008', crop_type: 'groundnut', season: 'kharif', year: 2025, rate_per_quintal: 6783.00, effective_from: '2025-10-01' },
  { id: '30000000-0000-0000-0000-000000000009', crop_type: 'barley', season: 'rabi', year: 2026, rate_per_quintal: 1980.00, effective_from: '2026-04-01' },
  { id: '30000000-0000-0000-0000-000000000010', crop_type: 'sunflower', season: 'rabi', year: 2026, rate_per_quintal: 7280.00, effective_from: '2026-04-01' },
];

export const INITIAL_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', phone: '+919999900001', name: 'Admin DoCA', role: 'admin', is_active: true, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000002', phone: '+919999900002', name: 'Officer Rajesh Kumar', role: 'officer', is_active: true, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000003', phone: '+919999900003', name: 'Officer Priya Singh', role: 'officer', is_active: true, created_at: new Date().toISOString() },
  { id: '20000000-0000-0000-0000-000000000001', phone: '+919876543201', name: 'Gurpreet Singh', role: 'farmer', is_active: true, created_at: new Date().toISOString() },
  { id: '20000000-0000-0000-0000-000000000002', phone: '+919876543202', name: 'Ramesh Yadav', role: 'farmer', is_active: true, created_at: new Date().toISOString() },
  { id: '20000000-0000-0000-0000-000000000003', phone: '+919876543203', name: 'Sunita Devi', role: 'farmer', is_active: true, created_at: new Date().toISOString() },
];

export const INITIAL_CENTRES = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Amritsar Central Mandi',
    address: 'GT Road, Near Bus Stand',
    district: 'Amritsar',
    state: 'Punjab',
    pincode: '143001',
    lat: 31.6340,
    lng: 74.8723,
    contact_phone: '+919812345001',
    daily_slot_capacity: 80,
    officer_id: '00000000-0000-0000-0000-000000000002',
    is_active: true,
    crops_accepted: ['wheat', 'paddy', 'maize'],
    operating_hours_start: '08:00',
    operating_hours_end: '17:00',
    avg_rating: 4.8,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Ludhiana Grain Market',
    address: 'Miller Ganj, Ludhiana',
    district: 'Ludhiana',
    state: 'Punjab',
    pincode: '141003',
    lat: 30.9010,
    lng: 75.8573,
    contact_phone: '+919812345002',
    daily_slot_capacity: 100,
    officer_id: '00000000-0000-0000-0000-000000000003',
    is_active: true,
    crops_accepted: ['wheat', 'paddy', 'cotton'],
    operating_hours_start: '08:00',
    operating_hours_end: '17:00',
    avg_rating: 4.6,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Hisar Procurement Centre',
    address: 'Sector 14, Hisar',
    district: 'Hisar',
    state: 'Haryana',
    pincode: '125001',
    lat: 29.1492,
    lng: 75.7217,
    contact_phone: '+919812345003',
    daily_slot_capacity: 60,
    officer_id: '00000000-0000-0000-0000-000000000002',
    is_active: true,
    crops_accepted: ['wheat', 'mustard', 'barley'],
    operating_hours_start: '08:00',
    operating_hours_end: '17:00',
    avg_rating: 4.7,
  },
];

export const INITIAL_PROFILES = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    user_id: '20000000-0000-0000-0000-000000000001',
    aadhaar_last4: '4321',
    crop_types: ['wheat', 'paddy'],
    land_area_acres: 12.5,
    village: 'Tarn Taran',
    district: 'Amritsar',
    state: 'Punjab',
    pincode: '143401',
    bank_name: 'Punjab National Bank',
    bank_account_last4: '5678',
    ifsc_code: 'PUNB0001234',
    profile_complete: true,
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    user_id: '20000000-0000-0000-0000-000000000002',
    aadhaar_last4: '8765',
    crop_types: ['paddy', 'maize'],
    land_area_acres: 8.0,
    village: 'Saharsa',
    district: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    bank_name: 'State Bank of India',
    bank_account_last4: '9012',
    ifsc_code: 'SBIN0001234',
    profile_complete: true,
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    user_id: '20000000-0000-0000-0000-000000000003',
    aadhaar_last4: '1234',
    crop_types: ['mustard', 'wheat'],
    land_area_acres: 5.5,
    village: 'Narnaul',
    district: 'Hisar',
    state: 'Haryana',
    pincode: '123001',
    bank_name: 'HDFC Bank',
    bank_account_last4: '3456',
    ifsc_code: 'HDFC0001234',
    profile_complete: true,
  },
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    title: 'Paddy MSP Revised for Kharif 2026',
    body: 'Government has revised MSP for Paddy to ₹2,400/quintal effective October 1, 2026.',
    is_active: true,
    expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    title: 'System Maintenance Tonight',
    body: 'KrishiSeva maintenance 11PM–1AM. Book slots before 10PM.',
    is_active: true,
    expires_at: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_FAQS = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    category: 'booking',
    question_hi: 'स्लॉट कैसे बुक करें?',
    answer_hi: 'ऐप खोलें → स्लॉट बुक करें → केंद्र चुनें → तारीख और समय → फसल जानकारी → पुष्टि करें।',
    question_en: 'How to book a slot?',
    answer_en: 'Open app → Book Slot → Select centre → Choose date and time → Enter crop details → Confirm.',
    sort_order: 1,
    is_active: true,
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    category: 'payment',
    question_hi: 'पैसे कब आएंगे?',
    answer_hi: 'खरीद के 72 घंटे के अंदर DBT के जरिये सीधे बैंक खाते में।',
    question_en: 'When will payment arrive?',
    answer_en: 'Within 72 hours of procurement via DBT directly to your bank account.',
    sort_order: 2,
    is_active: true,
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    category: 'msp',
    question_hi: 'MSP क्या होता है?',
    answer_hi: 'Minimum Support Price — सरकार द्वारा तय न्यूनतम मूल्य। गेहूं: ₹2,425/क्विंटल।',
    question_en: 'What is MSP?',
    answer_en: 'Minimum Support Price — government-fixed minimum rate. Wheat: ₹2,425/quintal (Rabi 2026).',
    sort_order: 3,
    is_active: true,
  },
];

export async function seedDatabase() {
  console.log('🌱 Seeding KrishiSeva dataset...');

  // 1. Memory Store Seeding
  memoryStore.msp_rates = [...INITIAL_MSP_RATES];
  memoryStore.users = [...INITIAL_USERS];
  memoryStore.procurement_centres = [...INITIAL_CENTRES];
  memoryStore.farmer_profiles = [...INITIAL_PROFILES];
  memoryStore.announcements = [...INITIAL_ANNOUNCEMENTS];
  memoryStore.faq_articles = [...INITIAL_FAQS];

  // 2. Generate slots for next 7 days
  const timeSlots = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ];

  const today = new Date();
  const generatedSlots: any[] = [];
  let slotCounter = 1;

  for (const centre of INITIAL_CENTRES) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      for (const ts of timeSlots) {
        generatedSlots.push({
          id: `70000000-0000-0000-${String(slotCounter).padStart(4, '0')}-000000000000`,
          centre_id: centre.id,
          slot_date: dateStr,
          start_time: ts.start,
          end_time: ts.end,
          max_capacity: 10,
          booked_count: dayOffset === 0 ? Math.floor(Math.random() * 8) : Math.floor(Math.random() * 4),
          is_blocked: false,
          block_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        slotCounter++;
      }
    }
  }
  memoryStore.slots = generatedSlots;

  // 3. Seed demo active bookings & queue entries for today
  const todayStr = today.toISOString().split('T')[0];
  const amritsarId = INITIAL_CENTRES[0].id;
  const gurpreetId = INITIAL_USERS[3].id; // Gurpreet Singh

  const demoBooking1 = {
    id: '80000000-0000-0000-0000-000000000001',
    farmer_id: gurpreetId,
    slot_id: generatedSlots[1].id,
    centre_id: amritsarId,
    token_number: 47,
    qr_token: 'QR-KS-2026-0911-0047',
    status: 'confirmed',
    crop_type: 'wheat',
    expected_quantity_kg: 500.00,
    notes: 'Premium Sharbati wheat, harvested yesterday',
    booked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const demoQueue1 = {
    id: '90000000-0000-0000-0000-000000000001',
    booking_id: demoBooking1.id,
    centre_id: amritsarId,
    queue_date: todayStr,
    token_number: 47,
    status: 'waiting',
    called_at: null,
    service_started_at: null,
    service_ended_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Preceding tokens in queue for Amritsar
  const precedingTokens = [
    { token: 44, name: 'Balwinder Singh', crop: 'wheat', qty: 500, status: 'in_service' },
    { token: 45, name: 'Harpreet Kaur', crop: 'paddy', qty: 450, status: 'waiting' },
    { token: 46, name: 'Jagjit Singh', crop: 'wheat', qty: 600, status: 'waiting' },
  ];

  memoryStore.bookings.push(demoBooking1);
  memoryStore.queue_entries.push(demoQueue1);

  for (let i = 0; i < precedingTokens.length; i++) {
    const pt = precedingTokens[i];
    const bId = `80000000-0000-0000-0000-00000000001${i + 2}`;
    const fakeFarmerId = `20000000-0000-0000-0000-00000000001${i + 4}`;

    memoryStore.users.push({
      id: fakeFarmerId,
      phone: `+9198765430${10 + i}`,
      name: pt.name,
      role: 'farmer',
      is_active: true,
      created_at: new Date().toISOString(),
    });

    memoryStore.bookings.push({
      id: bId,
      farmer_id: fakeFarmerId,
      slot_id: generatedSlots[1].id,
      centre_id: amritsarId,
      token_number: pt.token,
      qr_token: `QR-KS-2026-0911-00${pt.token}`,
      status: pt.status === 'in_service' ? 'in_service' : 'confirmed',
      crop_type: pt.crop,
      expected_quantity_kg: pt.qty,
      booked_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    memoryStore.queue_entries.push({
      id: `90000000-0000-0000-0000-00000000001${i + 2}`,
      booking_id: bId,
      centre_id: amritsarId,
      queue_date: todayStr,
      token_number: pt.token,
      status: pt.status,
      called_at: pt.status === 'in_service' ? new Date().toISOString() : null,
      service_started_at: pt.status === 'in_service' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // 4. Seed past procurements & payments for Gurpreet
  const pastProcurement1 = {
    id: 'a0000000-0000-0000-0000-000000000001',
    booking_id: '80000000-0000-0000-0000-000000000099',
    farmer_id: gurpreetId,
    centre_id: amritsarId,
    officer_id: '00000000-0000-0000-0000-000000000002',
    crop_type: 'wheat',
    quantity_kg: 2000.00,
    msp_rate: 2425.00,
    total_amount: (2000 / 100) * 2425.00, // ₹48,500
    moisture_level: 11.8,
    quality_grade: 'A',
    procurement_date: '2026-09-02',
    status: 'approved',
    source: 'iot_weighbridge',
    device_id: 'WB-AMR-01',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  };

  const pastPayment1 = {
    id: 'b0000000-0000-0000-0000-000000000001',
    procurement_id: pastProcurement1.id,
    farmer_id: gurpreetId,
    amount: 48500.00,
    status: 'credited',
    payment_date: '2026-09-04',
    reference_number: 'PFMS202609048712903',
    bank_account_last4: '5678',
    initiated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    credited_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  };

  const pendingProcurement2 = {
    id: 'a0000000-0000-0000-0000-000000000002',
    booking_id: '80000000-0000-0000-0000-000000000098',
    farmer_id: gurpreetId,
    centre_id: amritsarId,
    officer_id: '00000000-0000-0000-0000-000000000002',
    crop_type: 'wheat',
    quantity_kg: 500.00,
    msp_rate: 2425.00,
    total_amount: (500 / 100) * 2425.00, // ₹12,125
    moisture_level: 12.1,
    quality_grade: 'A',
    procurement_date: todayStr,
    status: 'pending',
    source: 'iot_weighbridge',
    device_id: 'WB-AMR-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const pendingPayment2 = {
    id: 'b0000000-0000-0000-0000-000000000002',
    procurement_id: pendingProcurement2.id,
    farmer_id: gurpreetId,
    amount: 12125.00,
    status: 'processing',
    payment_date: null,
    reference_number: null,
    bank_account_last4: '5678',
    initiated_at: new Date().toISOString(),
    credited_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryStore.procurements.push(pastProcurement1, pendingProcurement2);
  memoryStore.payments.push(pastPayment1, pendingPayment2);

  // 5. Seed sample grievances
  memoryStore.grievances.push({
    id: 'c0000000-0000-0000-0000-000000000001',
    farmer_id: gurpreetId,
    booking_id: demoBooking1.id,
    procurement_id: null,
    centre_id: amritsarId,
    category: 'queue_delay',
    subject: 'Wait time exceeded token prediction',
    description: 'Weighbridge took 45 minutes to calibrate causing delay in bay 2.',
    status: 'in_review',
    priority: 'medium',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    sla_deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    resolved_at: null,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 6. Seed weather cache
  memoryStore.weather_cache.push(
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      district: 'Amritsar',
      state: 'Punjab',
      forecast_date: todayStr,
      temperature_max: 32,
      temperature_min: 24,
      humidity_pct: 58,
      rainfall_mm: 0,
      condition: 'Sunny',
      is_adverse: false,
      advisory: 'Optimal weather for grain delivery and open yard unloading.',
      fetched_at: new Date().toISOString(),
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      district: 'Ludhiana',
      state: 'Punjab',
      forecast_date: todayStr,
      temperature_max: 33,
      temperature_min: 25,
      humidity_pct: 62,
      rainfall_mm: 2.5,
      condition: 'Partly Cloudy',
      is_adverse: false,
      advisory: 'Low moisture risk. Unloading operational.',
      fetched_at: new Date().toISOString(),
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      district: 'Hisar',
      state: 'Haryana',
      forecast_date: todayStr,
      temperature_max: 34,
      temperature_min: 26,
      humidity_pct: 52,
      rainfall_mm: 0,
      condition: 'Clear',
      is_adverse: false,
      advisory: 'Clear skies. Dry conditions.',
      fetched_at: new Date().toISOString(),
    }
  );

  // 7. Seed FPO group
  memoryStore.fpo_groups.push({
    id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Majha Kisan Producer Company',
    registration_number: 'FPO-PB-2024-8841',
    district: 'Amritsar',
    state: 'Punjab',
    leader_id: gurpreetId,
    created_at: new Date().toISOString(),
  });

  memoryStore.fpo_members.push({
    id: 'f0000000-0000-0000-0000-000000000001',
    fpo_id: 'e0000000-0000-0000-0000-000000000001',
    farmer_id: gurpreetId,
    joined_at: new Date().toISOString(),
  });

  console.log(`✅ Seed complete! Users: ${memoryStore.users.length}, Centres: ${memoryStore.procurement_centres.length}, Slots: ${memoryStore.slots.length}, Bookings: ${memoryStore.bookings.length}`);
}
