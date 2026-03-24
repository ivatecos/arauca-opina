import { useParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import {
  FolderKanban, Star, CheckCircle, MapPin,
  Banknote, Calendar, Users, BarChart2,
} from 'lucide-react'

const ESTADOS = {
  publicado:    { label: 'Publicado',    color: 'bg-blue-100 text-blue-700' },
  en_ejecucion: { label: 'En ejecución', color: 'bg-green-100 text-green-700' },
  finalizado:   { label: 'Finalizado',   color: 'bg-gray-100 text-gray-600' },
}

const ETIQUETAS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

/* ── Barra de distribución de votos ──────────────────────────────────────── */
function BarraVotos({ distribucion, total }) {
  return (
    <div className="space-y-2 mt-4">
      {[5, 4, 3, 2, 1].map((n) => {
        const cantidad = distribucion[n] || 0
        const pct = total > 0 ? Math.round((cantidad / total) * 100) : 0
        return (
          <div key={n} className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 w-16 shrink-0">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-gray-600 text-xs">{n}</span>
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right shrink-0">{cantidad}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Componente principal ─────────────────────────────────────────────────── */
export default function ProyectoDetalle() {
  const { id } = useParams()
  const { usuario } = useAuth()

  const [proyecto,  setProyecto]  = useState(null)
  const [votos,     setVotos]     = useState({ total: 0, promedio: 0, distribucion: {} })
  const [cargando,  setCargando]  = useState(true)
  const [yaVoto,    setYaVoto]    = useState(false)
  const [valoracion, setValoracion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando,  setEnviando]  = useState(false)
  const [error,     setError]     = useState('')
  const [exito,     setExito]     = useState(false)

  const cargarVotos = useCallback(async () => {
    const { data } = await supabase
      .from('votos_proyectos')
      .select('valoracion')
      .eq('proyecto_id', id)

    if (!data) return
    const total = data.length
    const promedio = total > 0
      ? data.reduce((s, v) => s + v.valoracion, 0) / total
      : 0
    const distribucion = data.reduce((acc, v) => {
      acc[v.valoracion] = (acc[v.valoracion] || 0) + 1
      return acc
    }, {})
    setVotos({ total, promedio, distribucion })
  }, [id])

  useEffect(() => {
    async function cargar() {
      const { data: proy } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', id)
        .single()

      setProyecto(proy)
      await cargarVotos()

      if (usuario) {
        const { data: voto } = await supabase
          .from('votos_proyectos')
          .select('id, valoracion')
          .eq('proyecto_id', id)
          .eq('usuario_id', usuario.id)
          .maybeSingle()
        if (voto) { setYaVoto(true); setValoracion(voto.valoracion) }
      }
      setCargando(false)
    }
    cargar()
  }, [id, usuario, cargarVotos])

  async function handleVotar(e) {
    e.preventDefault()
    if (!usuario)     { setError('Debes iniciar sesión para votar.'); return }
    if (!valoracion)  { setError('Selecciona una valoración (1-5 estrellas).'); return }

    setEnviando(true)
    setError('')
    const { error: err } = await supabase.from('votos_proyectos').insert({
      proyecto_id: parseInt(id),
      usuario_id:  usuario.id,
      valoracion,
      comentario: comentario.trim() || null,
    })
    if (err) {
      setError('Error al registrar tu voto. Intenta de nuevo.')
      setEnviando(false)
      return
    }
    setExito(true)
    setYaVoto(true)
    await cargarVotos()   // actualiza resultados en tiempo real
    setEnviando(false)
  }

  /* ── Loading ── */
  if (cargando) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  )

  if (!proyecto) return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <FolderKanban size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Proyecto no encontrado</h2>
      </div>
    </section>
  )

  const estado = ESTADOS[proyecto.estado]

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Columna principal ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Encabezado */}
            <div>
              <div className="flex items-center gap-2 text-purple-700 text-sm font-semibold mb-3">
                <FolderKanban size={16} /> Proyecto de inversión
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                {proyecto.titulo}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {proyecto.tema && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                    {proyecto.tema}
                  </span>
                )}
                {estado && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${estado.color}`}>
                    {estado.label}
                  </span>
                )}
              </div>
            </div>

            {/* Imagen */}
            {proyecto.imagen_url ? (
              <img src={proyecto.imagen_url} alt={proyecto.titulo}
                className="w-full h-56 object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-50
                              rounded-2xl flex items-center justify-center">
                <FolderKanban size={64} className="text-purple-200" />
              </div>
            )}

            {/* Descripción */}
            <Tarjeta>
              <h2 className="font-bold text-gray-800 mb-3">Descripción del proyecto</h2>
              <p className="text-gray-600 leading-relaxed">
                {proyecto.descripcion || 'Sin descripción disponible.'}
              </p>
            </Tarjeta>

            {/* Datos del proyecto */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {proyecto.presupuesto && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Banknote size={13} /> Presupuesto
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    ${Number(proyecto.presupuesto).toLocaleString('es-CO')}
                  </p>
                </div>
              )}
              {proyecto.municipio && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <MapPin size={13} /> Municipio
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{proyecto.municipio}</p>
                </div>
              )}
              {proyecto.fecha_publicacion && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Calendar size={13} /> Publicado
                  </div>
                  <p className="font-bold text-gray-800 text-sm">
                    {new Date(proyecto.fecha_publicacion).toLocaleDateString('es-CO', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Columna lateral: votos ─────────────────────────────── */}
          <div className="space-y-5">

            {/* Resultados en tiempo real */}
            <Tarjeta>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={18} className="text-purple-600" />
                <h3 className="font-bold text-gray-800">Resultados</h3>
              </div>

              {votos.total === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Aún no hay valoraciones.
                </p>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-5xl font-extrabold text-yellow-500">
                      {votos.promedio.toFixed(1)}
                    </p>
                    <div className="flex justify-center gap-0.5 my-2">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={18}
                          className={n <= Math.round(votos.promedio)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                      <Users size={14} />
                      {votos.total} valoración{votos.total !== 1 ? 'es' : ''}
                    </div>
                  </div>
                  <BarraVotos distribucion={votos.distribucion} total={votos.total} />
                </>
              )}
            </Tarjeta>

            {/* Formulario de voto */}
            {exito || yaVoto ? (
              <Tarjeta className="text-center py-6">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-800 mb-1">¡Gracias!</p>
                <p className="text-sm text-gray-500">Tu valoración fue registrada.</p>
                {yaVoto && valoracion > 0 && (
                  <div className="flex justify-center gap-0.5 mt-3">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} size={16}
                        className={n <= valoracion
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                )}
              </Tarjeta>
            ) : (
              <Tarjeta>
                <h3 className="font-bold text-gray-800 mb-4">¿Qué te parece?</h3>

                {error && (
                  <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')}
                    className="mb-4" />
                )}

                {/* Estrellas interactivas */}
                <div className="flex gap-2 justify-center mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setValoracion(n)}
                      className="hover:scale-125 transition-transform duration-150"
                      aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}>
                      <Star size={32}
                        className={n <= valoracion
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 fill-gray-100'} />
                    </button>
                  ))}
                </div>

                {valoracion > 0 && (
                  <p className="text-center text-sm font-semibold text-yellow-600 mb-3">
                    {ETIQUETAS[valoracion]}
                  </p>
                )}

                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comentario opcional..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-500
                             resize-none mb-4 mt-1"
                />

                {!usuario && (
                  <Alerta tipo="advertencia"
                    mensaje="Inicia sesión para votar." className="mb-4" />
                )}

                <Boton variante="primario" tamanio="lg" cargando={enviando}
                  disabled={!usuario || valoracion === 0}
                  onClick={handleVotar} className="w-full">
                  Enviar valoración
                </Boton>
              </Tarjeta>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}
