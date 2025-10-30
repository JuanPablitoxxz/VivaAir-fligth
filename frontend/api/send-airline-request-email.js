// Serverless function para Vercel
export default async function handler(req, res) {
  // Envolver todo en try-catch para capturar cualquier error
  try {
    // Headers primero
    res.setHeader('Content-Type', 'application/json')
    
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ ok: true })
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    const body = req.body || {}
    const { company_name, company_email } = body
    
    if (!company_name || !company_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos' 
      })
    }
    
    // Verificar variables de entorno
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const smtpPort = process.env.SMTP_PORT || '587'
    
    // Si no hay configuración, simular
    if (!smtpServer || !smtpUser || !smtpPassword) {
      return res.status(200).json({ 
        success: true, 
        message: `Email simulado enviado a ${company_email}`,
        note: 'Configura variables SMTP en Vercel'
      })
    }

    // Intentar importar y usar nodemailer
    try {
      const nodemailer = (await import('nodemailer')).default
      
      if (!nodemailer) {
        return res.status(200).json({
          success: false,
          message: 'nodemailer no disponible',
          note: 'Instala nodemailer: npm install nodemailer'
        })
      }

      const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(smtpPort),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword
        }
      })

      await transporter.verify()

      const info = await transporter.sendMail({
        from: `"VivaAir" <${smtpUser}>`,
        to: company_email,
        subject: `Solicitud de Aerolínea - ${company_name}`,
        html: `<h2>VivaAir - Nueva Solicitud</h2><p>La empresa <strong>${company_name}</strong> ha solicitado ingresar.</p><p>Email: ${company_email}</p>`,
        text: `VivaAir - Nueva Solicitud de ${company_name} (${company_email})`
      })
      
      return res.status(200).json({ 
        success: true, 
        message: `Email enviado a ${company_email}`,
        messageId: info.messageId
      })
    } catch (emailError) {
      return res.status(200).json({ 
        success: false, 
        message: `Error: ${emailError.message}`,
        error: String(emailError)
      })
    }
  } catch (error) {
    // Capturar cualquier error fatal
    console.error('Fatal error:', error)
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error interno',
      error: String(error)
    })
  }
}
