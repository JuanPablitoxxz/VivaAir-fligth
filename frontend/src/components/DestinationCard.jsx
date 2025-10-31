import React from 'react'

// Imágenes específicas de ciudades colombianas - URLs actualizadas con imágenes más confiables
const cityImages = {
  'Bogotá': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=600&h=400&q=80',
  'Medellín': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&h=400&q=80',
  'Cali': 'https://images.unsplash.com/photo-1576982826104-48cc330ae4f9?auto=format&fit=crop&w=600&h=400&q=80',
  'Cartagena': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&h=400&q=80',
  'Barranquilla': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&h=400&q=80',
  'Bucaramanga': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=600&h=400&q=80',
  'Pereira': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=400&q=80',
  'Santa Marta': 'https://images.unsplash.com/photo-1578839948499-2b389f2004c9?auto=format&fit=crop&w=600&h=400&q=80',
  'Cúcuta': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=400&q=80',
  'Ibagué': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=400&q=80'
}

export default function DestinationCard({ city, isPopular = false, onClick }) {
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)
  const imageUrl = cityImages[city] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&h=400'
  
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
        {!imageError && (
          <img 
            src={imageUrl} 
            alt={city}
            className="destination-card-image"
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 2,
              backgroundColor: 'var(--primary-light)'
            }}
            onLoad={(e) => {
              setImageLoaded(true)
            }}
            onError={(e) => {
              console.error('Error loading image for', city, ':', imageUrl)
              setImageError(true)
            }}
          />
        )}
        <div 
          className="destination-card-image-fallback" 
          style={{ 
            display: imageLoaded && !imageError ? 'none' : 'flex',
            zIndex: 1
          }}
        >
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
