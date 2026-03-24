import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import Boton from '@/componentes/comunes/Boton'
import { Lightbulb, Star, User, Plus, Search, SlidersHorizontal, ArrowRight } from 'lucide-react'

const ESTADOS = {
  pendiente:   { label: 'Pendiente',    color: 'bg-yellow-100 text-yellow-700' },
  en_revision: { label: 'En revisión',  color: 'bg-blue-100 text-blue-700' },
  aprobada:    { label: 'Aprobada',     color: 'bg-green-100 text-green-700' },
}

const TEMAS = [
  'Educación', 'Salud', 'Infraestructura', 'Medio Ambiente',
  'Seguridad', 'Cultura', 'Deporte', 'Vivienda', 'Económico', 'General',
]

export default function ListaPropuestas() {
  const { usuario } = useAuth()
  const [propuestas, setPropuestas] = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [busqueda,   setBusqueda]   = useState('')
  const [filtroTema, setFiltroTema] = useState('todos')
  const [orden,      setOrden]      = useState('votos')

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('propuestas')
        .select('*, usuarios(nombre, municipio)')
        .not('estado', 'eq', 'rechazada')
        .order(orden === 'votos' ? 'total_votos' : 'fecha', { ascending: false })

      setPropuestas(data || [])
      setCargando(false)
    }
    cargar()
  }, [orden])

  const filtradas = propuestas.filter((p) => {
    const txt = (p.titulo + ' ' + p.descripcion).toLowerCase()
    return (
      txt.includes(busqueda.toLowerCase()) &&
      (filtroTema === 'todos' || p.tema === filtroTema)
    )
  })

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-2">
              <Lightbulb size={16} /> Participación ciudadana
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Propuestas ciudadanas
            </h1>
            <p className="text-gray-500">
              Ideas de los ciudadanos para mejorar Arauca. Apoya las que te parezcan mejor.
            </p>
          </div>
          {usuario && (
            <Link to="/propuestas/nueva" className="shrink-0">
              <Boton variante="primario">
                <Plus size={16} /> Nueva propuesta
              </Boton>
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar propuesta..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
          </div>

          <div className="relative">
            <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={filtroTema} onChange={(e) => setFiltroTema(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white appearance-none">
              <option value="todos">Todos los temas</option>
              {TEMAS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden text-sm">
            <button
              onClick={() => setOrden('votos')}
              className={`px-4 py-2.5 font-medium transition-colors ${
                orden === 'votos' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              Más votadas
            </button>
            <button
              onClick={() => setOrden('fecha')}
              className={`px-4 py-2.5 font-medium transition-colors border-l border-gray-200 ${
                orden === 'fecha' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              Más recientes
            </button>
          </div>
        </div>

        {/* CTA para no autenticados */}
        {!usuario && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8
                          flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lightbulb size={24} className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">¿Tienes una idea?</span> Inicia sesión para
                enviar tu propuesta y votar.
              </p>
            </div>
            <Link to="/login">
              <Boton variante="primario" tamanio="sm" className="shrink-0">
                Iniciar sesión <ArrowRight size={14} />
              </Boton>
            </Link>
          </div>
        )}

        {/* Lista */}
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
          </div>
        ) : filtradas.length === 0 ? (
          <Tarjeta className="text-center py-16">
            <Lightbulb size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {busqueda ? 'No se encontraron propuestas.' : 'Aún no hay propuestas publicadas.'}
            </p>
          </Tarjeta>
        ) : (
          <div className="space-y-4">
            {filtradas.map((p) => (
              <Link key={p.id} to={`/propuestas/${p.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-md
                           hover:shadow-lg hover:border-amber-200 transition-all duration-200">
                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Votos destacados */}
                  <div className="sm:shrink-0 flex sm:flex-col items-center gap-3 sm:gap-1
                                  sm:w-16 sm:text-center">
                    <div className="flex items-center gap-1 sm:flex-col">
                      <Star size={18} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xl font-extrabold text-gray-800">
                        {p.estrellas > 0 ? p.estrellas.toFixed(1) : '—'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{p.total_votos} votos</span>
                  </div>

                  <div className="sm:w-px sm:self-stretch bg-gray-100 hidden sm:block" />

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ESTADOS[p.estado] && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium
                                          ${ESTADOS[p.estado].color}`}>
                          {ESTADOS[p.estado].label}
                        </span>
                      )}
                      {p.tema && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5
                                         rounded-full font-medium">
                          {p.tema}
                        </span>
                      )}
                    </div>

                    <h2 className="font-bold text-gray-900 leading-snug mb-1
                                   group-hover:text-amber-600 transition-colors">
                      {p.titulo}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {p.descripcion}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {p.usuarios?.nombre || 'Ciudadano'}
                        {p.usuarios?.municipio && ` · ${p.usuarios.municipio}`}
                      </span>
                      <span>
                        {new Date(p.fecha).toLocaleDateString('es-CO', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <ArrowRight size={18}
                    className="text-gray-300 group-hover:text-amber-400 shrink-0 hidden sm:block
                               transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
