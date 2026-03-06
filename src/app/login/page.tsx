'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  
  if (isSignUp) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return alert(error.message)
    
    // Si el registro fue exitoso, actualizamos su perfil con teléfono y dirección
    if (data.user) {
      await supabase.from('profiles').update({ 
        phone: phone, 
        address: address 
      }).eq('id', data.user.id)
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
  }

  router.push('/')
  router.refresh()
  setLoading(false)
}

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-100 p-10 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-blue-600 mb-2">IVY.</h1>
          <p className="text-slate-500 font-medium">
            {isSignUp ? 'Crea tu cuenta premium' : 'Bienvenido de vuelta'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          <>
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Teléfono</label>
      <input 
        type="tel" 
        placeholder="+57 300..."
        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
    </div>
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Dirección de Recogida</label>
      <input 
        type="text" 
        placeholder="Calle 123 #..."
        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
    </div>
  </>

          
          
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Email</label>
            <input 
              type="email" 
              placeholder="tu@correo.com"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Registrarme' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿Eres nuevo en IVY?'} {' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isSignUp ? 'Inicia sesión' : 'Crea una cuenta'}
          </button>
        </p>
      </div>
    </div>
  )
}