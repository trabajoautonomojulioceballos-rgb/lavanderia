'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Service {
  id: string
  name: string
  price_per_unit: number
  unit_type: string
}

export default function LandingPage() {
  const [services, setServices] = useState<Service[]>([]) // 👈 Usamos la Interfaz
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: servicesData } = await supabase.from('services').select('*')
      if (servicesData) setServices(servicesData as Service[])

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', currentUser.id)
          .single()
        
        if (profile?.is_admin) setIsAdmin(true)
      }
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.refresh() // Limpia la caché de Next.js
  }

  const handleOrder = async (serviceId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Si no está logueado, lo mandamos al login
    if (!user) {
      alert("Para solicitar un servicio, primero crea tu cuenta. ✨")
      router.push('/login')
      return
    }

    const { error } = await supabase.from('orders').insert([
      { 
        user_id: user.id, 
        service_id: serviceId, 
        status: 'PENDING' 
      }
    ])

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("¡Orden recibida! ✨ En breve pasamos por tu ropa.")
    }
    // Se eliminó el bloque duplicado que estaba aquí
  }

return (
    <div className="min-h-screen bg-white">
      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter text-blue-600 italic">IVY.</div>
        
        <div className="flex items-center gap-8 text-sm font-bold text-slate-600">
          {/* BOTÓN SECRETO: Solo aparece si isAdmin es true */}
          {isAdmin && (
            <a href="/admin" className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Panel Admin ⚙️
            </a>
          )}

          <a href="/tracking" className="hover:text-blue-600 transition">Mis Pedidos</a>
          
          {user ? (
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
              className="text-slate-400 hover:text-red-500 transition"
            >
              Salir
            </button>
          ) : (
            <a href="/login" className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition">
              Iniciar Sesión
            </a>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1545173168-9f18c8fbdd7c?q=80&w=2070&auto=format&fit=crop" 
            alt="Laundry service"
            className="w-full h-full object-cover brightness-[0.85]"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl">
            <span className="text-blue-600 font-black uppercase tracking-widest text-xs mb-4 block">Premium Laundry Service</span>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-none mb-6">
              Tu ropa impecable, <br/> 
              <span className="text-blue-600">sin moverte.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 font-medium">
              Lavandería IVY se encarga de todo. Recogemos, lavamos y entregamos en la puerta de tu casa en 24 horas.
            </p>
            <a href="#servicios" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-200">
              Ver Servicios ↓
            </a>
          </div>
        </div>
      </header>

      {/* --- SERVICES SECTION --- */}
      <main id="servicios" className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Nuestros Servicios</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Calidad artesanal para cada una de tus prendas con la tecnología más avanzada.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s) => (
            <div key={s.id} className="group bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform block">🧺</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{s.name}</h3>
              <p className="text-blue-600 font-black text-2xl mb-6">${s.price_per_unit} <span className="text-xs text-slate-400 font-medium">/ {s.unit_type}</span></p>
              <button 
                onClick={() => handleOrder(s.id)}
                className="w-full py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
              >
                Solicitar
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-center text-sm border-t border-slate-800">
        <p>© 2026 Lavandería IVY. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}