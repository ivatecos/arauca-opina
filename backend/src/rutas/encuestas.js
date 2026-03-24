import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = express.Router()

/**
 * GET /api/encuestas
 * Lista encuestas activas (públicas)
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('encuestas')
      .select('*')
      .eq('estado', 'activa')
      .order('fecha_inicio', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch {
    res.status(500).json({ error: 'Error al obtener encuestas' })
  }
})

/**
 * GET /api/encuestas/:id/resultados
 * Obtiene resultados de una encuesta (conteo de votos por opción)
 */
router.get('/:id/resultados', async (req, res) => {
  try {
    const { id } = req.params

    const { data: preguntas, error } = await supabaseAdmin
      .from('preguntas')
      .select(`
        id, texto,
        opciones (
          id, texto,
          respuestas (count)
        )
      `)
      .eq('encuesta_id', id)
      .order('id')

    if (error) throw error

    // Dar formato a los resultados
    const resultados = preguntas.map((p) => {
      const totalVotos = p.opciones?.reduce((acc, o) => acc + (o.respuestas?.[0]?.count || 0), 0) || 0
      return {
        id: p.id,
        texto: p.texto,
        totalVotos,
        opciones: p.opciones?.map((o) => ({
          id: o.id,
          texto: o.texto,
          votos: o.respuestas?.[0]?.count || 0,
          porcentaje: totalVotos > 0
            ? Math.round(((o.respuestas?.[0]?.count || 0) / totalVotos) * 100)
            : 0,
        })),
      }
    })

    res.json(resultados)
  } catch {
    res.status(500).json({ error: 'Error al obtener resultados' })
  }
})

export default router
