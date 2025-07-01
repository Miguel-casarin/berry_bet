import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../jogofuncional/style.css';
import "./popup.css";

function ApostaEsportiva() {
  const navigate = useNavigate();
  const [popupOpen, setPopupOpen] = useState(false);
  const [selecionado, setSelecionado] = useState("");
  const [valorDeposito, setValorDeposito] = useState("");

  const valoresRapidos = [100, 500, 1000];

  const handleValorRapido = (valor) => {
    setValorDeposito(prev => String(Number(prev || 0) + valor));
  };

  const handleInputChange = (e) => {
    setValorDeposito(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleConfirmar = async () => {
    if (!valorDeposito || !selecionado) return;
    // Exemplo de envio para backend
    try {
      await fetch('/api/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo: selecionado,
          valor: Number(valorDeposito)
        })
      });
      alert('Depósito enviado!');
      setPopupOpen(false);
      setValorDeposito("");
      setSelecionado("");
    } catch (err) {
      alert('Erro ao enviar depósito.');
    }
  };

  const textos = {
    pix: (
      <>
        <h3>PIX</h3>
        <p>Transferência instantânea e gratuita. Use nossa chave PIX: <strong>perca@seudinheiro.com</strong></p>
      </>
    ),
    cred: (
      <>
        <h3>Cartão de Crédito</h3>
        <p>Compre agora e se preocupe depois! <em>Juros de apenas 15% ao mês</em></p>
      </>
    ),
    deb: (
      <>
        <h3>Cartão de Débito</h3>
        <p>Dinheiro saindo direto da sua conta! Rápido e prático.</p>
      </>
    ),
    bole: (
      <>
        <h3>Boleto Bancário</h3>
        <p>Pague em qualquer agência ou internet banking. Vence em 3 dias!</p>
      </>
    ),
    bols: (
      <>
        <h3>Bolsa Família</h3>
        <p>Seu dinheiro voltando para você! (ou não)</p>
      </>
    ),
    carn: (
      <>
        <h3>Carnê</h3>
        <p>Parcelamos sua dívida em até 12x com juros que você nem vai perceber!</p>
      </>
    ),
  };

  return (
    <>
      <header>
        <nav>
          <a className="logo" href="/dashboard">Berry.Bet</a>
          <div className="mobile-menu">
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
          </div>
          <ul className="nav-list">
            <li><a href="#" onClick={e => { e.preventDefault(); setPopupOpen(true); }}>Depósito</a></li>
            <li><a href="/saque">Saque</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>Voltar</a></li>
          </ul>
        </nav>
      </header>
      <main>
        {popupOpen && (
          <div className={popupOpen ? "popup-overlay active" : "popup-overlay"} onClick={e => { e.target.className.includes('popup-overlay') && setPopupOpen(false); }}>
            <div className="popup-container" onClick={e => e.stopPropagation()}>
              <div className="popup-header">
                <div className="popup-close-canto">
                  <button className="popup-close" onClick={() => setPopupOpen(false)}>&times;</button>
                </div>
              </div>
              <div className="popup-content">
                <p>Escolha aqui seu método de pagamento:</p>
                <div className="popup-content-flex">
                  <div className="botoes-pagamento-coluna">
                    <button className={`botao-pagamento${selecionado === "pix" ? " selecionado" : ""}`} value="pix" onClick={() => setSelecionado("pix")}>Pix</button>
                    <button className={`botao-pagamento${selecionado === "cred" ? " selecionado" : ""}`} value="cred" onClick={() => setSelecionado("cred")}>Crédito</button>
                    <button className={`botao-pagamento${selecionado === "deb" ? " selecionado" : ""}`} value="deb" onClick={() => setSelecionado("deb")}>Débito</button>
                    <button className={`botao-pagamento${selecionado === "bole" ? " selecionado" : ""}`} value="bole" onClick={() => setSelecionado("bole")}>Boleto</button>
                    <button className={`botao-pagamento${selecionado === "bols" ? " selecionado" : ""}`} value="bols" onClick={() => setSelecionado("bols")}>Bolsa Família</button>
                    <button className={`botao-pagamento${selecionado === "carn" ? " selecionado" : ""}`} value="carn" onClick={() => setSelecionado("carn")}>Carnê</button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{marginLeft: 16}}>
                      {selecionado ? (
                        <>
                          {textos[selecionado]}
                          <div style={{margin: '16px 0'}}>
                            <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
                              {valoresRapidos.map(v => (
                                <button key={v} className="popup-btn popup-btn-secondary" type="button" onClick={() => handleValorRapido(v)}>
                                  +{v}
                                </button>
                              ))}
                            </div>
                            <input
                              type="number"
                              placeholder="Valor do depósito"
                              value={valorDeposito}
                              onChange={handleInputChange}
                              style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc'}}
                            />
                          </div>
                        </>
                      ) : <p>Selecione uma forma de pagamento para ver as informações</p>}
                    </div>
                  </div>
                </div>
                <div className="popup-actions">
                  <button className="popup-btn popup-btn-secondary" onClick={() => setPopupOpen(false)}>Fechar</button>
                  <button className="popup-btn popup-btn-primary" onClick={handleConfirmar} disabled={!valorDeposito || !selecionado}>Confirmar</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          <h1>Ainda indisponível!</h1>
          <p>Aposta Esportiva!</p>
          <p>Aqui você pode encontrar informações sobre apostas em eventos esportivos.</p>
        </div>
      </main>
    </>
  );
}

export default ApostaEsportiva;