import apostaTigrinho from '../assets/bolsafeliz.png';
import apostaEsport from '../assets/apostasEsportivas.png';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingPreview from '../components/RankingPreview'; // Importe o componente RankingPreview
import './dashboard.css'; // Importa o CSS específico do dashboard

const cardData = [
  { id: 'element-1', img: apostaTigrinho },
  { id: 'element-2', img: apostaEsport },
];


function Dashboard() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  // Mantém o tamanho do card responsivo ao tamanho da imagem
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [popupOpen, setPopupOpen] = useState(false);
  const [selecionado, setSelecionado] = useState("");
  const [valorDeposito, setValorDeposito] = useState("");
  const navigate = useNavigate();

  const valoresRapidos = [100, 500, 1000];

  const handleValorRapido = (valor) => {
    setValorDeposito(prev => String(Number(prev || 0) + valor));
  };

  const handleInputChange = (e) => {
    setValorDeposito(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleConfirmar = async () => {
    if (!valorDeposito || !selecionado || !user) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/v1/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          type: 'deposit',
          amount: Number(valorDeposito),
          description: `Depósito via ${nomesPagamento[selecionado] || selecionado}`
        })
      });
      if (!res.ok) throw new Error('Erro ao depositar');
      alert('Depósito enviado!');
      // Atualiza o saldo do usuário após depósito
      const userRes = await fetch('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.data);
      }
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

  // Mapeamento para nomes completos dos métodos de pagamento
  const nomesPagamento = {
    pix: "PIX",
    cred: "Cartão de Crédito",
    deb: "Cartão de Débito",
    bole: "Boleto Bancário",
    bols: "Bolsa Família",
    carn: "Carnê"
  };

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('token'));
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (res.status === 401) {
            localStorage.removeItem('token');
            setIsLogged(false);
            setUser(null);
            navigate('/');
            return;
          }
          if (res.ok) {
            const data = await res.json();
            setUser(data.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsLogged(false);
          setUser(null);
          navigate('/');
        });
    }

    // Listener para atualizar avatar em tempo real
    const handleAvatarUpdate = (event) => {
      const { avatarUrl } = event.detail;
      console.log('Dashboard: Avatar atualizado via evento:', avatarUrl); // Debug
      setUser(prevUser => ({
        ...prevUser,
        avatar_url: avatarUrl
      }));
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, [navigate]);

  const handleCardClick = () => {
    if (currentIdx === 0) {
      navigate('/jogodoTigrinho');
    } else if (currentIdx === 1) {
      navigate('/apostaEsportiva');
    }
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? cardData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === cardData.length - 1 ? 0 : prev + 1));
  };

  // Função para atualizar dimensões ao carregar imagem
  const handleImgLoad = (e) => {
    setImgDimensions({ width: e.target.naturalWidth, height: e.target.naturalHeight });
  };

  // Calcula proporção para manter responsividade
  const aspectRatio = imgDimensions.width && imgDimensions.height ? (imgDimensions.width / imgDimensions.height) : (16 / 9);
  const cardDynamicHeight = imgDimensions.width && imgDimensions.height
    ? `calc(90vw / ${aspectRatio})`
    : 'auto';

  // Remove altura fixa do card, ajusta dinamicamente
  const cardWidth = '90vw';
  const cardMaxWidth = 1200;

  return (
    <div
      className="dashboard-container"
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        paddingBottom: 40,
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          background: '#111',
          height: 64,
          marginBottom: 20,
          zIndex: 200,
          borderBottom: '1px solid #333',
        }}
      >
        {/* Espaço à esquerda com botão de avisos */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginLeft: 24, marginBottom: 20, }}>
          <button
            onClick={() => navigate('/aviso')}
            style={{
              background: '#FF6B35',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 0 10px rgba(255, 107, 53, 0.3)',
              transition: 'all 0.3s ease',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: '42px',
              width: 'auto',
              textAlign: 'center',
              letterSpacing: '0.5px',
              fontFamily: 'Arial, sans-serif',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#FF5722';
              e.target.style.boxShadow = '0 0 15px rgba(255, 107, 53, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FF6B35';
              e.target.style.boxShadow = '0 0 10px rgba(255, 107, 53, 0.3)';
            }}
            title="Ver avisos importantes"
          >
            AVISOS
          </button>
        </div>
        
        <header
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: 2,
            color: '#fff',
            userSelect: 'none',
            lineHeight: '56px',
            fontFamily: 'Montserrat, Arial, sans-serif',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: 32,
              color: '#51F893',
              letterSpacing: 1,
              textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
              userSelect: 'none',
              transition: 'all 0.3s ease'
            }}
            onClick={() => { navigate('/dashboard'); window.location.reload(); }}
            onMouseEnter={(e) => {
              e.target.style.textShadow = '0 0 15px rgba(81, 248, 147, 0.9)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.textShadow = '0 0 10px rgba(81, 248, 147, 0.7)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Berry.Bet
          </span>
        </header>
        
        {/* Saldo e Perfil à direita */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginRight: 24 }}>
          {/* Saldo à esquerda do bloco do perfil */}
          {isLogged && (
            user ? (
              <span
                style={{
                  fontWeight: 900,
                  color: '#000',
                  fontSize: 20,
                  background: '#51F893',
                  borderRadius: 14,
                  padding: '6px 22px',
                  boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
                  minWidth: 100,
                  textAlign: 'center',
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: 16,
                  letterSpacing: 1,
                  fontFamily: 'Arial, sans-serif',
                  border: 'none',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                title={`R$ ${user.balance?.toFixed(2) ?? '0,00'}`}
                onClick={() => setPopupOpen(true)}
                onMouseEnter={(e) => {
                  e.target.style.background = '#45E080';
                  e.target.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#51F893';
                  e.target.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 20 }}>
                  R$ {user.balance?.toFixed(2) ?? '0,00'}
                </span>
              </span>
            ) : (
              <span style={{
                width: 100,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#51F893',
                borderRadius: 14,
                marginRight: 16,
                fontWeight: 900,
                color: '#000',
                fontSize: 20,
                opacity: 0.7
              }}>
                ...
              </span>
            )
          )}
          {isLogged && (
            user ? (
              <div
                onClick={() => setShowProfileMenu((v) => !v)}
                style={{
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  height: 48,
                  cursor: 'pointer',
                  borderRadius: 24,
                  background: showProfileMenu ? '#333' : '#1a1a1a',
                  boxShadow: showProfileMenu ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
                  border: showProfileMenu ? '2px solid #51F893' : '2px solid #333',
                  padding: '2px 18px 2px 12px',
                  transition: 'all 0.3s ease',
                  gap: 10,
                  minWidth: 0,
                  position: 'relative',
                  marginRight: 0,
                  marginLeft: 0,
                }}
                title="Abrir menu do perfil"
              >
                {(() => {
                  const avatarSrc = user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`;
                  console.log('Avatar src no dashboard:', avatarSrc, 'user.avatar_url:', user.avatar_url); // Debug
                  
                  return (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#51F893', boxShadow: '0 0 8px rgba(81, 248, 147, 0.5)', border: 'none' }}
                    />
                  );
                })()}
                <span
                  style={{ fontWeight: 700, color: '#fff', fontSize: 18, maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={user.username}
                >
                  {user.username}
                </span>
                <span style={{ fontSize: 20, color: '#51F893', marginLeft: 2, display: 'flex', alignItems: 'center' }}>
                  {showProfileMenu ? '▲' : '▼'}
                </span>
                {showProfileMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 48,
                    right: 0,
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '2px solid #51F893',
                    borderRadius: 18,
                    boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)',
                    minWidth: 180,
                    padding: 0,
                    zIndex: 1000,
                    marginTop: 10,
                    opacity: showProfileMenu ? 1 : 0,
                    transform: showProfileMenu ? 'translateY(0)' : 'translateY(-10px)',
                    transition: 'opacity 0.25s, transform 0.25s',
                    pointerEvents: showProfileMenu ? 'auto' : 'none',
                  }}>
                    <button
                      className="profile-menu-button"
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 17,
                        color: '#fff',
                        transition: 'background 0.18s, color 0.18s, transform 0.18s',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                      title="Ver seu perfil"
                      onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#51F893'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                      onClick={e => { e.stopPropagation(); setShowProfileMenu(false); navigate('/perfil'); }}
                    >Perfil</button>
                    <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #333' }} />
                    <button
                      className="profile-menu-button"
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 17,
                        color: '#fff',
                        transition: 'background 0.18s, color 0.18s, transform 0.18s',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                      title="Gerenciar sua conta"
                      onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#51F893'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                      onClick={e => { e.stopPropagation(); setShowProfileMenu(false); navigate('/conta'); }}
                    >Conta</button>
                    <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #333' }} />
                    <button
                      className="profile-menu-button"
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 17,
                        color: '#fff',
                        transition: 'background 0.18s, color 0.18s, transform 0.18s',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                      title="Ver ranking dos jogadores"
                      onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#51F893'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                      onClick={e => { e.stopPropagation(); setShowProfileMenu(false); navigate('/ranking'); }}
                    >Ranking</button>
                    <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #333' }} />
                    <button
                      className="profile-menu-button"
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 17,
                        color: '#d32f2f',
                        fontWeight: 'bold',
                        transition: 'background 0.18s, color 0.18s, transform 0.18s',
                        outline: 'none'
                      }}
                      title="Sair da sua conta"
                      onMouseOver={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#ff4444'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#d32f2f'; }}
                      onClick={e => {
                        e.stopPropagation();
                        localStorage.removeItem('token');
                        navigate('/', { replace: true });
                        window.location.reload();
                      }}
                    >Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
                border: '2px solid #333',
                marginRight: 0,
                marginLeft: 0,
                opacity: 0.7
              }}>
                <span style={{ fontSize: 28, color: '#51F893' }}>...</span>
              </div>
            )
          )}
        </div>
      </div>
      {/* Conteúdo principal */}
      <main style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            className="nav-button"
            onClick={handlePrev}
            style={{
              fontSize: 36,
              background: '#51F893',
              border: 'none',
              cursor: 'pointer',
              padding: 18,
              borderRadius: 18,
              boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
              transition: 'all 0.3s ease',
              color: '#000',
              fontWeight: 900,
              outline: 'none'
            }}
            aria-label="Anterior"
            onMouseOver={e => {
              e.currentTarget.style.background = '#45E080';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#51F893';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
            }}
          >
            ◀
          </button>
          <div
            onClick={handleCardClick}
            style={{
              width: cardWidth,
              maxWidth: cardMaxWidth,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '22px',
              boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)',
              background: '#1a1a1a',
              padding: 0,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              margin: '0 10px',
              animation: 'fadein 0.5s',
              border: '2px solid #51F893',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 30px rgba(81, 248, 147, 0.6)';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 0 20px rgba(81, 248, 147, 0.3)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <img
              src={cardData[currentIdx].img}
              alt={cardData[currentIdx].id}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '22px',
                display: 'block',
                background: 'transparent',
                boxShadow: '0 0 15px rgba(81, 248, 147, 0.3)',
                transition: 'transform 0.3s',
              }}
            />
          </div>
          <button
            className="nav-button"
            onClick={handleNext}
            style={{
              fontSize: 36,
              background: '#51F893',
              border: 'none',
              cursor: 'pointer',
              padding: 18,
              borderRadius: 18,
              boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
              transition: 'all 0.3s ease',
              color: '#000',
              fontWeight: 900,
              outline: 'none'
            }}
            aria-label="Próximo"
            onMouseOver={e => {
              e.currentTarget.style.background = '#45E080';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#51F893';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
            }}
          >
            ▶
          </button>
        </div>
      </main>
      {/* Ranking dos Melhores Jogadores removido, só RankingPreview */}
      {currentIdx === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 48 }}>
          <RankingPreview />
        </div>
      )}

      {/* Popup de depósito igual ao Tigrinho */}
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
    </div>
  );
}

export default Dashboard;
