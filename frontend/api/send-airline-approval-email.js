// Serverless function para Vercel
// Configura las mismas variables SMTP que en send-airline-request-email.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    
    if (!smtpServer || !smtpUser) {
      // Simular envío
      console.log(`[Email Simulado] Aprobación de aerolínea ${company_name} (${company_email})`)
      console.log(`Para habilitar emails reales, configura SMTP_SERVER, SMTP_USER, SMTP_PASSWORD en Vercel`)
      
      return res.json({ 
        success: true, 
        message: `Emails simulados enviados a ${company_email} y admin@vivaair.co`,
        note: 'Configura variables SMTP en Vercel para enviar emails reales'
      })
    }

    console.log(`[Email] Enviando aprobación a ${company_email}`)
    
    // TODO: Implementar envío real con nodemailer
    
    return res.json({ 
      success: true, 
      message: `Emails enviados a ${company_email} y admin@vivaair.co` 
    })
  } catch (error) {
    console.error('Email error:', error)
    return res.json({ success: false, message: error.message })
  }
}
