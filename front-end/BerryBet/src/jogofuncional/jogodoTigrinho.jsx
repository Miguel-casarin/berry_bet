import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import "../pages/popup.css";
import RankingPreview from '../components/RankingPreview';

const NUM_DOGS = 8;
const getDogImage = (id) => `/src/assets/melo${id}.png`;

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
    
    // Executa o animação
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
      await animateSpin(1200, gridResult); // Passe o grid final aqui

      setResult(data.message || (data.result === 'win' ? '🎉 Vitória!' : '😢 Derrota!'));

      // NÃO limpe o campo de aposta aqui!
      // setValorAposta("");  <-- Remova ou comente esta linha

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
    const cardId = cardMap[card] || 7;

    if (card === 'perca') {
      // Para derrota, embaralhe os cachorros para evitar repetições em linha/coluna
      let dogs = [];
      for (let i = 0; i < 9; i++) {
        dogs.push((i % NUM_DOGS) + 1);
      }
      // Embaralha o array
      for (let i = dogs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dogs[i], dogs[j]] = [dogs[j], dogs[i]];
      }
      // Monta o grid 3x3
      return [
        [dogs[0], dogs[1], dogs[2]],
        [dogs[3], dogs[4], dogs[5]],
        [dogs[6], dogs[7], dogs[8]],
      ];
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

  // Adicione ou ajuste esta função no seu componente
