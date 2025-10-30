# VivaAir – Buscador de Vuelos Nacionales (Colombia)

Aplicación web tipo Trivago/Kayak enfocada solo en vuelos nacionales de Colombia. Incluye buscador de vuelos, dashboard por categorías de precio (económico, normal, preferencial, premium/primera), y roles: ADM, Cliente y Cajero (check-in/compra en aeropuerto).

## Requisitos
- Node.js 18+
- npm 9+

## Estructura
- `backend/`: API Express con datos de ejemplo (en memoria)
- `frontend/`: SPA en React (Vite)

## Instalación
```bash
# Backend
cd backend
npm install
npm run dev
# Se inicia en http://localhost:4000

# Frontend (en otra terminal)
cd ../frontend
npm install
npm run dev
# Se inicia en http://localhost:5173
```

## Credenciales de prueba
- ADM: `admin@vivaair.co` / `admin123`
- Cajero: `cajero@vivaair.co` / `cajero123`
- Cliente: `cliente@vivaair.co` / `cliente123`

## Funcionalidad
- Buscar vuelos: origen, destino, fecha, pasajeros.
- Dashboard: listas por categoría de precio.
- Roles:
  - ADM: ver panel de administración (resumen de vuelos y usuarios demo).
  - Cajero: flujo simplificado para comprar en nombre del cliente.
  - Cliente: buscar y reservar (simulado).

## Notas
- Los datos se mantienen en memoria para demos; no hay base de datos.
- Colores: azul claro y blanco (branding VivaAir demo).

## Variables de entorno (opcional)
- FRONTEND: `VITE_API_BASE` (por defecto `http://localhost:4000`)

## Scripts útiles
- `backend`: `npm run dev` (nodemon)
- `frontend`: `npm run dev` (Vite)

## Licencia
Uso educativo/demo.
