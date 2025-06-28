import apostaTigrinho from '../assets/bolsafeliz.png';
import apostaEsport from '../assets/apostasEsportivas.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';

const cardData = [
  { id: 'element-1', img: apostaTigrinho },
  { id: 'element-2', img: apostaEsport },
];

function Dashboard() {
  const [items, setItems] = React.useState(cardData);
  const [selected, setSelected] = React.useState([]);
  const navigate = useNavigate();

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
