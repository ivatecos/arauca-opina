import express from 'express'
import QRCode from 'qrcode'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = express.Router()

/**
 * POST /api/qr/generar
 * Genera un código QR para una encuesta, proyecto o propuesta
 * Body: { tipo: 'encuesta'|'proyecto'|'propuesta', referenciaId: number }
 */
router.post('/generar', async (req, res) => {
  try {
    const { tipo, referenciaId } = req.body

    if (!tipo || !referenciaId) {
      return res.status(400).json({ error: 'Se requieren los campos tipo y referenciaId' })
    }

    const tiposValidos = ['encuesta', 'proyecto', 'propuesta']
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}` })
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const url = `${baseUrl}/qr/${tipo}/${referenciaId}`

    // Generar imagen QR en base64
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1b5e20',   // Verde oscuro Arauca
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })

    // Guardar en base de datos
    const { data, error } = await supabaseAdmin
      .from('codigos_qr')
      .upsert(
        { tipo, referencia_id: referenciaId, url },
        { onConflict: 'tipo,referencia_id' }
      )
      .select()
      .single()

    if (error) throw error

    res.json({ qr: qrDataUrl, url, id: data.id })
  } catch (error) {
    console.error('Error generando QR:', error)
    res.status(500).json({ error: 'No se pudo generar el código QR' })
  }
})

/**
 * GET /api/qr/listar
 * Lista todos los códigos QR generados
 */
router.get('/listar', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('codigos_qr')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los códigos QR' })
  }
})

export default router
