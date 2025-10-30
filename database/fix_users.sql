-- Script para corregir los usuarios si el login no funciona
-- Ejecuta esto en Supabase SQL Editor

-- Asegurar que la función sha256 existe
CREATE OR REPLACE FUNCTION sha256(text) RETURNS text AS $$
    SELECT encode(digest($1, 'sha256'), 'hex')
$$ LANGUAGE SQL;

-- Eliminar usuarios existentes si hay conflictos
DELETE FROM users WHERE email IN ('admin@vivaair.co', 'cajero@vivaair.co', 'cliente@vivaair.co');

-- Insertar usuarios con hashes correctos
INSERT INTO users (email, password_hash, role, name) VALUES
    ('admin@vivaair.co', sha256('admin123'), 'ADM', 'Administrador'),
    ('cajero@vivaair.co', sha256('cajero123'), 'CAJERO', 'Cajero Principal'),
    ('cliente@vivaair.co', sha256('cliente123'), 'CLIENTE', 'Cliente Demo');

-- Verificar que se crearon correctamente
SELECT 
    email, 
    role, 
    name,
    SUbstring(password_hash, 1, 10) || '...' as hash_preview,
    LENGTH(password_hash) as hash_length
FROM users
WHERE email IN ('admin@vivaair.co', 'cajero@vivaair.co', 'cliente@vivaair.co')
ORDER BY role;

