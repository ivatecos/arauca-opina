import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import CampoFormulario, { Input } from '@/componentes/comunes/CampoFormulario'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ correo: '', contrasena: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  function validar() {
    const nuevosErrores = {}
    if (!form.correo.trim()) {
      nuevosErrores.correo = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(form.correo)) {
      nuevosErrores.correo = 'Ingresa un correo válido'
    }
    if (!form.contrasena) {
      nuevosErrores.contrasena = 'La contraseña es requerida'
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return

    setCargando(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: form.correo,
        password: form.contrasena,
      })

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('Correo o contraseña incorrectos. Intenta de nuevo.')
        } else if (authError.message.toLowerCase().includes('confirm')) {
          setError('Debes confirmar tu correo electrónico antes de ingresar.')
        } else {
          setError(`Error: ${authError.message}`)
        }
        return
      }

      navigate(destino, { replace: true })
    } catch {
      setError('Ocurrió un error inesperado. Por favor intenta más tarde.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">AO</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido de nuevo</h1>
          <p className="text-gray-500 mt-1">Ingresa a tu cuenta de Arauca Opina</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <CampoFormulario id="correo" label="Correo electrónico" error={errores.correo} requerido>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                error={errores.correo}
                placeholder="tu@correo.com"
                autoComplete="email"
                autoFocus
              />
            </CampoFormulario>

            <CampoFormulario id="contrasena" label="Contraseña" error={errores.contrasena} requerido>
              <div className="relative">
                <Input
                  id="contrasena"
                  name="contrasena"
                  type={verContrasena ? 'text' : 'password'}
                  value={form.contrasena}
                  onChange={handleChange}
                  error={errores.contrasena}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setVerContrasena(!verContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={verContrasena ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </CampoFormulario>

            <Boton
              type="submit"
              variante="primario"
              tamanio="lg"
              cargando={cargando}
              className="w-full"
            >
              <LogIn size={18} />
              Iniciar sesión
            </Boton>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-green-700 font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
