# Base de Datos VivaAir - Supabase

## Configuración

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Abre el SQL Editor
3. Ejecuta los scripts en este orden:

### Paso 1: Crear las tablas
Ejecuta el contenido de `schema.sql` en el SQL Editor de Supabase.

### Paso 2: Insertar ciudades
Las ciudades se insertan automáticamente con el script `schema.sql`.

### Paso 3: Crear usuarios de prueba
Ejecuta el contenido de `seed_users.sql` para crear usuarios de prueba.

**Usuarios de prueba:**
- **Admin**: `admin@vivaair.co` / `admin123`
- **Cajero**: `cajero@vivaair.co` / `cajero123`
- **Cliente**: `cliente@vivaair.co` / `cliente123`

## Nota sobre Passwords

Los passwords están hasheados con SHA-256 (función `sha256()` de PostgreSQL). 
Para mayor seguridad en producción, considera usar:
- Supabase Auth (recomendado)
- bcrypt con salt rounds 10+

## Estructura de Tablas

- **users**: Usuarios del sistema (ADM, CLIENTE, CAJERO)
- **cities**: Ciudades colombianas disponibles
- **flights**: Vuelos nacionales
- **reservations**: Reservas de vuelos

## Variables de Entorno

El frontend ya está configurado con:
- URL: `https://eurwcyzwtzraudcuwdck.supabase.co`
- API Key: Configurada en `frontend/src/lib/supabase.js`

