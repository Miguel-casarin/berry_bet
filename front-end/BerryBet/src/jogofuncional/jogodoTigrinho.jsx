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
  const [valorAposta, setValorAposta] = useState("");
  const [resultadoAposta, setResultadoAposta] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [showCarameloError, setShowCarameloError] = useState(false);
  const [showNoMoneyPopup, setShowNoMoneyPopup] = useState(false);
  const [showWinCard, setShowWinCard] = useState(false);
  const navigate = useNavigate();

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
    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Permite apenas um ponto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    // Limita a 2 casas decimais
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }
    const formattedValue = parts.join('.');
    setValorAposta(formattedValue);
  };

  const handleApostar = async () => {
    // Limpa mensagens de erro anteriores
    setShowCarameloError(false);
    setShowWinCard(false);
    
    if (!valorAposta || valorAposta === '' || Number(valorAposta) <= 0) {
      setResult('Digite um valor válido para apostar!');
      return;
    }

    const valorApostaNum = Number(valorAposta);
    
    // Validação adicional para valores muito baixos
    if (valorApostaNum < 0.01) {
      setResult('Valor mínimo de aposta é R$ 0,01');
      return;
    }
    
    // Verifica se tem saldo suficiente
    if (userBalance < valorApostaNum) {
      setResult('Saldo insuficiente!');
      // Mostra popup sempre, exceto quando for All Win com saldo < 1 real (que já é tratado no botão)
      setShowNoMoneyPopup(true);
      return;
    }

    // Decrementa o saldo imediatamente
    setUserBalance(prev => prev - valorApostaNum);
    
    setResultadoAposta(null);
    setShowCarameloError(false); // Reset do caramelo error
    setShowWinCard(false); // Reset da carta de vitória
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
      // Atualiza o saldo baseado na resposta do servidor
      if (data.current_balance !== undefined) {
        setUserBalance(data.current_balance);
      } else {
        // Fallback: se não há current_balance, calcula manualmente
        // O saldo já foi decrementado no início, então só adiciona se ganhou
        if (data.result === 'win' && data.win_amount > 0) {
          setUserBalance(prev => prev + data.win_amount);
        }
      }

      // Mapeia a carta retornada para uma visualização no grid
      const gridResult = mapCardToGrid(data.card);
      await animateSpin(1200, gridResult); // Passe o grid final aqui

      setResult(data.message || (data.result === 'win' ? '🎉 Vitória!' : '😢 Derrota!'));

      // Mostra o caramelo error se for derrota (após o grid final ser mostrado)
      if (data.result === 'loss' || data.card === 'perca') {
        setTimeout(() => {
          setShowCarameloError(true);
        }, 500); // Delay para mostrar o caramelo error
      } else if (data.result === 'win' && data.win_amount > 0) {
        // Para vitória, mostra a carta após um delay
        setTimeout(() => {
          setShowWinCard(true);
        }, 500); // Delay para mostrar a carta vencedora
      }

      // NÃO limpe o campo de aposta aqui!
      // setValorAposta("");  <-- Remova ou comente esta linha

    } catch (err) {
      // Se deu erro, restaura o saldo
      setUserBalance(prev => prev + valorApostaNum);
      setResult('Erro ao apostar.');
    }
    
    // Sempre garante que o botão play volta ao normal após o jogo
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

  // Adicionado para debug
  useEffect(() => {
    if (resultadoAposta) {
      console.log('DEBUG resultadoAposta:', resultadoAposta);
    }
  }, [resultadoAposta]);

  return (
    <>
      {/* Popup de sem dinheiro */}
      {showNoMoneyPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#1a1a1a',
            padding: '2rem',
            borderRadius: '16px',
            border: '2px solid #FF4444',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              😢
            </div>
            <h2 style={{
              color: '#FF4444',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              Saldo Insuficiente!
            </h2>
            <p style={{
              color: '#ccc',
              marginBottom: '1.5rem',
              fontSize: '1rem'
            }}>
              Você não tem saldo suficiente para fazer esta aposta.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowNoMoneyPopup(false)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#51F893',
                  color: '#000',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  outline: 'none'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Layout - Figma Style */}
      <div className="jogo-tigrinho" style={{
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
              style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51F893', cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              Berry.Bet
            </div>
            <div 
              style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => navigate('/dashboard')}
              onMouseEnter={(e) => e.target.style.color = '#51F893'}
              onMouseLeave={(e) => e.target.style.color = '#ccc'}
            >
              Menu
            </div>
            <div 
              style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => navigate('/ranking')}
              onMouseEnter={(e) => e.target.style.color = '#51F893'}
              onMouseLeave={(e) => e.target.style.color = '#ccc'}
            >
              Ranking
            </div>
            <div 
              style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => navigate('/saque')}
              onMouseEnter={(e) => e.target.style.color = '#51F893'}
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
        <div className="jogo-tigrinho" style={{
          display: 'flex',
          height: 'calc(100vh - 280px)', // header + footer maior (120px)
          position: 'relative',
          gap: '1rem',
          padding: '1rem',
          alignItems: 'stretch'
        }}>
          
          {/* Left Sidebar - Your Card */}
          <div style={{
            flex: '0 0 280px', // largura fixa mas responsiva
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="lightbar-card" style={{
              background: '#1a1a1a',
              height: '100%', // altura responsiva
              maxHeight: '450px', // altura máxima reduzida
              minHeight: '300px', // altura mínima
              borderRadius: '16px',
              border: '2px solid #51F893',
              boxShadow: '0 0 15px rgba(81, 248, 147, 0.5)',
              padding: '1.5rem',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#51F893', fontWeight: 'bold', textShadow: '0 0 10px rgba(81, 248, 147, 0.7)' }}>Your Card:</div>
              
              {/* Exibição da carta baseada no resultado */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showCarameloError ? (
                  // Mostra o caramelo error girando quando há derrota
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src="/src/assets/caramelo_error 1.png"
                      alt="Caramelo Error"
                      className="spinning-caramelo"
                      style={{
                        width: 120,
                        height: 120,
                        filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))'
                      }}
                    />
                    <div style={{ fontSize: '14px', color: '#FF4444', fontWeight: 'bold', marginTop: '10px' }}>
                      VOCÊ PERDEU!
                    </div>
                  </div>
                ) : showWinCard && resultadoAposta && ['win', 'vitoria'].includes(resultadoAposta.result) &&
                 resultadoAposta.card &&
                 ['master', 'vinte', 'dez', 'cinco', 'miseria'].includes(resultadoAposta.card) ? (
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
                                border: '2px solid #51F893',
                                boxShadow: '0 0 10px rgba(81, 248, 147, 0.6)',
                                background: '#fff'
                              }}
                            />
                            <div style={{ fontSize: '14px', color: '#51F893', fontWeight: 'bold', textShadow: '0 0 8px rgba(81, 248, 147, 0.8)' }}>
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
                                border: '2px solid #51F893', 
                                boxShadow: '0 0 10px rgba(81, 248, 147, 0.6)',
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#51F893', fontWeight: 'bold', textShadow: '0 0 8px rgba(81, 248, 147, 0.8)' }}>
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
                                border: '2px solid #51F893', 
                                boxShadow: '0 0 10px rgba(81, 248, 147, 0.6)',
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#51F893', fontWeight: 'bold', textShadow: '0 0 8px rgba(81, 248, 147, 0.8)' }}>
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
                                border: '2px solid #51F893', 
                                boxShadow: '0 0 10px rgba(81, 248, 147, 0.6)',
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#51F893', fontWeight: 'bold', textShadow: '0 0 8px rgba(81, 248, 147, 0.8)' }}>
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
                                border: '2px solid #51F893', 
                                boxShadow: '0 0 10px rgba(81, 248, 147, 0.6)',
                                background: '#fff' 
                              }} 
                            />
                            <div style={{ fontSize: '14px', color: '#51F893', fontWeight: 'bold', textShadow: '0 0 8px rgba(81, 248, 147, 0.8)' }}>
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
            position: 'relative',
            minHeight: '100%'
          }}>
            {/* Grid do jogo */}
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
                    // Célula transparente quando não há dogId
                    <div style={{ 
                      width: '100%',
                      height: '100%',
                      background: 'transparent'
                    }}>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Ranking Preview */}
          <div style={{
            flex: '0 0 350px', // largura fixa mas responsiva
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <RankingPreview />
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
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderTop: '1px solid #444',
          height: '120px', // altura maior para o footer
          justifyContent: 'space-between'
        }}>
          {/* Left side - Aporte and Lance (com flex para ocupar espaço) */}
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            color: '#fff',
            flex: '1' // Ocupa espaço disponível
          }}>
            <div>Aporte: {valorAposta ? `${Number(valorAposta).toFixed(2)}` : '0.00'} R$</div>
            <div>Lance: {resultadoAposta?.win_amount ? `${Number(resultadoAposta.win_amount).toFixed(2)}` : '0.00'} R$</div>
          </div>

          {/* Center - Botão de Play (centralizado horizontalmente) */}
          <div style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center' 
          }}>
            <button
              onClick={girar}
              disabled={isSpinning || !valorAposta || Number(valorAposta) <= 0}
              className={isSpinning ? "" : "lightbar-play-button"}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isSpinning ? '#666' : '#51F893',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 28,
                cursor: 'pointer',
                color: '#000',
                boxShadow: '0 4px 20px rgba(81, 248, 147, 0.4)',
                filter: 'drop-shadow(0 0 10px rgba(81, 248, 147, 0.6))',
                outline: 'none'
              }}
            >
              ▶
            </button>
          </div>

          {/* Right side - Bet amount controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            flex: '1', // Ocupa espaço disponível
            justifyContent: 'flex-end' // Alinha à direita
          }}>
            {/* Botões com imagens das notas de dinheiro e All Win/Clear */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              height: '100%'
            }}>
              {/* Botões das notas de dinheiro */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Primeira linha de botões das notas */}
                <div style={{
                  display: 'flex',
                  gap: '0.3rem'
                }}>
                  <button style={{
                    width: 64,
                    height: 36,
                    border: 'none',
                    borderRadius: '4px',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#000',
                    backgroundImage: 'url("/src/assets/5 Reais.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none'
                  }}
                  onClick={() => {
                    const newValue = (Number(valorAposta || 0) + 5).toFixed(2);
                    setValorAposta(newValue);
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '8px'
                    }}>
                      +5
                    </div>
                  </button>
                  <button style={{
                    width: 64,
                    height: 36,
                    border: 'none',
                    borderRadius: '4px',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#000',
                    backgroundImage: 'url("/src/assets/20 Reais.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none'
                  }}
                  onClick={() => {
                    const newValue = (Number(valorAposta || 0) + 20).toFixed(2);
                    setValorAposta(newValue);
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '8px'
                    }}>
                      +20
                    </div>
                  </button>
                  <button style={{
                    width: 64,
                    height: 36,
                    border: 'none',
                    borderRadius: '4px',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#000',
                    backgroundImage: 'url("/src/assets/50 Reais.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none'
                  }}
                  onClick={() => {
                    const newValue = (Number(valorAposta || 0) + 50).toFixed(2);
                    setValorAposta(newValue);
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '8px'
                    }}>
                      +50
                    </div>
                  </button>
                </div>
                
                {/* Segunda linha de botões das notas */}
                <div style={{
                  display: 'flex',
                  gap: '0.3rem'
                }}>
                  <button style={{
                    width: 64,
                    height: 36,
                    border: 'none',
                    borderRadius: '4px',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: '#000',
                    backgroundImage: 'url("/src/assets/100 Reais.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none'
                  }}
                  onClick={() => {
                    const newValue = (Number(valorAposta || 0) + 100).toFixed(2);
                    setValorAposta(newValue);
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '7px'
                    }}>
                      +100
                    </div>
                  </button>
                  <button style={{
                    width: 64,
                    height: 36,
                    border: 'none',
                    borderRadius: '4px',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: '#000',
                    backgroundImage: 'url("/src/assets/200 Reais.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none'
                  }}
                  onClick={() => {
                    const newValue = (Number(valorAposta || 0) + 200).toFixed(2);
                    setValorAposta(newValue);
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '7px'
                    }}>
                      +200
                    </div>
                  </button>
                  {/* Botão Clear (vermelho) */}
                  <button
                    onClick={() => setValorAposta('0.00')}
                    style={{
                      width: 64,
                      height: 36,
                      border: 'none',
                      borderRadius: '4px',
                      background: '#FF4444',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Botão All Win ao lado (maior) */}
              <button
                onClick={() => {
                  if (userBalance !== null) {
                    // Se saldo for menor que 1 real, mostra popup
                    if (userBalance < 1) {
                      setResult('Saldo insuficiente!');
                      setShowNoMoneyPopup(true);
                      return;
                    }
                    
                    // Para All Win, apenas define o valor da aposta com o saldo total
                    const allWinValue = Math.floor(userBalance);
                    setValorAposta(allWinValue.toString());
                    setResult('Valor All Win definido! Clique no botão Play para apostar.');
                  }
                }}
                style={{
                  width: 80,
                  height: 76, // Altura total das duas linhas (36 + 36 + 4 de gap)
                  border: 'none',
                  borderRadius: '6px',
                  background: '#FFD700',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  outline: 'none'
                }}
              >
                ALL WIN
              </button>
            </div>

            {/* Campo de input para valor da aposta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              justifyContent: 'center',
              height: '100%'
            }}>
              <span style={{ color: '#fff', fontSize: '14px' }}>Apostar:</span>
              
              {/* Botão de diminuir (-) */}
              <button
                onClick={() => {
                  const currentValue = Number(valorAposta || 0);
                  const newValue = Math.max(0, currentValue - 1).toFixed(2);
                  setValorAposta(newValue);
                }}
                style={{
                  width: '30px',
                  height: '35px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#FF4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none'
                }}
              >
                ◀
              </button>

              <input
                type="text"
                value={valorAposta ? 
                  (Number(valorAposta) % 1 === 0 ? 
                    Number(valorAposta).toString() : 
                    Number(valorAposta).toFixed(2)
                  ) : '0.00'}
                readOnly
                style={{
                  width: '80px',
                  height: '35px',
                  padding: '0 8px',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '14px',
                  textAlign: 'center',
                  cursor: 'default'
                }}
              />

              {/* Botão de aumentar (+) */}
              <button
                onClick={() => {
                  const currentValue = Number(valorAposta || 0);
                  const newValue = (currentValue + 1).toFixed(2);
                  setValorAposta(newValue);
                }}
                style={{
                  width: '30px',
                  height: '35px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#51F893',
                  color: '#000',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none'
                }}
              >
                ▶
              </button>

              <span style={{ color: '#fff', fontSize: '14px' }}>R$</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default jogodoTigrinho;