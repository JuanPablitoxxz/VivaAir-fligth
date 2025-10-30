# VivaAir – Buscador de Vuelos Nacionales (Colombia)

Aplicación web tipo Trivago/Kayak enfocada solo en vuelos nacionales de Colombia. Incluye buscador de vuelos, dashboard por categorías de precio (económico, normal, preferencial, premium/primera), y roles: ADM, Cliente y Cajero (check-in/compra en aeropuerto).

## Despliegue

[Deploy con Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJuanPablitoxxz%2FVivaAir-fligth&root-directory=frontend&project-name=vivaair&repository-name=VivaAir-fligth)

- Root Directory: `frontend`
- Framework: Vite (detectado)
- Build Command: `npm run build`
- Output Directory: `dist`

### Deploy por CLI (opcional)
1) Crea un token en Vercel: Cuenta → Settings → Tokens
2) Ejecuta:
```bash
# Requiere Node 18+
npm i -g vercel
vercel --cwd frontend --prod --token=TU_TOKEN
```

## Requisitos
- Node.js 18+
- npm 9+

## Estructura
- `backend/`: API Express con datos de ejemplo (en memoria)
- `frontend/`: SPA en React (Vite) + API serverless (`frontend/api/*`)

## Instalación local
```bash
# Backend (opcional para dev local sin Vercel CLI)
cd backend
npm install
npm run dev
# http://localhost:4000

# Frontend (otra terminal)
cd ../frontend
npm install
npm run dev
# http://localhost:5173
```

Para que el frontend apunte al backend local, crea `frontend/.env.local` con:
```
VITE_API_BASE=http://localhost:4000
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
- En producción, las rutas `/api/*` se sirven como funciones serverless en Vercel desde `frontend/api/*`.
- En local, puedes usar el backend Express o Vercel CLI.

## Scripts útiles
- `backend`: `npm run dev` (nodemon)
- `frontend`: `npm run dev` (Vite)

## Licencia
Uso educativo/demo.
