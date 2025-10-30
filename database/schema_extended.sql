-- Extensiones al schema para funcionalidades avanzadas

-- Tabla de empresas aéreas
CREATE TABLE IF NOT EXISTS airlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada', 'activa', 'inactiva')),
    certificate_url TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id)
);

-- Tabla de solicitudes de empresas (para workflow de aprobación)
CREATE TABLE IF NOT EXISTS airline_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_email VARCHAR(255) NOT NULL,
    certificate_pdf_url TEXT,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_revision', 'aprobada', 'rechazada')),
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actualizar tabla flights para incluir aerolínea
ALTER TABLE flights ADD COLUMN IF NOT EXISTS airline_id UUID REFERENCES airlines(id);
ALTER TABLE flights ADD COLUMN IF NOT EXISTS available_seats INTEGER DEFAULT 50;

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('tarjeta', 'efectivo', 'transferencia_qr', 'transferencia')),
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completado', 'cancelado', 'reembolsado')),
    transaction_id VARCHAR(255),
    processed_by UUID REFERENCES users(id),
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount INTEGER NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actualizar tabla reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendiente' 
    CHECK (status IN ('pendiente', 'confirmada', 'cancelada', 'completada'));
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS ticket_number VARCHAR(50) UNIQUE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_airlines_status ON airlines(status);
CREATE INDEX IF NOT EXISTS idx_airline_requests_status ON airline_requests(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_reservation_id ON invoices(reservation_id);

-- Función para generar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'VA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
           UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'FAC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
           LPAD(NEXTVAL('invoice_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Secuencia para números de factura
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

