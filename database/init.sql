-- Script de inicialización simplificado para Supabase
--script Usa Supabase Auth para autenticación en lugar de password_hash

-- Insertar ciudades
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

-- Los usuarios se crearán mediante Supabase Auth
-- Se necesita crear usuarios manualmente en Supabase Auth con los roles correctos

