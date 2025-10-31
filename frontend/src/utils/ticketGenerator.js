import jsPDF from 'jspdf'
import QRCode from 'qrcode'

// Generar datos aleatorios para el ticket
function generateTicketData(reservation, flight) {
  // Generar gate aleatorio
  const gates = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']
  const gate = gates[Math.floor(Math.random() * gates.length)]
  
  // Generar avión aleatorio
  const planes = ['Boeing 737', 'Airbus A320', 'Boeing 787', 'Airbus A330', 'Embraer E190']
  const plane = planes[Math.floor(Math.random() * planes.length)]
  
  // Calcular hora de llegada estimada
  const [hours, minutes] = flight.time.split(':')
  const departureTime = new Date()
  departureTime.setHours(parseInt(hours), parseInt(minutes), 0)
  const arrivalTime = new Date(departureTime.getTime() + (flight.duration_min || flight.durationMin || 60) * 60000)
  const estimatedArrival = arrivalTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const exactTime = departureTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  
  // Generar código QR simulado
  const qrData = `CHECKIN:${reservation.ticket_number}|USER:${reservation.user_id}|FLIGHT:${flight.id}`
  
  return {
    gate,
    plane,
    estimatedArrival,
    exactTime,
    qrData
  }
}

export async function generateTicketPDF(reservation, flight, user) {
  const ticketData = generateTicketData(reservation, flight)
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 148] // Tamaño de ticket de avión
  })
  
  // Color de fondo
  doc.setFillColor(245, 247, 250)
  doc.rect(0, 0, 210, 148, 'F')
  
  // Header - VivaAir
  doc.setFillColor(61, 169, 252)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('VivaAir', 10, 15)
  
  // Número de ticket
  doc.setFontSize(10)
  doc.text(`Ticket: ${reservation.ticket_number}`, 150, 15)
  
  // Información del pasajero
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PASAJERO', 10, 35)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Nombre: ${user.name}`, 10, 42)
  doc.text(`Email: ${user.email}`, 10, 48)
  
  // Información del vuelo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('VUELO', 10, 60)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Origen: ${flight.from_city || flight.from}`, 10, 67)
  doc.text(`Destino: ${flight.to_city || flight.to}`, 10, 73)
  doc.text(`Fecha: ${new Date(flight.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`, 10, 79)
  
  // Detalles de vuelo en dos columnas
  doc.setFont('helvetica', 'bold')
  doc.text('SALIDA', 10, 90)
  doc.text('LLEGADA', 105, 90)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text(ticketData.exactTime, 10, 98)
  doc.text(ticketData.estimatedArrival, 105, 98)
  
  doc.setFontSize(10)
  doc.text('Hora exacta', 10, 104)
  doc.text('Hora estimada', 105, 104)
  
  // Información adicional
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(`Aerolínea: ${flight.airline}`, 10, 115)
  doc.text(`Avión: ${ticketData.plane}`, 10, 121)
  doc.text(`Pasillo/Gate: ${ticketData.gate}`, 105, 115)
  doc.text(`Duración: ${flight.duration_min || flight.durationMin} min`, 105, 121)
  
  // Código QR
  try {
    const qrDataUrl = await QRCode.toDataURL(ticketData.qrData, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    doc.addImage(qrDataUrl, 'PNG', 160, 60, 40, 40)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Código de', 160, 105)
    doc.text('Check-in', 160, 111)
  } catch (err) {
    console.error('Error generating QR:', err)
    doc.setFontSize(10)
    doc.text('QR: Check-in', 160, 85)
    doc.text(ticketData.qrData.substring(0, 20), 160, 95)
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Presenta este ticket en el gate para abordar', 10, 138)
  doc.text(`Emisión: ${new Date(reservation.created_at).toLocaleDateString('es-CO')}`, 150, 138)
  
  return doc
}

export function downloadTicketPDF(reservation, flight, user) {
  generateTicketPDF(reservation, flight, user).then(doc => {
    const filename = `ticket-${reservation.ticket_number}.pdf`
    doc.save(filename)
  }).catch(err => {
    console.error('Error generating PDF:', err)
    alert('Error al generar el PDF del ticket')
  })
}

