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
  const [result, setResult] = useState('Clique em Girar');
  const [isSpinning, setIsSpinning] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const navigate = useNavigate();

  const animateSpin = async (duration = 1500) => {
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
    setIsSpinning(true);
    setResult('Girando...');

    await animateSpin();

    // Simula resultado final
    const fakeGrid = [
      [6, 4, 8],
      [7, 5, 8],
      [4, 7, 8],
    ];
    const fakeWin = true;

    setGrid(fakeGrid);
    setResult(fakeWin ? '🎉 Vitória (simulada)!' : '😢 Derrota (simulada)!');
    setIsSpinning(false);
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
          <div className="popup-container">
            <div className="popup-header">
              <span className="popup-title">Depósito</span>
              <button className="popup-close" onClick={() => setPopupOpen(false)}>&times;</button>
            </div>
            <div className="popup-content">
              <p>Insira aqui o conteúdo do seu popup de depósito.</p>
            </div>
            <div className="popup-actions">
              <button className="popup-btn popup-btn-secondary" onClick={() => setPopupOpen(false)}>Fechar</button>
              <button className="popup-btn popup-btn-primary">Confirmar</button>
            </div>
          </div>
        </div>
      )}
      <div className='jogodoTigrinho'>
        <h1>🐶 Roleta dos Cachorrinhos</h1>
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
        <button onClick={girar} disabled={isSpinning}>
          {isSpinning ? 'Girando...' : 'Girar'}
        </button>
        <div className='result'>{result}</div>
      </div>
    </>
  );
}

export default jogodoTigrinho;