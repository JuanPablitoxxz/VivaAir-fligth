# 📋 Instrucciones para Cargar Datos de Prueba

## Pasos para cargar las aerolíneas y vuelos:

1. **Asegúrate de que el schema esté creado:**
   - Ejecuta primero `database/schema.sql` en Supabase SQL Editor
   - Luego ejecuta `database/schema_extended.sql`

2. **Cargar aerolíneas y vuelos:**
   - Ejecuta `database/seed_airlines_and_flights.sql` en Supabase SQL Editor
   - Este script insertará:
     - **5 aerolíneas**: Avianca, LATAM Airlines Colombia, Viva Air Colombia, EasyFly, Wingo
     - **150 vuelos en total** (30 por aerolínea)
     - Vuelos con diferentes categorías (económico, normal, preferencial, premium)
     - Vuelos a diferentes ciudades de Colombia
     - Precios variados según la categoría

3. **Verificar que se insertaron correctamente:**
   - Ejecuta esta consulta en Supabase:
   ```sql
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
   ```

4. **Rangos de precios por categoría:**
   - **Económico**: $150,000 - $250,000 COP
   - **Normal**: $240,000 - $390,000 COP
   - **Preferencial**: $380,000 - $540,000 COP
   - **Premium**: $580,000 - $900,000 COP

## Nota:

Si ya tienes vuelos en la base de datos, el script usará `ON CONFLICT DO UPDATE` para actualizar los datos en lugar de duplicarlos.

