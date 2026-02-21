'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([])

  // Función para traer las órdenes con el nombre del servicio
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        services (
          name
        )
      `) // <--- Aquí es donde ocurre la relación que arreglamos
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    if (error) console.error("Error:", error.message)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Función para que el socio cambie el estado de la ropa
  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    fetchOrders() // Refrescamos la lista
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración IVY 👔</h1>
      
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
            <div>
              <p className="text-blue-600 font-mono text-xs uppercase">Orden #{order.id.slice(0,5)}</p>
              <h2 className="text-xl font-bold">{order.services?.name || 'Servicio Desconocido'}</h2>
              <p className="text-gray-500 text-sm">Recibida: {new Date(order.created_at).toLocaleString()}</p>
              <span className="mt-2 inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold uppercase">
                {order.status}
              </span>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => updateStatus(order.id, 'En Proceso')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
              >
                Lavar 🧺
              </button>
              <button 
                onClick={() => updateStatus(order.id, 'Listo')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
              >
                Entregar ✅
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}