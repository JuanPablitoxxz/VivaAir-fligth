-- Script completo para corregir usuarios y asegurar que funcionen
-- Ejecuta esto en Supabase SQL Editor

-- 1. Eliminar usuarios existentes si hay conflictos
DELETE FROM users WHERE email IN ('admin@vivaair.co', 'cajero@vivaair.co', 'cliente@vivaair.co');

-- 2. Asegurar que la función sha256 existe y funciona
CREATE OR REPLACE FUNCTION sha256(text) RETURNS text AS $$
    SELECT encode(digest($1, 'sha256'), 'hex')
$$ LANGUAGE SQL;

-- 3. Insertar usuarios con hashes correctos
INSERT INTO users (email, password_hash, role, name) VALUES
    ('admin@vivaair.co', sha256('admin123'), 'ADM', 'Administrador'),
    ('cajero@vivaair.co', sha256('cajero123'), 'CAJERO', 'Cajero Principal'),
    ('cliente@vivaair.co', sha256('cliente123'), 'CLIENTE', 'Cliente Demo');

-- 4. Verificar que se crearon correctamente con los hashes
SELECT 
    email, 
    role, 
    name,
    SUBSTRING(password_hash, 1, 20) || '...' as hash_preview,
    LENGTH(password_hash) as hash_length,
    CASE 
        WHEN password_hash = sha256('admin123') AND email = 'admin@vivaair.co' THEN '✓ Hash correcto'
        WHEN password_hash = sha256('cajero123') AND email = 'cajero@vivaair.co' THEN '✓ Hash correcto'
        WHEN password_hash = sha256('cliente123') AND email = 'cliente@vivaair.co' THEN '✓ Hash correcto'
        ELSE '✗ Hash incorrecto'
    END as hash_status
FROM users
WHERE email IN ('admin@vivaair.co', 'cajero@vivaair.co', 'cliente@vivaair.co')
ORDER BY role;

-- 5. Mostrar los hashes esperados para comparar (solo para debugging)
SELECT 
    'admin123' as password,
    sha256('admin123') as expected_hash,
    (SELECT password_hash FROM users WHERE email = 'admin@vivaair.co') as stored_hash,
    CASE 
        WHEN sha256('admin123') = (SELECT password_hash FROM users WHERE email = 'admin@vivaair.co') 
        THEN '✓ Coinciden' 
        ELSE '✗ No coinciden' 
    END as match_status
UNION ALL
SELECT 
    'cajero123',
    sha256('cajero123'),
    (SELECT password_hash FROM users WHERE email = 'cajero@vivaair.co'),
    CASE 
        WHEN sha256('cajero123') = (SELECT password_hash FROM users WHERE email = 'cajero@vivaair.co') 
        THEN '✓ Coinciden' 
        ELSE '✗ No coinciden' 
    END
UNION ALL
SELECT 
    'cliente123',
    sha256('cliente123'),
    (SELECT password_hash FROM users WHERE email = 'cliente@vivaair.co'),
    CASE 
        WHEN sha256('cliente123') = (SELECT password_hash FROM users WHERE email = 'cliente@vivaair.co') 
        THEN '✓ Coinciden' 
        ELSE '✗ No coinciden' 
    END;

