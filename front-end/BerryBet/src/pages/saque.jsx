function Saque() {
  return (
    <body>
        <header>
        <ul>
            <p>Berry.Bet</p>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/deposito">Depósito</a></li>
          <li><a href="/jogoTigrinho">JOGUE AQUI!!</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/'); }}>Sair</a></li>
        </ul>
        </header>
    <div>
      <h1>Saque</h1>
      <p>Esta é a página de saque. MAS VOCÊ NÃO PODE SACAR, VAI FICAR POBRE</p>
      {/* Aqui você pode adicionar mais conteúdo ou componentes relacionados ao saque */}
    </div>
    </body>
  );
}   


export default Saque;