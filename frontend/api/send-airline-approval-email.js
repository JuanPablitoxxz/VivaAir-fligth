import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { company_name, company_email } = req.body
    
    const { stdout, stderr } = await execAsync(
      `python3 scripts/send_email.py approval "${company_name}" "${company_email}"`
    )
    
    return res.json({ success: true, message: stdout })
  } catch (error) {
    console.error('Email error:', error)
    return res.json({ success: false, message: error.message })
  }
}

