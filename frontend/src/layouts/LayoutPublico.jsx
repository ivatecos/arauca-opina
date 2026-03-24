import { Outlet } from 'react-router-dom'
import Navbar from '@/componentes/comunes/Navbar'
import Footer from '@/componentes/comunes/Footer'

export default function LayoutPublico() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
