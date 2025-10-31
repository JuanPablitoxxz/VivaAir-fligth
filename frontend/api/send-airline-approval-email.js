// Serverless function para Vercel
export default async function handler(req, res) {
  // Asegurar headers JSON siempre
  res.setHeader('Content-Type', 'application/json')
  
  // Función helper para enviar JSON de forma segura
  const sendJSON = (status, data) => {
    try {
      const jsonString = JSON.stringify(data)
      res.status(status).end(jsonString)
      return
    } catch (err) {
      console.error('Error serializando JSON:', err)
      try {
        res.status(status).end(JSON.stringify({
          success: false,
          message: 'Error serializando respuesta',
          error: String(err).substring(0, 100)
        }))
      } catch (e) {
        res.status(500).end('{"success":false,"message":"Error interno fatal"}')
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
    
    // Si no hay configuración SMTP, simular envío
    if (!smtpServer || !smtpUser || !smtpPassword) {
      console.log(`[Email Simulado] Aprobación de ${company_name} (${company_email})`)
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

      const [companyResult, adminResult] = await Promise.all([
        transporter.sendMail({
          from: `"VivaAir" <${smtpUser}>`,
          to: company_email,
          subject: `¡Aprobada! - ${company_name}`,
          html: `<h2>¡Felicidades!</h2><p>Su solicitud ha sido <strong>APROBADA</strong>.</p>`,
          text: `Su solicitud ha sido aprobada`
        }),
        transporter.sendMail({
          from: `"VivaAir" <${smtpUser}>`,
          to: process.env.ADMIN_EMAIL || smtpUser,
          subject: `Aerolínea Aprobada - ${company_name}`,
          html: `<p>Aerolínea ${company_name} aprobada. Email: ${company_email}</p>`,
          text: `Aerolínea ${company_name} aprobada`
        })
      ])
      
      return sendJSON(200, { 
        success: true, 
        message: `Emails enviados exitosamente`,
        messageIds: [companyResult.messageId, adminResult.messageId]
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
    // Asegurar que siempre devolvemos JSON, incluso en errores fatales
    console.error('Error fatal en handler:', error.message, error.stack)
    try {
      return sendJSON(200, { 
        success: false, 
        message: error.message || 'Error interno del servidor',
        simulated: true,
        error: String(error).substring(0, 200),
        note: 'Error en función de email'
      })
    } catch (finalError) {
      // Último recurso: enviar respuesta mínima
      try {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).end('{"success":false,"message":"Error interno","simulated":true}')
      } catch (e) {
        // Ignorar si aún falla
      }
    }
  }
}
