import React, { useState } from 'react'
import Airlines from './admin/Airlines.jsx'
import Cashiers from './admin/Cashiers.jsx'
import Metrics from './admin/Metrics.jsx'

export default function Admin(){
  const [activeTab, setActiveTab] = useState('metrics')

  const tabs = [
    { id: 'metrics', label: 'Métricas' },
    { id: 'airlines', label: 'Aerolíneas' },
    { id: 'cashiers', label: 'Cajeros' }
  ]

  return (
    <div>
      <div style={{ borderBottom: '2px solid var(--muted)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'btn-primary' : 'btn-outline'}
              style={{ 
                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : 'none',
                borderRadius: '8px 8px 0 0',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'metrics' && <Metrics />}
      {activeTab === 'airlines' && <Airlines />}
      {activeTab === 'cashiers' && <Cashiers />}
    </div>
  )
}
