import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rutasQR from './rutas/qr.js'
import rutasReportes from './rutas/reportes.js'
import rutasEncuestas from './rutas/encuestas.js'

const app = express()
const PUERTO = process.env.PORT || 3001

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Rutas
app.use('/api/qr', rutasQR)
app.use('/api/reportes', rutasReportes)
app.use('/api/encuestas', rutasEncuestas)

// Ruta de salud
app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'API de Arauca Opina funcionando correctamente' })
})

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error en servidor:', err)
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Por favor intenta más tarde',
  })
})

app.listen(PUERTO, () => {
  console.log(`✅ Servidor Arauca Opina corriendo en http://localhost:${PUERTO}`)
})
