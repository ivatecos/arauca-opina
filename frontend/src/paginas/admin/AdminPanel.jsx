import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import {
  Users, ClipboardList, FolderKanban, Lightbulb,
  QrCode, FileDown, ArrowRight, Star, MessageSquare,
  Scan, TrendingUp, CheckCircle, Clock,
} from 'lucide-react'

export default function AdminPanel() {
  const [stats, setStats]     = useState(null)
  const [recientes, setRec]   = useState({ propuestas: [], encuestas: [] })
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const [
      { count: usuarios },
      { count: encuestas },
      { count: proyectos },
      { count: propuestas },
      { count: respuestas },
      { count: votosProyectos },
      { count: votosPropuestas },
      { data: qrData },
      { data: propRecientes },
      { data: encRecientes },
    ] = await Promise.all([
      supabase.from('usuarios').select('id', { count: 'exact', head: true }),
      supabase.from('encuestas').select('id', { count: 'exact', head: true }),
      supabase.from('proyectos').select('id', { count: 'exact', head: true }),
      supabase.from('propuestas').select('id', { count: 'exact', head: true }),
      supabase.from('respuestas').select('id', { count: 'exact', head: true }),
      supabase.from('votos_proyectos').select('id', { count: 'exact', head: true }),
      supabase.from('votos_propuestas').select('id', { count: 'exact', head: true }),
      supabase.from('codigos_qr').select('escaneos'),
      supabase.from('propuestas').select('id, titulo, estado, fecha').order('fecha', { ascending: false }).limit(5),
      supabase.from('encuestas').select('id, titulo, estado, creado_en').order('creado_en', { ascending: false }).limit(5),
    ])

    const escaneos = qrData?.reduce((s, q) => s + (q.escaneos || 0), 0) ?? 0

    setStats({
      usuarios:        usuarios || 0,
      encuestas:       encuestas || 0,
      proyectos:       proyectos || 0,
      propuestas:      propuestas || 0,
      respuestas:      respuestas || 0,
      votosProyectos:  votosProyectos || 0,
      votosPropuestas: votosPropuestas || 0,
      escaneos,
    })
    setRec({ propuestas: propRecientes || [], encuestas: encRecientes || [] })
    setCargando(false)
  }

  const ESTADO_ENC = {
    borrador:   { label: 'Borrador',   color: 'bg-gray-100 text-gray-600' },
    activa:     { label: 'Activa',     color: 'bg-green-100 text-green-700' },
    cerrada:    { label: 'Cerrada',    color: 'bg-red-100 text-red-600' },
    archivada:  { label: 'Archivada',  color: 'bg-yellow-100 text-yellow-700' },
  }
  const ESTADO_PROP = {
    pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
    en_revision: { label: 'En revisión', color: 'bg-blue-100 text-blue-700' },
    aprobada:    { label: 'Aprobada',    color: 'bg-green-100 text-green-700' },
    rechazada:   { label: 'Rechazada',   color: 'bg-red-100 text-red-600' },
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel General</h1>
        <p className="text-gray-500 text-sm mt-0.5">Resumen de la actividad ciudadana en Arauca Opina</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Ciudadanos',   valor: stats?.usuarios,   Icono: Users,        color: 'text-blue-600 bg-blue-50' },
          { label: 'Encuestas',    valor: stats?.encuestas,  Icono: ClipboardList, color: 'text-green-600 bg-green-50',  ruta: '/admin/encuestas' },
          { label: 'Proyectos',    valor: stats?.proyectos,  Icono: FolderKanban,  color: 'text-purple-600 bg-purple-50', ruta: '/admin/proyectos' },
          { label: 'Propuestas',   valor: stats?.propuestas, Icono: Lightbulb,     color: 'text-amber-600 bg-amber-50',  ruta: '/admin/propuestas' },
        ].map(({ label, valor, Icono, color, ruta }) => (
          <Tarjeta key={label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icono size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-gray-800 leading-none">
                {cargando ? '—' : (valor ?? 0).toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{label}</p>
              {ruta && (
                <Link to={ruta} className="text-xs text-green-700 hover:underline flex items-center gap-0.5 mt-1">
                  Ver <ArrowRight size={10} />
                </Link>
              )}
            </div>
          </Tarjeta>
        ))}
      </div>

      {/* Métricas de participación */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Respuestas a encuestas', valor: stats?.respuestas,      Icono: MessageSquare, color: 'text-green-700 bg-green-100' },
          { label: 'Votos en proyectos',     valor: stats?.votosProyectos,  Icono: Star,          color: 'text-purple-700 bg-purple-100' },
          { label: 'Votos en propuestas',    valor: stats?.votosPropuestas, Icono: CheckCircle,   color: 'text-amber-700 bg-amber-100' },
          { label: 'Escaneos QR totales',    valor: stats?.escaneos,        Icono: Scan,          color: 'text-gray-700 bg-gray-100' },
        ].map(({ label, valor, Icono, color }) => (
          <div key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icono size={14} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800 leading-none">
                {cargando ? '—' : (valor ?? 0).toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Propuestas recientes */}
        <Tarjeta className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              <p className="text-sm font-bold text-gray-700">Propuestas recientes</p>
            </div>
            <Link to="/admin/propuestas" className="text-xs text-green-700 hover:underline flex items-center gap-0.5">
              Ver todas <ArrowRight size={10} />
            </Link>
          </div>
          {cargando ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700" />
            </div>
          ) : recientes.propuestas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin propuestas aún.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recientes.propuestas.map((p) => {
                const e = ESTADO_PROP[p.estado]
                return (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3 gap-3">
                    <span className="text-sm text-gray-700 truncate flex-1">{p.titulo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${e?.color || 'bg-gray-100 text-gray-500'}`}>
                      {e?.label || p.estado}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Tarjeta>

        {/* Encuestas recientes */}
        <Tarjeta className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-green-600" />
              <p className="text-sm font-bold text-gray-700">Encuestas recientes</p>
            </div>
            <Link to="/admin/encuestas" className="text-xs text-green-700 hover:underline flex items-center gap-0.5">
              Ver todas <ArrowRight size={10} />
            </Link>
          </div>
          {cargando ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700" />
            </div>
          ) : recientes.encuestas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin encuestas aún.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recientes.encuestas.map((e) => {
                const ei = ESTADO_ENC[e.estado]
                return (
                  <li key={e.id} className="flex items-center justify-between px-5 py-3 gap-3">
                    <span className="text-sm text-gray-700 truncate flex-1">{e.titulo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${ei?.color || 'bg-gray-100 text-gray-500'}`}>
                      {ei?.label || e.estado}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Tarjeta>
      </div>

      {/* Accesos rápidos */}
      <Tarjeta>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-green-700" />
          <p className="text-sm font-bold text-gray-700">Acciones rápidas</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { ruta: '/admin/encuestas',  label: 'Nueva encuesta',   Icono: ClipboardList, bg: 'bg-green-50 hover:bg-green-100',   text: 'text-green-800' },
            { ruta: '/admin/proyectos',  label: 'Nuevo proyecto',   Icono: FolderKanban,  bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-800' },
            { ruta: '/admin/propuestas', label: 'Ver propuestas',   Icono: Lightbulb,     bg: 'bg-amber-50 hover:bg-amber-100',   text: 'text-amber-800' },
            { ruta: '/admin/qr',         label: 'Generar QR',       Icono: QrCode,        bg: 'bg-gray-50 hover:bg-gray-100',     text: 'text-gray-800' },
            { ruta: '/admin/reportes',   label: 'Ver reportes',     Icono: FileDown,      bg: 'bg-blue-50 hover:bg-blue-100',     text: 'text-blue-800' },
            { ruta: '/admin/reportes',   label: 'Analítica',        Icono: Clock,         bg: 'bg-red-50 hover:bg-red-100',       text: 'text-red-800' },
          ].map(({ ruta, label, Icono, bg, text }) => (
            <Link key={label} to={ruta}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${bg}`}>
              <Icono size={22} className={text} />
              <span className={`text-xs font-medium text-center leading-tight ${text}`}>{label}</span>
            </Link>
          ))}
        </div>
      </Tarjeta>
    </div>
  )
}
