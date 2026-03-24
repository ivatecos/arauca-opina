import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import {
  Lightbulb, Star, CheckCircle, User,
  Calendar, Tag, Users,
} from 'lucide-react'

const ESTADOS = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  en_revision: { label: 'En revisión', color: 'bg-blue-100 text-blue-700' },
  aprobada:    { label: 'Aprobada',    color: 'bg-green-100 text-green-700' },
  rechazada:   { label: 'Rechazada',   color: 'bg-red-100 text-red-600' },
}

const ETIQUETAS = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente']

export default function PropuestaDetalle() {
  const { id }       = useParams()
  const { usuario }  = useAuth()

  const [propuesta, setPropuesta] = useState(null)
  const [cargando,  setCargando]  = useState(true)
  const [estrellas, setEstrellas] = useState(0)
  const [enviando,  setEnviando]  = useState(false)
  const [yaVoto,    setYaVoto]    = useState(false)
  const [error,     setError]     = useState('')
  const [exito,     setExito]     = useState(false)

  const cargarPropuesta = useCallback(async () => {
    const { data } = await supabase
      .from('propuestas')
      .select('*, usuarios(nombre, municipio)')
      .eq('id', id)
      .single()

    setPropuesta(data)

    if (usuario && data) {
      const { data: voto } = await supabase
        .from('votos_propuestas')
        .select('id, estrellas')
        .eq('propuesta_id', id)
        .eq('usuario_id', usuario.id)
        .maybeSingle()
      if (voto) { setYaVoto(true); setEstrellas(voto.estrellas) }
    }
  }, [id, usuario])

  useEffect(() => {
    async function init() {
      await cargarPropuesta()
      setCargando(false)
    }
    init()
  }, [cargarPropuesta])

  async function handleVotar() {
    if (!usuario)  { setError('Debes iniciar sesión para votar.'); return }
    if (!estrellas) { setError('Selecciona una puntuación (1-5 estrellas).'); return }
    if (propuesta?.usuario_id === usuario.id) {
      setError('No puedes votar tu propia propuesta.'); return
    }

    setEnviando(true)
    setError('')

    const { error: err } = await supabase.from('votos_propuestas').insert({
      propuesta_id: parseInt(id),
      usuario_id:   usuario.id,
      estrellas,
    })

    if (err) {
      setError('Error al registrar tu voto. Intenta de nuevo.')
      setEnviando(false)
      return
    }

    // El trigger de Supabase actualiza el promedio automáticamente
    await cargarPropuesta()   // refresca datos en tiempo real
    setExito(true)
    setYaVoto(true)
    setEnviando(false)
  }

  /* ── Loading ── */
  if (cargando) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
    </div>
  )

  if (!propuesta) return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Lightbulb size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Propuesta no encontrada</h2>
        <Link to="/propuestas" className="mt-4 inline-block text-sm text-amber-600 hover:underline">
          Ver todas las propuestas
        </Link>
      </div>
    </section>
  )

  const esPropia    = usuario?.id === propuesta.usuario_id
  const estadoInfo  = ESTADOS[propuesta.estado]

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Columna principal ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Encabezado */}
            <div>
              <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3">
                <Lightbulb size={16} /> Propuesta ciudadana
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                {propuesta.titulo}
              </h1>
              <div className="flex flex-wrap gap-2">
                {estadoInfo && (
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${estadoInfo.color}`}>
                    {estadoInfo.label}
                  </span>
                )}
                {propuesta.tema && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                    {propuesta.tema}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <Tarjeta>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {propuesta.descripcion}
              </p>
            </Tarjeta>

            {/* Meta info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <User size={12} /> Autor
                </div>
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {propuesta.usuarios?.nombre || 'Ciudadano'}
                </p>
                {propuesta.usuarios?.municipio && (
                  <p className="text-xs text-gray-400">{propuesta.usuarios.municipio}</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <Calendar size={12} /> Enviada
                </div>
                <p className="font-semibold text-gray-800 text-sm">
                  {new Date(propuesta.fecha).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <Tag size={12} /> Tema
                </div>
                <p className="font-semibold text-gray-800 text-sm">
                  {propuesta.tema || 'General'}
                </p>
              </div>
            </div>

          </div>

          {/* ── Columna lateral: votación ──────────────────────────── */}
          <div className="space-y-5">

            {/* Puntuación actual */}
            <Tarjeta>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Puntuación
                </p>
                <p className="text-5xl font-extrabold text-amber-500 leading-none mb-2">
                  {propuesta.estrellas > 0 ? Number(propuesta.estrellas).toFixed(1) : '—'}
                </p>
                <div className="flex justify-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={18}
                      className={n <= Math.round(propuesta.estrellas)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
                  <Users size={14} />
                  {propuesta.total_votos} voto{propuesta.total_votos !== 1 ? 's' : ''}
                </div>
              </div>
            </Tarjeta>

            {/* Formulario de voto */}
            {esPropia ? (
              <Tarjeta className="text-center py-6">
                <Lightbulb size={32} className="text-amber-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Esta es tu propuesta.</p>
                <p className="text-xs text-gray-400 mt-1">No puedes votar tus propias ideas.</p>
              </Tarjeta>
            ) : exito || yaVoto ? (
              <Tarjeta className="text-center py-8">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-800 mb-1">¡Voto registrado!</p>
                <p className="text-sm text-gray-500 mb-3">
                  Gracias por apoyar esta propuesta.
                </p>
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={20}
                      className={n <= estrellas
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
              </Tarjeta>
            ) : (
              <Tarjeta>
                <h3 className="font-bold text-gray-800 mb-4 text-center">
                  ¿Apoyas esta idea?
                </h3>

                {error && (
                  <Alerta tipo="error" mensaje={error}
                    onCerrar={() => setError('')} className="mb-4" />
                )}

                {/* Estrellas */}
                <div className="flex justify-center gap-2 mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setEstrellas(n)}
                      className="hover:scale-125 transition-transform duration-150"
                      aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}>
                      <Star size={34}
                        className={n <= estrellas
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 fill-gray-100'} />
                    </button>
                  ))}
                </div>

                {estrellas > 0 && (
                  <p className="text-center text-sm font-semibold text-amber-600 mb-4">
                    {ETIQUETAS[estrellas]}
                  </p>
                )}

                {!usuario && (
                  <Alerta tipo="advertencia"
                    mensaje="Inicia sesión para votar." className="mb-4" />
                )}

                <Boton variante="primario" tamanio="lg" cargando={enviando}
                  disabled={!usuario || estrellas === 0}
                  onClick={handleVotar} className="w-full">
                  <Star size={16} /> Votar propuesta
                </Boton>

                {!usuario && (
                  <div className="flex gap-2 mt-3">
                    <Link to="/login" className="flex-1">
                      <Boton variante="secundario" tamanio="sm" className="w-full">
                        Iniciar sesión
                      </Boton>
                    </Link>
                    <Link to="/registro" className="flex-1">
                      <Boton variante="fantasma" tamanio="sm" className="w-full">
                        Registrarse
                      </Boton>
                    </Link>
                  </div>
                )}
              </Tarjeta>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}
