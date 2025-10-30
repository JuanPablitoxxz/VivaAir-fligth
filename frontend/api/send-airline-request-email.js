// Serverless function para Vercel que ejecuta el script de Python
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
    // Ejecutar script de Python (requiere que el script esté en el mismo repo)
    const { stdout, stderr } = await execAsync(
      `python3 scripts/send_email.py request "${company_name}" "${company_email}"`
    )
    
    return res.json({ success: true, message: stdout })
  } catch (error) {
    console.error('Email error:', error)
    // No fallar si el email no se envía (en desarrollo)
    return res.json({ success: false, message: error.message })
  }
}

