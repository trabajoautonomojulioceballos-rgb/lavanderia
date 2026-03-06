'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// 1. Tipos
type OrderStatus = 'RECEIVED' | 'PROCESSING' | 'READY'

interface Service {
  name: string
}

interface Order {
  id: string
  status: OrderStatus
  services: Service | null
}

// 2. Configuración de estados (tipada)
const STATUS_CONFIG: Record<OrderStatus, {
  progress: string
  label: string
  activeStep: number
}> = {
  RECEIVED: {
    progress: '5%',
    label: 'Estamos cuidando tus prendas...',
    activeStep: 1,
  },
  PROCESSING: {
    progress: '50%',
    label: 'Estamos cuidando tus prendas...',
    activeStep: 2,
  },
  READY: {
    progress: '100%',
    label: '¡Tu ropa te espera! 🥳',
    activeStep: 3,
  },
}

export default function TrackingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 3. useCallback para evitar recrear la función
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('orders')
        .select('id, status, services(name)')

      if (error) throw error

      setOrders((data ?? []) as Order[])
      setError(null)
    } catch (err) {
      console.error(err)
      setError('No pudimos cargar tus pedidos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        fetchOrders
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders])

  if (isLoading) {
    return <div className="p-6 text-center">Cargando...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">{error}</div>
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Mis Pedidos
          </h1>
          <p className="text-slate-500 font-medium">
            Sigue el proceso de tu ropa en vivo
          </p>
        </header>

        <div className="space-y-6">
          {orders.map(order => {
            const config = STATUS_CONFIG[order.status]

            return (
              <div
                key={order.id}
                className="bg-slate-50 rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm"
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  {order.services?.name ?? 'Servicio Desconocido'}
                </h2>

                <div className="flex justify-between items-start mb-2">
                  <Step icon="📥" label="Recibido" active={config.activeStep >= 1} />
                  <Step icon="🧼" label="Lavando" active={config.activeStep >= 2} />
                  <Step icon="✨" label="Listo" active={config.activeStep >= 3} />
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: config.progress }}
                  />
                </div>

                <p className="text-center mt-6 text-sm font-bold text-blue-600">
                  {config.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 4. Componente Step tipado correctamente
interface StepProps {
  icon: string
  label: string
  active: boolean
}

function Step({ icon, label, active }: StepProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`h-12 w-12 rounded-full flex items-center justify-center text-xl shadow-sm transition-all duration-500 ${
          active ? 'bg-white scale-110' : 'bg-slate-200 opacity-40'
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-tighter ${
          active ? 'text-slate-800' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}