const getCardImage = (card) => {
  const cardMap = {
    'miseria': 'Card1.png',
    'cinco': 'Card2.png',
    'dez': 'Card3.png',
    'vinte': 'Card4.png',
    'master': 'Card5.png'
  };
  return `/src/assets/${cardMap[card] || 'Card1.png'}`;
};

  // Animação fake só para efeito visual
  const animateSpin = async (duration = 1200, gridFinal = null) => {
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
    // Suaviza a transição para o grid final
    if (gridFinal) {
      for (let i = 0; i < 3; i++) {
        setGrid(prev => {
          const novo = prev.map(row => [...row]);
          for (let j = 0; j <= i; j++) {
            novo[i][j] = gridFinal[i][j];
          }
          return novo;
        });
        await new Promise(res => setTimeout(res, 120));
      }
      setGrid(gridFinal);
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

  // Adicionado para debug
  useEffect(() => {
    if (resultadoAposta) {
      console.log('DEBUG resultadoAposta:', resultadoAposta);
    }
  }, [resultadoAposta]);

  return (
    <>
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
      {/* Game Layout - Figma Style */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          background: '#111',
          borderBottom: '1px solid #333'
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div 
              style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#39FF14', cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              Berry.Bet
            </div>
            <div 
              style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => navigate('/dashboard')}
              onMouseEnter={(e) => e.target.style.color = '#39FF14'}
              onMouseLeave={(e) => e.target.style.color = '#ccc'}
            >
              Menu
            </div>
            <div 
              style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => navigate('/ranking')}
              onMouseEnter={(e) => e.target.style.color = '#39FF14'}
              onMouseLeave={(e) => e.target.style.color = '#ccc'}
            >
              Ranking
            </div>
            <div 
              style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => navigate('/saque')}
              onMouseEnter={(e) => e.target.style.color = '#39FF14'}
              onMouseLeave={(e) => e.target.style.color = '#ccc'}
            >
              Saque
            </div>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            R$ {userBalance !== null ? userBalance.toFixed(2) : '0.00'}
          </div>
        </header>

        {/* Main Game Area */}
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 140px)', // header + footer
          position: 'relative'
        }}>
          
          {/* Left Sidebar - Your Card */}
          <div style={{
            width: '300px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#1a1a1a',
              height: '900px', 
              borderRadius: '16px',
              border: '2px solid #39FF14',
              padding: '2rem',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#39FF14', fontWeight: 'bold' }}>Your Card:</div>
              
              {/* Exibição da carta baseada no resultado */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {resultadoAposta && ['win', 'vitoria'].includes(resultadoAposta.result) &&
                 resultadoAposta.card &&
                 ['master', 'vinte', 'dez', 'cinco', 'miseria'].includes(resultadoAposta.card) &&
                 resultadoAposta.win_amount > Number(valorAposta) ? (
                  (() => {
                    switch (resultadoAposta.card) {
                      case 'master':
                        return (
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <img
                              src={getCardImage('master')}
                              alt="Master"
                              style={{
                                width: 150,
                                height: 200,
                                marginBottom: 16,
                                borderRadius: 8,
                                border: '2px solid #39FF14',
                                background: '#fff'
                              }}
                            />
                            <div style={{ fontSize: '14px', color: '#39FF14', fontWeight: 'bold' }}>
                              MASTER - {getMultiplierDisplay('master')}
                            </div>
                          </div>
                        );
                      case 'vinte':
                        return (
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={getCardImage('vinte')} 
                              alt="Vinte" 
                              style={{ 
                                width: 150, 
                                height: 200, 
                                marginBottom: 16, 
                                borderRadius: 8, 
                                border: '2px solid #39FF14', 
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#39FF14', fontWeight: 'bold' }}>
                              VINTE - {getMultiplierDisplay('vinte')}
                            </div>
                          </div>
                        );
                      case 'dez':
                        return (
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={getCardImage('dez')} 
                              alt="Dez" 
                              style={{ 
                                width: 150, 
                                height: 200, 
                                marginBottom: 16, 
                                borderRadius: 8, 
                                border: '2px solid #39FF14', 
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#39FF14', fontWeight: 'bold' }}>
                              DEZ - {getMultiplierDisplay('dez')}
                            </div>
                          </div>
                        );
                      case 'cinco':
                        return (
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={getCardImage('cinco')} 
                              alt="Cinco" 
                              style={{ 
                                width: 150, 
                                height: 200, 
                                marginBottom: 16, 
                                borderRadius: 8, 
                                border: '2px solid #39FF14', 
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#39FF14', fontWeight: 'bold' }}>
                              CINCO - {getMultiplierDisplay('cinco')}
                            </div>
                          </div>
                        );
                      case 'miseria':
                        return (
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            <img 
                              src={getCardImage('miseria')} 
                              alt="Miséria" 
                              style={{ 
                                width: 150, 
                                height: 200, 
                                marginBottom: 16, 
                                borderRadius: 8, 
                                border: '2px solid #39FF14', 
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#39FF14', fontWeight: 'bold' }}>
                              MISÉRIA - {getMultiplierDisplay('miseria')}
                            </div>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()
                ) : (
                  /* Estado padrão - Vazio */
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    Aguardando resultado...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Game Grid */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            minHeight: '100%'
          }}>
            <div className="slot" style={{
              backgroundImage: 'url("/src/assets/Frame 2.png")',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}>
              {grid.flat().map((dogId, index) => (
                <div 
                  key={index}
                  className="cell"
                >
                  {dogId ? (
                    <img
                      src={getDogImage(dogId)}
                      alt={`dog-${dogId}`}
                      className="dog-img"
                    />
                  ) : (
                    <div style={{ 
                      fontSize: '4rem', 
                      color: 'rgba(255, 255, 255, 0.3)',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                    }}>
                      ❔
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Ranking Preview */}
          <div style={{
            width: '510px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#1a1a1a',
              height: '900px', 
              borderRadius: '16px',
              border: '2px solid #39FF14',
              padding: '2rem',
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Título do Ranking */}
              <div style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1.5rem', 
                color: '#39FF14', 
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Top 5 Jogadores
              </div>
              
              {/* Componente RankingPreview sem scroll */}
              <div style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '100%',
                  maxHeight: '100%',
                  transform: 'scale(1)',
                  transformOrigin: 'center'
                }}>
                  <RankingPreview />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <footer style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#2D2D2D',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderTop: '1px solid #444'
        }}>
          {/* Left side - Aporte and Lance */}
          <div style={{ display: 'flex', gap: '2rem', color: '#fff' }}>
            <div>Aporte: {valorAposta ? `${Number(valorAposta).toFixed(2)}` : '0.00'} R$</div>
            <div>Lance: {resultadoAposta?.win_amount ? `${Number(resultadoAposta.win_amount).toFixed(2)}` : '0.00'} R$</div>
          </div>

          {/* Center - Play button */}
          <button
            onClick={girar}
            disabled={isSpinning || !valorAposta || Number(valorAposta) <= 0}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isSpinning ? '#666' : '#39FF14',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 24,
              cursor: 'pointer',
              color: '#000'
            }}
          >
            ▶
          </button>

          {/* Right side - Bet amount controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Apostas rápidas */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.3rem'
              }}>
                <button style={{
                  width: 35,
                  height: 25,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#39FF14',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#000'
                }}
                onClick={() => {
                  const newValue = Number(valorAposta || 0) + 2;
                  setValorAposta(newValue.toString());
                }}
                >
                  +2
                </button>
                <button style={{
                  width: 35,
                  height: 25,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#39FF14',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#000'
                }}
                onClick={() => {
                  const newValue = Number(valorAposta || 0) + 20;
                  setValorAposta(newValue.toString());
                }}
                >
                  +20
                </button>
                <button style={{
                  width: 35,
                  height: 25,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#39FF14',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#000'
                }}
                onClick={() => {
                  const newValue = Number(valorAposta || 0) + 50;
                  setValorAposta(newValue.toString());
                }}
                >
                  +50
                </button>
              </div>
              <div style={{
                display: 'flex',
                gap: '0.3rem'
              }}>
                <button style={{
                  width: 35,
                  height: 25,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#39FF14',
                  cursor: 'pointer',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#000'
                }}
                onClick={() => {
                  const newValue = Number(valorAposta || 0) + 100;
                  setValorAposta(newValue.toString());
                }}
                >
                  +100
                </button>
                <button style={{
                  width: 35,
                  height: 25,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#39FF14',
                  cursor: 'pointer',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#000'
                }}
                onClick={() => {
                  const newValue = Number(valorAposta || 0) + 200;
                  setValorAposta(newValue.toString());
                }}
                >
                  +200
                </button>
                <button style={{
                  width: 35,
                  height: 25,
                  border: 'none',
                  borderRadius: '4px',
                  background: '#FF4444',
                  cursor: 'pointer',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
                onClick={() => {
                  setValorAposta('0');
                }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Botão All Win */}
            <button style={{
              width: 80,
              height: 55,
              border: 'none',
              borderRadius: '8px',
              background: '#FFD700',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#000',
              marginRight: '1rem'
            }}
            onClick={() => {
              if (userBalance && userBalance > 0) {
                setValorAposta(userBalance.toFixed(2));
              }
            }}
            disabled={!userBalance || userBalance <= 0}
            >
              ALL WIN
            </button>

            {/* Controles principais de aposta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <button style={{
                width: 40,
                height: 40,
                border: 'none',
                borderRadius: '50%',
                background: '#39FF14',
                cursor: 'pointer',
                fontSize: '18px'
              }}
              onClick={() => {
                const newValue = Math.max(0, Number(valorAposta) - 5);
                setValorAposta(newValue.toString());
              }}
              >
                ◀
              </button>
              
              <div style={{
                background: '#39FF14',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: 'bold',
                minWidth: '80px',
                textAlign: 'center'
              }}>
                R$ {valorAposta ? Number(valorAposta).toFixed(2) : '0.00'}
              </div>
              
              <button style={{
                width: 40,
                height: 40,
                border: 'none',
                borderRadius: '50%',
                background: '#39FF14',
                cursor: 'pointer',
                fontSize: '18px'
              }}
              onClick={() => {
                const newValue = Number(valorAposta || 0) + 5;
                setValorAposta(newValue.toString());
              }}
              >
                ▶
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default jogodoTigrinho;