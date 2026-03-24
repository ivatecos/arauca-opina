/**
 * Botón reutilizable con variantes, tamaños y estado de carga.
 * Variantes: 'primario' | 'secundario' | 'peligro' | 'fantasma' | 'dorado'
 * Tamaños:   'sm' | 'md' | 'lg'
 */
export default function Boton({
  children,
  variante = 'primario',
  tamanio = 'md',
  cargando = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
    'transition-all duration-200 focus-visible:outline focus-visible:outline-2 ' +
    'focus-visible:outline-offset-2 focus-visible:outline-green-600 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

  const variantes = {
    primario:
      'bg-green-700 hover:bg-green-600 active:bg-green-800 text-white ' +
      'shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/25 hover:-translate-y-0.5',
    secundario:
      'bg-white hover:bg-gray-50 active:bg-gray-100 text-green-800 ' +
      'border-2 border-green-700 shadow-sm hover:shadow-md hover:-translate-y-0.5',
    peligro:
      'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white ' +
      'shadow-md shadow-red-900/20 hover:shadow-lg hover:-translate-y-0.5',
    fantasma:
      'text-green-700 hover:bg-green-50 active:bg-green-100',
    dorado:
      'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-white ' +
      'shadow-md shadow-yellow-900/25 hover:shadow-lg hover:shadow-yellow-900/30 hover:-translate-y-0.5',
  }

  const tamanios = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`${base} ${variantes[variante]} ${tamanios[tamanio]} ${className}`}
      {...props}
    >
      {cargando && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
