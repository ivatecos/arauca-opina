import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import {
  Lightbulb, ChevronLeft, Star, Users,
  User, Calendar, Tag, CheckCircle, XCircle,
  Clock, Eye, Search,
} from 'lucide-react'

/* ── Constantes ─────────────────────────────────────────────────────────── */

const ESTADOS = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700', Icono: Clock },
  en_revision: { label: 'En revisión', color: 'bg-blue-100 text-blue-700',     Icono: Eye },
  aprobada:    { label: 'Aprobada',    color: 'bg-green-100 text-green-700',   Icono: CheckCircle },
  rechazada:   { label: 'Rechazada',   color: 'bg-red-100 text-red-600',       Icono: XCircle },
}

const TRANSICIONES = {
  pendiente:   ['en_revision', 'aprobada', 'rechazada'],
  en_revision: ['aprobada', 'rechazada', 'pendiente'],
  aprobada:    ['en_revision', 'rechazada'],
  rechazada:   ['en_revision', 'pendiente'],
}

/* ── Vista: LISTA ───────────────────────────────────────────────────────── */

function VistaLista({ onVerDetalle }) {
  const [propuestas, setPropuestas] = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [filtro,     setFiltro]     = useState('todos')
  const [busqueda,   setBusqueda]   = useState('')
  const [error,      setError]      = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    let q = supabase
      .from('propuestas')
      .select('*, usuarios(nombre, municipio)')
      .order('fecha', { ascending: false })
    if (filtro !== 'todos') q = q.eq('estado', filtro)
    const { data, error: err } = await q
    if (err) setError(err.message)
    else setPropuestas(data || [])
    setCargando(false)
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  const filtradas = propuestas.filter((p) =>
    (p.titulo + ' ' + (p.usuarios?.nombre || ''))
      .toLowerCase().includes(busqueda.toLowerCase())
  )

  async function cambiarEstado(p, nuevoEstado) {
    const { error: err } = await supabase
      .from('propuestas')
      .update({ estado: nuevoEstado })
      .eq('id', p.id)
    if (err) { setError(err.message); return }
    cargar()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Propuestas</h1>
        <p className="text-gray-500 text-sm mt-0.5">Revisa y gestiona las propuestas ciudadanas</p>
      </div>

      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-4" />}

      {/* Filtros + buscador */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por título o autor..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['todos', ...Object.keys(ESTADOS)].map((f) => {
            const info = ESTADOS[f]
            return (
              <button key={f} onClick={() => setFiltro(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filtro === f
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f === 'todos' ? 'Todas' : info.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Resumen de conteos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(ESTADOS).map(([k, v]) => {
          const total = propuestas.filter((p) => p.estado === k).length
          return (
            <div key={k}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${v.color}`}>
                <v.Icono size={14} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-800 leading-none">{total}</p>
                <p className="text-xs text-gray-400">{v.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : filtradas.length === 0 ? (
        <Tarjeta className="text-center py-16">
          <Lightbulb size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay propuestas que mostrar.</p>
        </Tarjeta>
      ) : (
        <div className="space-y-3">
          {filtradas.map((p) => {
            const estado = ESTADOS[p.estado]
            return (
              <Tarjeta key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${estado.color}`}>
                      {estado.label}
                    </span>
                    {p.tema && <span className="text-xs text-gray-400">{p.tema}</span>}
                  </div>
                  <p className="font-semibold text-gray-800 truncate">{p.titulo}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {p.usuarios?.nombre || 'Ciudadano'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      {p.estrellas > 0 ? Number(p.estrellas).toFixed(1) : '—'}
                      ({p.total_votos} votos)
                    </span>
                    <span>{new Date(p.fecha).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Cambio rápido de estado */}
                  {TRANSICIONES[p.estado]?.slice(0, 2).map((s) => {
                    const info = ESTADOS[s]
                    return (
                      <button key={s} onClick={() => cambiarEstado(p, s)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium
                                    border transition-colors ${info.color} hover:opacity-80`}>
                        → {info.label}
                      </button>
                    )
                  })}
                  <button onClick={() => onVerDetalle(p)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Ver detalle">
                    <Eye size={16} />
                  </button>
                </div>
              </Tarjeta>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Vista: DETALLE ADMIN ───────────────────────────────────────────────── */

function VistaDetalle({ propuesta: prop, onVolver }) {
  const [propuesta,  setPropuesta]  = useState(prop)
  const [cambiando,  setCambiando]  = useState(false)
  const [error,      setError]      = useState('')
  const [exito,      setExito]      = useState('')

  async function cambiarEstado(nuevoEstado) {
    setCambiando(true)
    const { error: err } = await supabase
      .from('propuestas')
      .update({ estado: nuevoEstado })
      .eq('id', propuesta.id)

    if (err) { setError(err.message); setCambiando(false); return }
    setPropuesta((p) => ({ ...p, estado: nuevoEstado }))
    setExito(`Estado cambiado a "${ESTADOS[nuevoEstado].label}"`)
    setCambiando(false)
  }

  const estadoInfo    = ESTADOS[propuesta.estado]
  const transiciones  = TRANSICIONES[propuesta.estado] || []

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onVolver}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detalle de propuesta</h1>
          <p className="text-gray-500 text-sm">Revisa y gestiona el estado</p>
        </div>
      </div>

      {error  && <Alerta tipo="error"  mensaje={error}  onCerrar={() => setError('')}  className="mb-4" />}
      {exito  && <Alerta tipo="exito"  mensaje={exito}  onCerrar={() => setExito('')}  className="mb-4" />}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Contenido */}
        <div className="lg:col-span-2 space-y-5">
          <Tarjeta>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${estadoInfo.color}`}>
                {estadoInfo.label}
              </span>
              {propuesta.tema && (
                <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                  {propuesta.tema}
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">{propuesta.titulo}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {propuesta.descripcion}
            </p>
          </Tarjeta>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <User size={11} /> Autor
              </div>
              <p className="font-semibold text-gray-800 text-sm">{propuesta.usuarios?.nombre || '—'}</p>
              <p className="text-xs text-gray-400">{propuesta.usuarios?.municipio || ''}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Calendar size={11} /> Enviada
              </div>
              <p className="font-semibold text-gray-800 text-sm">
                {new Date(propuesta.fecha).toLocaleDateString('es-CO', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Tag size={11} /> Tema
              </div>
              <p className="font-semibold text-gray-800 text-sm">{propuesta.tema || 'General'}</p>
            </div>
          </div>
        </div>

        {/* Panel de acción */}
        <div className="space-y-5">

          {/* Métricas */}
          <Tarjeta className="text-center">
            <p className="text-5xl font-extrabold text-amber-500 leading-none mb-2">
              {propuesta.estrellas > 0 ? Number(propuesta.estrellas).toFixed(1) : '—'}
            </p>
            <div className="flex justify-center gap-0.5 mb-2">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} size={16}
                  className={n <= Math.round(propuesta.estrellas)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
              <Users size={14} />
              {propuesta.total_votos} voto{propuesta.total_votos !== 1 ? 's' : ''}
            </div>
          </Tarjeta>

          {/* Cambiar estado */}
          <Tarjeta>
            <p className="text-sm font-bold text-gray-700 mb-3">Cambiar estado</p>
            <div className="space-y-2">
              {transiciones.map((s) => {
                const info = ESTADOS[s]
                return (
                  <Boton key={s} variante="secundario" tamanio="sm"
                    cargando={cambiando}
                    onClick={() => cambiarEstado(s)}
                    className="w-full justify-start gap-2">
                    <info.Icono size={14} />
                    Marcar como {info.label}
                  </Boton>
                )
              })}
            </div>
          </Tarjeta>

        </div>
      </div>
    </div>
  )
}

/* ── Componente raíz ────────────────────────────────────────────────────── */

export default function AdminPropuestas() {
  const [vista,   setVista]   = useState('lista')
  const [activa,  setActiva]  = useState(null)

  if (vista === 'detalle' && activa) return (
    <VistaDetalle
      propuesta={activa}
      onVolver={() => { setActiva(null); setVista('lista') }}
    />
  )

  return (
    <VistaLista
      onVerDetalle={(p) => { setActiva(p); setVista('detalle') }}
    />
  )
}
