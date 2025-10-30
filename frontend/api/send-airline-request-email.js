// Serverless function para Vercel
export default async function handler(req, res) {
  // Asegurar que siempre devolvemos JSON
  const sendJSON = (status, data) => {
    res.setHeader('Content-Type', 'application/json')
    return res.status(status).json(data)
  }
  
  try {
    if (req.method === 'OPTIONS') {
      return sendJSON(200, { ok: true })
    }
    
    if (req.method !== 'POST') {
      return sendJSON(405, { message: 'Method not allowed' })
    }

    const body = req.body || {}
    const { company_name, company_email } = body
    
    if (!company_name || !company_email) {
      return sendJSON(400, { 
        success: false, 
        message: 'Faltan datos requeridos' 
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
        message: `Email simulado enviado a ${company_email}`,
        simulated: true
      })
    }

    // Intentar usar nodemailer solo si está disponible
    let nodemailer
    try {
      const mod = await import('nodemailer')
      nodemailer = mod.default || mod
    } catch (importError) {
      console.warn('nodemailer no disponible:', importError.message)
      return sendJSON(200, {
        success: true,
        message: `Email simulado (nodemailer no disponible)`,
        simulated: true,
        note: 'Instala nodemailer en package.json'
      })
    }

    if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
      return sendJSON(200, {
        success: true,
        message: `Email simulado`,
        simulated: true
      })
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword
        }
      })

      const info = await transporter.sendMail({
        from: `"VivaAir" <${smtpUser}>`,
        to: company_email,
        subject: `Solicitud de Aerolínea - ${company_name}`,
        html: `<h2>VivaAir</h2><p>La empresa <strong>${company_name}</strong> ha solicitado ingresar.</p><p>Email: ${company_email}</p>`,
        text: `VivaAir - Solicitud de ${company_name} (${company_email})`
      })
      
      return sendJSON(200, { 
        success: true, 
        message: `Email enviado a ${company_email}`,
        messageId: info.messageId
      })
    } catch (emailError) {
      console.error('Error enviando email:', emailError.message)
      return sendJSON(200, { 
        success: false, 
        message: `Error: ${emailError.message}`,
        simulated: true
      })
    }
  } catch (error) {
    console.error('Error fatal:', error)
    return sendJSON(500, { 
      success: false, 
      message: error.message || 'Error interno',
      error: String(error).substring(0, 200)
    })
  }
}
