import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  const anio = new Date().getFullYear()

  return (
    <footer className="bg-green-900 text-green-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Identidad */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                <span className="text-green-800 font-extrabold text-sm">AO</span>
              </div>
              <div>
                <p className="font-bold text-white leading-tight">Arauca Opina</p>
                <p className="text-green-400 text-xs">Gobernación de Arauca</p>
              </div>
            </div>
            <p className="text-green-300 text-sm leading-relaxed mb-5">
              Plataforma oficial de participación ciudadana del departamento
              de Arauca, Colombia.
            </p>
            <div className="space-y-2 text-sm text-green-400">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="shrink-0" /> Arauca, Colombia
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="shrink-0" /> (607) 885 0000
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="shrink-0" /> contacto@arauca.gov.co
              </div>
            </div>
          </div>

          {/* Módulos */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">
              Módulos
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/encuestas',  label: 'Encuestas ciudadanas' },
                { to: '/proyectos',  label: 'Proyectos de inversión' },
                { to: '/propuestas', label: 'Propuestas ciudadanas' },
                { to: '/registro',   label: 'Registro ciudadano' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-green-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes + Horario */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">
              Síguenos
            </h4>
            <div className="flex gap-3 mb-6">
              {[
                { href: 'https://facebook.com',  Icon: Facebook,  label: 'Facebook' },
                { href: 'https://twitter.com',   Icon: Twitter,   label: 'Twitter' },
                { href: 'https://instagram.com', Icon: Instagram, label: 'Instagram' },
                { href: 'https://youtube.com',   Icon: Youtube,   label: 'YouTube' },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                   aria-label={label}
                   className="w-10 h-10 flex items-center justify-center rounded-xl
                              bg-green-800 hover:bg-yellow-500 border border-green-700
                              transition-colors duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <div className="bg-green-800/60 rounded-xl p-4 border border-green-700">
              <p className="text-green-200 font-medium text-sm mb-1">Horario de atención</p>
              <p className="text-green-400 text-sm">Lun – Vie: 8:00 a.m. – 5:00 p.m.</p>
            </div>
          </div>

        </div>

        <div className="border-t border-green-800 pt-6 flex flex-col sm:flex-row
                        items-center justify-between gap-2 text-xs text-green-500">
          <p>© {anio} Gobernación de Arauca. Todos los derechos reservados.</p>
          <p>Plataforma de participación ciudadana</p>
        </div>

      </div>
    </footer>
  )
}
