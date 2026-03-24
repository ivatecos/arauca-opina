import { Link } from 'react-router-dom'
import {
  ClipboardList, FolderKanban, Lightbulb, QrCode,
  ArrowRight, Users, BarChart2, CheckCircle,
} from 'lucide-react'
import Boton from '@/componentes/comunes/Boton'
import { useAuth } from '@/hooks/useAuth'

/* ─── Datos ─────────────────────────────────────────────────────────────── */

const modulos = [
  {
    icono: ClipboardList,
    titulo: 'Encuestas',
    descripcion: 'Participa en encuestas sobre temas que importan en tu municipio.',
    ruta: '/encuestas',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
  },
  {
    icono: FolderKanban,
    titulo: 'Proyectos',
    descripcion: 'Opina sobre los proyectos de inversión pública de la Gobernación.',
    ruta: '/proyectos',
    bg: 'bg-purple-50',
    color: 'text-purple-600',
  },
  {
    icono: Lightbulb,
    titulo: 'Propuestas',
    descripcion: 'Envía tus ideas para mejorar la calidad de vida en Arauca.',
    ruta: '/propuestas',
    bg: 'bg-amber-50',
    color: 'text-amber-600',
  },
  {
    icono: QrCode,
    titulo: 'Escanea QR',
    descripcion: 'Accede a encuestas escaneando los códigos QR institucionales.',
    ruta: '#',
    bg: 'bg-green-50',
    color: 'text-green-700',
  },
]

const estadisticas = [
  { valor: '10.000+', label: 'Ciudadanos registrados', icono: Users },
  { valor: '50+',     label: 'Encuestas realizadas',   icono: ClipboardList },
  { valor: '200+',    label: 'Propuestas recibidas',   icono: Lightbulb },
  { valor: '85%',     label: 'Satisfacción ciudadana', icono: BarChart2 },
]

/* ─── Componente ────────────────────────────────────────────────────────── */

export default function Inicio() {
  const { usuario } = useAuth()

  return (
    <>
      {/* ══════════════════════════════════════════════════════ HERO ══ */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-700
                          min-h-screen flex items-center justify-center relative overflow-hidden">

        {/* Decoración */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">

          {/* Chip */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                          text-green-100 text-sm px-5 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Gobernación de Arauca · Colombia
          </div>

          {/* Título */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white
                         tracking-tight leading-[1.08] mb-6">
            Tu voz{' '}
            <span className="text-yellow-400">transforma</span>
            {' '}Arauca
          </h1>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl text-green-100/80 max-w-2xl mx-auto leading-relaxed mb-10">
            Participa en las decisiones que afectan tu comunidad. Encuestas,
            propuestas y consultas ciudadanas para construir juntos el
            departamento que queremos.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {usuario ? (
              <Link to="/encuestas">
                <Boton variante="dorado" tamanio="lg">
                  Ver encuestas activas <ArrowRight size={18} />
                </Boton>
              </Link>
            ) : (
              <>
                <Link to="/registro">
                  <Boton variante="dorado" tamanio="lg">
                    Registrarse gratis <ArrowRight size={18} />
                  </Boton>
                </Link>
                <Link to="/login">
                  <Boton variante="secundario" tamanio="lg"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50">
                    Iniciar sesión
                  </Boton>
                </Link>
              </>
            )}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════ ESTADÍSTICAS ══ */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Arauca en números</h2>
            <p className="text-gray-500 text-lg">La participación ciudadana crece cada día</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {estadisticas.map(({ valor, label, icono: Icono }) => (
              <div key={label}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center
                                justify-center mx-auto mb-4">
                  <Icono size={22} className="text-green-700" />
                </div>
                <p className="text-4xl font-extrabold text-green-800 mb-1">{valor}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════ MÓDULOS ══ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">
            <span className="inline-block text-green-700 font-semibold text-sm
                             uppercase tracking-widest mb-3">
              Formas de participar
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              ¿Cómo puedes participar?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Elige la forma que prefieras para hacer parte de la construcción colectiva de Arauca.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modulos.map((m) => (
              <Link key={m.titulo} to={m.ruta}
                className="group bg-white rounded-2xl border-2 border-transparent p-8
                           shadow-md hover:shadow-xl hover:border-green-200
                           hover:-translate-y-2 transition-all duration-200 flex flex-col">

                <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center
                                mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <m.icono size={26} className={m.color} />
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2">{m.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{m.descripcion}</p>

                <div className={`flex items-center gap-1.5 mt-5 text-sm font-semibold ${m.color}
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                  Ir al módulo <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════ CTA FINAL ══ */}
      {!usuario && (
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="bg-gradient-to-br from-green-900 to-emerald-700
                            rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid md:grid-cols-2">

                {/* Columna izquierda */}
                <div className="p-10 md:p-14">
                  <span className="text-yellow-400 font-semibold text-sm uppercase tracking-widest">
                    Únete ahora
                  </span>
                  <h2 className="text-3xl font-extrabold text-white mt-3 mb-4 leading-tight">
                    Participa en la construcción de Arauca
                  </h2>
                  <p className="text-green-100/75 mb-8 leading-relaxed">
                    Regístrate gratis y empieza a hacer parte del cambio en tu departamento.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/registro">
                      <Boton variante="dorado" tamanio="lg">
                        Registrarse gratis <ArrowRight size={18} />
                      </Boton>
                    </Link>
                    <Link to="/login">
                      <Boton variante="secundario" tamanio="lg"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                        Ya tengo cuenta
                      </Boton>
                    </Link>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="bg-white/5 border-t md:border-t-0 md:border-l
                                border-white/10 p-10 md:p-14">
                  <p className="text-green-300 font-semibold text-sm uppercase tracking-widest mb-6">
                    ¿Por qué registrarse?
                  </p>
                  <ul className="space-y-4">
                    {[
                      'Registro gratuito en menos de 2 minutos',
                      'Participa desde cualquier dispositivo',
                      'Tus respuestas son confidenciales',
                      'Resultados en tiempo real',
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                        <span className="text-green-100 text-sm leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </section>
      )}
    </>
  )
}
