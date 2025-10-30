// Serverless function para Vercel
// Configurado para usar Gmail SMTP

export default async function handler(req, res) {
  // Establecer headers CORS y JSON
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
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
      // Simular envío
      console.log(`[Email Simulado] Aprobación de aerolínea ${company_name} (${company_email})`)
      console.log(`Para habilitar emails reales, configura SMTP_SERVER, SMTP_USER, SMTP_PASSWORD en Vercel`)
      
      return res.status(200).json({ 
        success: true, 
        message: `Emails simulados enviados a ${company_email} y ${adminEmail}`,
        note: 'Configura variables SMTP en Vercel para enviar emails reales'
      })
    }

    // Enviar emails reales
    try {
      // Usar import dinámico para compatibilidad con ES modules
      const nodemailerModule = await import('nodemailer')
      const nodemailer = nodemailerModule.default || nodemailerModule
      
      const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: parseInt(smtpPort),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword
        }
      })

      // Email a la empresa
      const companyMailOptions = {
        from: `"VivaAir" <${smtpUser}>`,
        to: company_email,
        subject: `¡Felicidades! Tu solicitud ha sido aprobada - ${company_name}`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #3da9fc; margin-top: 0;">¡Felicidades! Tu solicitud ha sido aprobada</h2>
                <p>Estimados representantes de <strong>${company_name}</strong>,</p>
                <p>Nos complace informarles que su solicitud para vender vuelos en VivaAir ha sido <strong style="color: #22c55e;">APROBADA</strong>.</p>
                <p>Ya pueden comenzar a gestionar sus vuelos desde el panel de administración.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Saludos cordiales,<br>Equipo VivaAir</p>
              </div>
            </body>
          </html>
        `,
        text: `
¡Felicidades! Tu solicitud ha sido aprobada

Estimados representantes de ${company_name},

Nos complace informarles que su solicitud para vender vuelos en VivaAir ha sido APROBADA.

Ya pueden comenzar a gestionar sus vuelos desde el panel de administración.

Saludos cordiales,
Equipo VivaAir
        `
      }

      // Email al admin
      const adminMailOptions = {
        from: `"VivaAir" <${smtpUser}>`,
        to: adminEmail,
        subject: `Aerolínea Aprobada - ${company_name}`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #3da9fc; margin-top: 0;">Aerolínea Aprobada</h2>
                <p>La aerolínea <strong>${company_name}</strong> ha sido aprobada exitosamente.</p>
                <p><strong>Email:</strong> ${company_email}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
              </div>
            </body>
          </html>
        `,
        text: `
Aerolínea Aprobada

La aerolínea ${company_name} ha sido aprobada exitosamente.

Email: ${company_email}
Fecha: ${new Date().toLocaleString('es-CO')}
        `
      }

      // Enviar ambos emails
      await Promise.all([
        transporter.sendMail(companyMailOptions),
        transporter.sendMail(adminMailOptions)
      ])
      
      console.log(`[Emails Enviados] Aprobación a ${company_email} y ${adminEmail}`)
      
      return res.status(200).json({ 
        success: true, 
        message: `Emails enviados exitosamente a ${company_email} y ${adminEmail}` 
      })
    } catch (emailError) {
      console.error('Error enviando emails con nodemailer:', emailError)
      return res.status(200).json({ 
        success: false, 
        message: `Error al enviar emails: ${emailError.message}`,
        note: 'Verifica la configuración SMTP en Vercel',
        error: emailError.toString()
      })
    }
  } catch (error) {
    console.error('Email error:', error)
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error desconocido al procesar email',
      error: error.toString()
    })
  }
}
