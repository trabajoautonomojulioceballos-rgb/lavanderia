'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    
    if (error) alert(error.message)
    else alert('¡Revisa tu correo para el enlace de acceso! 📩')
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar a IVY 👔</h1>
        <input
          type="email"
          placeholder="Tu correo electrónico"
          className="w-full p-3 border rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {loading ? 'Enviando...' : 'Enviar Enlace Mágico'}
        </button>
      </form>
    </div>
  )
}