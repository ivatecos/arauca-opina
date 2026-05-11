import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import { KeyRound, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [contrasena, setContrasena]         = useState('')
  const [confirmar, setConfirmar]           = useState('')
  const [verContrasena, setVerContrasena]   = useState(false)
  const [cargando, setCargando]             = useState(false)
  const [error, setError]                   = useState('')
  const [listo, setListo]                   = useState(false)
  const [sesionLista, setSesionLista]       = useState(false)

  useEffect(() => {
    // Supabase procesa el hash de la URL automáticamente y dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'PASSWORD_RECOVERY') {
        setSesionLista(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)
    const { error: err } = await supabase.auth.updateUser({ password: contrasena })
    setCargando(false)

    if (err) {
      setError('No se pudo actualizar la contraseña. Solicita un nuevo enlace.')
      return
    }

    setListo(true)
    setTimeout(() => navigate('/login'), 3000)
  }

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none
    focus:ring-2 focus:ring-green-500 border-gray-300`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nueva contraseña</h1>
          <p className="text-gray-500 mt-1">Arauca Opina — Gobernación de Arauca</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {listo ? (
            <Alerta
              tipo="exito"
              mensaje="¡Contraseña actualizada! Redirigiendo al inicio de sesión..."
            />
          ) : !sesionLista ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Verificando enlace de recuperación...</p>
            </div>
          ) : (
            <>
              {error && (
                <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-5" />
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={verContrasena ? 'text' : 'password'}
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={inputCls}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setVerContrasena(!verContrasena)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    type={verContrasena ? 'text' : 'password'}
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className={inputCls}
                  />
                </div>

                <Boton type="submit" variante="primario" tamanio="lg" cargando={cargando} className="w-full">
                  <KeyRound size={18} />
                  Guardar nueva contraseña
                </Boton>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
