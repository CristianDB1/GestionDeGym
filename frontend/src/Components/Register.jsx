import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { crearUsuario } from '../services/api.js'
import '../styles/Login.css' // Reutilizamos los estilos del login

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'CLIENTE' // Por defecto
  })
  
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    try {
      // Eliminamos confirmPassword ya que no es parte del modelo
      const { confirmPassword, ...userData } = formData
      
      // Enviamos el registro
      await crearUsuario(userData)
      
      // Redirigimos al login
      alert('Usuario registrado correctamente. Por favor, inicia sesión.')
      navigate('/login')
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data)
      } else {
        setError('Error al registrar usuario. Por favor, intente de nuevo.')
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Registro de Usuario</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apellido">Apellido:</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">Registrarse</button>
          
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register