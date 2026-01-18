import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, REDIRECT_URL } from '../config/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Check if this is an OAuth callback (URL contains auth params)
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const queryParams = new URLSearchParams(window.location.search)

      // Check for error in callback
      const error = hashParams.get('error') || queryParams.get('error')
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')

      if (error) {
        console.error('OAuth error:', error, errorDescription)
        setAuthError(errorDescription || error)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        setLoading(false)
        return
      }

      // Check for access token in hash (implicit flow) or code in query (PKCE flow)
      const accessToken = hashParams.get('access_token')
      const code = queryParams.get('code')

      if (accessToken || code) {
        try {
          // Let Supabase handle the token exchange
          const { data, error: sessionError } = await supabase.auth.getSession()

          if (sessionError) {
            console.error('Session error:', sessionError)
            setAuthError(sessionError.message)
          } else if (data?.session) {
            setSession(data.session)
            setUser(data.session.user)
          }

          // Clean up URL after processing
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          console.error('OAuth callback error:', err)
          setAuthError(err.message)
        }
      }
    }

    // Get initial session
    const initAuth = async () => {
      try {
        // First check for OAuth callback
        await handleOAuthCallback()

        // Then get existing session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Get session error:', error)
          setAuthError(error.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        setAuthError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event)
      setSession(session)
      setUser(session?.user ?? null)
      setAuthError(null) // Clear any previous errors on successful auth
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    })
    return { data, error }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      setAuthError(null)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google sign-in error:', error)
        setAuthError(error.message)
      }

      return { data, error }
    } catch (err) {
      console.error('Google sign-in exception:', err)
      setAuthError(err.message)
      return { data: null, error: err }
    }
  }

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null)
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Reset password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    return { data, error }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    authError,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    clearAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
