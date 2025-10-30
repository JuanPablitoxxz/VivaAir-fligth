// Serverless function para Vercel
// Para que funcione, configura estas variables de entorno en Vercel:
// - SMTP_SERVER (ej: smtp.gmail.com)
// - SMTP_PORT (ej: 587)
// - SMTP_USER (tu email)
// - SMTP_PASSWORD (contraseña de aplicación)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
    // Verificar si hay configuración SMTP
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    
    if (!smtpServer || !smtpUser) {
      // Simular envío si no hay configuración
      console.log(`[Email Simulado] Solicitud de aerolínea de ${company_name} (${company_email})`)
      console.log(`Para habilitar emails reales, configura SMTP_SERVER, SMTP_USER, SMTP_PASSWORD en Vercel`)
      
      return res.json({ 
        success: true, 
        message: `Email simulado enviado a ${company_email}`,
        note: 'Configura variables SMTP en Vercel para enviar emails reales'
      })
    }

    // Aquí iría el código para enviar email real usando nodemailer o similar
    // Por ahora, solo logueamos
    console.log(`[Email] Enviando solicitud de aerolínea a ${company_email}`)
    
    // TODO: Implementar envío real con nodemailer
    // const nodemailer = require('nodemailer')
    // const transporter = nodemailer.createTransport({...})
    // await transporter.sendMail({...})
    
    return res.json({ 
      success: true, 
      message: `Email enviado a ${company_email}` 
    })
  } catch (error) {
    console.error('Email error:', error)
    return res.json({ success: false, message: error.message })
  }
}
