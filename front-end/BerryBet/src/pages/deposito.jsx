function Deposito() {
  return (
    <div className="deposito-container">
      <h1>Depósito</h1>
      <p>Faça seu depósito aqui!</p>
      <form>
        <label htmlFor="amount">Valor do depósito:</label>
        <input type="number" id="amount" name="amount" required />
        <button type="submit">Depositar</button>
      </form>
    </div>
)
}

export default Deposito;
