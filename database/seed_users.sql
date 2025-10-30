-- Script para insertar usuarios de prueba en Supabase
-- Los passwords están hasheados con SHA-256 (simple para demo)
-- En producción usar bcrypt o Supabase Auth

-- NOTA: Ejecuta este script en el SQL Editor de Supabase después de crear las tablas

-- Función para generar hash SHA-256 en PostgreSQL
CREATE OR REPLACE FUNCTION sha256(text) RETURNS text AS $$
    SELECT encode(digest($1, 'sha256'), 'hex')
$$ LANGUAGE SQL;

-- Insertar usuarios de prueba
-- Password: admin123 -> hash SHA-256
INSERT INTO users (email, password_hash, role, name) VALUES
    ('admin@vivaair.co', sha256('admin123'), 'ADM', 'Administrador'),
    ('cajero@vivaair.co', sha256('cajero123'), 'CAJERO', 'Cajero Principal'),
    ('cliente@vivaair.co', sha256('cliente123'), 'CLIENTE', 'Cliente Demo')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    name = EXCLUDED.name;

-- Verificar usuarios creados
SELECT id, email, role, name, created_at FROM users;

