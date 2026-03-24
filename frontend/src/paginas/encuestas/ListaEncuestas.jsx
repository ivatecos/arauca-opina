import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ClipboardList, Calendar, ChevronRight, Search } from 'lucide-react'
import Tarjeta from '@/componentes/comunes/Tarjeta'

const BADGE = {
  activa:   'bg-green-100 text-green-700',
  cerrada:  'bg-gray-100 text-gray-500',
}

export default function ListaEncuestas() {
  const [encuestas, setEncuestas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('encuestas')
        .select('id, titulo, descripcion, fecha_fin, estado')
        .in('estado', ['activa', 'cerrada'])
        .order('creado_en', { ascending: false })

      setEncuestas(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  const filtradas = encuestas.filter((e) =>
    e.titulo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="w-full py-16"><div className="max-w-4xl mx-auto px-6">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
          <ClipboardList size={16} />
          Participación ciudadana
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Encuestas ciudadanas
        </h1>
        <p className="text-gray-500">
          Comparte tu opinión sobre los temas que afectan a Arauca.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar encuesta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : filtradas.length === 0 ? (
        <Tarjeta className="text-center py-16">
          <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {busqueda ? 'No se encontraron encuestas.' : 'No hay encuestas disponibles aún.'}
          </p>
        </Tarjeta>
      ) : (
        <div className="space-y-4">
          {filtradas.map((encuesta) => (
            <Link key={encuesta.id} to={`/encuestas/${encuesta.id}`}>
              <Tarjeta className="hover:border-green-300 hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE[encuesta.estado] ?? BADGE.cerrada}`}>
                        {encuesta.estado === 'activa' ? 'Activa' : 'Cerrada'}
                      </span>
                    </div>
                    <h2 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors leading-snug mb-1">
                      {encuesta.titulo}
                    </h2>
                    {encuesta.descripcion && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {encuesta.descripcion}
                      </p>
                    )}
                    {encuesta.fecha_fin && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                        <Calendar size={12} />
                        Cierra el{' '}
                        {new Date(encuesta.fecha_fin).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-300 group-hover:text-green-500 flex-shrink-0 mt-1 transition-colors"
                  />
                </div>
              </Tarjeta>
            </Link>
          ))}
        </div>
      )}
    </div></div>
  )
}
