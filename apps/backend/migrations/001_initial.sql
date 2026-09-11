CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('farmer','officer','admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending','confirmed','arrived','in_service','completed','cancelled','no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE queue_status AS ENUM ('waiting','called','in_service','done','skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE procurement_status AS ENUM ('pending','processing','approved','rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending','processing','credited','failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grievance_status AS ENUM ('open','in_review','escalated','resolved','closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Core tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  role user_role DEFAULT 'farmer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  aadhaar_last4 CHAR(4),
  crop_types TEXT[] DEFAULT '{}',
  land_area_acres NUMERIC(8,2),
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),
  bank_name VARCHAR(100),
  bank_account_last4 CHAR(4),
  ifsc_code VARCHAR(11),
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS procurement_centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6),
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  contact_phone VARCHAR(15),
  daily_slot_capacity INTEGER DEFAULT 50,
  officer_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  crops_accepted TEXT[] DEFAULT '{}',
  operating_hours_start TIME DEFAULT '08:00',
  operating_hours_end TIME DEFAULT '17:00',
  avg_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES procurement_centres(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER DEFAULT 10,
  booked_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(centre_id, slot_date, start_time)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id),
  slot_id UUID REFERENCES slots(id),
  centre_id UUID REFERENCES procurement_centres(id),
  token_number INTEGER,
  qr_token VARCHAR(128) UNIQUE NOT NULL,
  status booking_status DEFAULT 'confirmed',
  crop_type VARCHAR(50) NOT NULL,
  expected_quantity_kg NUMERIC(10,2),
  notes TEXT,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  centre_id UUID REFERENCES procurement_centres(id),
  queue_date DATE NOT NULL,
  token_number INTEGER NOT NULL,
  status queue_status DEFAULT 'waiting',
  called_at TIMESTAMPTZ,
  service_started_at TIMESTAMPTZ,
  service_ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS procurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  farmer_id UUID REFERENCES users(id),
  centre_id UUID REFERENCES procurement_centres(id),
  officer_id UUID REFERENCES users(id),
  crop_type VARCHAR(50) NOT NULL,
  quantity_kg NUMERIC(10,2) NOT NULL,
  msp_rate NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,  -- ALWAYS: (quantity_kg / 100) * msp_rate
  moisture_level NUMERIC(5,2),
  quality_grade VARCHAR(5) DEFAULT 'A',
  procurement_date DATE DEFAULT CURRENT_DATE,
  status procurement_status DEFAULT 'pending',
  officer_notes TEXT,
  rejection_reason TEXT,
  source VARCHAR(20) DEFAULT 'manual',  -- 'manual' | 'iot_weighbridge' | 'simulated'
  device_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  procurement_id UUID UNIQUE REFERENCES procurements(id),
  farmer_id UUID REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_date DATE,
  reference_number VARCHAR(50),
  bank_account_last4 CHAR(4),
  failure_reason TEXT,
  initiated_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS msp_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_type VARCHAR(50) NOT NULL,
  season VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  rate_per_quintal NUMERIC(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  UNIQUE(crop_type, season, year)
);

-- Feature tables
CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  procurement_id UUID REFERENCES procurements(id),
  centre_id UUID REFERENCES procurement_centres(id),
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status grievance_status DEFAULT 'open',
  priority VARCHAR(10) DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  sla_deadline TIMESTAMPTZ,  -- created_at + 72 hours
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grievance_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fpo_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  registration_number VARCHAR(50),
  district VARCHAR(100),
  state VARCHAR(100),
  leader_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fpo_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fpo_id UUID REFERENCES fpo_groups(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fpo_id, farmer_id)
);

CREATE TABLE IF NOT EXISTS slot_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id),
  slot_id UUID REFERENCES slots(id),
  crop_type VARCHAR(50),
  expected_kg NUMERIC(10,2),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farmer_id, slot_id)
);

CREATE TABLE IF NOT EXISTS crop_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  crop_type VARCHAR(50) NOT NULL,
  estimated_moisture NUMERIC(5,2),
  quality_grade VARCHAR(5),
  faq_compliant BOOLEAN,
  confidence_score NUMERIC(5,2),
  recommendation TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS msp_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id),
  crop_type VARCHAR(50) NOT NULL,
  msp_rate NUMERIC(10,2) NOT NULL,
  offer_rate NUMERIC(10,2),
  quantity_kg NUMERIC(10,2),
  saved_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS centre_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES procurement_centres(id),
  farmer_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES procurement_centres(id),
  author_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  forecast_date DATE NOT NULL,
  temperature_max NUMERIC(5,2),
  temperature_min NUMERIC(5,2),
  humidity_pct NUMERIC(5,2),
  rainfall_mm NUMERIC(6,2),
  condition VARCHAR(50),
  is_adverse BOOLEAN DEFAULT FALSE,
  advisory TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district, state, forecast_date)
);

CREATE TABLE IF NOT EXISTS demand_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES procurement_centres(id),
  forecast_date DATE NOT NULL,
  predicted_bookings INTEGER,
  predicted_quantity_kg NUMERIC(12,2),
  predicted_revenue NUMERIC(15,2),
  confidence_pct NUMERIC(5,2),
  actual_bookings INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(centre_id, forecast_date)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  actor_role VARCHAR(20),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmer_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id),
  flagged_by UUID REFERENCES users(id),
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  severity VARCHAR(10) DEFAULT 'warning',
  is_active BOOLEAN DEFAULT TRUE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  question_hi TEXT NOT NULL,
  answer_hi TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  question_pa TEXT, answer_pa TEXT,
  question_ta TEXT, answer_ta TEXT,
  question_te TEXT, answer_te TEXT,
  question_mr TEXT, answer_mr TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
