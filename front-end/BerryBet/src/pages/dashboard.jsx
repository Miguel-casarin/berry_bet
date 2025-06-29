import apostaTigrinho from '../assets/bolsafeliz.png';
import apostaEsport from '../assets/apostasEsportivas.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { useState, useEffect } from 'react';

const cardData = [
  { id: 'element-1', img: apostaTigrinho },
  { id: 'element-2', img: apostaEsport },
];

function Dashboard() {
  const [items, setItems] = React.useState(cardData);
  const [selected, setSelected] = React.useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('token'));
  }, []);

  const isItemSelected = (id) => !!selected.find((el) => el === id);

  const handleClick = (id, idx) => (visibility) => {
    if (idx === 0) {
      navigate('/jogodoTigrinho');
      return;
    }
    if (idx === 1) {
      navigate('/apostaEsportiva');
      return;
    }
    const itemSelected = isItemSelected(id);
    setSelected((currentSelected) =>
      itemSelected
        ? currentSelected.filter((el) => el !== id)
        : currentSelected.concat(id),
    );
  };

  return (
    <div>
      {/* Ícone de perfil no canto superior direito */}
      {isLogged && (
        <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 20 }}>
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
              position: 'fixed',
              top: 68,
              right: 32,
              background: '#fff', // solid background
              color: '#222', // readable text color
              border: '1px solid #ddd', // subtle border
              borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)', // stronger shadow for contrast
              minWidth: 140,
              padding: 0,
              zIndex: 1000,
            }}>
              <button style={{ width: '100%', padding: '12px 18px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 16, color: '#222' }} onClick={() => { setShowProfileMenu(false); navigate('/perfil'); }}>Perfil</button>
              <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #eee' }} />
              <button style={{ width: '100%', padding: '12px 18px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 16, color: '#222' }} onClick={() => alert('Conta')}>Conta</button>
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
                  window.location.href = '/'; // Redirect to login page
                }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      )}
      <header style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
        Berry.Bet
      </header>

      <main style={{ padding: '20px' }}>
        <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
          {items.map(({ id, img }, idx) => (
            <Card
              itemId={id}
              title={id}
              key={id}
              img={img}
              idx={idx}
              onClick={handleClick(id, idx)}
              selected={isItemSelected(id)}
            />
          ))}
        </ScrollMenu>
      </main>
    </div>
  );
}

const LeftArrow = () => {
  const visibility = React.useContext(VisibilityContext);
  const isFirstItemVisible = visibility.useIsVisible('first', true);
  return (
    <button
      disabled={isFirstItemVisible}
      onClick={() => visibility.scrollPrev()}
      style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}
    >
      ◀
    </button>
  );
};

const RightArrow = () => {
  const visibility = React.useContext(VisibilityContext);
  const isLastItemVisible = visibility.useIsVisible('last', false);
  return (
    <button
      disabled={isLastItemVisible}
      onClick={() => visibility.scrollNext()}
      style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}
    >
      ▶
    </button>
  );
};

function Card({ onClick, selected, title, itemId, img, idx }) {
  const visibility = React.useContext(VisibilityContext);
  const visible = visibility.useIsVisible(itemId, true);

  const cardWidth = idx === 1 ? '1100px' : '900px';

  return (
    <div
      onClick={() => onClick(visibility)}
      style={{
        width: cardWidth,
        margin: '0 8px',
        cursor: 'pointer',
      }}
      tabIndex={0}
    >
      <div className="card">
        <img src={img} alt={title} style={{ width: '100%', borderRadius: '12px', marginBottom: 8 }} />
        <div>{title}</div>
        <div>visible: {JSON.stringify(visible)}</div>
        <div>selected: {JSON.stringify(!!selected)}</div>
      </div>
      <div style={{ height: '200px' }} />
    </div>
  );
}

export default Dashboard;
