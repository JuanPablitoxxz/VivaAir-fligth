# 🔍 Diagnosticar Error 500 en Funciones de Email

## Pasos para identificar el problema:

### 1. Revisar Logs de Vercel
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `VivaAir-fligth`
3. Ve a **Functions** → Busca `send-airline-request-email`
4. Haz clic para ver los logs
5. Busca errores como:
   - `Module not found: nodemailer`
   - `Cannot find module 'nodemailer'`
   - Errores de sintaxis
   - Errores de importación

### 2. Verificar que nodemailer está instalado
En los logs del build, deberías ver algo como:
```
added 1 package, and audited 2 packages in 1s
```

Si no ves esto, nodemailer no se está instalando.

### 3. Solución Temporal: Deshabilitar nodemailer

Si nodemailer no funciona, podemos hacer que las funciones solo simulen el envío por ahora. Las funciones ya tienen este fallback, pero si están fallando antes de llegar ahí, podemos:

**Opción A:** Hacer que las funciones no dependan de nodemailer inicialmente
**Opción B:** Usar un servicio de email diferente como Resend o SendGrid que tenga mejor soporte en Vercel

### 4. Verificar Variables de Entorno
Asegúrate de que las variables estén correctamente configuradas:
- Ve a Vercel → Settings → Environment Variables
- Verifica que SMTP_SERVER, SMTP_USER, SMTP_PASSWORD existen
- Verifica que están en Production, Preview y Development

### 5. Probar Localmente (opcional)
```bash
cd frontend
npm install
npm run build
vercel dev
```

## Qué hacer ahora:

1. **Comparte los logs de Vercel** - Esto me ayudará a ver el error exacto
2. O puedes **deshabilitar temporalmente los emails reales** y solo usar la simulación
3. O podemos **migrar a un servicio como Resend** que es más confiable en Vercel

