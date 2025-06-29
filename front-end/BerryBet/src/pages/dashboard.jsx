import apostaTigrinho from '../assets/bolsafeliz.png';
import apostaEsport from '../assets/apostasEsportivas.png';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const cardData = [
  { id: 'element-1', img: apostaTigrinho },
  { id: 'element-2', img: apostaEsport },
];

function Dashboard() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('token'));
  }, []);

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

  // Mantém o tamanho do card fixo
  const cardWidth = '2800px'; // aumente aqui
  const cardHeight = '618.5px'; // novo

  return (
    <div>
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          background: '#fff',
          height: 56,
          marginBottom: 20,
          zIndex: 200,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <header
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            flex: 1,
            letterSpacing: 1,
            color: '#222',
            userSelect: 'none',
            lineHeight: '44px',
          }}
        >
          Berry.Bet
        </header>
        {isLogged && (
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 32,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              height: 44,
            }}
          >
            <div
              onClick={() => setShowProfileMenu((v) => !v)}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                fontSize: 24,
                color: '#555',
                border: '2px solid #ccc',
                userSelect: 'none',
              }}
              title="Perfil"
            >
              <span role="img" aria-label="perfil">👤</span>
            </div>
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: 56,
                right: 32,
                background: '#fff',
                color: '#222',
                border: '1px solid #ddd',
                borderRadius: 8,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                minWidth: 140,
                padding: 0,
                zIndex: 1000,
              }}>
                <button style={{ width: '100%', padding: '12px 18px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 16, color: '#222' }} onClick={() => { setShowProfileMenu(false); navigate('/perfil'); }}>Perfil</button>
                <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #eee' }} />
                <button style={{ width: '100%', padding: '12px 18px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 16, color: '#222' }} onClick={() => { setShowProfileMenu(false); navigate('/conta'); }}>Conta</button>
                <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #eee' }} />
                <button
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 16,
                    color: '#d32f2f',
                    fontWeight: 'bold',
                  }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Conteúdo principal */}
      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={handlePrev}
            style={{
              fontSize: 24,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
            }}
            aria-label="Anterior"
          >
            ◀
          </button>
          <div
            onClick={handleCardClick}
            style={{
              width: cardWidth,
              height: cardHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              background: 'transparent', // fundo transparente
              padding: 0,
              textAlign: 'center',
              transition: 'box-shadow 0.2s',
              overflow: 'hidden',
            }}
          >
            <img
              src={cardData[currentIdx].img}
              alt={cardData[currentIdx].id}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                margin: 'auto',
                display: 'block',
                background: 'transparent',
              }}
            />
          </div>
          <button
            onClick={handleNext}
            style={{
              fontSize: 24,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
            }}
            aria-label="Próximo"
          >
            ▶
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
