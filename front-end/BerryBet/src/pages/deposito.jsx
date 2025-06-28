function Deposito() {
  return (
    <body>
      <header>
          <ul>
            <p>Berry.Bet</p>
          <li><a href="/dashboard">Inicial</a></li>
          <li><a href="/jogodoTigrinho">JOGUE AQUI!</a></li>
          <li><a href="/saque">Saque</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/'); }}>Sair</a></li>
        </ul>
      </header>



    <div className="deposito-container">
      <h1>Depósito</h1>
      <p>Faça seu depósito aqui!</p>
      <form>
        <label htmlFor="amount">Valor do depósito:</label>
        <input type="number" id="amount" name="amount" required />
        <button type="submit">Depositar</button>
      </form>
    </div>


    </body>
)
}

export default Deposito;
