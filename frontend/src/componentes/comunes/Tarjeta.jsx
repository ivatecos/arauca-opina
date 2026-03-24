export default function Tarjeta({ children, className = '', sinPadding = false }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-100 transition-all duration-200 ${
        sinPadding ? '' : 'p-6'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function TarjetaHeader({ children, className = '' }) {
  return (
    <div className={`pb-4 mb-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

export function TarjetaFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 mt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  )
}
