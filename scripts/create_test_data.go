package main

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// Abrir conexão com o banco
	db, err := sql.Open("sqlite3", "./data/berry_bet.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// ID do usuário de teste (assumindo que existe um usuário com ID 1)
	userID := 1

	log.Println("Criando dados de teste para o dashboard...")

	// Criar algumas apostas de exemplo diretamente no banco
	testBets := []struct {
		GameType   string
		BetAmount  float64
		WinAmount  float64
		ProfitLoss float64
		Result     string
		Details    string
	}{
		{"roleta", 100.0, 200.0, 100.0, "win", "Aposta na cor vermelha"},
		{"roleta", 50.0, 0.0, -50.0, "loss", "Aposta no número 7"},
		{"crash", 75.0, 150.0, 75.0, "win", "Saiu em 2.0x"},
		{"crash", 25.0, 0.0, -25.0, "loss", "Crash em 1.2x"},
		{"roleta", 200.0, 400.0, 200.0, "win", "Aposta par/ímpar"},
		{"crash", 150.0, 300.0, 150.0, "win", "Saiu em 2.0x"},
		{"roleta", 80.0, 0.0, -80.0, "loss", "Aposta no zero"},
		{"crash", 120.0, 0.0, -120.0, "loss", "Crash em 1.1x"},
	}

	// Inserir no bet_history
	for i, bet := range testBets {
		query := `
			INSERT INTO bet_history (user_id, game_type, bet_amount, win_amount, profit_loss, result, details, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`

		createdAt := time.Now().Add(-time.Duration(len(testBets)-i) * time.Hour)

		_, err := db.Exec(query, userID, bet.GameType, bet.BetAmount, bet.WinAmount, bet.ProfitLoss, bet.Result, bet.Details, createdAt)
		if err != nil {
			log.Printf("Erro ao inserir aposta %d: %v", i+1, err)
		} else {
			log.Printf("Aposta %d inserida com sucesso", i+1)
		}
	}

	// Atualizar estatísticas por jogo
	gameTypes := []string{"roleta", "crash"}
	for _, gameType := range gameTypes {
		// Calcular estatísticas
		var totalBets, totalWins, totalLosses int
		var totalAmountBet, totalProfit, biggestWin, biggestLoss float64

		query := `
			SELECT 
				COUNT(*) as total_bets,
				SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as total_wins,
				SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as total_losses,
				SUM(bet_amount) as total_amount_bet,
				SUM(profit_loss) as total_profit,
				MAX(CASE WHEN profit_loss > 0 THEN profit_loss ELSE 0 END) as biggest_win,
				MIN(CASE WHEN profit_loss < 0 THEN profit_loss ELSE 0 END) as biggest_loss
			FROM bet_history 
			WHERE user_id = ? AND game_type = ?
		`

		err := db.QueryRow(query, userID, gameType).Scan(
			&totalBets, &totalWins, &totalLosses, &totalAmountBet, &totalProfit, &biggestWin, &biggestLoss,
		)

		if err != nil {
			log.Printf("Erro ao calcular estatísticas para %s: %v", gameType, err)
			continue
		}

		// Inserir ou atualizar game_stats
		upsertQuery := `
			INSERT OR REPLACE INTO game_stats 
			(user_id, game_type, total_bets, total_wins, total_losses, total_amount_bet, total_profit, biggest_win, biggest_loss, current_streak, best_win_streak, worst_loss_streak, last_played_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?)
		`

		now := time.Now()
		_, err = db.Exec(upsertQuery, userID, gameType, totalBets, totalWins, totalLosses, totalAmountBet, totalProfit, biggestWin, biggestLoss, now, now, now)
		if err != nil {
			log.Printf("Erro ao atualizar game_stats para %s: %v", gameType, err)
		} else {
			log.Printf("Estatísticas atualizadas para %s", gameType)
		}
	}

	// Criar métricas diárias
	for i := 0; i < 7; i++ {
		date := time.Now().AddDate(0, 0, -i)

		// Calcular métricas para o dia
		var betsCount, winsCount int
		var totalBetAmount, totalProfit float64

		query := `
			SELECT 
				COUNT(*) as bets_count,
				SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins_count,
				SUM(bet_amount) as total_bet_amount,
				SUM(profit_loss) as total_profit
			FROM bet_history 
			WHERE user_id = ? AND date(created_at) = date(?)
		`

		err := db.QueryRow(query, userID, date.Format("2006-01-02")).Scan(
			&betsCount, &winsCount, &totalBetAmount, &totalProfit,
		)

		if err != nil {
			// Se não há dados para o dia, criar entrada vazia
			betsCount, winsCount = 0, 0
			totalBetAmount, totalProfit = 0, 0
		}

		// Inserir métricas diárias
		insertQuery := `
			INSERT OR REPLACE INTO daily_metrics 
			(user_id, date, bets_count, total_bet_amount, total_profit, wins_count, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`

		now := time.Now()
		_, err = db.Exec(insertQuery, userID, date.Format("2006-01-02"), betsCount, totalBetAmount, totalProfit, winsCount, now, now)
		if err != nil {
			log.Printf("Erro ao inserir métricas diárias para %s: %v", date.Format("2006-01-02"), err)
		}
	}

	log.Println("Dados de teste criados com sucesso!")
	log.Println("Agora você pode testar o dashboard no frontend.")
}
