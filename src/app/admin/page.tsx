'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, status, created_at, services(name)')
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    fetchOrders()
  }

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

      <div className="max-w-5xl mx-auto grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-md">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">
                🧺
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Orden #{order.id.slice(0,5)}</p>
                <h2 className="text-xl font-bold text-slate-800">{order.services?.name}</h2>
                <div className="flex gap-2 mt-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                    order.status === 'READY' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => updateStatus(order.id, 'PROCESSING')}
                className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200"
              >
                Lavar
              </button>
              <button 
                onClick={() => updateStatus(order.id, 'READY')}
                className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                ¡Listo! ✅
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}