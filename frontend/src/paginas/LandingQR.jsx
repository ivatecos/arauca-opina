import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardList, FolderKanban, Lightbulb, QrCode } from 'lucide-react'

const iconosPorTipo = {
  encuesta: { Icono: ClipboardList, color: 'text-blue-700', bg: 'bg-blue-100', label: 'Encuesta' },
  proyecto: { Icono: FolderKanban, color: 'text-purple-700', bg: 'bg-purple-100', label: 'Proyecto' },
  propuesta: { Icono: Lightbulb, color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Propuesta' },
}

export default function LandingQR() {
  const { tipo, id } = useParams()
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    redirigir()
  }, [tipo, id])

  async function redirigir() {
    const rutasMapa = {
      encuesta: `/encuestas/${id}`,
      proyecto: `/proyectos/${id}`,
      propuesta: `/propuestas/${id}`,
    }

    if (!rutasMapa[tipo]) {
      setError('Código QR no válido.')
      setCargando(false)
      return
    }

    // Registrar escaneo en la base de datos
    try {
      const { data: qr } = await supabase
        .from('codigos_qr')
        .select('id, escaneos')
        .eq('tipo', tipo)
        .eq('referencia_id', parseInt(id))
        .maybeSingle()
      if (qr) {
        await supabase
          .from('codigos_qr')
          .update({ escaneos: qr.escaneos + 1 })
          .eq('id', qr.id)
      }
    } catch {
      // No bloqueamos la redirección si falla el registro
    }

    // Pequeño delay para mostrar la pantalla de transición
    setTimeout(() => {
      navigate(rutasMapa[tipo], { replace: true })
    }, 1500)
  }

  const config = iconosPorTipo[tipo] || { Icono: QrCode, color: 'text-gray-700', bg: 'bg-gray-100', label: 'Contenido' }
  const { Icono, color, bg, label } = config

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <QrCode size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">QR no válido</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-green-800">
      <div className="text-center text-white">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-green-800 font-bold text-3xl">AO</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Arauca Opina</h1>
        <p className="text-green-200 mb-8">Gobernación de Arauca</p>

        <div className={`inline-flex items-center gap-3 ${bg} px-6 py-4 rounded-2xl mb-6`}>
          <Icono size={24} className={color} />
          <div className="text-left">
            <p className={`font-semibold ${color}`}>{label}</p>
            <p className="text-gray-600 text-sm">Cargando contenido...</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  )
}
