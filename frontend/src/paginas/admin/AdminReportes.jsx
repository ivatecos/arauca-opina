import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import Alerta from '@/componentes/comunes/Alerta'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  FileDown, BarChart2, ClipboardList, Lightbulb,
  FolderKanban, Download, RefreshCw,
} from 'lucide-react'

/* ── Paleta de colores ───────────────────────────────────────── */
const COLORES   = ['#166534', '#15803d', '#4ade80', '#bbf7d0', '#f59e0b', '#f97316', '#3b82f6', '#a855f7']
const C_ESTADO  = { pendiente: '#f59e0b', en_revision: '#3b82f6', aprobada: '#16a34a', rechazada: '#dc2626' }
const C_ENC_EST = { borrador: '#9ca3af', activa: '#16a34a', cerrada: '#dc2626', archivada: '#f59e0b' }

/* ── Utilidades ──────────────────────────────────────────────── */
function exportarCSV(filas, nombre) {
  if (!filas?.length) return
  const headers = Object.keys(filas[0])
  const rows    = filas.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')
  )
  const csv  = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${nombre}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function BotonExportar({ onClick, label = 'Exportar CSV' }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-medium text-green-700
                 border border-green-300 bg-green-50 hover:bg-green-100
                 px-3 py-1.5 rounded-lg transition-colors">
      <Download size={12} /> {label}
    </button>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
    </div>
  )
}

function TituloSeccion({ Icono, titulo, color = 'text-green-700', extra }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icono size={16} className={color} />
        <p className="text-sm font-bold text-gray-700">{titulo}</p>
      </div>
      {extra}
    </div>
  )
}

