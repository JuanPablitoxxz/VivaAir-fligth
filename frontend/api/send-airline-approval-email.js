// Serverless function para Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
    // Simular envío de email
    console.log(`[Email Simulado] Aprobación de aerolínea ${company_name} (${company_email})`)
    
    return res.json({ 
      success: true, 
      message: `Emails simulados enviados a ${company_email} y admin@vivaair.co` 
    })
  } catch (error) {
    console.error('Email error:', error)
    return res.json({ success: false, message: error.message })
  }
}
