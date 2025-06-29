import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

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
          <a class="logo" href="/dashboard">Berry.Bet</a>
          <div class="mobile-menu">
            <div class="line1"></div>
            <div class="line2"></div>
            <div class="line3"></div>
          </div>
          <ul class="nav-list">
            <li><a href="/deposito">Depósito</a></li>
            <li><a href="/saque">Saque</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); navigate('/'); }}>Sair</a></li>
          </ul>
        </nav>
      </header>
      <main>

      </main>
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