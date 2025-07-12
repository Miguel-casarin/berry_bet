package main

import (
	"berry_bet/config"
	"berry_bet/internal/dashboard"
	"log"
	"time"
)

func main() {
	// Configurar o banco de dados
	config.SetupDatabase()

	// Criar o service
	service := dashboard.NewService(config.DB)

	// ID do usuário de teste (assumindo que existe um usuário com ID 1)
	userID := 1

	log.Println("Criando dados de teste para o dashboard...")

	// Criar algumas apostas de exemplo
	testBets := []dashboard.RecordBetRequest{
		{
			GameType:   "roleta",
			BetAmount:  100.0,
			WinAmount:  200.0,
			ProfitLoss: 100.0,
			Result:     "win",
			Details:    "Aposta na cor vermelha",
		},
		{
			GameType:   "roleta",
			BetAmount:  50.0,
			WinAmount:  0.0,
			ProfitLoss: -50.0,
			Result:     "loss",
			Details:    "Aposta no número 7",
		},
		{
			GameType:   "crash",
			BetAmount:  75.0,
			WinAmount:  150.0,
			ProfitLoss: 75.0,
			Result:     "win",
			Details:    "Saiu em 2.0x",
		},
		{
			GameType:   "crash",
			BetAmount:  25.0,
			WinAmount:  0.0,
			ProfitLoss: -25.0,
			Result:     "loss",
			Details:    "Crash em 1.2x",
		},
		{
			GameType:   "roleta",
			BetAmount:  200.0,
			WinAmount:  400.0,
			ProfitLoss: 200.0,
			Result:     "win",
			Details:    "Aposta par/ímpar",
		},
	}

	// Registrar as apostas
	for i, bet := range testBets {
		err := service.RecordBet(userID, &bet)
		if err != nil {
			log.Printf("Erro ao registrar aposta %d: %v", i+1, err)
		} else {
			log.Printf("Aposta %d registrada com sucesso", i+1)
		}

		// Adicionar um pequeno delay para criar timestamps diferentes
		time.Sleep(100 * time.Millisecond)
	}

	log.Println("Dados de teste criados com sucesso!")
	log.Println("Agora você pode testar o dashboard no frontend.")
}
