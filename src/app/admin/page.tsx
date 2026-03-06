'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// 1. Interfaz actualizada con profiles (para que TS no se queje)
interface Order {
  id: string
  status: string
  created_at: string
  services: { name: string } | null
  profiles: { 
    phone: string; 
    address: string 
  } | null
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 2. fetchOrders correctamente envuelto en useCallback
  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, 
        status, 
        created_at, 
        services(name),
        profiles(phone, address)
      `)
      .order('created_at', { ascending: false })
    
    // Casteamos el resultado a nuestra interfaz
    if (data) setOrders(data as unknown as Order[])
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        // 3. Verificación de seguridad: Usamos la tabla profiles para mayor seguridad
        if (error || !user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!profile?.is_admin) {
          alert("Acceso denegado: No eres administrador.")
          router.push('/')
          return
        }

        await fetchOrders()
      } catch (err) {
        console.error("Error en la autenticación", err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router, fetchOrders])

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (!error) {
      fetchOrders()
    } else {
      alert("Error al actualizar: " + error.message)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 font-bold animate-pulse">Verificando credenciales de Admin...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">IVY Admin</h1>
          <p className="text-slate-500 font-medium">Gestión de órdenes en tiempo real</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-green-500 animate-pulse mr-2">●</span>
          <span className="text-sm font-bold text-slate-600">Sistema Online</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid gap-6">
        {orders.length === 0 ? (
          <p className="text-center text-slate-400 py-10">No hay órdenes registradas.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">
                    🧺
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Orden #{order.id.slice(0,5)}</p>
                    <h2 className="text-xl font-bold text-slate-800">
                      {order.services?.name || 'Servicio no especificado'}
                    </h2>
                    <span className={`inline-block mt-2 text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                      order.status === 'READY' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* 4. Mostramos los datos de contacto y dirección que traemos de profiles */}
                <div className="mt-4 md:mt-0 text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
                   <p className="text-sm font-bold text-slate-700">📍 {order.profiles?.address || 'Sin dirección'}</p>
                   <p className="text-sm font-medium text-blue-600">📞 {order.profiles?.phone || 'Sin teléfono'}</p>
                </div>
              </div>

              <div className="flex gap-3 w-full border-t pt-6">
                <button 
                  onClick={() => updateStatus(order.id, 'PROCESSING')}
                  className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition"
                >
                  Lavar
                </button>
                <button 
                  onClick={() => updateStatus(order.id, 'READY')}
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  ¡Listo! ✅
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}