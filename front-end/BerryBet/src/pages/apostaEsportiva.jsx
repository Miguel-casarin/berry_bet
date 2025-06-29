import '../jogofuncional/style.css';
import { useNavigate } from 'react-router-dom';

function ApostaEsportiva() {
  const navigate = useNavigate();

  return (
    <body>
        <header>
        <nav>
          <a class="logo" href="/dashboard">Berry.Bet</a>
          <div class="mobile-menu">
            <div class="line1"></div>
            <div class="line2"></div>
            <div class="line3"></div>
          </div>
          <ul class="nav-list">
            <li><a href="/deposito">Depósito</a></li>
            <li><a href="/saque">Saque</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); navigate('/'); }}>Sair</a></li>
          </ul>
        </nav>
      </header>
      <main></main>
    <div>
      <h1>Ainda indisponível!</h1>
      <p>Aposta Esportiva!</p>
      <p>Aqui você pode encontrar informações sobre apostas em eventos esportivos.</p>
    </div>
    </body>
  );
}   

export default ApostaEsportiva;