/**
 * Componente de campo de formulario con etiqueta y manejo de errores
 */
export default function CampoFormulario({
  id,
  label,
  error,
  ayuda,
  requerido = false,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {requerido && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {ayuda && !error && (
        <p className="text-xs text-gray-500">{ayuda}</p>
      )}
      {error && (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  )
}

export function Input({
  id,
  error,
  className = '',
  ...props
}) {
  return (
    <input
      id={id}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
        error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      } ${className}`}
      {...props}
    />
  )
}

export function Select({
  id,
  error,
  children,
  className = '',
  ...props
}) {
  return (
    <select
      id={id}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
        error ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({
  id,
  error,
  className = '',
  ...props
}) {
  return (
    <textarea
      id={id}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
        error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      } ${className}`}
      {...props}
    />
  )
}
