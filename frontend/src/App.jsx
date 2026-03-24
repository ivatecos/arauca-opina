import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'

// Layouts
import LayoutPublico from '@/layouts/LayoutPublico'
import LayoutAdmin from '@/layouts/LayoutAdmin'

// Páginas públicas
import Inicio from '@/paginas/Inicio'
import Login from '@/paginas/auth/Login'
import Registro from '@/paginas/auth/Registro'
import ListaEncuestas from '@/paginas/encuestas/ListaEncuestas'
import EncuestaDetalle from '@/paginas/encuestas/EncuestaDetalle'
import ListaProyectos from '@/paginas/proyectos/ListaProyectos'
import ProyectoDetalle from '@/paginas/proyectos/ProyectoDetalle'
import ListaPropuestas from '@/paginas/propuestas/ListaPropuestas'
import NuevaPropuesta from '@/paginas/propuestas/NuevaPropuesta'
import PropuestaDetalle from '@/paginas/propuestas/PropuestaDetalle'
import LandingQR from '@/paginas/LandingQR'

// Páginas de administración
import AdminPanel from '@/paginas/admin/AdminPanel'
import AdminEncuestas from '@/paginas/admin/AdminEncuestas'
import AdminProyectos from '@/paginas/admin/AdminProyectos'
import AdminPropuestas from '@/paginas/admin/AdminPropuestas'
import AdminQR from '@/paginas/admin/AdminQR'
import AdminReportes from '@/paginas/admin/AdminReportes'

// Componente para rutas protegidas
function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (soloAdmin && usuario.rol !== 'administrador') {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<LayoutPublico />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/encuestas" element={<ListaEncuestas />} />
            <Route path="/encuestas/:id" element={<EncuestaDetalle />} />
            <Route path="/proyectos" element={<ListaProyectos />} />
            <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
            <Route path="/propuestas" element={<ListaPropuestas />} />
            <Route path="/propuestas/nueva" element={<NuevaPropuesta />} />
            <Route path="/propuestas/:id" element={<PropuestaDetalle />} />
            <Route path="/qr/:tipo/:id" element={<LandingQR />} />
          </Route>

          {/* Rutas de administración */}
          <Route
            path="/admin"
            element={
              <RutaProtegida soloAdmin>
                <LayoutAdmin />
              </RutaProtegida>
            }
          >
            <Route index element={<AdminPanel />} />
            <Route path="encuestas" element={<AdminEncuestas />} />
            <Route path="proyectos" element={<AdminProyectos />} />
            <Route path="propuestas" element={<AdminPropuestas />} />
            <Route path="qr" element={<AdminQR />} />
            <Route path="reportes" element={<AdminReportes />} />
          </Route>

          {/* Ruta no encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
