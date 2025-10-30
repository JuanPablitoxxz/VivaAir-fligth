// Serverless function para Vercel
export default async function handler(req, res) {
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
    
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    
    if (!smtpServer || !smtpUser || !smtpPassword) {
      console.log(`[Email Simulado] Aprobación de ${company_name}`)
      return sendJSON(200, { 
        success: true, 
        message: `Emails simulados enviados`,
        simulated: true
      })
    }

    let nodemailer
    try {
      const mod = await import('nodemailer')
      nodemailer = mod.default || mod
    } catch (importError) {
      console.warn('nodemailer no disponible:', importError.message)
      return sendJSON(200, {
        success: true,
        message: `Emails simulados (nodemailer no disponible)`,
        simulated: true
      })
    }

    if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
      return sendJSON(200, {
        success: true,
        message: `Emails simulados`,
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
        message: `Emails enviados a ${company_email}`,
        messageIds: [companyResult.messageId, adminResult.messageId]
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
