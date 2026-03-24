import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, ChevronDown, LogOut, User, Settings } from 'lucide-react'

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [perfilAbierto, setPerfilAbierto] = useState(false)

  async function handleCerrarSesion() {
    await cerrarSesion()
    navigate('/')
    setMenuAbierto(false)
    setPerfilAbierto(false)
  }

  const estiloLink = ({ isActive }) =>
    `text-sm font-medium transition-colors pb-0.5 border-b-2 ${
      isActive
        ? 'text-yellow-300 border-yellow-300'
        : 'text-green-100 hover:text-white border-transparent'
    }`

  return (
    <header className="bg-green-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-green-800 font-extrabold text-sm">AO</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-white text-sm leading-tight">Arauca Opina</p>
              <p className="text-green-300 text-xs leading-tight">Gobernación de Arauca</p>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" end className={estiloLink}>Inicio</NavLink>
            <NavLink to="/encuestas"  className={estiloLink}>Encuestas</NavLink>
            <NavLink to="/proyectos"  className={estiloLink}>Proyectos</NavLink>
            <NavLink to="/propuestas" className={estiloLink}>Propuestas</NavLink>
          </nav>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center gap-3">
            {usuario ? (
              <div className="relative">
                <button
                  onClick={() => setPerfilAbierto(!perfilAbierto)}
                  className="flex items-center gap-2 text-sm text-green-100 hover:text-white
                             bg-green-700 hover:bg-green-600 px-3 py-2 rounded-xl transition-colors"
                >
                  <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center
                                  font-bold text-xs">
                    {usuario.nombre?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-24 truncate">{usuario.nombre}</span>
                  <ChevronDown size={14} />
                </button>

                {perfilAbierto && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setPerfilAbierto(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl
                                    border border-gray-100 py-1.5 z-20">
                      {usuario.rol === 'administrador' && (
                        <Link to="/admin" onClick={() => setPerfilAbierto(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Settings size={14} className="text-gray-400" /> Panel Admin
                        </Link>
                      )}
                      <Link to="/perfil" onClick={() => setPerfilAbierto(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={14} className="text-gray-400" /> Mi perfil
                      </Link>
                      <hr className="my-1" />
                      <button onClick={handleCerrarSesion}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600
                                   hover:bg-red-50 w-full text-left">
                        <LogOut size={14} /> Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm text-green-100 hover:text-white font-medium
                             hover:bg-green-700 px-4 py-2 rounded-xl transition-colors">
                  Ingresar
                </Link>
                <Link to="/registro"
                  className="text-sm bg-yellow-500 hover:bg-yellow-400 text-white
                             px-4 py-2 rounded-xl font-semibold shadow-md
                             hover:-translate-y-0.5 transition-all">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Botón hamburguesa móvil */}
          <button
            className="md:hidden p-2 text-white hover:bg-green-700 rounded-lg transition-colors"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Menú"
          >
            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="md:hidden bg-green-900 border-t border-green-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            {[
              { ruta: '/',           label: 'Inicio' },
              { ruta: '/encuestas',  label: 'Encuestas' },
              { ruta: '/proyectos',  label: 'Proyectos' },
              { ruta: '/propuestas', label: 'Propuestas' },
            ].map(({ ruta, label }) => (
              <NavLink key={ruta} to={ruta} end={ruta === '/'}
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-green-700 text-yellow-300' : 'text-green-100 hover:bg-green-700'
                  }`
                }>
                {label}
              </NavLink>
            ))}

            <div className="pt-2 border-t border-green-700 mt-2">
              {usuario ? (
                <>
                  {usuario.rol === 'administrador' && (
                    <Link to="/admin" onClick={() => setMenuAbierto(false)}
                      className="block px-4 py-3 text-sm text-green-100 hover:bg-green-700 rounded-xl">
                      Panel Admin
                    </Link>
                  )}
                  <button onClick={handleCerrarSesion}
                    className="block w-full text-left px-4 py-3 text-sm text-red-300
                               hover:bg-green-700 rounded-xl mt-1">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-1">
                  <Link to="/login" onClick={() => setMenuAbierto(false)}
                    className="block px-4 py-3 text-sm text-center text-green-100
                               hover:bg-green-700 rounded-xl">
                    Ingresar
                  </Link>
                  <Link to="/registro" onClick={() => setMenuAbierto(false)}
                    className="block px-4 py-3 text-sm text-center bg-yellow-500
                               hover:bg-yellow-400 text-white rounded-xl font-semibold">
                    Registrarse gratis
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
