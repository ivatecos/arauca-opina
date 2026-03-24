import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import { Lightbulb, Send, ChevronLeft, CheckCircle } from 'lucide-react'

const TEMAS = [
  'Educación', 'Salud', 'Infraestructura', 'Medio Ambiente',
  'Seguridad', 'Cultura', 'Deporte', 'Vivienda', 'Económico', 'General',
]

export default function NuevaPropuesta() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()

  const [form, setForm] = useState({ titulo: '', descripcion: '', tema: 'General' })
  const [enviando, setEnviando] = useState(false)
  const [error,    setError]    = useState('')
  const [enviada,  setEnviada]  = useState(false)

  const set = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.value }))

  async function handleEnviar(e) {
    e.preventDefault()
    if (!form.titulo.trim())       { setError('El título es obligatorio.'); return }
    if (!form.descripcion.trim())  { setError('La descripción es obligatoria.'); return }
    if (form.titulo.length < 10)   { setError('El título debe tener al menos 10 caracteres.'); return }
    if (form.descripcion.length < 30) {
      setError('La descripción debe tener al menos 30 caracteres.'); return
    }

    setEnviando(true)
    setError('')

    const { error: err } = await supabase.from('propuestas').insert({
      usuario_id:  usuario.id,
      titulo:      form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      tema:        form.tema,
      estado:      'pendiente',
    })

    if (err) {
      setError('Error al enviar la propuesta. Intenta de nuevo.')
      setEnviando(false)
      return
    }

    setEnviada(true)
  }

  /* ── Sin sesión ── */
  if (!usuario) return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Tarjeta className="text-center py-16">
          <Lightbulb size={48} className="text-amber-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia sesión primero</h2>
          <p className="text-gray-500 mb-6">
            Para enviar una propuesta necesitas tener una cuenta.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/login">
              <Boton variante="primario">Iniciar sesión</Boton>
            </Link>
            <Link to="/registro">
              <Boton variante="secundario">Registrarse</Boton>
            </Link>
          </div>
        </Tarjeta>
      </div>
    </section>
  )

  /* ── Enviada con éxito ── */
  if (enviada) return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Tarjeta className="text-center py-14">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            ¡Propuesta enviada!
          </h2>
          <p className="text-gray-500 mb-2">
            Tu propuesta fue recibida y será revisada por el equipo de la Gobernación.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Te notificaremos cuando cambie su estado.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/propuestas">
              <Boton variante="primario">Ver todas las propuestas</Boton>
            </Link>
            <Boton variante="secundario" onClick={() => {
              setForm({ titulo: '', descripcion: '', tema: 'General' })
              setEnviada(false)
            }}>
              Enviar otra
            </Boton>
          </div>
        </Tarjeta>
      </div>
    </section>
  )

  const restanteTitulo = Math.max(0, 10 - form.titulo.length)
  const restanteDesc   = Math.max(0, 30 - form.descripcion.length)

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/propuestas')}
            className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-1">
              <Lightbulb size={15} /> Nueva propuesta
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Comparte tu idea
            </h1>
          </div>
        </div>

        {/* Guía de uso */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-semibold">¿Cómo funciona?</span> Envía tu propuesta y
            la Gobernación la revisará. Si es aprobada, la comunidad podrá votarla con
            estrellas. Las propuestas más votadas tienen mayor impacto en las decisiones.
          </p>
        </div>

        {error && (
          <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-5" />
        )}

        <Tarjeta>
          <form onSubmit={handleEnviar} className="space-y-5">

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Título de la propuesta *
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={set('titulo')}
                placeholder="Ej: Construcción de parque en el barrio Jordán"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-between mt-1">
                {restanteTitulo > 0 ? (
                  <p className="text-xs text-amber-600">Mínimo {restanteTitulo} caracteres más</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-gray-400">{form.titulo.length}/120</p>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Descripción detallada *
              </label>
              <textarea
                rows={6}
                value={form.descripcion}
                onChange={set('descripcion')}
                placeholder="Describe tu propuesta: ¿qué problema resuelve?, ¿cómo se implementaría?, ¿a quiénes beneficia?..."
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
              <div className="flex justify-between mt-1">
                {restanteDesc > 0 ? (
                  <p className="text-xs text-amber-600">Mínimo {restanteDesc} caracteres más</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-gray-400">{form.descripcion.length}/1000</p>
              </div>
            </div>

            {/* Tema */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tema
              </label>
              <select
                value={form.tema}
                onChange={set('tema')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500">
                {TEMAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Aviso autor */}
            <p className="text-xs text-gray-400">
              Se publicará bajo tu nombre: <span className="font-medium text-gray-600">{usuario.nombre}</span>
            </p>

            <Boton type="submit" variante="primario" tamanio="lg"
              cargando={enviando} className="w-full">
              <Send size={17} /> Enviar propuesta
            </Boton>
          </form>
        </Tarjeta>

      </div>
    </section>
  )
}
