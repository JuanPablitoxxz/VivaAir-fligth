// Serverless function para Vercel
// Configurado para usar Gmail SMTP

export default async function handler(req, res) {
  // Establecer headers JSON primero
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body || {}
    
    if (!company_name || !company_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos: company_name y company_email' 
      })
    }
    
    // Verificar si hay configuración SMTP
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const smtpPort = process.env.SMTP_PORT || '587'
    
    if (!smtpServer || !smtpUser || !smtpPassword) {
      // Simular envío si no hay configuración
      console.log(`[Email Simulado] Solicitud de aerolínea de ${company_name} (${company_email})`)
      
      return res.status(200).json({ 
        success: true, 
        message: `Email simulado enviado a ${company_email}`,
        note: 'Configura variables SMTP en Vercel para enviar emails reales'
      })
    }

    // Enviar email real usando nodemailer
    let nodemailer
    try {
      // Intentar importar nodemailer
      const nodemailerModule = await import('nodemailer')
      nodemailer = nodemailerModule.default || nodemailerModule
      
      if (!nodemailer || !nodemailer.createTransport) {
        throw new Error('nodemailer no está disponible correctamente')
      }
    } catch (importError) {
      console.error('Error importando nodemailer:', importError)
      return res.status(200).json({
        success: false,
        message: 'nodemailer no está disponible. Instala la dependencia en package.json',
        error: importError.message,
        note: 'Asegúrate de que nodemailer está en frontend/package.json'
      })
    }
    
    try {
      const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(smtpPort),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword
        }
      })

      // Verificar conexión antes de enviar
      await transporter.verify()

      const mailOptions = {
        from: `"VivaAir" <${smtpUser}>`,
        to: company_email,
        subject: `Solicitud de Aerolínea - ${company_name}`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #3da9fc; margin-top: 0;">VivaAir - Nueva Solicitud de Aerolínea</h2>
                <p>Hola,</p>
                <p>La empresa <strong>${company_name}</strong> ha solicitado ingresar a la plataforma VivaAir.</p>
                <p><strong>Correo de contacto:</strong> ${company_email}</p>
                <p>Un analista revisará la solicitud y se contactará con ustedes pronto.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Saludos,<br>Equipo VivaAir</p>
              </div>
            </body>
          </html>
        `,
        text: `VivaAir - Nueva Solicitud de Aerolínea\n\nHola,\n\nLa empresa ${company_name} ha solicitado ingresar a la plataforma VivaAir.\n\nCorreo de contacto: ${company_email}\n\nUn analista revisará la solicitud y se contactará con ustedes pronto.\n\nSaludos,\nEquipo VivaAir`
      }

      const info = await transporter.sendMail(mailOptions)
      console.log(`[Email Enviado] Solicitud de aerolínea a ${company_email}`, info.messageId)
      
      return res.status(200).json({ 
        success: true, 
        message: `Email enviado exitosamente a ${company_email}`,
        messageId: info.messageId
      })
    } catch (emailError) {
      console.error('Error enviando email con nodemailer:', emailError)
      return res.status(200).json({ 
        success: false, 
        message: `Error al enviar email: ${emailError.message}`,
        note: 'Verifica la configuración SMTP en Vercel',
        error: emailError.toString()
      })
    }
  } catch (error) {
    console.error('Error general en handler:', error)
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error desconocido al procesar email',
      error: error.toString()
    })
  }
}
