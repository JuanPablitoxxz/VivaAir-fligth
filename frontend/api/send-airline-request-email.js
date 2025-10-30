// Serverless function para Vercel
// En Vercel, las funciones serverless de Node.js usan este formato
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
    // Simular envío de email (en producción usar un servicio como SendGrid)
    console.log(`[Email Simulado] Solicitud de aerolínea de ${company_name} (${company_email})`)
    
    // En producción, aquí se haría la llamada real al servicio de email
    // Por ahora solo logueamos para evitar errores en Vercel
    
    return res.json({ 
      success: true, 
      message: `Email simulado enviado a ${company_email}` 
    })
  } catch (error) {
    console.error('Email error:', error)
    return res.json({ success: false, message: error.message })
  }
}
