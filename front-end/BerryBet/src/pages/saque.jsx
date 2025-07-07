function Saque() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Número 404 */}
      <div style={{
        fontSize: '150px',
        fontWeight: 'bold',
        color: '#FF0000',
        marginBottom: '40px',
        letterSpacing: '10px',
        textShadow: '0 0 20px rgba(255, 0, 0, 0.5)'
      }}>
        404
      </div>
      
      {/* Ícone Pixelado */}
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: '#333',
        border: '4px solid #666',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '30px',
        position: 'relative',
        boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)'
      }}>
        {/* Símbolo de dinheiro pixelado */}
        <div style={{
          color: '#39FF14',
          fontSize: '60px',
          fontWeight: 'bold',
          fontFamily: 'monospace'
        }}>
          $
        </div>
      </div>
      
      {/* Mensagem */}
      <div style={{
        color: '#ffffff',
        fontSize: '24px',
        textAlign: 'center',
        maxWidth: '600px',
        lineHeight: '1.5',
        marginBottom: '40px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          Saque Não Disponível
        </div>
        <div style={{
          fontSize: '16px',
          color: '#888',
          fontStyle: 'italic'
        }}>
          Esta funcionalidade está temporariamente indisponível
        </div>
      </div>
      
      {/* Botão de Voltar */}
      <button
        onClick={() => window.history.back()}
        style={{
          backgroundColor: '#39FF14',
          color: '#000',
          border: 'none',
          padding: '15px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(57, 255, 20, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2dd910';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#39FF14';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Voltar ao Jogo
      </button>
    </div>
  );
}   


export default Saque;