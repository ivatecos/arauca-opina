import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import { ClipboardList, Calendar, CheckCircle } from 'lucide-react'

export default function EncuestaDetalle() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const [encuesta, setEncuesta] = useState(null)
  const [preguntas, setPreguntas] = useState([])
  const [respuestas, setRespuestas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [yaRespondio, setYaRespondio] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarEncuesta()
  }, [id])

  async function cargarEncuesta() {
    try {
      const [{ data: enc }, { data: pregs }] = await Promise.all([
        supabase.from('encuestas').select('*').eq('id', id).single(),
        supabase.from('preguntas').select('*, opciones(*)').eq('encuesta_id', id).order('id'),
      ])

      setEncuesta(enc)
      setPreguntas(pregs || [])

      // Verificar si el usuario ya respondió
      if (usuario) {
        const { data: resp } = await supabase
          .from('respuestas')
          .select('id')
          .eq('usuario_id', usuario.id)
          .eq('pregunta_id', pregs?.[0]?.id)
          .maybeSingle()

        setYaRespondio(!!resp)
      }
    } catch (err) {
      setError('No se pudo cargar la encuesta.')
    } finally {
      setCargando(false)
    }
  }

  function handleRespuesta(preguntaId, opcionId) {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }))
  }

  async function handleEnviar(e) {
    e.preventDefault()

    if (!usuario) {
      setError('Debes iniciar sesión para responder la encuesta.')
      return
    }

    const preguntasSinResponder = preguntas.filter((p) => !respuestas[p.id])
    if (preguntasSinResponder.length > 0) {
      setError('Por favor responde todas las preguntas antes de enviar.')
      return
    }

    setEnviando(true)
    setError('')

    try {
      const registros = Object.entries(respuestas).map(([preguntaId, opcionId]) => ({
        usuario_id: usuario.id,
        pregunta_id: parseInt(preguntaId),
        opcion_id: opcionId,
      }))

      const { error: insertError } = await supabase.from('respuestas').insert(registros)
      if (insertError) throw insertError

      setExito(true)
      setYaRespondio(true)
    } catch {
      setError('Error al enviar las respuestas. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
      </div>
    )
  }

  if (!encuesta) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Encuesta no encontrada</h2>
      </div>
    )
  }

  return (
    <div className="w-full py-16"><div className="max-w-3xl mx-auto px-6">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-3">
          <ClipboardList size={16} />
          Encuesta ciudadana
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{encuesta.titulo}</h1>
        {encuesta.descripcion && (
          <p className="text-gray-600 leading-relaxed">{encuesta.descripcion}</p>
        )}
        {encuesta.fecha_fin && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <Calendar size={14} />
            Cierra el {new Date(encuesta.fecha_fin).toLocaleDateString('es-CO', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        )}
      </div>

      {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} className="mb-6" />}

      {exito || yaRespondio ? (
        <Tarjeta className="text-center py-10">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">¡Gracias por participar!</h2>
          <p className="text-gray-500">Tu respuesta ha sido registrada exitosamente.</p>
        </Tarjeta>
      ) : (
        <form onSubmit={handleEnviar} className="space-y-6">
          {preguntas.map((pregunta, idx) => (
            <Tarjeta key={pregunta.id}>
              <p className="font-medium text-gray-800 mb-4">
                <span className="text-green-700 font-bold">{idx + 1}.</span> {pregunta.texto}
              </p>
              <div className="space-y-3">
                {pregunta.opciones?.map((opcion) => (
                  <label
                    key={opcion.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      respuestas[pregunta.id] === opcion.id
                        ? 'bg-green-50 border-green-400'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id}`}
                      value={opcion.id}
                      checked={respuestas[pregunta.id] === opcion.id}
                      onChange={() => handleRespuesta(pregunta.id, opcion.id)}
                      className="accent-green-700"
                    />
                    <span className="text-sm text-gray-700">{opcion.texto}</span>
                  </label>
                ))}
              </div>
            </Tarjeta>
          ))}

          {!usuario && (
            <Alerta tipo="advertencia"
              mensaje="Debes iniciar sesión para enviar tus respuestas." />
          )}

          <Boton
            type="submit"
            variante="primario"
            tamanio="lg"
            cargando={enviando}
            disabled={!usuario}
            className="w-full"
          >
            Enviar respuestas
          </Boton>
        </form>
      )}
    </div></div>
  )
}
