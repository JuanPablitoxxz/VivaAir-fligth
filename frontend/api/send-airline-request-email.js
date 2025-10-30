// Serverless function para Vercel
// Configurado para usar Gmail SMTP

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
    // Verificar si hay configuración SMTP
    const smtpServer = process.env.SMTP_SERVER
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const smtpPort = process.env.SMTP_PORT || '587'
    
    if (!smtpServer || !smtpUser || !smtpPassword) {
      // Simular envío si no hay configuración
      console.log(`[Email Simulado] Solicitud de aerolínea de ${company_name} (${company_email})`)
      console.log(`Para habilitar emails reales, configura SMTP_SERVER, SMTP_USER, SMTP_PASSWORD en Vercel`)
      
      return res.json({ 
        success: true, 
        message: `Email simulado enviado a ${company_email}`,
        note: 'Configura variables SMTP en Vercel para enviar emails reales'
      })
    }

    // Enviar email real usando nodemailer
    try {
      // Usar import dinámico para compatibilidad con ES modules
      const nodemailer = (await import('nodemailer')).default
      
      const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(smtpPort),
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: smtpUser,
          pass: smtpPassword
        }
      })

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
        text: `
VivaAir - Nueva Solicitud de Aerolínea

Hola,

La empresa ${company_name} ha solicitado ingresar a la plataforma VivaAir.

Correo de contacto: ${company_email}

Un analista revisará la solicitud y se contactará con ustedes pronto.

Saludos,
Equipo VivaAir
        `
      }

      await transporter.sendMail(mailOptions)
      console.log(`[Email Enviado] Solicitud de aerolínea a ${company_email}`)
      
      return res.json({ 
        success: true, 
        message: `Email enviado exitosamente a ${company_email}` 
      })
    } catch (emailError) {
      console.error('Error enviando email con nodemailer:', emailError)
      // Si nodemailer falla, retornar error pero no fallar completamente
      return res.json({ 
        success: false, 
        message: `Error al enviar email: ${emailError.message}`,
        note: 'Verifica la configuración SMTP en Vercel'
      })
    }
  } catch (error) {
    console.error('Email error:', error)
    return res.json({ success: false, message: error.message })
  }
}
