const API_BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export const Api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  cities: () => request('/api/cities'),
  searchFlights: (params) => {
    const q = new URLSearchParams(params)
    return request(`/api/flights?${q.toString()}`)
  },
  dashboard: () => request('/api/dashboard'),
  adminSummary: () => request('/api/admin/summary')
}
