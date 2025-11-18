import { useState } from 'react'
import Login from './Login'
import Register from './Register'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login') // 'login' or 'register'

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
  }

  return mode === 'login' ? (
    <Login onToggleMode={toggleMode} onClose={onClose} />
  ) : (
    <Register onToggleMode={toggleMode} onClose={onClose} />
  )
}
