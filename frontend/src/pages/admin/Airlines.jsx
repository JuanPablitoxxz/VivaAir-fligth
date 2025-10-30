import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Airlines() {
  const [airlines, setAirlines] = useState([])
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ 
    company_name: '', 
    company_email: '', 
    certificate: null 
  })

  useEffect(() => {
    loadAirlines()
    loadRequests()
  }, [])

  const loadAirlines = async () => {
    try {
      const { data, error } = await supabase.from('airlines').select('*').order('name')
      if (error) {
        console.error('Error loading airlines:', error)
        setAirlines([])
      } else {
        setAirlines(data || [])
      }
    } catch (err) {
      console.error('Error loading airlines:', err)
      setAirlines([])
    }
  }

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase.from('airline_requests').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error('Error loading requests:', error)
        setRequests([])
      } else {
        setRequests(data || [])
      }
    } catch (err) {
      console.error('Error loading requests:', err)
      setRequests([])
    }
  }

  const handleFileUpload = async (file) => {
    try {
      // Intentar subir el archivo
      const fileName = `certificates/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file)
      
      if (error) {
        // Si el bucket no existe, almacenar solo el nombre del archivo
        console.warn('Error uploading file to storage:', error)
        console.warn('Almacenando solo nombre del archivo. Configura el bucket "documents" en Supabase Storage para guardar archivos.')
        return fileName // Retornar solo el nombre como fallback
      }
      return data.path
    } catch (err) {
      console.error('Error in file upload:', err)
      // Fallback: solo guardar el nombre del archivo
      return `certificates/${Date.now()}_${file.name}`
    }
  }

  const submitRequest = async (e) => {
    e.preventDefault()
    try {
      let certificateUrl = null
      if (formData.certificate) {
        certificateUrl = await handleFileUpload(formData.certificate)
      }

      const { error } = await supabase.from('airline_requests').insert([{
        company_name: formData.company_name,
        company_email: formData.company_email,
        certificate_pdf_url: certificateUrl,
        status: 'pendiente'
      }])

      if (error) throw error

      // Simular envío de email (llamar a API endpoint que ejecutará Python script)
      await fetch('/api/send-airline-request-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.company_name,
          company_email: formData.company_email
        })
      })

      alert('Solicitud enviada. Se ha notificado al analista y a la empresa.')
      setFormData({ company_name: '', company_email: '', certificate: null })
      setShowForm(false)
      loadRequests()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const approveRequest = async (requestId) => {
    try {
      const request = requests.find(r => r.id === requestId)
      // Crear aerolínea
      const { data: airline, error: airlineError } = await supabase.from('airlines').insert([{
        name: request.company_name,
        email: request.company_email,
        certificate_url: request.certificate_pdf_url,
        status: 'aprobada'
      }]).select().single()

      if (airlineError) throw airlineError

      // Actualizar solicitud
      const { error: updateError } = await supabase
        .from('airline_requests')
        .update({ status: 'aprobada', reviewed_by: (await supabase.auth.getUser()).data.user?.id })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Enviar email de aprobación
      await fetch('/api/send-airline-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: request.company_name,
          company_email: request.company_email
        })
      })

      loadAirlines()
      loadRequests()
      alert('Aerolínea aprobada y notificada.')
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const toggleAirlineStatus = async (airlineId, currentStatus) => {
    const newStatus = currentStatus === 'activa' ? 'inactiva' : 'activa'
    const { error } = await supabase
      .from('airlines')
      .update({ status: newStatus })
      .eq('id', airlineId)
    
    if (!error) loadAirlines()
  }

  return (
    <div className="grid" style={{ gap: '24px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Gestión de Aerolíneas</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nueva Solicitud'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitRequest} className="card" style={{ marginBottom: '24px', background: 'var(--bg-light)' }}>
            <h3>Nueva Solicitud de Aerolínea</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label className="label">Nombre de la Empresa</label>
                <input 
                  className="input"
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Correo de la Empresa</label>
                <input 
                  className="input"
                  type="email"
                  value={formData.company_email}
                  onChange={e => setFormData({ ...formData, company_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Certificado (PDF)</label>
                <input 
                  className="input"
                  type="file"
                  accept=".pdf"
                  onChange={e => setFormData({ ...formData, certificate: e.target.files[0] })}
                  required
                />
              </div>
              <button className="btn btn-primary" type="submit">Enviar Solicitud</button>
            </div>
          </form>
        )}

        <h3>Solicitudes Pendientes</h3>
        <div className="results">
          {requests.filter(r => r.status === 'pendiente' || r.status === 'en_revision').map(req => (
            <div key={req.id} className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
                <div>
                  <h4>{req.company_name}</h4>
                  <p>{req.company_email}</p>
                  <span className="tag">{req.status}</span>
                  {req.certificate_pdf_url && (
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                        Certificado: {req.certificate_pdf_url.split('/').pop()}
                      </p>
                      <a 
                        href={req.certificate_pdf_url} 
                        target="_blank" 
                        rel="noopener"
                        style={{ fontSize: '12px' }}
                        onClick={(e) => {
                          // Si no es una URL válida, prevenir navegación
                          if (!req.certificate_pdf_url.startsWith('http')) {
                            e.preventDefault()
                            alert('El certificado necesita ser configurado en Supabase Storage. Por ahora solo se guarda el nombre del archivo.')
                          }
                        }}
                      >
                        Ver certificado
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <button className="btn btn-primary" onClick={() => approveRequest(req.id)}>
                    Aprobar
                  </button>
                  <button className="btn-outline" style={{ marginTop: '8px' }}>
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '32px' }}>Aerolíneas Activas</h3>
        <div className="results">
          {airlines.map(airline => (
            <div key={airline.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{airline.name}</h4>
                  <p>{airline.email}</p>
                  <span className="tag">{airline.status}</span>
                </div>
                <button 
                  className={airline.status === 'activa' ? 'btn-outline' : 'btn'}
                  onClick={() => toggleAirlineStatus(airline.id, airline.status)}
                >
                  {airline.status === 'activa' ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

