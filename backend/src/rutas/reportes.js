import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = express.Router()

/**
 * GET /api/reportes/participacion
 * Retorna datos consolidados de participación ciudadana
 */
router.get('/participacion', async (req, res) => {
  try {
    const [usuarios, encuestas, respuestas, propuestas, proyectos] = await Promise.all([
      supabaseAdmin.from('usuarios').select('municipio, fecha_registro'),
      supabaseAdmin.from('encuestas').select('estado, fecha_inicio'),
      supabaseAdmin.from('respuestas').select('fecha'),
      supabaseAdmin.from('propuestas').select('tema, estrellas, fecha'),
      supabaseAdmin.from('proyectos').select('estado, tema'),
    ])

    res.json({
      totales: {
        usuarios: usuarios.data?.length || 0,
        encuestas: encuestas.data?.length || 0,
        respuestas: respuestas.data?.length || 0,
        propuestas: propuestas.data?.length || 0,
        proyectos: proyectos.data?.length || 0,
      },
      usuariosPorMunicipio: agruparPorCampo(usuarios.data || [], 'municipio'),
      propuestasPorTema: agruparPorCampo(propuestas.data || [], 'tema'),
      proyectosPorEstado: agruparPorCampo(proyectos.data || [], 'estado'),
    })
  } catch {
    res.status(500).json({ error: 'Error al generar reporte de participación' })
  }
})

/**
 * GET /api/reportes/encuesta/:id/csv
 * Exporta resultados de una encuesta en CSV
 */
router.get('/encuesta/:id/csv', async (req, res) => {
  try {
    const { id } = req.params

    const { data: respuestas, error } = await supabaseAdmin
      .from('respuestas')
      .select(`
        fecha,
        usuarios (nombre, municipio),
        preguntas (texto),
        opciones (texto)
      `)
      .eq('preguntas.encuesta_id', id)

    if (error) throw error

    // Generar CSV
    const cabecera = 'Ciudadano,Municipio,Pregunta,Respuesta,Fecha\n'
    const filas = (respuestas || []).map((r) =>
      `"${r.usuarios?.nombre || ''}","${r.usuarios?.municipio || ''}","${r.preguntas?.texto || ''}","${r.opciones?.texto || ''}","${r.fecha || ''}"`
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="encuesta-${id}-resultados.csv"`)
    res.send('\uFEFF' + cabecera + filas) // BOM para Excel
  } catch {
    res.status(500).json({ error: 'Error al exportar el reporte' })
  }
})

// Función auxiliar para agrupar datos
function agruparPorCampo(datos, campo) {
  return datos.reduce((acc, item) => {
    const valor = item[campo] || 'Sin clasificar'
    acc[valor] = (acc[valor] || 0) + 1
    return acc
  }, {})
}

export default router
