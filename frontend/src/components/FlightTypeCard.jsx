import React, { useState } from 'react'

const flightTypes = {
  economico: {
    name: 'Económico',
    description: 'La opción más económica para viajar',
    features: [
      'Asiento estándar con espacio básico',
      'Equipaje de mano incluido (10 kg)',
      'Sin cambios ni reembolsos',
      'Prioridad estándar de abordaje',
      'Servicio de comida a la venta'
    ],
    price: 'Desde $120.000 COP',
    color: '#3da9fc'
  },
  normal: {
    name: 'Normal',
    description: 'Equilibrio perfecto entre precio y comodidad',
    features: [
      'Asiento con más espacio para las piernas',
      'Equipaje de mano incluido (12 kg)',
      'Cambios con cargo adicional',
      'Prioridad media de abordaje',
      'Bebida y snack incluidos'
    ],
    price: 'Desde $250.000 COP',
    color: '#2a7fca'
  },
  preferencial: {
    name: 'Preferencial',
    description: 'Mayor comodidad y flexibilidad',
    features: [
      'Asiento con espacio extra para piernas',
      'Equipaje de mano (12 kg) + 1 maleta (23 kg)',
      'Cambios y cancelaciones con cargo reducido',
      'Prioridad alta de abordaje',
      'Comida y bebidas incluidas',
      'Acceso a salas VIP en algunos aeropuertos'
    ],
    price: 'Desde $400.000 COP',
    color: '#1e5f9e'
  },
  premium: {
    name: 'Premium / Primera Clase',
    description: 'La máxima experiencia de vuelo',
    features: [
      'Asientos reclinables con amplio espacio',
      'Equipaje de mano (15 kg) + 2 maletas (32 kg c/u)',
      'Cambios y cancelaciones sin cargo',
      'Abordaje prioritario y desembarque rápido',
      'Menú gourmet y barra libre',
      'Acceso a salas VIP exclusivas',
      'Sistema de entretenimiento premium',
      'Atención personalizada'
    ],
    price: 'Desde $550.000 COP',
    color: '#0d3d6b'
  }
}

export default function FlightTypeCard({ type }) {
  const [isOpen, setIsOpen] = useState(false)
  const info = flightTypes[type]

  return (
    <>
      <div 
        className="flight-type-card"
        onClick={() => setIsOpen(true)}
        style={{ 
          background: `linear-gradient(135deg, ${info.color}15 0%, ${info.color}05 100%)`,
          borderColor: info.color
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: info.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 800
            }}
          >
            {type === 'economico' ? '💰' : type === 'normal' ? '✨' : type === 'preferencial' ? '⭐' : '👑'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>
              {info.name}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-light)' }}>
              {info.description}
            </p>
          </div>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: info.color, marginTop: '16px' }}>
          {info.price}
        </div>
        <button 
          className="btn-outline" 
          style={{ 
            marginTop: '16px', 
            width: '100%',
            borderColor: info.color,
            color: info.color
          }}
        >
          Ver detalles →
        </button>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
                {info.name}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '28px', 
                  cursor: 'pointer',
                  color: 'var(--text-light)'
                }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: '18px', color: 'var(--text-light)', marginBottom: '24px' }}>
              {info.description}
            </p>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
                Incluye:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {info.features.map((feature, idx) => (
                  <li 
                    key={idx}
                    style={{ 
                      padding: '12px 0', 
                      borderBottom: '1px solid var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ color: info.color, fontSize: '20px' }}>✓</span>
                    <span style={{ fontSize: '16px', color: 'var(--text)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ 
              padding: '20px', 
              background: `linear-gradient(135deg, ${info.color}15 0%, ${info.color}05 100%)`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: info.color }}>
                {info.price}
              </div>
              <button 
                className="btn" 
                style={{ 
                  marginTop: '16px',
                  background: info.color,
                  minWidth: '200px'
                }}
                onClick={() => setIsOpen(false)}
              >
                Buscar vuelos {info.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

