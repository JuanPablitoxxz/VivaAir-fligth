import React from 'react'

// Imágenes específicas de ciudades colombianas - usando URLs directas de Unsplash sin parámetros que puedan causar problemas
const cityImages = {
  'Bogotá': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=600&h=400',
  'Medellín': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&h=400',
  'Cali': 'https://images.unsplash.com/photo-1587330979470-3585acb56371?auto=format&fit=crop&w=600&h=400',
  'Cartagena': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&h=400',
  'Barranquilla': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&h=400',
  'Bucaramanga': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=600&h=400',
  'Pereira': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=400',
  'Santa Marta': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?auto=format&fit=crop&w=600&h=400',
  'Cúcuta': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=400',
  'Ibagué': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=400'
}

export default function DestinationCard({ city, isPopular = false, onClick }) {
  const imageUrl = cityImages[city] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
  
  return (
    <div 
      className="destination-card" 
      onClick={onClick}
      style={{ position: 'relative' }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#dc2626',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          zIndex: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Popular
        </div>
      )}
      <div className="destination-card-image-container">
        <img 
          src={imageUrl} 
          alt={city}
          className="destination-card-image"
          loading="lazy"
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            backgroundColor: 'var(--primary-light)'
          }}
          onLoad={(e) => {
            // Asegurar que la imagen se muestra cuando carga correctamente
            e.target.style.display = 'block'
            const fallback = e.target.nextElementSibling
            if (fallback) {
              fallback.style.display = 'none'
            }
          }}
          onError={(e) => {
            console.error('Error loading image for', city, ':', imageUrl)
            e.target.style.display = 'none'
            const fallback = e.target.nextElementSibling
            if (fallback) {
              fallback.style.display = 'flex'
            }
          }}
        />
        <div className="destination-card-image-fallback" style={{ display: 'flex' }}>
          {city.substring(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="destination-card-content">
        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>
          {city}
        </h3>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--text-light)' }}>
          Ver vuelos disponibles →
        </p>
      </div>
    </div>
  )
}
