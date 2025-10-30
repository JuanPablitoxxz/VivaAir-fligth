-- Crear 5 aerolíneas para VivaAir

-- Primero, asegurar que las aerolíneas estén activas
INSERT INTO airlines (name, code, email, status) VALUES
    ('Avianca', 'AVA', 'contacto@avianca.com', 'activa'),
    ('LATAM', 'LAN', 'contacto@latam.com', 'activa'),
    ('Wingo', 'R5', 'contacto@wingo.com', 'activa'),
    ('JetSMART', 'JA', 'contacto@jetsmart.com', 'activa'),
    ('EasyFly', 'VE', 'contacto@easyfly.com', 'activa')
ON CONFLICT (name) DO UPDATE SET
    status = 'activa',
    code = EXCLUDED.code,
    email = EXCLUDED.email;

-- Obtener los IDs de las aerolíneas creadas
DO $$
DECLARE
    avianca_id UUID;
    latam_id UUID;
    wingo_id UUID;
    jetsmart_id UUID;
    easyfly_id UUID;
BEGIN
    -- Obtener IDs
    SELECT id INTO avianca_id FROM airlines WHERE name = 'Avianca';
    SELECT id INTO latam_id FROM airlines WHERE name = 'LATAM';
    SELECT id INTO wingo_id FROM airlines WHERE name = 'Wingo';
    SELECT id INTO jetsmart_id FROM airlines WHERE name = 'JetSMART';
    SELECT id INTO easyfly_id FROM airlines WHERE name = 'EasyFly';
    
    -- Insertar 30 vuelos para Avianca (variedad de rutas, precios y categorías)
    INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats) VALUES
    ('AVA-001', 'Avianca', avianca_id, 'Bogotá', 'Medellín', '2025-03-11', '06:00', 65, 450000, 'premium', 15),
    ('AVA-002', 'Avianca', avianca_id, 'Bogotá', 'Medellín', '2025-03-11', '09:30', 65, 380000, 'preferencial', 20),
    ('AVA-003', 'Avianca', avianca_id, 'Bogotá', 'Medellín', '2025-03-11', '12:15', 70, 320000, 'normal', 25),
    ('AVA-004', 'Avianca', avianca_id, 'Bogotá', 'Medellín', '2025-03-11', '15:45', 65, 280000, 'economico', 30),
    ('AVA-005', 'Avianca', avianca_id, 'Bogotá', 'Medellín', '2025-03-11', '18:20', 70, 320000, 'normal', 28),
    ('AVA-006', 'Avianca', avianca_id, 'Bogotá', 'Cartagena', '2025-03-11', '07:00', 90, 520000, 'premium', 12),
    ('AVA-007', 'Avianca', avianca_id, 'Bogotá', 'Cartagena', '2025-03-11', '10:30', 95, 420000, 'preferencial', 18),
    ('AVA-008', 'Avianca', avianca_id, 'Bogotá', 'Cartagena', '2025-03-11', '14:00', 90, 350000, 'normal', 22),
    ('AVA-009', 'Avianca', avianca_id, 'Bogotá', 'Cartagena', '2025-03-11', '17:30', 95, 300000, 'economico', 35),
    ('AVA-010', 'Avianca', avianca_id, 'Bogotá', 'Cali', '2025-03-11', '08:15', 75, 480000, 'premium', 14),
    ('AVA-011', 'Avianca', avianca_id, 'Bogotá', 'Cali', '2025-03-11', '11:45', 80, 400000, 'preferencial', 19),
    ('AVA-012', 'Avianca', avianca_id, 'Bogotá', 'Cali', '2025-03-11', '16:00', 75, 330000, 'normal', 24),
    ('AVA-013', 'Avianca', avianca_id, 'Bogotá', 'Cali', '2025-03-11', '19:30', 80, 290000, 'economico', 32),
    ('AVA-014', 'Avianca', avianca_id, 'Medellín', 'Bogotá', '2025-03-12', '05:30', 60, 460000, 'premium', 13),
    ('AVA-015', 'Avianca', avianca_id, 'Medellín', 'Bogotá', '2025-03-12', '09:00', 65, 390000, 'preferencial', 21),
    ('AVA-016', 'Avianca', avianca_id, 'Medellín', 'Cartagena', '2025-03-12', '07:30', 85, 510000, 'premium', 16),
    ('AVA-017', 'Avianca', avianca_id, 'Medellín', 'Cartagena', '2025-03-12', '13:00', 90, 410000, 'preferencial', 17),
    ('AVA-018', 'Avianca', avianca_id, 'Cartagena', 'Bogotá', '2025-03-12', '08:00', 90, 530000, 'premium', 11),
    ('AVA-019', 'Avianca', avianca_id, 'Cartagena', 'Bogotá', '2025-03-12', '12:30', 95, 430000, 'preferencial', 20),
    ('AVA-020', 'Avianca', avianca_id, 'Cali', 'Bogotá', '2025-03-12', '06:45', 75, 490000, 'premium', 15),
    ('AVA-021', 'Avianca', avianca_id, 'Cali', 'Bogotá', '2025-03-12', '11:15', 80, 410000, 'preferencial', 18),
    ('AVA-022', 'Avianca', avianca_id, 'Bogotá', 'Barranquilla', '2025-03-13', '08:30', 85, 470000, 'premium', 14),
    ('AVA-023', 'Avianca', avianca_id, 'Bogotá', 'Barranquilla', '2025-03-13', '14:00', 90, 380000, 'preferencial', 22),
    ('AVA-024', 'Avianca', avianca_id, 'Bogotá', 'Santa Marta', '2025-03-13', '09:00', 88, 485000, 'premium', 13),
    ('AVA-025', 'Avianca', avianca_id, 'Bogotá', 'Santa Marta', '2025-03-13', '15:30', 92, 395000, 'preferencial', 19),
    ('AVA-026', 'Avianca', avianca_id, 'Medellín', 'Cali', '2025-03-13', '10:00', 70, 440000, 'premium', 16),
    ('AVA-027', 'Avianca', avianca_id, 'Medellín', 'Cali', '2025-03-13', '16:30', 75, 360000, 'normal', 23),
    ('AVA-028', 'Avianca', avianca_id, 'Cartagena', 'Medellín', '2025-03-14', '07:45', 82, 500000, 'premium', 12),
    ('AVA-029', 'Avianca', avianca_id, 'Cartagena', 'Medellín', '2025-03-14', '13:15', 87, 405000, 'preferencial', 21),
    ('AVA-030', 'Avianca', avianca_id, 'Cali', 'Medellín', '2025-03-14', '09:30', 72, 455000, 'premium', 17)
    ON CONFLICT (id) DO NOTHING;

    -- Insertar 30 vuelos para LATAM
    INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats) VALUES
    ('LAN-001', 'LATAM', latam_id, 'Bogotá', 'Medellín', '2025-03-11', '06:30', 63, 440000, 'premium', 16),
    ('LAN-002', 'LATAM', latam_id, 'Bogotá', 'Medellín', '2025-03-11', '10:00', 65, 370000, 'preferencial', 19),
    ('LAN-003', 'LATAM', latam_id, 'Bogotá', 'Medellín', '2025-03-11', '13:30', 68, 310000, 'normal', 26),
    ('LAN-004', 'LATAM', latam_id, 'Bogotá', 'Medellín', '2025-03-11', '17:00', 63, 270000, 'economico', 33),
    ('LAN-005', 'LATAM', latam_id, 'Bogotá', 'Medellín', '2025-03-11', '20:30', 68, 310000, 'normal', 27),
    ('LAN-006', 'LATAM', latam_id, 'Bogotá', 'Cartagena', '2025-03-11', '07:30', 88, 510000, 'premium', 13),
    ('LAN-007', 'LATAM', latam_id, 'Bogotá', 'Cartagena', '2025-03-11', '11:00', 93, 410000, 'preferencial', 20),
    ('LAN-008', 'LATAM', latam_id, 'Bogotá', 'Cartagena', '2025-03-11', '14:30', 88, 340000, 'normal', 25),
    ('LAN-009', 'LATAM', latam_id, 'Bogotá', 'Cartagena', '2025-03-11', '18:00', 93, 295000, 'economico', 38),
    ('LAN-010', 'LATAM', latam_id, 'Bogotá', 'Cali', '2025-03-11', '08:45', 73, 470000, 'premium', 15),
    ('LAN-011', 'LATAM', latam_id, 'Bogotá', 'Cali', '2025-03-11', '12:15', 78, 390000, 'preferencial', 22),
    ('LAN-012', 'LATAM', latam_id, 'Bogotá', 'Cali', '2025-03-11', '16:30', 73, 320000, 'normal', 28),
    ('LAN-013', 'LATAM', latam_id, 'Bogotá', 'Cali', '2025-03-11', '20:00', 78, 285000, 'economico', 35),
    ('LAN-014', 'LATAM', latam_id, 'Medellín', 'Bogotá', '2025-03-12', '05:45', 58, 450000, 'premium', 14),
    ('LAN-015', 'LATAM', latam_id, 'Medellín', 'Bogotá', '2025-03-12', '09:15', 63, 380000, 'preferencial', 23),
    ('LAN-016', 'LATAM', latam_id, 'Medellín', 'Cartagena', '2025-03-12', '07:45', 83, 500000, 'premium', 17),
    ('LAN-017', 'LATAM', latam_id, 'Medellín', 'Cartagena', '2025-03-12', '13:15', 88, 400000, 'preferencial', 19),
    ('LAN-018', 'LATAM', latam_id, 'Cartagena', 'Bogotá', '2025-03-12', '08:15', 88, 520000, 'premium', 12),
    ('LAN-019', 'LATAM', latam_id, 'Cartagena', 'Bogotá', '2025-03-12', '12:45', 93, 420000, 'preferencial', 22),
    ('LAN-020', 'LATAM', latam_id, 'Cali', 'Bogotá', '2025-03-12', '07:00', 73, 480000, 'premium', 16),
    ('LAN-021', 'LATAM', latam_id, 'Cali', 'Bogotá', '2025-03-12', '11:30', 78, 400000, 'preferencial', 21),
    ('LAN-022', 'LATAM', latam_id, 'Bogotá', 'Barranquilla', '2025-03-13', '08:45', 83, 460000, 'premium', 15),
    ('LAN-023', 'LATAM', latam_id, 'Bogotá', 'Barranquilla', '2025-03-13', '14:15', 88, 375000, 'preferencial', 24),
    ('LAN-024', 'LATAM', latam_id, 'Bogotá', 'Santa Marta', '2025-03-13', '09:15', 86, 475000, 'premium', 14),
    ('LAN-025', 'LATAM', latam_id, 'Bogotá', 'Santa Marta', '2025-03-13', '15:45', 90, 385000, 'preferencial', 20),
    ('LAN-026', 'LATAM', latam_id, 'Medellín', 'Cali', '2025-03-13', '10:15', 68, 430000, 'premium', 18),
    ('LAN-027', 'LATAM', latam_id, 'Medellín', 'Cali', '2025-03-13', '16:45', 73, 355000, 'normal', 26),
    ('LAN-028', 'LATAM', latam_id, 'Cartagena', 'Medellín', '2025-03-14', '08:00', 80, 490000, 'premium', 13),
    ('LAN-029', 'LATAM', latam_id, 'Cartagena', 'Medellín', '2025-03-14', '13:30', 85, 395000, 'preferencial', 23),
    ('LAN-030', 'LATAM', latam_id, 'Cali', 'Medellín', '2025-03-14', '09:45', 70, 445000, 'premium', 18)
    ON CONFLICT (id) DO NOTHING;

    -- Insertar 30 vuelos para Wingo
    INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats) VALUES
    ('R5-001', 'Wingo', wingo_id, 'Bogotá', 'Medellín', '2025-03-11', '05:45', 63, 420000, 'premium', 18),
    ('R5-002', 'Wingo', wingo_id, 'Bogotá', 'Medellín', '2025-03-11', '09:15', 65, 350000, 'preferencial', 22),
    ('R5-003', 'Wingo', wingo_id, 'Bogotá', 'Medellín', '2025-03-11', '12:45', 68, 290000, 'normal', 30),
    ('R5-004', 'Wingo', wingo_id, 'Bogotá', 'Medellín', '2025-03-11', '16:15', 63, 250000, 'economico', 40),
    ('R5-005', 'Wingo', wingo_id, 'Bogotá', 'Medellín', '2025-03-11', '19:45', 68, 290000, 'normal', 32),
    ('R5-006', 'Wingo', wingo_id, 'Bogotá', 'Cartagena', '2025-03-11', '06:45', 86, 490000, 'premium', 16),
    ('R5-007', 'Wingo', wingo_id, 'Bogotá', 'Cartagena', '2025-03-11', '10:15', 91, 390000, 'preferencial', 24),
    ('R5-008', 'Wingo', wingo_id, 'Bogotá', 'Cartagena', '2025-03-11', '13:45', 86, 320000, 'normal', 30),
    ('R5-009', 'Wingo', wingo_id, 'Bogotá', 'Cartagena', '2025-03-11', '17:15', 91, 280000, 'economico', 42),
    ('R5-010', 'Wingo', wingo_id, 'Bogotá', 'Cali', '2025-03-11', '07:45', 71, 450000, 'premium', 17),
    ('R5-011', 'Wingo', wingo_id, 'Bogotá', 'Cali', '2025-03-11', '11:15', 76, 370000, 'preferencial', 25),
    ('R5-012', 'Wingo', wingo_id, 'Bogotá', 'Cali', '2025-03-11', '15:45', 71, 300000, 'normal', 33),
    ('R5-013', 'Wingo', wingo_id, 'Bogotá', 'Cali', '2025-03-11', '19:15', 76, 265000, 'economico', 38),
    ('R5-014', 'Wingo', wingo_id, 'Medellín', 'Bogotá', '2025-03-12', '05:15', 56, 430000, 'premium', 15),
    ('R5-015', 'Wingo', wingo_id, 'Medellín', 'Bogotá', '2025-03-12', '08:45', 61, 360000, 'preferencial', 26),
    ('R5-016', 'Wingo', wingo_id, 'Medellín', 'Cartagena', '2025-03-12', '06:15', 81, 480000, 'premium', 19),
    ('R5-017', 'Wingo', wingo_id, 'Medellín', 'Cartagena', '2025-03-12', '11:45', 86, 380000, 'preferencial', 22),
    ('R5-018', 'Wingo', wingo_id, 'Cartagena', 'Bogotá', '2025-03-12', '07:30', 86, 500000, 'premium', 13),
    ('R5-019', 'Wingo', wingo_id, 'Cartagena', 'Bogotá', '2025-03-12', '12:00', 91, 400000, 'preferencial', 25),
    ('R5-020', 'Wingo', wingo_id, 'Cali', 'Bogotá', '2025-03-12', '06:30', 71, 460000, 'premium', 17),
    ('R5-021', 'Wingo', wingo_id, 'Cali', 'Bogotá', '2025-03-12', '11:00', 76, 380000, 'preferencial', 24),
    ('R5-022', 'Wingo', wingo_id, 'Bogotá', 'Barranquilla', '2025-03-13', '08:00', 81, 440000, 'premium', 16),
    ('R5-023', 'Wingo', wingo_id, 'Bogotá', 'Barranquilla', '2025-03-13', '13:30', 86, 360000, 'preferencial', 27),
    ('R5-024', 'Wingo', wingo_id, 'Bogotá', 'Santa Marta', '2025-03-13', '08:30', 84, 455000, 'premium', 15),
    ('R5-025', 'Wingo', wingo_id, 'Bogotá', 'Santa Marta', '2025-03-13', '15:00', 88, 370000, 'preferencial', 23),
    ('R5-026', 'Wingo', wingo_id, 'Medellín', 'Cali', '2025-03-13', '09:00', 66, 410000, 'premium', 20),
    ('R5-027', 'Wingo', wingo_id, 'Medellín', 'Cali', '2025-03-13', '15:30', 71, 340000, 'normal', 29),
    ('R5-028', 'Wingo', wingo_id, 'Cartagena', 'Medellín', '2025-03-14', '07:15', 78, 470000, 'premium', 14),
    ('R5-029', 'Wingo', wingo_id, 'Cartagena', 'Medellín', '2025-03-14', '12:45', 83, 380000, 'preferencial', 26),
    ('R5-030', 'Wingo', wingo_id, 'Cali', 'Medellín', '2025-03-14', '08:45', 68, 425000, 'premium', 19)
    ON CONFLICT (id) DO NOTHING;

    -- Insertar 30 vuelos para JetSMART
    INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats) VALUES
    ('JA-001', 'JetSMART', jetsmart_id, 'Bogotá', 'Medellín', '2025-03-11', '06:15', 64, 435000, 'premium', 17),
    ('JA-002', 'JetSMART', jetsmart_id, 'Bogotá', 'Medellín', '2025-03-11', '09:45', 66, 365000, 'preferencial', 21),
    ('JA-003', 'JetSMART', jetsmart_id, 'Bogotá', 'Medellín', '2025-03-11', '13:15', 69, 305000, 'normal', 29),
    ('JA-004', 'JetSMART', jetsmart_id, 'Bogotá', 'Medellín', '2025-03-11', '16:45', 64, 265000, 'economico', 37),
    ('JA-005', 'JetSMART', jetsmart_id, 'Bogotá', 'Medellín', '2025-03-11', '20:15', 69, 305000, 'normal', 31),
    ('JA-006', 'JetSMART', jetsmart_id, 'Bogotá', 'Cartagena', '2025-03-11', '07:15', 87, 505000, 'premium', 14),
    ('JA-007', 'JetSMART', jetsmart_id, 'Bogotá', 'Cartagena', '2025-03-11', '10:45', 92, 405000, 'preferencial', 21),
    ('JA-008', 'JetSMART', jetsmart_id, 'Bogotá', 'Cartagena', '2025-03-11', '14:15', 87, 335000, 'normal', 28),
    ('JA-009', 'JetSMART', jetsmart_id, 'Bogotá', 'Cartagena', '2025-03-11', '17:45', 92, 290000, 'economico', 40),
    ('JA-010', 'JetSMART', jetsmart_id, 'Bogotá', 'Cali', '2025-03-11', '08:15', 72, 465000, 'premium', 16),
    ('JA-011', 'JetSMART', jetsmart_id, 'Bogotá', 'Cali', '2025-03-11', '11:45', 77, 385000, 'preferencial', 23),
    ('JA-012', 'JetSMART', jetsmart_id, 'Bogotá', 'Cali', '2025-03-11', '15:15', 72, 315000, 'normal', 31),
    ('JA-013', 'JetSMART', jetsmart_id, 'Bogotá', 'Cali', '2025-03-11', '18:45', 77, 275000, 'economico', 36),
    ('JA-014', 'JetSMART', jetsmart_id, 'Medellín', 'Bogotá', '2025-03-12', '05:45', 59, 445000, 'premium', 15),
    ('JA-015', 'JetSMART', jetsmart_id, 'Medellín', 'Bogotá', '2025-03-12', '09:15', 64, 375000, 'preferencial', 24),
    ('JA-016', 'JetSMART', jetsmart_id, 'Medellín', 'Cartagena', '2025-03-12', '07:00', 82, 495000, 'premium', 18),
    ('JA-017', 'JetSMART', jetsmart_id, 'Medellín', 'Cartagena', '2025-03-12', '12:30', 87, 395000, 'preferencial', 20),
    ('JA-018', 'JetSMART', jetsmart_id, 'Cartagena', 'Bogotá', '2025-03-12', '08:00', 87, 515000, 'premium', 12),
    ('JA-019', 'JetSMART', jetsmart_id, 'Cartagena', 'Bogotá', '2025-03-12', '12:30', 92, 415000, 'preferencial', 23),
    ('JA-020', 'JetSMART', jetsmart_id, 'Cali', 'Bogotá', '2025-03-12', '07:15', 72, 475000, 'premium', 16),
    ('JA-021', 'JetSMART', jetsmart_id, 'Cali', 'Bogotá', '2025-03-12', '11:45', 77, 395000, 'preferencial', 22),
    ('JA-022', 'JetSMART', jetsmart_id, 'Bogotá', 'Barranquilla', '2025-03-13', '08:45', 82, 465000, 'premium', 15),
    ('JA-023', 'JetSMART', jetsmart_id, 'Bogotá', 'Barranquilla', '2025-03-13', '14:15', 87, 380000, 'preferencial', 25),
    ('JA-024', 'JetSMART', jetsmart_id, 'Bogotá', 'Santa Marta', '2025-03-13', '09:15', 85, 480000, 'premium', 14),
    ('JA-025', 'JetSMART', jetsmart_id, 'Bogotá', 'Santa Marta', '2025-03-13', '15:45', 89, 390000, 'preferencial', 21),
    ('JA-026', 'JetSMART', jetsmart_id, 'Medellín', 'Cali', '2025-03-13', '10:30', 69, 435000, 'premium', 19),
    ('JA-027', 'JetSMART', jetsmart_id, 'Medellín', 'Cali', '2025-03-13', '17:00', 74, 360000, 'normal', 27),
    ('JA-028', 'JetSMART', jetsmart_id, 'Cartagena', 'Medellín', '2025-03-14', '08:30', 79, 485000, 'premium', 13),
    ('JA-029', 'JetSMART', jetsmart_id, 'Cartagena', 'Medellín', '2025-03-14', '13:00', 84, 390000, 'preferencial', 24),
    ('JA-030', 'JetSMART', jetsmart_id, 'Cali', 'Medellín', '2025-03-14', '09:15', 71, 440000, 'premium', 17)
    ON CONFLICT (id) DO NOTHING;

    -- Insertar 30 vuelos para EasyFly
    INSERT INTO flights (id, airline, airline_id, from_city, to_city, date, time, duration_min, price_cop, category, available_seats) VALUES
    ('VE-001', 'EasyFly', easyfly_id, 'Bogotá', 'Medellín', '2025-03-11', '07:00', 66, 410000, 'premium', 19),
    ('VE-002', 'EasyFly', easyfly_id, 'Bogotá', 'Medellín', '2025-03-11', '10:30', 68, 340000, 'preferencial', 24),
    ('VE-003', 'EasyFly', easyfly_id, 'Bogotá', 'Medellín', '2025-03-11', '14:00', 71, 285000, 'normal', 32),
    ('VE-004', 'EasyFly', easyfly_id, 'Bogotá', 'Medellín', '2025-03-11', '17:30', 66, 245000, 'economico', 43),
    ('VE-005', 'EasyFly', easyfly_id, 'Bogotá', 'Medellín', '2025-03-11', '21:00', 71, 285000, 'normal', 35),
    ('VE-006', 'EasyFly', easyfly_id, 'Bogotá', 'Cartagena', '2025-03-11', '08:00', 89, 480000, 'premium', 17),
    ('VE-007', 'EasyFly', easyfly_id, 'Bogotá', 'Cartagena', '2025-03-11', '11:30', 94, 380000, 'preferencial', 25),
    ('VE-008', 'EasyFly', easyfly_id, 'Bogotá', 'Cartagena', '2025-03-11', '15:00', 89, 315000, 'normal', 34),
    ('VE-009', 'EasyFly', easyfly_id, 'Bogotá', 'Cartagena', '2025-03-11', '18:30', 94, 275000, 'economico', 45),
    ('VE-010', 'EasyFly', easyfly_id, 'Bogotá', 'Cali', '2025-03-11', '09:00', 74, 440000, 'premium', 18),
    ('VE-011', 'EasyFly', easyfly_id, 'Bogotá', 'Cali', '2025-03-11', '12:30', 79, 360000, 'preferencial', 26),
    ('VE-012', 'EasyFly', easyfly_id, 'Bogotá', 'Cali', '2025-03-11', '16:00', 74, 295000, 'normal', 36),
    ('VE-013', 'EasyFly', easyfly_id, 'Bogotá', 'Cali', '2025-03-11', '19:30', 79, 260000, 'economico', 41),
    ('VE-014', 'EasyFly', easyfly_id, 'Medellín', 'Bogotá', '2025-03-12', '06:00', 61, 420000, 'premium', 16),
    ('VE-015', 'EasyFly', easyfly_id, 'Medellín', 'Bogotá', '2025-03-12', '09:30', 66, 350000, 'preferencial', 27),
    ('VE-016', 'EasyFly', easyfly_id, 'Medellín', 'Cartagena', '2025-03-12', '07:15', 83, 470000, 'premium', 20),
    ('VE-017', 'EasyFly', easyfly_id, 'Medellín', 'Cartagena', '2025-03-12', '12:45', 88, 370000, 'preferencial', 23),
    ('VE-018', 'EasyFly', easyfly_id, 'Cartagena', 'Bogotá', '2025-03-12', '08:30', 89, 490000, 'premium', 14),
    ('VE-019', 'EasyFly', easyfly_id, 'Cartagena', 'Bogotá', '2025-03-12', '13:00', 94, 390000, 'preferencial', 26),
    ('VE-020', 'EasyFly', easyfly_id, 'Cali', 'Bogotá', '2025-03-12', '07:45', 74, 450000, 'premium', 18),
    ('VE-021', 'EasyFly', easyfly_id, 'Cali', 'Bogotá', '2025-03-12', '12:15', 79, 370000, 'preferencial', 25),
    ('VE-022', 'EasyFly', easyfly_id, 'Bogotá', 'Barranquilla', '2025-03-13', '09:30', 84, 430000, 'premium', 17),
    ('VE-023', 'EasyFly', easyfly_id, 'Bogotá', 'Barranquilla', '2025-03-13', '15:00', 89, 350000, 'preferencial', 28),
    ('VE-024', 'EasyFly', easyfly_id, 'Bogotá', 'Santa Marta', '2025-03-13', '10:00', 87, 445000, 'premium', 16),
    ('VE-025', 'EasyFly', easyfly_id, 'Bogotá', 'Santa Marta', '2025-03-13', '16:30', 91, 365000, 'preferencial', 24),
    ('VE-026', 'EasyFly', easyfly_id, 'Medellín', 'Cali', '2025-03-13', '11:00', 70, 400000, 'premium', 21),
    ('VE-027', 'EasyFly', easyfly_id, 'Medellín', 'Cali', '2025-03-13', '17:30', 75, 330000, 'normal', 30),
    ('VE-028', 'EasyFly', easyfly_id, 'Cartagena', 'Medellín', '2025-03-14', '09:00', 81, 460000, 'premium', 15),
    ('VE-029', 'EasyFly', easyfly_id, 'Cartagena', 'Medellín', '2025-03-14', '14:30', 86, 370000, 'preferencial', 27),
    ('VE-030', 'EasyFly', easyfly_id, 'Cali', 'Medellín', '2025-03-14', '10:15', 72, 415000, 'premium', 20)
    ON CONFLICT (id) DO NOTHING;

END $$;
