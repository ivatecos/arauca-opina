import { useState, useEffect, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '@/lib/supabase'
import Tarjeta from '@/componentes/comunes/Tarjeta'
import Boton from '@/componentes/comunes/Boton'
import Alerta from '@/componentes/comunes/Alerta'
import {
  QrCode, Download, ClipboardList, FolderKanban,
  Scan, RefreshCw, CheckCircle2, ExternalLink,
} from 'lucide-react'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

const TABS = [
  { id: 'encuesta', label: 'Encuestas',  Icono: ClipboardList, color: 'text-blue-600',   bg: 'bg-blue-50',   ring: 'ring-blue-500'   },
  { id: 'proyecto', label: 'Proyectos',  Icono: FolderKanban,  color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-500' },
]

export default function AdminQR() {
  const [tab,          setTab]          = useState('encuesta')
  const [items,        setItems]        = useState([])
  const [codigos,      setCodigos]      = useState({})   // { [referencia_id]: { escaneos, url } }
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando,     setCargando]     = useState(true)
  const [guardando,    setGuardando]    = useState(false)
  const [error,        setError]        = useState('')
  const [exito,        setExito]        = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    const tabla = tab === 'encuesta' ? 'encuestas' : 'proyectos'
    const { data: filas } = await supabase
      .from(tabla)
      .select('id, titulo')
      .order('id', { ascending: false })
    setItems(filas || [])

    const { data: qrs } = await supabase
      .from('codigos_qr')
      .select('referencia_id, escaneos, url')
      .eq('tipo', tab)
    const map = {}
    qrs?.forEach((q) => { map[q.referencia_id] = q })
    setCodigos(map)
    setCargando(false)
  }, [tab])

  useEffect(() => {
    setSeleccionado(null)
    cargar()
  }, [cargar])

  async function generarQR(item) {
    setSeleccionado(item)
    setGuardando(true)
    setError('')
    setExito('')

    const url = `${APP_URL}/qr/${tab}/${item.id}`
    const { error: err } = await supabase
      .from('codigos_qr')
      .upsert(
        { tipo: tab, referencia_id: item.id, url },
        { onConflict: 'tipo,referencia_id' },
      )
    if (err) { setError(err.message); setGuardando(false); return }
    setExito(`QR generado para "${item.titulo}"`)
    await cargar()
    setGuardando(false)
  }

  function descargarPNG() {
    const canvas = document.getElementById('qr-preview-canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${tab}-${seleccionado.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const tabInfo  = TABS.find((t) => t.id === tab)
  const urlQR    = seleccionado ? `${APP_URL}/qr/${tab}/${seleccionado.id}` : ''
  const codigoSel = seleccionado ? codigos[seleccionado.id] : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Códigos QR</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Genera y descarga códigos QR institucionales para compartir encuestas y proyectos
        </p>
      </div>

      {error  && <Alerta tipo="error" mensaje={error}  onCerrar={() => setError('')}  className="mb-4" />}
      {exito  && <Alerta tipo="exito" mensaje={exito}  onCerrar={() => setExito('')}  className="mb-4" />}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label, Icono }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === id
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            <Icono size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* Lista */}
        <div className="lg:col-span-3">
          <Tarjeta className="overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">
                Selecciona un elemento para generar su QR
              </p>
            </div>

            {cargando ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <tabInfo.Icono size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay {tabInfo.label.toLowerCase()} disponibles.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((item) => {
                  const qr       = codigos[item.id]
                  const activo   = seleccionado?.id === item.id
                  return (
                    <li key={item.id}
                      onClick={() => setSeleccionado(item)}
                      className={`flex items-center justify-between px-5 py-3.5 cursor-pointer
                                  transition-colors ${activo ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tabInfo.bg}`}>
                          <tabInfo.Icono size={14} className={tabInfo.color} />
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate">{item.titulo}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        {qr ? (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Scan size={12} /> {qr.escaneos} escaneos
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">Sin QR</span>
                        )}
                        {activo && <CheckCircle2 size={16} className="text-green-600" />}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Tarjeta>
        </div>

        {/* Panel QR */}
        <div className="lg:col-span-2 space-y-4">
          {!seleccionado ? (
            <Tarjeta className="text-center py-16">
              <QrCode size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-sm text-gray-400">
                Selecciona un elemento de la lista para ver o generar su código QR.
              </p>
            </Tarjeta>
          ) : (
            <>
              <Tarjeta className="text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Vista previa del QR
                </p>

                <div className="flex justify-center mb-4">
                  {codigoSel ? (
                    <div className="p-3 bg-white rounded-2xl border-2 border-green-200 shadow-md inline-block">
                      <QRCodeCanvas
                        id="qr-preview-canvas"
                        value={urlQR}
                        size={180}
                        marginSize={2}
                        level="H"
                        imageSettings={{
                          src: '',
                          excavate: false,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-[206px] h-[206px] border-2 border-dashed border-gray-200
                                    rounded-2xl flex items-center justify-center">
                      <QrCode size={48} className="text-gray-200" />
                    </div>
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-800 mb-1 truncate px-2">
                  {seleccionado.titulo}
                </p>

                {codigoSel && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-4">
                    <Scan size={12} />
                    <span>{codigoSel.escaneos} escaneos registrados</span>
                  </div>
                )}

                {!codigoSel && (
                  <p className="text-xs text-gray-400 mb-4">
                    Este elemento aún no tiene un código QR generado.
                  </p>
                )}

                <div className="space-y-2">
                  <Boton
                    variante="primario"
                    tamanio="sm"
                    cargando={guardando}
                    onClick={() => generarQR(seleccionado)}
                    className="w-full gap-2">
                    <RefreshCw size={14} />
                    {codigoSel ? 'Regenerar QR' : 'Generar QR'}
                  </Boton>

                  {codigoSel && (
                    <Boton
                      variante="secundario"
                      tamanio="sm"
                      onClick={descargarPNG}
                      className="w-full gap-2">
                      <Download size={14} />
                      Descargar PNG
                    </Boton>
                  )}
                </div>
              </Tarjeta>

              {codigoSel && (
                <Tarjeta className="text-xs text-gray-500 break-all">
                  <p className="font-semibold text-gray-600 mb-1 text-xs">URL del QR</p>
                  <a href={urlQR} target="_blank" rel="noreferrer"
                    className="text-green-700 hover:underline flex items-start gap-1">
                    <ExternalLink size={11} className="shrink-0 mt-0.5" />
                    {urlQR}
                  </a>
                </Tarjeta>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
