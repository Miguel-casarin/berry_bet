import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./saque.css";
import bolsaFelizImg from "../assets/bolsafeliz.png";

function Deposito() {
  const [selecionado, setSelecionado] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const navigate = useNavigate();

  const textos = {
    pix: (
      <>
        <h3>PIX</h3>
        <p>
          Transferência instantânea e gratuita. Use nossa chave PIX: <strong>perca@seudinheiro.com</strong>
        </p>
      </>
    ),
    cred: (
      <>
        <h3>Cartão de Crédito</h3>
        <p>
          Compre agora e se preocupe depois! <em>Juros de apenas 15% ao mês</em>
        </p>
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

  const handleClick = (valor) => {
    setSelecionado(valor);
    if (valor === "bols") {
      setModalAberto(true);
    }
  };

  const fecharModal = () => setModalAberto(false);

  return (
    <>
      <header>
        <ul>
          <p>Berry.Bet</p>
          <li><a href="/dashboard">Inicial</a></li>
          <li><a href="/jogodoTigrinho">JOGUE AQUI!</a></li>
          <li><a href="/saque">Saque</a></li>
          <li>
            <a href="#" onClick={e => { e.preventDefault(); navigate("/"); }}>Sair</a>
          </li>
        </ul>
      </header>

      <h1>PERCA SEU DINHEIRO AQUI!!</h1>
      <p>Escolha a forma de pagamento:</p>

      <div id="containerBotoes">
        <button
          className={`botao-pagamento${selecionado === "pix" ? " selecionado" : ""}`}
          value="pix"
          onClick={() => handleClick("pix")}
        >
          Pix
        </button>
        <button
          className={`botao-pagamento${selecionado === "cred" ? " selecionado" : ""}`}
          value="cred"
          onClick={() => handleClick("cred")}
        >
          Crédito
        </button>
        <button
          className={`botao-pagamento${selecionado === "deb" ? " selecionado" : ""}`}
          value="deb"
          onClick={() => handleClick("deb")}
        >
          Débito
        </button>
        <button
          className={`botao-pagamento${selecionado === "bole" ? " selecionado" : ""}`}
          value="bole"
          onClick={() => handleClick("bole")}
        >
          Boleto
        </button>
        <button
          className={`botao-pagamento${selecionado === "bols" ? " selecionado" : ""}`}
          value="bols"
          onClick={() => handleClick("bols")}
        >
          Bolsa Família
        </button>
        <button
          className={`botao-pagamento${selecionado === "carn" ? " selecionado" : ""}`}
          value="carn"
          onClick={() => handleClick("carn")}
        >
          Carnê
        </button>
      </div>
      <div id="areaTexto">
        {selecionado ? textos[selecionado] : <p>Selecione uma forma de pagamento para ver as informações</p>}
      </div>

      {/* Modal para Bolsa Família */}
      {modalAberto && (
        <div className="modal" style={{ display: "block" }} onClick={e => { if (e.target.className === "modal") fecharModal(); }}>
          <div className="modal-content">
            <span className="close" onClick={fecharModal}>&times;</span>
            <h2>FAÇA O L</h2>
            <img id="imagemBolsa" src={bolsaFelizImg} alt="Bolsa Feliz" />
          </div>
        </div>
      )}

      <footer>Copyright 2025. Todos os direitors reservados pela gurizada. ÉOSGURI</footer>
    </>
  );
}

export default Deposito;
