// Serverless function para Vercel
export default async function handler(req, res) {
  // Función helper para enviar JSON de forma segura
  const sendJSON = (status, data) => {
    try {
      res.setHeader('Content-Type', 'application/json')
      res.status(status).json(data)
      return
    } catch (err) {
      console.error('Error enviando JSON:', err)
      try {
        res.status(status).end(JSON.stringify(data))
      } catch (e) {
        res.status(500).end('{"success":false,"message":"Error interno"}')
      }
    }
  }
  
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
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
      } else {
        body = req.body || {}
      }
    } catch (parseError) {
      return sendJSON(400, { 
        success: false, 
        message: 'Body JSON inválido' 
      })
    }

    const { company_name, company_email } = body
    
    if (!company_name || !company_email) {
      return sendJSON(400, { 
        success: false, 
        message: 'Faltan datos requeridos: company_name y company_email' 
      })
    }
    
    // Verificar variables de entorno
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    
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
      nodemailer = nodemailerModule.default || nodemailerModule
      if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
        throw new Error('nodemailer.createTransport no disponible')
      }
    } catch (importError) {
      console.warn('nodemailer no disponible:', importError.message)
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
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword
        },
        tls: {
          rejectUnauthorized: false
        }
      })

      // Verificar conexión
      await transporter.verify()

      const info = await transporter.sendMail({
        from: `"VivaAir" <${smtpUser}>`,
        to: company_email,
        subject: `Solicitud de Aerolínea - ${company_name}`,
        html: `<h2>VivaAir</h2><p>La empresa <strong>${company_name}</strong> ha solicitado ingresar.</p><p>Email: ${company_email}</p>`,
        text: `VivaAir - Solicitud de ${company_name} (${company_email})`
      })
      
      return sendJSON(200, { 
        success: true, 
        message: `Email enviado exitosamente`,
        messageId: info.messageId
      })
    } catch (emailError) {
      console.error('Error enviando email:', emailError.message, emailError.stack)
      // No fallar la función, solo reportar el error
      return sendJSON(200, { 
        success: false, 
        message: `Error enviando email: ${emailError.message}`,
        simulated: true,
        error: emailError.message
      })
    }
  } catch (error) {
    console.error('Error fatal en handler:', error.message, error.stack)
    return sendJSON(500, { 
      success: false, 
      message: error.message || 'Error interno del servidor',
      error: String(error).substring(0, 200)
    })
  }
}
