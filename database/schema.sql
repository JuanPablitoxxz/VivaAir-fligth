-- VivaAir Database Schema for Supabase (PostgreSQL)

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADM', 'CLIENTE', 'CAJERO')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ciudades
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(3) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vuelos
CREATE TABLE IF NOT EXISTS flights (
    id VARCHAR(50) PRIMARY KEY,
    airline VARCHAR(100) NOT NULL,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration_min INTEGER NOT NULL,
    price_cop INTEGER NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('economico', 'normal', 'preferencial', 'premium')),
    available_seats INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    flight_id VARCHAR(50) REFERENCES flights(id) ON DELETE CASCADE,
    passengers INTEGER NOT NULL DEFAULT 1,
    total_price INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(date);
CREATE INDEX IF NOT EXISTS idx_flights_from_to ON flights(from_city, to_city);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_flight_id ON reservations(flight_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar ciudades de Colombia
INSERT INTO cities (name, code) VALUES
    ('Bogotá', 'BOG'),
    ('Medellín', 'MDE'),
    ('Cali', 'CLO'),
    ('Barranquilla', 'BAQ'),
    ('Cartagena', 'CTG'),
    ('Bucaramanga', 'BGA'),
    ('Pereira', 'PEI'),
    ('Santa Marta', 'SMR'),
    ('Cúcuta', 'CUC'),
    ('Ibagué', 'IBE')
ON CONFLICT (name) DO NOTHING;

-- NOTA: Los usuarios se crearán usando Supabase Auth o mediante la API de registro
-- Para crear usuarios de prueba manualmente, ejecutar en la consola SQL de Supabase:
-- INSERT INTO users (email, password_hash, role, name) VALUES
--     ('admin@vivaair.co', '$2b$10$...', 'ADM', 'Administrador');
