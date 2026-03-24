import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import CampoFormulario from '@/componentes/comunes/CampoFormulario'
import {
  ClipboardList, Plus, Pencil, Trash2, ChevronLeft,
  ListChecks, PlusCircle, X, Save, Eye,
} from 'lucide-react'

// ─── utilidades ────────────────────────────────────────────────────────────────

const ESTADO_BADGE = {
  borrador:  'bg-gray-100 text-gray-600',
  activa:    'bg-green-100 text-green-700',
  cerrada:   'bg-yellow-100 text-yellow-700',
  archivada: 'bg-red-100 text-red-600',
}

const ESTADO_LABELS = {
  borrador:  'Borrador',
  activa:    'Activa',
  cerrada:   'Cerrada',
  archivada: 'Archivada',
}

const ENCUESTA_VACIA = { titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'borrador' }
const PREGUNTA_VACIA = { texto: '', tipo: 'opcion_multiple', orden: 0 }

// ─── vistas ────────────────────────────────────────────────────────────────────

// Vista: LISTA
function VistaLista({ onNueva, onEditar, onGestionar, onEliminar }) {
  const [encuestas, setEncuestas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    let q = supabase.from('encuestas').select('*').order('creado_en', { ascending: false })
    if (filtro !== 'todas') q = q.eq('estado', filtro)
    const { data, error: err } = await q
    if (err) setError(err.message)
    else setEncuestas(data || [])
    setCargando(false)
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  async function eliminar(enc) {
    if (!window.confirm(`¿Eliminar "${enc.titulo}"? Esta acción no se puede deshacer.`)) return
    const { error: err } = await supabase.from('encuestas').delete().eq('id', enc.id)
    if (err) { setError(err.message); return }
    onEliminar?.()
    cargar()
  }

  const FILTROS = ['todas', 'borrador', 'activa', 'cerrada', 'archivada']

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Encuestas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Crea y administra encuestas ciudadanas</p>
        </div>
        <Boton variante="primario" onClick={onNueva}>
          <Plus size={16} /> Nueva encuesta
        </Boton>
      </div>

      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-4" />}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filtro === f
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'todas' ? 'Todas' : ESTADO_LABELS[f]}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : encuestas.length === 0 ? (
        <Tarjeta className="text-center py-16">
          <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay encuestas. Crea la primera.</p>
        </Tarjeta>
      ) : (
        <div className="space-y-3">
          {encuestas.map((enc) => (
            <Tarjeta key={enc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_BADGE[enc.estado]}`}>
                    {ESTADO_LABELS[enc.estado]}
                  </span>
                </div>
                <p className="font-medium text-gray-800 truncate">{enc.titulo}</p>
                {enc.fecha_fin && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cierra: {new Date(enc.fecha_fin).toLocaleDateString('es-CO')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onGestionar(enc)}
                  title="Gestionar preguntas"
                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <ListChecks size={16} />
                </button>
                <button
                  onClick={() => onEditar(enc)}
                  title="Editar encuesta"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => eliminar(enc)}
                  title="Eliminar encuesta"
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
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

// Vista: FORMULARIO (crear / editar encuesta)
function VistaFormulario({ encuesta, onGuardado, onCancelar }) {
  const { usuario } = useAuth()
  const esNueva = !encuesta?.id
  const [form, setForm] = useState(encuesta ? {
    titulo:       encuesta.titulo,
    descripcion:  encuesta.descripcion ?? '',
    fecha_inicio: encuesta.fecha_inicio ?? '',
    fecha_fin:    encuesta.fecha_fin ?? '',
    estado:       encuesta.estado,
  } : ENCUESTA_VACIA)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function set(campo) {
    return (e) => setForm((p) => ({ ...p, [campo]: e.target.value }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('El título es obligatorio.'); return }
    setGuardando(true)
    setError('')

    const payload = {
      titulo:      form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin:   form.fecha_fin || null,
      estado:      form.estado,
    }

    let err
    if (esNueva) {
      ;({ error: err } = await supabase.from('encuestas').insert({ ...payload, creado_por: usuario.id }))
    } else {
      ;({ error: err } = await supabase.from('encuestas').update(payload).eq('id', encuesta.id))
    }

    if (err) { setError(err.message); setGuardando(false); return }
    onGuardado()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancelar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {esNueva ? 'Nueva encuesta' : 'Editar encuesta'}
          </h1>
          <p className="text-gray-500 text-sm">
            {esNueva ? 'Completa los datos para crear la encuesta.' : 'Modifica los datos de la encuesta.'}
          </p>
        </div>
      </div>

      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-5" />}

      <form onSubmit={handleGuardar} className="space-y-5">
        <CampoFormulario
          label="Título *"
          placeholder="Ej: ¿Cómo califica los servicios de salud?"
          value={form.titulo}
          onChange={set('titulo')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea
            rows={3}
            placeholder="Descripción opcional de la encuesta..."
            value={form.descripcion}
            onChange={set('descripcion')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={set('fecha_inicio')}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de cierre</label>
            <input
              type="date"
              value={form.fecha_fin}
              onChange={set('fecha_fin')}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
          <select
            value={form.estado}
            onChange={set('estado')}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="borrador">Borrador</option>
            <option value="activa">Activa</option>
            <option value="cerrada">Cerrada</option>
            <option value="archivada">Archivada</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Boton type="submit" variante="primario" cargando={guardando}>
            <Save size={16} /> {esNueva ? 'Crear encuesta' : 'Guardar cambios'}
          </Boton>
          <Boton type="button" variante="secundario" onClick={onCancelar}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  )
}

// Vista: PREGUNTAS (gestionar preguntas + opciones de una encuesta)
function VistaPreguntas({ encuesta, onVolver }) {
  const [preguntas, setPreguntas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // Modal pregunta
  const [modalPregunta, setModalPregunta] = useState(null) // null | { pregunta? }
  // Modal opción
  const [modalOpcion, setModalOpcion] = useState(null) // null | { preguntaId, opcion? }

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error: err } = await supabase
      .from('preguntas')
      .select('*, opciones(*)')
      .eq('encuesta_id', encuesta.id)
      .order('orden')
    if (err) setError(err.message)
    else setPreguntas(data || [])
    setCargando(false)
  }, [encuesta.id])

  useEffect(() => { cargar() }, [cargar])

  async function eliminarPregunta(id) {
    if (!window.confirm('¿Eliminar esta pregunta y todas sus opciones?')) return
    const { error: err } = await supabase.from('preguntas').delete().eq('id', id)
    if (err) { setError(err.message); return }
    cargar()
  }

  async function eliminarOpcion(id) {
    if (!window.confirm('¿Eliminar esta opción?')) return
    const { error: err } = await supabase.from('opciones').delete().eq('id', id)
    if (err) { setError(err.message); return }
    cargar()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onVolver} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Preguntas</h1>
          <p className="text-gray-500 text-sm truncate max-w-sm">{encuesta.titulo}</p>
        </div>
      </div>

      <div className="flex justify-end mb-5">
        <Boton variante="primario" onClick={() => setModalPregunta({})}>
          <PlusCircle size={16} /> Agregar pregunta
        </Boton>
      </div>

      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-4" />}

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : preguntas.length === 0 ? (
        <Tarjeta className="text-center py-14">
          <ListChecks size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Esta encuesta no tiene preguntas aún.</p>
        </Tarjeta>
      ) : (
        <div className="space-y-4">
          {preguntas.map((preg, idx) => (
            <Tarjeta key={preg.id}>
              {/* Cabecera pregunta */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-green-700 font-semibold">Pregunta {idx + 1}</span>
                  <p className="font-medium text-gray-800 mt-0.5">{preg.texto}</p>
                  <span className="text-xs text-gray-400">{
                    preg.tipo === 'opcion_multiple' ? 'Opción múltiple' :
                    preg.tipo === 'si_no' ? 'Sí / No' : 'Escala'
                  }</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setModalPregunta({ pregunta: preg })}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => eliminarPregunta(preg.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-2 pl-3 border-l-2 border-gray-100">
                {(preg.opciones || []).map((op) => (
                  <div key={op.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-gray-700 flex-1">{op.texto}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setModalOpcion({ preguntaId: preg.id, opcion: op })}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => eliminarOpcion(op.id)}
                        className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setModalOpcion({ preguntaId: preg.id })}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium mt-1"
                >
                  <PlusCircle size={13} /> Agregar opción
                </button>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}

      {/* Modal: crear / editar pregunta */}
      {modalPregunta !== null && (
        <ModalPregunta
          encuestaId={encuesta.id}
          pregunta={modalPregunta.pregunta}
          orden={preguntas.length}
          onGuardado={() => { setModalPregunta(null); cargar() }}
          onCerrar={() => setModalPregunta(null)}
        />
      )}

      {/* Modal: crear / editar opción */}
      {modalOpcion !== null && (
        <ModalOpcion
          preguntaId={modalOpcion.preguntaId}
          opcion={modalOpcion.opcion}
          orden={(preguntas.find((p) => p.id === modalOpcion.preguntaId)?.opciones?.length) ?? 0}
          onGuardado={() => { setModalOpcion(null); cargar() }}
          onCerrar={() => setModalOpcion(null)}
        />
      )}
    </div>
  )
}

// ─── modales ───────────────────────────────────────────────────────────────────

function ModalPregunta({ encuestaId, pregunta, orden, onGuardado, onCerrar }) {
  const esNueva = !pregunta?.id
  const [texto, setTexto] = useState(pregunta?.texto ?? '')
  const [tipo,  setTipo]  = useState(pregunta?.tipo  ?? 'opcion_multiple')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e) {
    e.preventDefault()
    if (!texto.trim()) { setError('El texto es obligatorio.'); return }
    setGuardando(true)
    const payload = { texto: texto.trim(), tipo, encuesta_id: encuestaId, orden: pregunta?.orden ?? orden }
    const { error: err } = esNueva
      ? await supabase.from('preguntas').insert(payload)
      : await supabase.from('preguntas').update({ texto: texto.trim(), tipo }).eq('id', pregunta.id)
    if (err) { setError(err.message); setGuardando(false); return }
    onGuardado()
  }

  return (
    <ModalContenedor titulo={esNueva ? 'Nueva pregunta' : 'Editar pregunta'} onCerrar={onCerrar}>
      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-4" />}
      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Texto de la pregunta *</label>
          <textarea
            rows={3}
            placeholder="Escribe la pregunta..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="opcion_multiple">Opción múltiple</option>
            <option value="si_no">Sí / No</option>
            <option value="escala">Escala (1-5)</option>
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <Boton type="submit" variante="primario" cargando={guardando}>
            <Save size={15} /> {esNueva ? 'Agregar' : 'Guardar'}
          </Boton>
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
        </div>
      </form>
    </ModalContenedor>
  )
}

function ModalOpcion({ preguntaId, opcion, orden, onGuardado, onCerrar }) {
  const esNueva = !opcion?.id
  const [texto, setTexto] = useState(opcion?.texto ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e) {
    e.preventDefault()
    if (!texto.trim()) { setError('El texto es obligatorio.'); return }
    setGuardando(true)
    const { error: err } = esNueva
      ? await supabase.from('opciones').insert({ texto: texto.trim(), pregunta_id: preguntaId, orden })
      : await supabase.from('opciones').update({ texto: texto.trim() }).eq('id', opcion.id)
    if (err) { setError(err.message); setGuardando(false); return }
    onGuardado()
  }

  return (
    <ModalContenedor titulo={esNueva ? 'Nueva opción' : 'Editar opción'} onCerrar={onCerrar}>
      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-4" />}
      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Texto de la opción *</label>
          <input
            type="text"
            placeholder="Ej: Muy buena"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <Boton type="submit" variante="primario" cargando={guardando}>
            <Save size={15} /> {esNueva ? 'Agregar' : 'Guardar'}
          </Boton>
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
        </div>
      </form>
    </ModalContenedor>
  )
}

function ModalContenedor({ titulo, onCerrar, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{titulo}</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── componente principal ──────────────────────────────────────────────────────

export default function AdminEncuestas() {
  // 'lista' | 'nueva' | 'editar' | 'preguntas'
  const [vista, setVista] = useState('lista')
  const [encuestaActiva, setEncuestaActiva] = useState(null)

  if (vista === 'nueva') {
    return (
      <VistaFormulario
        encuesta={null}
        onGuardado={() => setVista('lista')}
        onCancelar={() => setVista('lista')}
      />
    )
  }

  if (vista === 'editar' && encuestaActiva) {
    return (
      <VistaFormulario
        encuesta={encuestaActiva}
        onGuardado={() => { setEncuestaActiva(null); setVista('lista') }}
        onCancelar={() => { setEncuestaActiva(null); setVista('lista') }}
      />
    )
  }

  if (vista === 'preguntas' && encuestaActiva) {
    return (
      <VistaPreguntas
        encuesta={encuestaActiva}
        onVolver={() => { setEncuestaActiva(null); setVista('lista') }}
      />
    )
  }

  return (
    <VistaLista
      onNueva={() => setVista('nueva')}
      onEditar={(enc) => { setEncuestaActiva(enc); setVista('editar') }}
      onGestionar={(enc) => { setEncuestaActiva(enc); setVista('preguntas') }}
      onEliminar={() => {}}
    />
  )
}
