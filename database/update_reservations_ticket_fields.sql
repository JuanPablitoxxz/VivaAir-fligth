-- Actualizar tabla reservations para incluir campos de ticket

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS gate VARCHAR(10);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS plane VARCHAR(100);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS estimated_arrival TIME;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS exact_departure_time TIME;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS qr_code TEXT;

