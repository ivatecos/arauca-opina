import { createContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        cargarPerfil(session.user.id)
      } else {
        setCargando(false)
      }
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (evento, session) => {
        if (evento === 'SIGNED_IN' && session?.user) {
          await cargarPerfil(session.user.id)
        } else if (evento === 'SIGNED_OUT') {
          setUsuario(null)
          setCargando(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function cargarPerfil(userId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUsuario(data)
    } catch (error) {
      console.error('Error cargando perfil:', error)
      setUsuario(null)
    } finally {
      setCargando(false)
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  const valor = {
    usuario,
    cargando,
    cerrarSesion,
    cargarPerfil,
  }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}
