import React from 'react';
import { useNavigate } from 'react-router-dom';

function Aviso() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      paddingBottom: 40,
    }}>
      {/* Header com padrão do dashboard */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          background: '#111',
          height: 64,
          marginBottom: 30,
          zIndex: 200,
          borderBottom: '1px solid #333',
        }}
      >
        {/* Botão de volta à esquerda */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginLeft: 24,marginBottom: 20, }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#51F893',
              border: 'none',
              borderRadius: '14px',
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000',
              boxShadow: '0 0 10px rgba(81, 248, 147, 0.3)',
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
              e.target.style.background = '#45E080';
              e.target.style.boxShadow = '0 0 15px rgba(81, 248, 147, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#51F893';
              e.target.style.boxShadow = '0 0 10px rgba(81, 248, 147, 0.3)';
            }}
            title="Voltar ao dashboard"
          >
            ← Voltar
          </button>
        </div>
        
        {/* Título centralizado */}
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
              cursor: 'default',
              fontWeight: 900,
              fontSize: 32,
              color: '#51F893',
              letterSpacing: 1,
              textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
              userSelect: 'none',
            }}
          >
            Berry.Bet - Avisos
          </span>
        </header>
        
        {/* Espaço à direita (vazio para manter simetria) */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: 24 }}>
        </div>
      </div>

      {/* Container principal */}
      <div style={{
        maxWidth: '800px',
        margin: '20px auto',
        background: '#1a1a1a',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 0 20px rgba(81, 248, 147, 0.3)',
        border: '2px solid #51F893',
        lineHeight: '1.6'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '25px', textAlign: 'justify' }}>
          O presente projeto busca simular de forma realista uma casa de apostas (tigrinho). O intuito é demonstrar de maneira satírica que jogos de azar online não garantem retorno financeiro, com os mesmos causando prejuízos de ordem econômica a seus usuários.
        </p>
        
        <h2 style={{ 
          color: '#51F893', 
          fontSize: '24px', 
          marginBottom: '20px',
          textShadow: '0 0 5px rgba(81, 248, 147, 0.5)'
        }}>
          O vício em jogo de azar e como as apostas online intensificam esse problema
        </h2>
        
        <p style={{ marginBottom: '20px', textAlign: 'justify' }}>
          Atualmente, as casas de apostas online apelidadas "BETS" se tornaram populares no Brasil nos últimos anos, tendo recentemente, entre os anos de 2024 e 2025, se envolvido em uma série de polêmicas quanto à legalidade e direito de operação dessas empresas em território nacional. Essa problemática levou à criação de leis para a regulação de cassinos online em 2025. Até o presente momento em que esse texto foi escrito (27 de junho de 2025), as BETS foram legalizadas desde que respeitem a regulação vigente. PARA MAIS INFORMAÇÕES{' '}
          <a 
            href="https://www.gov.br/secom/pt-br/fatos/brasil-contra-fake/noticias/2024/09/regulamentacao-da-legislacao-de-bets-torna-atividade-mais-segura-no-brasil" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#51F893', textDecoration: 'underline' }}
          >
            ACESSE AQUI
          </a>.
        </p>
        
        <p style={{ marginBottom: '25px', textAlign: 'justify' }}>
          A Organização Mundial de Saúde (OMS) classifica o vício em apostas como um transtorno grave. Parece banal, mas a compulsão por apostar possui efeitos na psique similares ao uso de drogas e abuso de álcool.
        </p>
      
        <div style={{
          border: '2px solid #51F893',
          padding: '20px',
          background: '#333',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '30px auto',
          textAlign: 'center',
          boxShadow: '0 0 15px rgba(81, 248, 147, 0.3)'
        }}>
          <p style={{ margin: 0, fontSize: '16px', fontStyle: 'italic' }}>
            "As pessoas começam achando que vão ganhar dinheiro fácil e passam horas apostando. Isso afeta o funcionamento do cérebro de forma semelhante às drogas e ao álcool".
          </p>
          <div style={{ marginTop: '15px', fontStyle: 'italic', textAlign: 'right', color: '#51F893' }}>
            — Psiquiatra Antônio Geraldo da Silva
          </div>
        </div>
        
        <p style={{ marginBottom: '20px', textAlign: 'justify' }}>
          O impacto das BETS na economia e sociedade tem se mostrado significativo. A Confederação Nacional de Comércio (CNC) estima que, só em 2024, o setor varejista perdeu R$ 109 bilhões devido às apostas. Ainda segundo relatório do Banco Central, em agosto de 2024, cerca de 5 milhões de beneficiários do programa Bolsa Família gastaram 3 bilhões de reais em casas de aposta virtuais. Esse dinheiro, destinado a melhorar a qualidade de vida de pessoas na linha da pobreza, foi jogado fora para alimentar um vício e uma falsa promessa de lucro fácil. A respeito desse fato, vale refletir sobre como as BETS podem afetar a sociedade, empobrecendo a população que, por falta de instrução, acaba acreditando em influenciadores e destinando o pouco que tem a uma ação que pode levar à miséria.
        </p>
        
        <p style={{ marginBottom: '20px', textAlign: 'justify' }}>
          Com nosso projeto, queremos deixar claro que não existe dinheiro fácil, e que acreditar que colocar dinheiro em um joguinho ou roletinha vai resultar em grandes retornos é uma ilusão. As casas de apostas são pensadas e construídas para prenderem seus usuários e darem a falsa sensação de ganhos. Tendo isso em vista, imagina o estrago que um aplicativo na palma da mão pode fazer.
        </p>
        
        <p style={{ 
          marginBottom: '20px', 
          textAlign: 'justify',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#51F893',
          textShadow: '0 0 5px rgba(81, 248, 147, 0.5)'
        }}>
          Portanto, fica a seguinte mensagem: não existe ganhos sem se ter algum esforço. As pessoas são livres para fazerem o que bem entenderem, mas fica a dica: apostas não garantem nada.
        </p>
      </div>
    </div>
  );
}

export default Aviso;
