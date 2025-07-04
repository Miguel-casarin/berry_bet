import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import "../pages/popup.css";

const NUM_DOGS = 8;
const getDogImage = id => `/src/assets/melo${id}.png`;

const createEmptyGrid = () =>
  Array(3)
    .fill(0)
    .map(() => Array(3).fill(null));

function jogodoTigrinho() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [result, setResult] = useState('Digite o valor e clique em Apostar');
  const [isSpinning, setIsSpinning] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selecionado, setSelecionado] = useState("");
  const [valorDeposito, setValorDeposito] = useState("");
  const [valorAposta, setValorAposta] = useState("");
  const [resultadoAposta, setResultadoAposta] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const navigate = useNavigate();

  // Variáveis para o popup de depósito
  const valoresRapidos = [100, 500, 1000];

  // Busca saldo do usuário ao carregar
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setUserBalance(data.data.balance);
          }
        });
    }
  }, []);

  const handleValorApostaChange = (e) => {
    setValorAposta(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleApostar = async () => {
    if (!valorAposta || Number(valorAposta) <= 0) {
      setResult('Digite um valor válido para apostar!');
      return;
    }

    const valorApostaNum = Number(valorAposta);
    
    // Verifica se tem saldo suficiente
    if (userBalance < valorApostaNum) {
      setResult('Saldo insuficiente!');
      return;
    }

    // Decrementa o saldo imediatamente
    setUserBalance(prev => prev - valorApostaNum);
    
    setResultadoAposta(null);
    setResult('Apostando...');
    setIsSpinning(true);
    
    // Executa a animação
    await animateSpin();
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/v1/roleta/apostar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ valor_aposta: valorApostaNum })
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Se deu erro, restaura o saldo
        setUserBalance(prev => prev + valorApostaNum);
        setResult(data.message || data.mensagem || 'Erro na aposta');
        setIsSpinning(false);
        return;
      }
      
      setResultadoAposta(data);
      setUserBalance(data.current_balance);
      
      // Mapeia a carta retornada para uma visualização no grid
      const gridResult = mapCardToGrid(data.card);
      setGrid(gridResult);
      
      setResult(data.message || (data.result === 'win' ? '🎉 Vitória!' : '😢 Derrota!'));
      
      // Limpa o campo de aposta para próxima rodada
      setValorAposta("");
      
    } catch (err) {
      // Se deu erro, restaura o saldo
      setUserBalance(prev => prev + valorApostaNum);
      setResult('Erro ao apostar.');
    }
    setIsSpinning(false);
  };

  // Função para mapear a carta retornada para uma visualização no grid
  const mapCardToGrid = (card) => {
    const cardMap = {
      'cinco': 5,
      'dez': 2,
      'vinte': 3,
      'master': 1,
      'miseria': 8,
      'perca': 7
    };
    
    const cardId = cardMap[card] || 7; // default para perca
    
    if (card === 'perca') {
      // Para perda, mostra imagens aleatórias sem padrão
      return Array(3).fill(0).map(() => 
        Array(3).fill(0).map(() => Math.floor(Math.random() * NUM_DOGS) + 1)
      );
    } else {
      // Para vitória, mostra um padrão com a carta vencedora
      const grid = Array(3).fill(0).map(() => Array(3).fill(0));
      
      // Escolhe aleatoriamente um tipo de padrão vencedor
      const patterns = [
        'horizontal-top',    // linha superior
        'horizontal-middle', // linha do meio
        'horizontal-bottom', // linha inferior
        'vertical-left',     // coluna esquerda
        'vertical-middle',   // coluna do meio
        'vertical-right'     // coluna direita
      ];
      
      const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
      
      // Aplica o padrão selecionado
      switch (selectedPattern) {
        case 'horizontal-top':
          grid[0][0] = cardId;
          grid[0][1] = cardId;
          grid[0][2] = cardId;
          break;
        case 'horizontal-middle':
          grid[1][0] = cardId;
          grid[1][1] = cardId;
          grid[1][2] = cardId;
          break;
        case 'horizontal-bottom':
          grid[2][0] = cardId;
          grid[2][1] = cardId;
          grid[2][2] = cardId;
          break;
        case 'vertical-left':
          grid[0][0] = cardId;
          grid[1][0] = cardId;
          grid[2][0] = cardId;
          break;
        case 'vertical-middle':
          grid[0][1] = cardId;
          grid[1][1] = cardId;
          grid[2][1] = cardId;
          break;
        case 'vertical-right':
          grid[0][2] = cardId;
          grid[1][2] = cardId;
          grid[2][2] = cardId;
          break;
      }
      
      // Preenche o resto com imagens aleatórias
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[i][j] === 0) {
            grid[i][j] = Math.floor(Math.random() * NUM_DOGS) + 1;
          }
        }
      }
      
      return grid;
    }
  };

  // Função para exibir o nome da carta de forma amigável
  const getCardDisplayName = (card) => {
    const cardNames = {
      'cinco': 'Cinco (5%)',
      'dez': 'Dez (10%)',
      'vinte': 'Vinte (20%)',
      'master': 'Master (70%)',
      'miseria': 'Miséria (0.5%)',
      'perca': 'Perda'
    };
    return cardNames[card] || card;
  };

  // Função para exibir o multiplicador
  const getMultiplierDisplay = (card) => {
    const multipliers = {
      'cinco': '5%',
      'dez': '10%',
      'vinte': '20%',
      'master': '70%',
      'miseria': '0.5%',
      'perca': '0%'
    };
    return multipliers[card] || '0%';
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

  // Animação fake só para efeito visual
  const animateSpin = async (duration = 1200) => {
    const interval = 100;
    const iterations = duration / interval;
    for (let i = 0; i < iterations; i++) {
      const tempGrid = Array(3)
        .fill(0)
        .map(() =>
          Array(3)
            .fill(0)
            .map(() => Math.floor(Math.random() * NUM_DOGS) + 1)
        );
      setGrid(tempGrid);
      await new Promise(res => setTimeout(res, interval));
    }
  };

  const girar = async () => {
    // Esta função agora só chama handleApostar
    await handleApostar();
  };

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
            <li>
              <a href="#" onClick={e => { e.preventDefault(); setPopupOpen(true); }}>Depósito</a>
            </li>
            <li><a href="/saque">Saque</a></li>
            <li>
              <a href="#" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>Voltar</a>
            </li>
          </ul>
        </nav>
      </header>
      <main></main>
      {popupOpen && (
        <div className={popupOpen ? "popup-overlay active" : "popup-overlay"} onClick={e => { if (e.target.className.includes('popup-overlay')) setPopupOpen(false); }}>
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
                  <div style={{ marginLeft: 16 }}>
                    {selecionado ? (
                      <>
                        {textos[selecionado]}
                        <div style={{ margin: '16px 0' }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
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
                            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
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
      <div className='jogodoTigrinho'>
        <h1>🐶 Roleta dos Cachorrinhos</h1>
        <div style={{ marginBottom: 16 }}>
          <strong>Saldo: </strong> R$ {userBalance !== null ? userBalance.toFixed(2) : '...'}
        </div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Valor da aposta"
            value={valorAposta}
            onChange={handleValorApostaChange}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 160 }}
            disabled={isSpinning}
          />
        </div>
        <div className='slot'>
          {grid.flat().map((dogId, index) => (
            <div className='cell' key={index}>
              {dogId ? (
                <img
                  src={getDogImage(dogId)}
                  alt={`dog-${dogId}`}
                  className='dog-img'
                />
              ) : (
                <span>❔</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={girar} disabled={isSpinning || !valorAposta || Number(valorAposta) <= 0}>
          {isSpinning ? 'Apostando...' : 'Apostar'}
        </button>
        <div className='result'>{result}</div>
        {resultadoAposta && (
          <div style={{ marginTop: 16, fontWeight: 'bold' }}>
            Resultado: {resultadoAposta.result === 'win' ? 'Vitória' : 'Derrota'}<br />
            {resultadoAposta.result === 'win' && (
              <>
                Carta: {getCardDisplayName(resultadoAposta.card)}<br />
                Valor ganho: R$ {resultadoAposta.win_amount.toFixed(2)}<br />
                Multiplicador: {getMultiplierDisplay(resultadoAposta.card)}<br />
              </>
            )}
            {resultadoAposta.result === 'lose' && (
              <>
                Carta: {getCardDisplayName(resultadoAposta.card)}<br />
                Valor perdido: R$ {Number(valorAposta) || 0}<br />
              </>
            )}
            Saldo atual: R$ {resultadoAposta.current_balance.toFixed(2)}
          </div>
        )}
      </div>
    </>
  );
}

export default jogodoTigrinho;