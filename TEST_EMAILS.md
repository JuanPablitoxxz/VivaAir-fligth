# ✅ Verificar que los Emails Funcionen

## Pasos para Probar:

### 1. Haz un Redeploy en Vercel

**Opción A - Automático:**
- Espera que Vercel detecte los cambios del último commit
- O haz un pequeño cambio y push a GitHub

**Opción B - Manual:**
- Ve a Vercel Dashboard → Tu Proyecto
- Deployments → Último deploy → ⋮ → Redeploy

### 2. Verifica que nodemailer se Instaló

Después del deploy:
- Ve a la pestaña "Logs" del deployment
- Deberías ver que se instalan las dependencias
- Busca `nodemailer` en los logs

### 3. Prueba Enviar un Email

1. Inicia sesión como ADMIN (`admin@vivaair.co` / `admin123`)
2. Ve a "Admin" → "Aerolíneas"
3. Haz clic en "+ Nueva Solicitud"
4. Completa el formulario con un email de prueba (puede ser el tuyo)
5. Envía la solicitud

### 4. Verifica los Logs en Vercel

1. Ve a Vercel Dashboard → Tu Proyecto
2. Functions → Busca `send-airline-request-email`
3. Haz clic para ver los logs
4. Deberías ver:
   - `[Email Enviado] Solicitud de aerolínea a [email]` ✅
   - O si hay error, verás el mensaje específico

### 5. Revisa tu Bandeja de Entrada

- Revisa el email que pusiste en el formulario
- También revisa la carpeta de SPAM por si acaso

## Posibles Problemas:

### ❌ "nodemailer is not defined"
**Solución:** Verifica que el redeploy se completó. Vercel debe instalar nodemailer automáticamente desde `package.json`.

### ❌ "Invalid login"
**Solución:** 
- Verifica que `SMTP_PASSWORD` es la contraseña de aplicación (16 caracteres)
- No uses tu contraseña normal de Gmail
- Asegúrate que no hay espacios en la contraseña

### ❌ "Connection timeout"
**Solución:**
- Verifica `SMTP_SERVER = smtp.gmail.com` (sin https://)
- Verifica `SMTP_PORT = 587`

### ❌ Variables no se detectan
**Solución:**
- Asegúrate que marcas las 3 opciones (Production, Preview, Development)
- Haz un nuevo deploy después de agregar las variables

## ✅ Éxito

Si ves en los logs: `[Email Enviado]` y recibes el email, ¡todo funciona correctamente!

