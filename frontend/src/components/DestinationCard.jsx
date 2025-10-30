import React from 'react'

// Imágenes específicas y acordes a cada ciudad colombiana
const cityImages = {
  'Bogotá': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop',
  'Medellín': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
  'Cali': 'https://images.unsplash.com/photo-1587330979470-3585acb56371?w=400&h=300&fit=crop',
  'Cartagena': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
  'Barranquilla': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop',
  'Bucaramanga': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
  'Pereira': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'Santa Marta': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=400&h=300&fit=crop',
  'Cúcuta': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'Ibagué': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
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
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex'
            }
          }}
        />
        <div className="destination-card-image-fallback" style={{ display: 'none' }}>
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
