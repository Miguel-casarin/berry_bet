import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./deposito.css"; // CSS específico para depósito
import "./dashboard.css"; // Importa CSS para remover contornos
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
    <div className="deposito-container" style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
    }}>
      <header style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#111',
        borderBottom: '1px solid #333'
      }}>
        {/* Espaço à esquerda (invisível) para balancear */}
        <div style={{ flex: 1 }}></div>
        
        {/* Berry.Bet centralizado */}
        <div 
          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51F893', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          Berry.Bet
        </div>
        
        {/* Menu de navegação e botão Sair à direita */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2rem' }}>
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
          <div 
            style={{ color: '#ccc', cursor: 'pointer', transition: 'color 0.3s' }}
            onClick={() => navigate('/jogodoTigrinho')}
            onMouseEnter={(e) => e.target.style.color = '#51F893'}
            onMouseLeave={(e) => e.target.style.color = '#ccc'}
          >
            JOGUE AQUI!
          </div>
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              localStorage.removeItem('token');
              navigate("/"); 
            }}
            style={{
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 20,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              boxShadow: '0 0 10px rgba(255, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'auto',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ff6666';
              e.target.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ff4444';
              e.target.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.3)';
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <div style={{
        width: '100%',
        maxWidth: 800,
        background: '#111',
        borderRadius: 20,
        boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)',
        padding: 40,
        border: '2px solid #51F893',
        margin: '40px 20px',
        position: 'relative',
      }}>
        {/* Botão X circular no canto superior direito */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            position: 'absolute',
            top: -40,
            right: -25,
            width: 10,
            height: 45,
            borderRadius: '50%',
            background: '#ff4444',
            border: 'none',
            color: '#fff',
            fontSize: 20,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(255, 68, 68, 0.5)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#ff6666';
            e.target.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.8)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#ff4444';
            e.target.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>

        <h1 style={{
          textAlign: 'center',
          color: '#51F893',
          fontWeight: 900,
          fontSize: 32,
          marginBottom: 20,
          textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
        }}>
          ADICIONE SEU DINHEIRO AQUI!
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#fff',
          fontSize: 18,
          marginBottom: 30,
        }}>
          Escolha a forma de pagamento:
        </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 15,
        marginBottom: 30,
      }}>
        <button
          className={`botao-pagamento ${selecionado === "pix" ? "selecionado" : ""}`}
          value="pix"
          onClick={() => handleClick("pix")}
          style={{
            background: '#51F893',
            backgroundColor: '#51F893',
            color: '#000',
            border: '2px solid #51F893',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: selecionado === "pix" ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
            transform: selecionado === "pix" ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          Pix
        </button>
        <button
          className={`botao-pagamento ${selecionado === "cred" ? "selecionado" : ""}`}
          value="cred"
          onClick={() => handleClick("cred")}
          style={{
            background: '#51F893',
            backgroundColor: '#51F893',
            color: '#000',
            border: '2px solid #51F893',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: selecionado === "cred" ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
            transform: selecionado === "cred" ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          Crédito
        </button>
        <button
          className={`botao-pagamento ${selecionado === "deb" ? "selecionado" : ""}`}
          value="deb"
          onClick={() => handleClick("deb")}
          style={{
            background: '#51F893',
            backgroundColor: '#51F893',
            color: '#000',
            border: '2px solid #51F893',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: selecionado === "deb" ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
            transform: selecionado === "deb" ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          Débito
        </button>
        <button
          className={`botao-pagamento ${selecionado === "bole" ? "selecionado" : ""}`}
          value="bole"
          onClick={() => handleClick("bole")}
          style={{
            background: '#51F893',
            backgroundColor: '#51F893',
            color: '#000',
            border: '2px solid #51F893',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: selecionado === "bole" ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
            transform: selecionado === "bole" ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          Boleto
        </button>
        <button
          className={`botao-pagamento ${selecionado === "bols" ? "selecionado" : ""}`}
          value="bols"
          onClick={() => handleClick("bols")}
          style={{
            background: '#51F893',
            backgroundColor: '#51F893',
            color: '#000',
            border: '2px solid #51F893',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: selecionado === "bols" ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
            transform: selecionado === "bols" ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          Bolsa Família
        </button>
        <button
          className={`botao-pagamento ${selecionado === "carn" ? "selecionado" : ""}`}
          value="carn"
          onClick={() => handleClick("carn")}
          style={{
            background: '#51F893',
            backgroundColor: '#51F893',
            color: '#000',
            border: '2px solid #51F893',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: selecionado === "carn" ? '0 0 15px rgba(81, 248, 147, 0.6)' : '0 0 10px rgba(81, 248, 147, 0.3)',
            transform: selecionado === "carn" ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          Carnê
        </button>
      </div>
      <div style={{
        background: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        border: '2px solid #333',
        marginBottom: 30,
        minHeight: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div style={{ color: '#fff', fontSize: 16, lineHeight: '1.6' }}>
          {selecionado ? textos[selecionado] : <p>Selecione uma forma de pagamento para ver as informações</p>}
        </div>
      </div>

      {/* Modal para Bolsa Família */}
      {modalAberto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) fecharModal(); }}
        >
          <div style={{
            background: '#111',
            borderRadius: 20,
            padding: 40,
            border: '2px solid #51F893',
            boxShadow: '0 0 30px rgba(81, 248, 147, 0.5)',
            maxWidth: 500,
            width: '90%',
            textAlign: 'center',
            position: 'relative',
          }}>
            <button
              onClick={fecharModal}
              style={{
                position: 'absolute',
                top: -40,
                right: -25,
                width: 10,
                height: 45,
                borderRadius: '70%',
                background: '#ff4444',
                border: 'none',
                color: '#fff',
                fontSize: 20,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(255, 68, 68, 0.5)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ff6666';
                e.target.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.8)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ff4444';
                e.target.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.5)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
            <h2 style={{
              color: '#51F893',
              fontWeight: 900,
              fontSize: 28,
              marginBottom: 20,
              textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
            }}>
              FAÇA O L
            </h2>
            <img 
              src={bolsaFelizImg} 
              alt="Bolsa Feliz" 
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 12,
                boxShadow: '0 0 15px rgba(81, 248, 147, 0.3)',
              }}
            />
          </div>
        </div>
      )}
      </div>

      <footer style={{
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        padding: '20px 0',
        borderTop: '1px solid #333',
        marginTop: 'auto',
      }}>
        Copyright 2025. Todos os direitos reservados pela gurizada. ÉOSGURI
      </footer>
    </div>
  );
}

export default Deposito;
