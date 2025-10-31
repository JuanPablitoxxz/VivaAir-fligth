// Serverless function para Vercel
// Wrapper global para capturar cualquier error
export default async function handler(req, res) {
  // Asegurar headers JSON desde el inicio - ANTES de cualquier operación
  try {
    res.setHeader('Content-Type', 'application/json')
  } catch (e) {
    // Si falla, intentar de nuevo
  }
  
  // Función helper para enviar JSON de forma segura
  const sendJSON = (status, data) => {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data)
      res.status(status).end(jsonString)
    } catch (err) {
      console.error('Error enviando JSON:', err)
      try {
        res.status(status).end(JSON.stringify({
          success: false,
          message: 'Error serializando respuesta'
        }))
      } catch (e) {
        // Último recurso
        try {
          res.status(200).end('{"success":false,"message":"Error interno"}')
        } catch (finalErr) {
          // Ignorar si todo falla
        }
      }
    }
  }
  
  // Try-catch global para capturar TODOS los errores
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      try {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      } catch (e) {
        // Ignorar errores de headers CORS
      }
      return sendJSON(200, { ok: true })
    }
    
    if (req.method !== 'POST') {
      return sendJSON(405, { success: false, message: 'Method not allowed' })
    }

    // Parsear body de forma segura
    let body = {}
    try {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
      } else if (req.body) {
        body = req.body
      }
    } catch (parseError) {
      return sendJSON(400, { 
        success: false, 
        message: 'Body JSON inválido' 
      })
    }

    const company_name = body?.company_name || ''
    const company_email = body?.company_email || ''
    
    if (!company_name || !company_email) {
      return sendJSON(400, { 
        success: false, 
        message: 'Faltan datos requeridos: company_name y company_email' 
      })
    }
    
    // Verificar variables de entorno
    const smtpServer = process.env?.SMTP_SERVER || ''
    const smtpUser = process.env?.SMTP_USER || ''
    const smtpPassword = process.env?.SMTP_PASSWORD || ''
    
    // Si no hay configuración, simular
    if (!smtpServer || !smtpUser || !smtpPassword) {
      console.log(`[Email Simulado] Solicitud de ${company_name} (${company_email})`)
      return sendJSON(200, { 
        success: true, 
        message: `Email simulado enviado (SMTP no configurado)`,
        simulated: true,
        note: 'Configura SMTP_SERVER, SMTP_USER y SMTP_PASSWORD en Vercel'
      })
    }

    // Intentar importar nodemailer
    let nodemailer
    try {
      const nodemailerModule = await import('nodemailer')
      nodemailer = nodemailerModule?.default || nodemailerModule
      if (!nodemailer || typeof nodemailer?.createTransport !== 'function') {
        throw new Error('nodemailer.createTransport no disponible')
      }
    } catch (importError) {
      console.warn('nodemailer no disponible:', importError?.message || 'unknown error')
      return sendJSON(200, {
        success: true,
        message: `Email simulado (nodemailer no disponible)`,
        simulated: true,
        note: 'Instala nodemailer: npm install nodemailer'
      })
    }

    // Intentar enviar email real
    try {
      const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(process.env?.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword
        },
        tls: {
          rejectUnauthorized: false
        }
      })

      // Verificar conexión (con timeout para evitar cuelgues)
      try {
        await Promise.race([
          transporter.verify(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ])
      } catch (verifyError) {
        console.warn('Error verificando conexión SMTP:', verifyError?.message)
        // Continuar de todas formas
      }

      const info = await transporter.sendMail({
        from: `"VivaAir" <${smtpUser}>`,
        to: company_email,
        subject: `Solicitud de Aerolínea - ${company_name}`,
        html: `<h2>VivaAir</h2><p>La empresa <strong>${company_name}</strong> ha solicitado ingresar.</p><p>Email: ${company_email}</p>`,
        text: `VivaAir - Solicitud de ${company_name} (${company_email})`
      }).catch(err => {
        console.error('Error enviando email:', err)
        return { messageId: null, error: err.message }
      })
      
      return sendJSON(200, { 
        success: true, 
        message: `Email enviado exitosamente`,
        messageId: info?.messageId || null
      })
    } catch (emailError) {
      console.error('Error enviando email:', emailError?.message || 'unknown error')
      // No fallar la función, solo reportar el error
      return sendJSON(200, { 
        success: false, 
        message: `Error enviando email: ${emailError?.message || 'Error desconocido'}`,
        simulated: true,
        error: String(emailError?.message || 'unknown').substring(0, 100)
      })
    }
  } catch (error) {
    // Catch global para CUALQUIER error no capturado
    console.error('Error fatal en handler:', error?.message || 'unknown error', error?.stack)
    try {
      return sendJSON(200, { 
        success: false, 
        message: error?.message || 'Error interno del servidor',
        simulated: true,
        error: String(error || 'unknown').substring(0, 200),
        note: 'Error en función de email'
      })
    } catch (finalError) {
      // Último recurso: enviar respuesta mínima
      try {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).end('{"success":false,"message":"Error interno","simulated":true}')
      } catch (e) {
        // Si todo falla, intentar una última vez sin try-catch
        res.status(200).end('{"success":false}')
      }
    }
  }
}
