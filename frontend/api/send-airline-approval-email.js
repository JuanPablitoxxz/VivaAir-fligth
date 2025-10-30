// Serverless function para Vercel
export default async function handler(req, res) {
  try {
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
    
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const smtpPort = process.env.SMTP_PORT || '587'
    const adminEmail = process.env.ADMIN_EMAIL || smtpUser || 'admin@vivaair.co'
    
    if (!smtpServer || !smtpUser || !smtpPassword) {
      return res.status(200).json({ 
        success: true, 
        message: `Emails simulados enviados`,
        note: 'Configura variables SMTP'
      })
    }

    try {
      const nodemailer = (await import('nodemailer')).default
      
      if (!nodemailer) {
        return res.status(200).json({
          success: false,
          message: 'nodemailer no disponible'
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
          to: adminEmail,
          subject: `Aerolínea Aprobada - ${company_name}`,
          html: `<p>Aerolínea ${company_name} aprobada. Email: ${company_email}</p>`,
          text: `Aerolínea ${company_name} aprobada`
        })
      ])
      
      return res.status(200).json({ 
        success: true, 
        message: `Emails enviados a ${company_email} y ${adminEmail}`
      })
    } catch (emailError) {
      return res.status(200).json({ 
        success: false, 
        message: `Error: ${emailError.message}`,
        error: String(emailError)
      })
    }
  } catch (error) {
    console.error('Fatal error:', error)
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error interno',
      error: String(error)
    })
  }
}
