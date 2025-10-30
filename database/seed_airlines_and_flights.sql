-- Script para insertar aerolíneas y vuelos de prueba
-- Ejecutar en Supabase SQL Editor después de schema.sql y schema_extended.sql

-- Primero, crear las 5 aerolíneas principales de Colombia
INSERT INTO airlines (name, code, status, email) VALUES
    ('Avianca', 'AVA', 'activa', 'contacto@avianca.com'),
    ('LATAM Airlines Colombia', 'LCO', 'activa', 'contacto@latam.com'),
    ('Viva Air Colombia', 'VVC', 'activa', 'contacto@vivaair.com'),
    ('EasyFly', 'EFY', 'activa', 'contacto@easyfly.com.co'),
    ('Wingo', 'RPA', 'activa', 'contacto@wingo.com')
ON CONFLICT (name) DO UPDATE SET
    status = EXCLUDED.status,
    code = EXCLUDED.code;

-- Obtener IDs de aerolíneas
DO $$
DECLARE
    avianca_id UUID;
    latam_id UUID;
    viva_id UUID;
    easyfly_id UUID;
    wingo_id UUID;
    city_from VARCHAR(100);
    city_to VARCHAR(100);
    flight_date DATE;
    flight_time TIME;
    flight_category VARCHAR(20);
    base_price INTEGER;
    flight_id VARCHAR(50);
    i INTEGER;
    j INTEGER;
    categories VARCHAR[] := ARRAY['economico', 'normal', 'preferencial', 'premium'];
    cities VARCHAR[] := ARRAY['Bogotá', 'Medellín', 'Cali', 'Cartagena', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Cúcuta', 'Ibagué'];
    times TIME[] := ARRAY['06:00', '08:30', '11:00', '13:30', '16:00', '18:30', '21:00'];
    durations INTEGER[] := ARRAY[60, 75, 90, 105, 120];
BEGIN
    -- Obtener IDs de aerolíneas
    SELECT id INTO avianca_id FROM airlines WHERE code = 'AVA';
    SELECT id INTO latam_id FROM airlines WHERE code = 'LCO';
    SELECT id INTO viva_id FROM airlines WHERE code = 'VVC';
    SELECT id INTO easyfly_id FROM airlines WHERE code = 'EFY';
    SELECT id INTO wingo_id FROM airlines WHERE code = 'RPA';

    -- Generar vuelos para Avianca
    FOR i IN 1..30 LOOP
        -- Seleccionar ciudades aleatorias
        city_from := cities[1 + floor(random() * array_length(cities, 1))::int];
        LOOP
            city_to := cities[1 + floor(random() * array_length(cities, 1))::int];
            EXIT WHEN city_to != city_from;
        END LOOP;

        -- Fecha en los próximos 90 días
        flight_date := CURRENT_DATE + (floor(random() * 90)::int || ' days')::interval;
        flight_time := times[1 + floor(random() * array_length(times, 1))::int];
        flight_category := categories[1 + floor(random() * array_length(categories, 1))::int];
        
        -- Precios base según categoría
        CASE flight_category
            WHEN 'economico' THEN base_price := 180000 + floor(random() * 70000)::int;
            WHEN 'normal' THEN base_price := 280000 + floor(random() * 100000)::int;
            WHEN 'preferencial' THEN base_price := 420000 + floor(random() * 120000)::int;
            WHEN 'premium' THEN base_price := 650000 + floor(random() * 200000)::int;
        END CASE;

        flight_id := 'AVA-' || LPAD(i::text, 4, '0') || '-' || TO_CHAR(flight_date, 'YYYYMMDD');

        INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats)
        VALUES (
            flight_id,
            'Avianca',
            avianca_id,
            city_from,
            city_to,
            flight_date,
            flight_time,
            durations[1 + floor(random() * array_length(durations, 1))::int],
            base_price,
            flight_category,
            20 + floor(random() * 50)::int
        ) ON CONFLICT (id) DO UPDATE SET
            airline_id = EXCLUDED.airline_id,
            price_cop = EXCLUDED.price_cop,
            category = EXCLUDED.category;
    END LOOP;

    -- Generar vuelos para LATAM
    FOR i IN 1..30 LOOP
        city_from := cities[1 + floor(random() * array_length(cities, 1))::int];
        LOOP
            city_to := cities[1 + floor(random() * array_length(cities, 1))::int];
            EXIT WHEN city_to != city_from;
        END LOOP;

        flight_date := CURRENT_DATE + (floor(random() * 90)::int || ' days')::interval;
        flight_time := times[1 + floor(random() * array_length(times, 1))::int];
        flight_category := categories[1 + floor(random() * array_length(categories, 1))::int];
        
        CASE flight_category
            WHEN 'economico' THEN base_price := 200000 + floor(random() * 80000)::int;
            WHEN 'normal' THEN base_price := 300000 + floor(random() * 110000)::int;
            WHEN 'preferencial' THEN base_price := 450000 + floor(random() * 130000)::int;
            WHEN 'premium' THEN base_price := 680000 + floor(random() * 220000)::int;
        END CASE;

        flight_id := 'LCO-' || LPAD(i::text, 4, '0') || '-' || TO_CHAR(flight_date, 'YYYYMMDD');

        INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats)
        VALUES (
            flight_id,
            'LATAM Airlines Colombia',
            latam_id,
            city_from,
            city_to,
            flight_date,
            flight_time,
            durations[1 + floor(random() * array_length(durations, 1))::int],
            base_price,
            flight_category,
            20 + floor(random() * 50)::int
        ) ON CONFLICT (id) DO UPDATE SET
            airline_id = EXCLUDED.airline_id,
            price_cop = EXCLUDED.price_cop,
            category = EXCLUDED.category;
    END LOOP;

    -- Generar vuelos para Viva Air
    FOR i IN 1..30 LOOP
        city_from := cities[1 + floor(random() * array_length(cities, 1))::int];
        LOOP
            city_to := cities[1 + floor(random() * array_length(cities, 1))::int];
            EXIT WHEN city_to != city_from;
        END LOOP;

        flight_date := CURRENT_DATE + (floor(random() * 90)::int || ' days')::interval;
        flight_time := times[1 + floor(random() * array_length(times, 1))::int];
        flight_category := categories[1 + floor(random() * array_length(categories, 1))::int];
        
        CASE flight_category
            WHEN 'economico' THEN base_price := 150000 + floor(random() * 60000)::int;
            WHEN 'normal' THEN base_price := 240000 + floor(random() * 90000)::int;
            WHEN 'preferencial' THEN base_price := 380000 + floor(random() * 110000)::int;
            WHEN 'premium' THEN base_price := 580000 + floor(random() * 180000)::int;
        END CASE;

        flight_id := 'VVC-' || LPAD(i::text, 4, '0') || '-' || TO_CHAR(flight_date, 'YYYYMMDD');

        INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats)
        VALUES (
            flight_id,
            'Viva Air Colombia',
            viva_id,
            city_from,
            city_to,
            flight_date,
            flight_time,
            durations[1 + floor(random() * array_length(durations, 1))::int],
            base_price,
            flight_category,
            20 + floor(random() * 50)::int
        ) ON CONFLICT (id) DO UPDATE SET
            airline_id = EXCLUDED.airline_id,
            price_cop = EXCLUDED.price_cop,
            category = EXCLUDED.category;
    END LOOP;

    -- Generar vuelos para EasyFly
    FOR i IN 1..30 LOOP
        city_from := cities[1 + floor(random() * array_length(cities, 1))::int];
        LOOP
            city_to := cities[1 + floor(random() * array_length(cities, 1))::int];
            EXIT WHEN city_to != city_from;
        END LOOP;

        flight_date := CURRENT_DATE + (floor(random() * 90)::int || ' days')::interval;
        flight_time := times[1 + floor(random() * array_length(times, 1))::int];
        flight_category := categories[1 + floor(random() * array_length(categories, 1))::int];
        
        CASE flight_category
            WHEN 'economico' THEN base_price := 170000 + floor(random() * 65000)::int;
            WHEN 'normal' THEN base_price := 260000 + floor(random() * 95000)::int;
            WHEN 'preferencial' THEN base_price := 400000 + floor(random() * 115000)::int;
            WHEN 'premium' THEN base_price := 620000 + floor(random() * 190000)::int;
        END CASE;

        flight_id := 'EFY-' || LPAD(i::text, 4, '0') || '-' || TO_CHAR(flight_date, 'YYYYMMDD');

        INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats)
        VALUES (
            flight_id,
            'EasyFly',
            easyfly_id,
            city_from,
            city_to,
            flight_date,
            flight_time,
            durations[1 + floor(random() * array_length(durations, 1))::int],
            base_price,
            flight_category,
            20 + floor(random() * 50)::int
        ) ON CONFLICT (id) DO UPDATE SET
            airline_id = EXCLUDED.airline_id,
            price_cop = EXCLUDED.price_cop,
            category = EXCLUDED.category;
    END LOOP;

    -- Generar vuelos para Wingo
    FOR i IN 1..30 LOOP
        city_from := cities[1 + floor(random() * array_length(cities, 1))::int];
        LOOP
            city_to := cities[1 + floor(random() * array_length(cities, 1))::int];
            EXIT WHEN city_to != city_from;
        END LOOP;

        flight_date := CURRENT_DATE + (floor(random() * 90)::int || ' days')::interval;
        flight_time := times[1 + floor(random() * array_length(times, 1))::int];
        flight_category := categories[1 + floor(random() * array_length(categories, 1))::int];
        
        CASE flight_category
            WHEN 'economico' THEN base_price := 160000 + floor(random() * 62000)::int;
            WHEN 'normal' THEN base_price := 250000 + floor(random() * 92000)::int;
            WHEN 'preferencial' THEN base_price := 390000 + floor(random() * 112000)::int;
            WHEN 'premium' THEN base_price := 600000 + floor(random() * 185000)::int;
        END CASE;

        flight_id := 'RPA-' || LPAD(i::text, 4, '0') || '-' || TO_CHAR(flight_date, 'YYYYMMDD');

        INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats)
        VALUES (
            flight_id,
            'Wingo',
            wingo_id,
            city_from,
            city_to,
            flight_date,
            flight_time,
            durations[1 + floor(random() * array_length(durations, 1))::int],
            base_price,
            flight_category,
            20 + floor(random() * 50)::int
        ) ON CONFLICT (id) DO UPDATE SET
            airline_id = EXCLUDED.airline_id,
            price_cop = EXCLUDED.price_cop,
            category = EXCLUDED.category;
    END LOOP;

END $$;

-- Verificar inserción
SELECT 
    a.name as aerolinea,
    COUNT(f.id) as total_vuelos,
    MIN(f.price_cop) as precio_minimo,
    MAX(f.price_cop) as precio_maximo,
    COUNT(DISTINCT f.category) as categorias_distintas
FROM airlines a
LEFT JOIN flights f ON a.id = f.airline_id
WHERE a.status = 'activa'
GROUP BY a.name
ORDER BY a.name;