/* ── PESTAÑA: Resumen General ────────────────────────────────── */
function TabResumen() {
  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const [
      { data: usuariosPorMun },
      { data: propPorTema },
      { data: propPorEstado },
      { count: totalResp },
      { count: totalVotosProy },
      { count: totalVotosProp },
    ] = await Promise.all([
      supabase.from('usuarios').select('municipio'),
      supabase.from('propuestas').select('tema'),
      supabase.from('propuestas').select('estado'),
      supabase.from('respuestas').select('id', { count: 'exact', head: true }),
      supabase.from('votos_proyectos').select('id', { count: 'exact', head: true }),
      supabase.from('votos_propuestas').select('id', { count: 'exact', head: true }),
    ])

    // Agrupar usuarios por municipio
    const munMapa = {}
    usuariosPorMun?.forEach(({ municipio }) => {
      const k = municipio || 'No especificado'
      munMapa[k] = (munMapa[k] || 0) + 1
    })
    const porMunicipio = Object.entries(munMapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    // Propuestas por tema
    const temaMapa = {}
    propPorTema?.forEach(({ tema }) => {
      const k = tema || 'General'
      temaMapa[k] = (temaMapa[k] || 0) + 1
    })
    const porTema = Object.entries(temaMapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Propuestas por estado
    const estadoMapa = {}
    propPorEstado?.forEach(({ estado }) => {
      estadoMapa[estado] = (estadoMapa[estado] || 0) + 1
    })
    const porEstado = Object.entries(estadoMapa)
      .map(([name, value]) => ({ name, value }))

    // Participación general
    const participacion = [
      { name: 'Resp. Encuestas',   value: totalResp      || 0 },
      { name: 'Votos Proyectos',   value: totalVotosProy || 0 },
      { name: 'Votos Propuestas',  value: totalVotosProp || 0 },
    ]

    setDatos({ porMunicipio, porTema, porEstado, participacion })
    setCargando(false)
  }

  if (cargando) return <Spinner />

  return (
    <div className="space-y-6">

      {/* Participación general */}
      <Tarjeta>
        <TituloSeccion Icono={BarChart2} titulo="Participación ciudadana por módulo"
          extra={<BotonExportar onClick={() => exportarCSV(datos.participacion, 'participacion_general')} />} />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={datos.participacion} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip formatter={(v) => [v.toLocaleString('es-CO'), 'Total']} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {datos.participacion.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Tarjeta>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Usuarios por municipio */}
        <Tarjeta>
          <TituloSeccion Icono={BarChart2} titulo="Ciudadanos por municipio"
            extra={<BotonExportar onClick={() => exportarCSV(datos.porMunicipio, 'ciudadanos_por_municipio')} />} />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={datos.porMunicipio} layout="vertical"
              margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v) => [v, 'Ciudadanos']} />
              <Bar dataKey="value" fill="#166534" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Tarjeta>

        {/* Propuestas por estado */}
        <Tarjeta>
          <TituloSeccion Icono={Lightbulb} titulo="Propuestas por estado"
            color="text-amber-600"
            extra={<BotonExportar onClick={() => exportarCSV(datos.porEstado, 'propuestas_por_estado')} />} />
          {datos.porEstado.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Sin datos aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={datos.porEstado} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}>
                  {datos.porEstado.map((e, i) => (
                    <Cell key={i} fill={C_ESTADO[e.name] || COLORES[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Tarjeta>
      </div>

      {/* Propuestas por tema */}
      <Tarjeta>
        <TituloSeccion Icono={Lightbulb} titulo="Propuestas por tema" color="text-amber-600"
          extra={<BotonExportar onClick={() => exportarCSV(datos.porTema, 'propuestas_por_tema')} />} />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={datos.porTema} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {datos.porTema.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Tarjeta>
    </div>
  )
}

/* ── PESTAÑA: Encuestas ──────────────────────────────────────── */
function TabEncuestas() {
  const [encuestas,     setEncuestas]     = useState([])
  const [seleccionada,  setSeleccionada]  = useState(null)
  const [resultados,    setResultados]    = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [cargandoRes,   setCargandoRes]   = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase
      .from('encuestas')
      .select('id, titulo, estado, creado_en')
      .order('creado_en', { ascending: false })
    setEncuestas(data || [])
    setCargando(false)
  }

  const cargarResultados = useCallback(async (enc) => {
    setSeleccionada(enc)
    setCargandoRes(true)
    const { data: preguntas } = await supabase
      .from('preguntas')
      .select('id, texto, opciones(id, texto, orden)')
      .eq('encuesta_id', enc.id)
      .order('orden')

    const res = []
    for (const preg of (preguntas || [])) {
      const opIds = preg.opciones?.map((o) => o.id) || []
      const { data: respuesta } = await supabase
        .from('respuestas')
        .select('opcion_id')
        .in('opcion_id', opIds.length ? opIds : [-1])

      const conteo = {}
      respuesta?.forEach(({ opcion_id }) => {
        conteo[opcion_id] = (conteo[opcion_id] || 0) + 1
      })

      const opciones = preg.opciones
        ?.sort((a, b) => a.orden - b.orden)
        .map((o) => ({ name: o.texto, value: conteo[o.id] || 0 }))
      const total = opciones?.reduce((s, o) => s + o.value, 0) || 0

      res.push({ pregunta: preg.texto, opciones, total })
    }

    setResultados(res)
    setCargandoRes(false)
  }, [])

  function exportarEncuesta() {
    if (!resultados.length) return
    const filas = []
    resultados.forEach(({ pregunta, opciones, total }) => {
      opciones.forEach(({ name, value }) => {
        filas.push({
          Pregunta: pregunta,
          Opción: name,
          Votos: value,
          Porcentaje: total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%',
        })
      })
    })
    exportarCSV(filas, `resultados_encuesta_${seleccionada?.id}`)
  }

  const csvEncuestas = encuestas.map((e) => ({
    ID: e.id,
    Título: e.titulo,
    Estado: e.estado,
    Creada: new Date(e.creado_en).toLocaleDateString('es-CO'),
  }))

  return (
    <div className="space-y-6">

      {/* Lista de encuestas */}
      <Tarjeta className="overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-green-600" />
            <p className="text-sm font-bold text-gray-700">Encuestas — selecciona para ver resultados</p>
          </div>
          <BotonExportar onClick={() => exportarCSV(csvEncuestas, 'listado_encuestas')} />
        </div>
        {cargando ? <Spinner /> : (
          <ul className="divide-y divide-gray-50">
            {encuestas.map((enc) => {
              const ei = { borrador: 'bg-gray-100 text-gray-600', activa: 'bg-green-100 text-green-700', cerrada: 'bg-red-100 text-red-600', archivada: 'bg-yellow-100 text-yellow-700' }
              const activa = seleccionada?.id === enc.id
              return (
                <li key={enc.id}
                  onClick={() => cargarResultados(enc)}
                  className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors
                    ${activa ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                  <span className="text-sm text-gray-800 truncate flex-1">{enc.titulo}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ei[enc.estado] || 'bg-gray-100 text-gray-500'}`}>
                      {enc.estado}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(enc.creado_en).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </li>
              )
            })}
            {encuestas.length === 0 && (
              <li className="px-5 py-10 text-sm text-gray-400 text-center">Sin encuestas registradas.</li>
            )}
          </ul>
        )}
      </Tarjeta>

      {/* Resultados */}
      {seleccionada && (
        <Tarjeta>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Resultados de encuesta</p>
              <p className="text-sm font-bold text-gray-800">{seleccionada.titulo}</p>
            </div>
            <BotonExportar onClick={exportarEncuesta} label="Exportar resultados CSV" />
          </div>

          {cargandoRes ? <Spinner /> : resultados.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              Esta encuesta no tiene preguntas o respuestas aún.
            </p>
          ) : (
            <div className="space-y-8">
              {resultados.map(({ pregunta, opciones, total }, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {i + 1}. {pregunta}
                    <span className="ml-2 text-xs font-normal text-gray-400">({total} respuesta{total !== 1 ? 's' : ''})</span>
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={opciones} margin={{ top: 0, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [v, 'Respuestas']} />
                      <Bar dataKey="value" fill="#166534" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          )}
        </Tarjeta>
      )}
    </div>
  )
}

/* ── PESTAÑA: Propuestas ─────────────────────────────────────── */
function TabPropuestas() {
  const [datos,    setDatos]    = useState(null)
  const [top,      setTop]      = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const [{ data: propuestas }, { data: topProp }] = await Promise.all([
      supabase.from('propuestas').select('tema, estado, estrellas, total_votos, titulo, fecha'),
      supabase.from('propuestas')
        .select('id, titulo, estrellas, total_votos, estado, tema')
        .order('total_votos', { ascending: false })
        .limit(10),
    ])

    // Por tema
    const temaMapa = {}
    propuestas?.forEach(({ tema }) => {
      const k = tema || 'General'
      temaMapa[k] = (temaMapa[k] || 0) + 1
    })
    const porTema = Object.entries(temaMapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Por estado
    const estadoMapa = {}
    propuestas?.forEach(({ estado }) => {
      estadoMapa[estado] = (estadoMapa[estado] || 0) + 1
    })
    const porEstado = Object.entries(estadoMapa)
      .map(([name, value]) => ({ name, value }))

    // Promedio de estrellas
    const conVotos = propuestas?.filter((p) => p.total_votos > 0) || []
    const avgEstrellas = conVotos.length
      ? (conVotos.reduce((s, p) => s + Number(p.estrellas), 0) / conVotos.length).toFixed(2)
      : '—'

    setDatos({ porTema, porEstado, avgEstrellas, total: propuestas?.length || 0, conVotos: conVotos.length })
    setTop(topProp || [])
    setCargando(false)
  }

  if (cargando) return <Spinner />

  const csvTop = top.map((p) => ({
    ID: p.id,
    Título: p.titulo,
    Tema: p.tema,
    Estado: p.estado,
    Estrellas: p.estrellas,
    'Total votos': p.total_votos,
  }))

  return (
    <div className="space-y-6">

      {/* Cards KPI */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total propuestas',     valor: datos.total },
          { label: 'Con votos',            valor: datos.conVotos },
          { label: 'Promedio ★',           valor: datos.avgEstrellas },
        ].map(({ label, valor }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-800">{valor}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Por estado */}
        <Tarjeta>
          <TituloSeccion Icono={Lightbulb} titulo="Distribución por estado" color="text-amber-600"
            extra={<BotonExportar onClick={() => exportarCSV(datos.porEstado, 'propuestas_por_estado')} />} />
          {datos.porEstado.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={datos.porEstado} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}
                  labelLine>
                  {datos.porEstado.map((e, i) => (
                    <Cell key={i} fill={C_ESTADO[e.name] || COLORES[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Tarjeta>

        {/* Por tema */}
        <Tarjeta>
          <TituloSeccion Icono={BarChart2} titulo="Propuestas por tema"
            extra={<BotonExportar onClick={() => exportarCSV(datos.porTema, 'propuestas_por_tema')} />} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datos.porTema} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {datos.porTema.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Tarjeta>
      </div>

      {/* Top propuestas */}
      <Tarjeta className="overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            <p className="text-sm font-bold text-gray-700">Top 10 propuestas más votadas</p>
          </div>
          <BotonExportar onClick={() => exportarCSV(csvTop, 'top_propuestas')} />
        </div>
        {top.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin propuestas con votos aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Título</th>
                <th className="px-5 py-3 text-left">Tema</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-right">★</th>
                <th className="px-5 py-3 text-right">Votos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {top.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 font-semibold">{i + 1}</td>
                  <td className="px-5 py-3 text-gray-800 font-medium max-w-xs truncate">{p.titulo}</td>
                  <td className="px-5 py-3 text-gray-500">{p.tema || 'General'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      { pendiente: 'bg-yellow-100 text-yellow-700', en_revision: 'bg-blue-100 text-blue-700', aprobada: 'bg-green-100 text-green-700', rechazada: 'bg-red-100 text-red-600' }[p.estado] || 'bg-gray-100 text-gray-500'
                    }`}>
                      { { pendiente: 'Pendiente', en_revision: 'En revisión', aprobada: 'Aprobada', rechazada: 'Rechazada' }[p.estado] || p.estado }
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-amber-600">
                    {p.estrellas > 0 ? Number(p.estrellas).toFixed(1) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gray-800">{p.total_votos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </div>
  )
}

/* ── Componente raíz ─────────────────────────────────────────── */

const TABS = [
  { id: 'resumen',   label: 'Resumen General', Icono: BarChart2      },
  { id: 'encuestas', label: 'Encuestas',        Icono: ClipboardList  },
  { id: 'propuestas',label: 'Propuestas',       Icono: Lightbulb      },
]

export default function AdminReportes() {
  const [tab, setTab] = useState('resumen')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reportes y Analítica</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Visualiza la participación ciudadana y descarga datos en CSV
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ id, label, Icono }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === id
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            <Icono size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'resumen'    && <TabResumen />}
      {tab === 'encuestas'  && <TabEncuestas />}
      {tab === 'propuestas' && <TabPropuestas />}
    </div>
  )
}
