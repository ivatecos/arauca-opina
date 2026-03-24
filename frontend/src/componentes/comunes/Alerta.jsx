import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

const tipos = {
  exito: {
    icono: CheckCircle,
    clases: 'bg-green-50 border-green-200 text-green-800',
    iconoClase: 'text-green-500',
  },
  error: {
    icono: XCircle,
    clases: 'bg-red-50 border-red-200 text-red-800',
    iconoClase: 'text-red-500',
  },
  advertencia: {
    icono: AlertCircle,
    clases: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconoClase: 'text-yellow-500',
  },
  info: {
    icono: Info,
    clases: 'bg-blue-50 border-blue-200 text-blue-800',
    iconoClase: 'text-blue-500',
  },
}

export default function Alerta({ tipo = 'info', mensaje, onCerrar, className = '' }) {
  if (!mensaje) return null

  const config = tipos[tipo]
  const Icono = config.icono

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.clases} ${className}`}
      role="alert"
    >
      <Icono size={18} className={`flex-shrink-0 mt-0.5 ${config.iconoClase}`} />
      <p className="flex-1 text-sm">{mensaje}</p>
      {onCerrar && (
        <button
          onClick={onCerrar}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar alerta"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
