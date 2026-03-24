import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import {
  FolderKanban, Plus, Pencil, Trash2, ChevronLeft,
  Save, Star, BarChart2, Users, X,
} from 'lucide-react'

/* ── Constantes ─────────────────────────────────────────────────────────── */

const ESTADOS = {
  borrador:     'Borrador',
  publicado:    'Publicado',
  en_ejecucion: 'En ejecución',
  finalizado:   'Finalizado',
}

const ESTADO_COLOR = {
  borrador:     'bg-gray-100 text-gray-600',
  publicado:    'bg-blue-100 text-blue-700',
  en_ejecucion: 'bg-green-100 text-green-700',
  finalizado:   'bg-purple-100 text-purple-700',
}

const TEMAS = [
  'Educación', 'Salud', 'Infraestructura', 'Medio Ambiente',
  'Seguridad', 'Cultura', 'Deporte', 'Vivienda', 'Económico', 'General',
]

const FORM_VACIO = {
  titulo: '', descripcion: '', tema: 'General', estado: 'borrador',
  presupuesto: '', municipio: '', imagen_url: '', fecha_publicacion: '',
}

/* ── Vista: LISTA ───────────────────────────────────────────────────────── */

function VistaLista({ onNuevo, onEditar, onVerResultados }) {
  const [proyectos, setProyectos] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [filtro,    setFiltro]    = useState('todos')
  const [error,     setError]     = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    let q = supabase
      .from('proyectos')
      .select('*, votos_proyectos(valoracion)')
      .order('creado_en', { ascending: false })
    if (filtro !== 'todos') q = q.eq('estado', filtro)
    const { data, error: err } = await q
    if (err) { setError(err.message); setCargando(false); return }

    setProyectos((data || []).map((p) => {
      const votos = p.votos_proyectos || []
      const total = votos.length
      const promedio = total > 0
        ? (votos.reduce((s, v) => s + v.valoracion, 0) / total).toFixed(1)
        : null
      return { ...p, total_votos: total, promedio }
    }))
    setCargando(false)
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  async function eliminar(p) {
    if (!window.confirm(`¿Eliminar "${p.titulo}"? Esta acción no se puede deshacer.`)) return
    const { error: err } = await supabase.from('proyectos').delete().eq('id', p.id)
    if (err) { setError(err.message); return }
    cargar()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Publica y administra proyectos de inversión</p>
        </div>
        <Boton variante="primario" onClick={onNuevo}>
          <Plus size={16} /> Nuevo proyecto
        </Boton>
      </div>

      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-4" />}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['todos', ...Object.keys(ESTADOS)].map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filtro === f
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f === 'todos' ? 'Todos' : ESTADOS[f]}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : proyectos.length === 0 ? (
        <Tarjeta className="text-center py-16">
          <FolderKanban size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay proyectos. Crea el primero.</p>
        </Tarjeta>
      ) : (
        <div className="space-y-3">
          {proyectos.map((p) => (
            <Tarjeta key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ESTADO_COLOR[p.estado]}`}>
                    {ESTADOS[p.estado]}
                  </span>
                  {p.tema && (
                    <span className="text-xs text-gray-400">{p.tema}</span>
                  )}
                </div>
                <p className="font-semibold text-gray-800 truncate">{p.titulo}</p>
                <div className="flex items-center gap-3 mt-1">
                  {p.promedio ? (
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <Star size={11} className="fill-yellow-400 text-yellow-400" />
                      {p.promedio} ({p.total_votos} votos)
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Sin valoraciones</span>
                  )}
                  {p.municipio && (
                    <span className="text-xs text-gray-400">{p.municipio}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onVerResultados(p)} title="Ver resultados"
                  className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors">
                  <BarChart2 size={16} />
                </button>
                <button onClick={() => onEditar(p)} title="Editar"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => eliminar(p)} title="Eliminar"
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Vista: FORMULARIO ──────────────────────────────────────────────────── */

function VistaFormulario({ proyecto, onGuardado, onCancelar }) {
  const { usuario } = useAuth()
  const esNuevo = !proyecto?.id
  const [form, setForm] = useState(proyecto ? {
    titulo:           proyecto.titulo,
    descripcion:      proyecto.descripcion ?? '',
    tema:             proyecto.tema ?? 'General',
    estado:           proyecto.estado,
    presupuesto:      proyecto.presupuesto ?? '',
    municipio:        proyecto.municipio ?? '',
    imagen_url:       proyecto.imagen_url ?? '',
    fecha_publicacion: proyecto.fecha_publicacion ?? '',
  } : FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  const set = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.value }))

  async function guardar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('El título es obligatorio.'); return }
    setGuardando(true)
    setError('')

    const payload = {
      titulo:           form.titulo.trim(),
      descripcion:      form.descripcion.trim() || null,
      tema:             form.tema,
      estado:           form.estado,
      presupuesto:      form.presupuesto ? parseFloat(form.presupuesto) : null,
      municipio:        form.municipio.trim() || null,
      imagen_url:       form.imagen_url.trim() || null,
      fecha_publicacion: form.fecha_publicacion || null,
    }

    const { error: err } = esNuevo
      ? await supabase.from('proyectos').insert({ ...payload, creado_por: usuario.id })
      : await supabase.from('proyectos').update(payload).eq('id', proyecto.id)

    if (err) { setError(err.message); setGuardando(false); return }
    onGuardado()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancelar}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {esNuevo ? 'Nuevo proyecto' : 'Editar proyecto'}
          </h1>
          <p className="text-gray-500 text-sm">
            {esNuevo ? 'Completa los datos del nuevo proyecto.' : 'Modifica los datos del proyecto.'}
          </p>
        </div>
      </div>

      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-5" />}

      <form onSubmit={guardar} className="space-y-5">
        <div>
          <label className={labelCls}>Título *</label>
          <input type="text" value={form.titulo} onChange={set('titulo')}
            placeholder="Ej: Construcción de acueducto veredal"
            className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Descripción</label>
          <textarea rows={4} value={form.descripcion} onChange={set('descripcion')}
            placeholder="Describe el alcance y objetivos del proyecto..."
            className={`${inputCls} resize-none`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tema</label>
            <select value={form.tema} onChange={set('tema')} className={inputCls}>
              {TEMAS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Estado</label>
            <select value={form.estado} onChange={set('estado')} className={inputCls}>
              {Object.entries(ESTADOS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Presupuesto (COP)</label>
            <input type="number" min="0" step="1000000"
              value={form.presupuesto} onChange={set('presupuesto')}
              placeholder="Ej: 500000000"
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Municipio</label>
            <input type="text" value={form.municipio} onChange={set('municipio')}
              placeholder="Ej: Arauca"
              className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Fecha de publicación</label>
            <input type="date" value={form.fecha_publicacion}
              onChange={set('fecha_publicacion')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>URL de imagen</label>
            <input type="url" value={form.imagen_url} onChange={set('imagen_url')}
              placeholder="https://..."
              className={inputCls} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Boton type="submit" variante="primario" cargando={guardando}>
            <Save size={16} /> {esNuevo ? 'Crear proyecto' : 'Guardar cambios'}
          </Boton>
          <Boton type="button" variante="secundario" onClick={onCancelar}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  )
}

/* ── Vista: RESULTADOS ──────────────────────────────────────────────────── */

function VistaResultados({ proyecto, onVolver }) {
  const [votos,    setVotos]    = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('votos_proyectos')
        .select('valoracion, comentario, fecha, usuarios(nombre)')
        .eq('proyecto_id', proyecto.id)
        .order('fecha', { ascending: false })
      setVotos(data || [])
      setCargando(false)
    }
    cargar()
  }, [proyecto.id])

  const total    = votos.length
  const promedio = total > 0
    ? votos.reduce((s, v) => s + v.valoracion, 0) / total
    : 0
  const distribucion = votos.reduce((acc, v) => {
    acc[v.valoracion] = (acc[v.valoracion] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onVolver}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resultados de votación</h1>
          <p className="text-gray-500 text-sm truncate max-w-sm">{proyecto.titulo}</p>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Tarjeta className="text-center">
              <p className="text-5xl font-extrabold text-yellow-500 mb-1">
                {total > 0 ? promedio.toFixed(1) : '—'}
              </p>
              <div className="flex justify-center gap-0.5 mb-1">
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} size={16}
                    className={n <= Math.round(promedio)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <p className="text-sm text-gray-500">Promedio</p>
            </Tarjeta>

            <Tarjeta className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users size={20} className="text-green-600" />
                <p className="text-5xl font-extrabold text-green-700">{total}</p>
              </div>
              <p className="text-sm text-gray-500">Valoraciones</p>
            </Tarjeta>

            <Tarjeta>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Distribución
              </p>
              {[5,4,3,2,1].map((n) => {
                const cant = distribucion[n] || 0
                const pct  = total > 0 ? Math.round((cant / total) * 100) : 0
                return (
                  <div key={n} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-500 w-3">{n}</span>
                    <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{cant}</span>
                  </div>
                )
              })}
            </Tarjeta>
          </div>

          {/* Comentarios */}
          {votos.filter((v) => v.comentario).length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3">
                Comentarios ({votos.filter((v) => v.comentario).length})
              </h3>
              <div className="space-y-3">
                {votos.filter((v) => v.comentario).map((v, i) => (
                  <Tarjeta key={i} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((n) => (
                              <Star key={n} size={12}
                                className={n <= v.valoracion
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {v.usuarios?.nombre || 'Ciudadano'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{v.comentario}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(v.fecha).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </Tarjeta>
                ))}
              </div>
            </div>
          )}

          {total === 0 && (
            <Tarjeta className="text-center py-14">
              <BarChart2 size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Este proyecto aún no tiene valoraciones.</p>
            </Tarjeta>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Componente raíz ────────────────────────────────────────────────────── */

export default function AdminProyectos() {
  const [vista,    setVista]    = useState('lista')
  const [activo,   setActivo]   = useState(null)

  if (vista === 'nuevo') return (
    <VistaFormulario proyecto={null}
      onGuardado={() => setVista('lista')}
      onCancelar={() => setVista('lista')} />
  )

  if (vista === 'editar' && activo) return (
    <VistaFormulario proyecto={activo}
      onGuardado={() => { setActivo(null); setVista('lista') }}
      onCancelar={() => { setActivo(null); setVista('lista') }} />
  )

  if (vista === 'resultados' && activo) return (
    <VistaResultados proyecto={activo}
      onVolver={() => { setActivo(null); setVista('lista') }} />
  )

  return (
    <VistaLista
      onNuevo={() => setVista('nuevo')}
      onEditar={(p) => { setActivo(p); setVista('editar') }}
      onVerResultados={(p) => { setActivo(p); setVista('resultados') }}
    />
  )
}
