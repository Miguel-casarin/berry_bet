import minhaImagem from '../../assets/imagemBackground.png'
import './style.css'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    // Aqui você pode validar o login futuramente
    navigate('/dashboard')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${minhaImagem})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: 1,
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className='container'>
          <form onSubmit={handleSubmit}>
            <h1>Bem-vindo ao BerryBet!</h1>
            <h2>Faça seu login</h2>
            <div className='input-container'>
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" placeholder="Digite seu email" required />
            </div>
            <div className='input-container'>
              <label htmlFor="password">Senha:</label>
              <input type="password" id="password" name="password" placeholder="Digite sua senha" required />
            </div>
            <button type="submit">Entrar</button>
            <p>Não tem uma conta? <a href="/register">Cadastre-se</a></p>
            <p><a href="/forgot-password">Esqueci minha senha</a></p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home
