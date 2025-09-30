-- Migration: Events System
-- Description: Creates tables for events and event RSVPs with capacity tracking and payment support
-- Created: 2025-09-29

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  host TEXT NOT NULL,
  external_rsvp_url TEXT,
  image TEXT,
  tags TEXT[],
  capacity INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_intent_id TEXT,
  guest_name TEXT,
  guest_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_event_user_rsvp UNIQUE(event_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON event_rsvps(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_event_rsvps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER events_updated_at_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

CREATE TRIGGER event_rsvps_updated_at_trigger
  BEFORE UPDATE ON event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_event_rsvps_updated_at();

-- Add comments for documentation
COMMENT ON TABLE events IS 'Stores all events hosted at the coworking space';
COMMENT ON TABLE event_rsvps IS 'Stores RSVP records for events with capacity and payment tracking';
COMMENT ON COLUMN events.capacity IS 'Maximum number of attendees (NULL means unlimited)';
COMMENT ON COLUMN events.price IS 'Event ticket price in dollars (0 for free events)';
COMMENT ON COLUMN event_rsvps.status IS 'RSVP status: confirmed, cancelled, or waitlist';
COMMENT ON COLUMN event_rsvps.payment_status IS 'Payment status for paid events: pending, paid, or refunded';
COMMENT ON COLUMN event_rsvps.guest_name IS 'Name for guest (non-registered user) RSVPs';
COMMENT ON COLUMN event_rsvps.guest_email IS 'Email for guest (non-registered user) RSVPs';