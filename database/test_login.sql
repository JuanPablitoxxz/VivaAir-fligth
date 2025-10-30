-- Script de prueba para verificar los hashes de passwords
-- Ejecuta esto en Supabase SQL Editor para ver los hashes

-- Función SHA-256
CREATE OR REPLACE FUNCTION sha256(text) RETURNS text AS $$
    SELECT encode(digest($1, 'sha256'), 'hex')
$$ LANGUAGE SQL;

-- Ver los hashes de los passwords de prueba
SELECT 
    email,
    role,
    password_hash,
    sha256('admin123') as admin123_hash,
    sha256('cajero123') as cajero123_hash,
    sha256('cliente123') as cliente123_hash
FROM users;

-- Si los hashes no coinciden, actualiza los usuarios:
UPDATE users 
SET password_hash = sha256('admin123') 
WHERE email = 'admin@vivaair.co';

UPDATE users 
SET password_hash = sha256('cajero123') 
WHERE email = 'cajero@vivaair.co';

UPDATE users 
SET password_hash = sha256('cliente123') 
WHERE email = 'cliente@vivaair.co';

-- Verificar usuarios actualizados
SELECT id, email, role, name, password_hash FROM users;

