# 📧 Variables de Entorno para Vercel - Gmail

## Paso 1: Generar Contraseña de Aplicación en Gmail

1. **Habilita la verificación en dos pasos** (si no la tienes):
   - Ve a: https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"

2. **Genera una contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Seleccionar app" > "Otra (nombre personalizado)"
   - Escribe: `VivaAir`
   - Haz clic en "Generar"
   - **Copia la contraseña de 16 caracteres** (aparece como: `xxxx xxxx xxxx xxxx` - copia sin espacios)

## Paso 2: Configurar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `VivaAir-fligth`
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas 4 variables (una por una):

### Variable 1:
```
Name: SMTP_SERVER
Value: smtp.gmail.com
Environments: ☑ Production ☑ Preview ☑ Development
```

### Variable 2:
```
Name: SMTP_PORT
Value: 587
Environments: ☑ Production ☑ Preview ☑ Development
```

### Variable 3:
```
Name: SMTP_USER
Value: juan.bruno200679@gmail.com
Environments: ☑ Production ☑ Preview ☑ Development
```

### Variable 4:
```
Name: SMTP_PASSWORD
Value: [PEGA AQUÍ LA CONTRASEÑA DE 16 CARACTERES QUE GENERASTE]
Environments: ☑ Production ☑ Preview ☑ Development
```

## Paso 3: Redesplegar

Después de agregar las variables:
1. Ve a **Deployments**
2. Haz clic en los tres puntos (...) del último deploy
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo push a GitHub y Vercel desplegará automáticamente

## ⚠️ Importante

- La contraseña de aplicación es diferente a tu contraseña normal de Gmail
- Solo la verás una vez al generarla, guárdala bien
- Si la pierdes, tendrás que generar una nueva

## ✅ Verificación

Después del redeploy, prueba:
1. Crea una nueva solicitud de aerolínea
2. Revisa los logs en Vercel (Functions → Ver logs)
3. Deberías ver que intenta enviar el email (no "Email simulado")

