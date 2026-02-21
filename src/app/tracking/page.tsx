'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TrackingPage() {
  const [orders, setOrders] = useState<any[]>([])

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('id, status, services(name)')
    if (data) setOrders(data)
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase.channel('realtime-orders').on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'orders' }, () => fetchOrders()
    ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Mis Pedidos</h1>
        <p className="text-slate-500 mb-8 font-medium">Sigue el proceso de tu ropa en vivo</p>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-50 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{order.services?.name}</h2>
                
                {/* Stepper Visual */}
                <div className="flex justify-between items-start mb-2">
                  <Step icon="📥" label="Recibido" active={true} />
                  <Step icon="🧼" label="Lavando" active={order.status === 'PROCESSING' || order.status === 'READY'} />
                  <Step icon="✨" label="Listo" active={order.status === 'READY'} />
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: order.status === 'READY' ? '100%' : order.status === 'PROCESSING' ? '50%' : '5%' }}
                  />
                </div>
                
                <p className="text-center mt-6 text-sm font-bold text-blue-600">
                  {order.status === 'READY' ? '¡Tu ropa te espera! 🥳' : 'Estamos cuidando tus prendas...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step({ icon, label, active }: { icon: string, label: string, active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl shadow-sm transition-colors duration-500 ${active ? 'bg-white' : 'bg-slate-200 opacity-40'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-tighter ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
    </div>
  )
}