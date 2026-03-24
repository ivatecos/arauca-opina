import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { FolderKanban, Star, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import Tarjeta from '@/componentes/comunes/Tarjeta'

const ESTADOS = {
  publicado:    { label: 'Publicado',    color: 'bg-blue-100 text-blue-700' },
  en_ejecucion: { label: 'En ejecución', color: 'bg-green-100 text-green-700' },
  finalizado:   { label: 'Finalizado',   color: 'bg-gray-100 text-gray-600' },
}

function Estrellas({ promedio, total }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={14}
            className={n <= Math.round(promedio)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-200 fill-gray-200'} />
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {promedio > 0 ? promedio.toFixed(1) : '—'} {total > 0 && `(${total})`}
      </span>
    </div>
  )
}

export default function ListaProyectos() {
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTema, setFiltroTema] = useState('todos')
  const [temas, setTemas] = useState([])

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('proyectos')
        .select(`
          id, titulo, descripcion, tema, estado,
          presupuesto, municipio, imagen_url,
          votos_proyectos(valoracion)
        `)
        .in('estado', ['publicado', 'en_ejecucion', 'finalizado'])
        .order('creado_en', { ascending: false })

      if (data) {
        const enriquecidos = data.map((p) => {
          const votos = p.votos_proyectos || []
          const total = votos.length
          const promedio = total > 0
            ? votos.reduce((s, v) => s + v.valoracion, 0) / total
            : 0
          return { ...p, total_votos: total, promedio }
        })
        setProyectos(enriquecidos)
        const temasUnicos = [...new Set(enriquecidos.map((p) => p.tema).filter(Boolean))]
        setTemas(temasUnicos)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  const filtrados = proyectos.filter((p) => {
    const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideTema = filtroTema === 'todos' || p.tema === filtroTema
    return coincideBusqueda && coincideTema
  })

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-purple-700 text-sm font-semibold mb-2">
            <FolderKanban size={16} /> Participación ciudadana
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Proyectos de inversión
          </h1>
          <p className="text-gray-500">
            Conoce y valora los proyectos que la Gobernación ejecuta para Arauca.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar proyecto..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
          </div>
          {temas.length > 0 && (
            <div className="relative">
              <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filtroTema} onChange={(e) => setFiltroTema(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none">
                <option value="todos">Todos los temas</option>
                {temas.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Lista */}
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
          </div>
        ) : filtrados.length === 0 ? (
          <Tarjeta className="text-center py-16">
            <FolderKanban size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron proyectos.</p>
          </Tarjeta>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map((p) => (
              <Link key={p.id} to={`/proyectos/${p.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-md
                           hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">

                {/* Imagen o placeholder */}
                <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-50
                                flex items-center justify-center overflow-hidden shrink-0">
                  {p.imagen_url
                    ? <img src={p.imagen_url} alt={p.titulo}
                        className="w-full h-full object-cover" />
                    : <FolderKanban size={48} className="text-purple-200" />
                  }
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {p.tema && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5
                                       rounded-full font-medium shrink-0">
                        {p.tema}
                      </span>
                    )}
                    {ESTADOS[p.estado] && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0
                                        ${ESTADOS[p.estado].color}`}>
                        {ESTADOS[p.estado].label}
                      </span>
                    )}
                  </div>

                  <h2 className="font-bold text-gray-900 leading-snug mb-2
                                 group-hover:text-purple-700 transition-colors flex-1">
                    {p.titulo}
                  </h2>

                  {p.descripcion && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {p.descripcion}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <Estrellas promedio={p.promedio} total={p.total_votos} />
                    {p.municipio && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} /> {p.municipio}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
