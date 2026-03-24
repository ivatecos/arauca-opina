import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  BarChart2,
  ClipboardList,
  FolderKanban,
  Lightbulb,
  QrCode,
  FileDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { ruta: '/admin', label: 'Panel General', icono: BarChart2, exacto: true },
  { ruta: '/admin/encuestas', label: 'Encuestas', icono: ClipboardList },
  { ruta: '/admin/proyectos', label: 'Proyectos', icono: FolderKanban },
  { ruta: '/admin/propuestas', label: 'Propuestas', icono: Lightbulb },
  { ruta: '/admin/qr', label: 'Códigos QR', icono: QrCode },
  { ruta: '/admin/reportes', label: 'Reportes', icono: FileDown },
]

export default function LayoutAdmin() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  async function handleCerrarSesion() {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-green-800 text-white">
        {/* Logo */}
        <div className="p-6 border-b border-green-700">
          <h1 className="text-xl font-bold">Arauca Opina</h1>
          <p className="text-green-300 text-sm mt-1">Panel Administrativo</p>
        </div>

        {/* Menú */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              end={item.exacto}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-green-100 hover:bg-green-700'
                }`
              }
            >
              <item.icono size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-green-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
              {usuario?.nombre?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{usuario?.nombre || 'Administrador'}</p>
              <p className="text-xs text-green-300 truncate">{usuario?.correo || ''}</p>
            </div>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-2 text-sm text-green-300 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuAbierto(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-green-800 text-white flex flex-col">
            <div className="p-6 border-b border-green-700 flex items-center justify-between">
              <h1 className="text-xl font-bold">Arauca Opina</h1>
              <button onClick={() => setMenuAbierto(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.ruta}
                  to={item.ruta}
                  end={item.exacto}
                  onClick={() => setMenuAbierto(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'text-green-100 hover:bg-green-700'
                    }`
                  }
                >
                  <item.icono size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-green-700">
              <button
                onClick={handleCerrarSesion}
                className="flex items-center gap-2 text-sm text-green-300 hover:text-white transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header móvil */}
        <header className="lg:hidden bg-green-800 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMenuAbierto(true)}>
            <Menu size={22} />
          </button>
          <h1 className="font-bold">Arauca Opina - Admin</h1>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
