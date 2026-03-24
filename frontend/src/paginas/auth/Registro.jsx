import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import CampoFormulario, { Input, Select } from '@/componentes/comunes/CampoFormulario'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

const MUNICIPIOS_ARAUCA = [
  'Arauca',
  'Arauquita',
  'Cravo Norte',
  'Fortul',
  'Puerto Rondón',
  'Saravena',
  'Tame',
]

export default function Registro() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    celular: '',
    municipio: '',
    contrasena: '',
    confirmarContrasena: '',
  })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
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

    if (!form.nombre.trim() || form.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!form.correo.trim()) {
      nuevosErrores.correo = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(form.correo)) {
      nuevosErrores.correo = 'Ingresa un correo válido'
    }

    if (form.celular && !/^[0-9]{10}$/.test(form.celular.replace(/\s/g, ''))) {
      nuevosErrores.celular = 'El celular debe tener 10 dígitos'
    }

    if (!form.municipio) {
      nuevosErrores.municipio = 'Selecciona tu municipio'
    }

    if (!form.contrasena || form.contrasena.length < 8) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (form.contrasena !== form.confirmarContrasena) {
      nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden'
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
      // 1. Crear cuenta en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.correo,
        password: form.contrasena,
        options: {
          data: {
            nombre: form.nombre,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este correo ya está registrado. Intenta iniciar sesión.')
        } else {
          setError('Error al crear la cuenta. Por favor intenta más tarde.')
        }
        return
      }

      // 2. Crear perfil en la tabla usuarios
      if (authData.user) {
        const { error: perfilError } = await supabase.from('usuarios').insert({
          id: authData.user.id,
          nombre: form.nombre.trim(),
          correo: form.correo.toLowerCase().trim(),
          celular: form.celular.trim() || null,
          municipio: form.municipio,
          rol: 'ciudadano',
        })

        if (perfilError) {
          console.error('Error creando perfil:', perfilError)
        }
      }

      setExito(
        'Registro exitoso. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.'
      )
      setTimeout(() => navigate('/login'), 4000)
    } catch {
      setError('Ocurrió un error inesperado. Por favor intenta más tarde.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">AO</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="text-gray-500 mt-1">Regístrate como ciudadano de Arauca</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-6" />
          )}
          {exito && (
            <Alerta tipo="exito" mensaje={exito} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <CampoFormulario id="nombre" label="Nombre completo" error={errores.nombre} requerido>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                error={errores.nombre}
                placeholder="Tu nombre completo"
                autoComplete="name"
                autoFocus
              />
            </CampoFormulario>

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
              />
            </CampoFormulario>

            <CampoFormulario
              id="celular"
              label="Número de celular"
              error={errores.celular}
              ayuda="Opcional - 10 dígitos sin espacios"
            >
              <Input
                id="celular"
                name="celular"
                type="tel"
                value={form.celular}
                onChange={handleChange}
                error={errores.celular}
                placeholder="3001234567"
                autoComplete="tel"
              />
            </CampoFormulario>

            <CampoFormulario id="municipio" label="Municipio" error={errores.municipio} requerido>
              <Select
                id="municipio"
                name="municipio"
                value={form.municipio}
                onChange={handleChange}
                error={errores.municipio}
              >
                <option value="">Selecciona tu municipio</option>
                {MUNICIPIOS_ARAUCA.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </CampoFormulario>

            <CampoFormulario id="contrasena" label="Contraseña" error={errores.contrasena} requerido
              ayuda="Mínimo 8 caracteres">
              <div className="relative">
                <Input
                  id="contrasena"
                  name="contrasena"
                  type={verContrasena ? 'text' : 'password'}
                  value={form.contrasena}
                  onChange={handleChange}
                  error={errores.contrasena}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
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

            <CampoFormulario id="confirmarContrasena" label="Confirmar contraseña"
              error={errores.confirmarContrasena} requerido>
              <Input
                id="confirmarContrasena"
                name="confirmarContrasena"
                type={verContrasena ? 'text' : 'password'}
                value={form.confirmarContrasena}
                onChange={handleChange}
                error={errores.confirmarContrasena}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
              />
            </CampoFormulario>

            <Boton
              type="submit"
              variante="primario"
              tamanio="lg"
              cargando={cargando}
              className="w-full"
            >
              <UserPlus size={18} />
              Crear cuenta
            </Boton>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-green-700 font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
