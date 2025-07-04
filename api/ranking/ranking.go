package ranking

import (
	"berry_bet/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RankingPlayer struct {
	ID             int     `json:"id"`
	Username       string  `json:"username"`
	Name           string  `json:"name"`
	AvatarURL      string  `json:"avatar_url"`
	Balance        float64 `json:"balance"`
	TotalBets      int64   `json:"total_bets"`
	TotalWins      int64   `json:"total_wins"`
	TotalLosses    int64   `json:"total_losses"`
	TotalProfit    float64 `json:"total_profit"`
	TotalAmountBet float64 `json:"total_amount_bet"`
}

// GetRankingHandler retorna o ranking dos jogadores por saldo (top 10)
func GetRankingHandler(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT u.id, u.username, u.name, u.avatar_url,
		COALESCE(us.balance, 0),
		COALESCE(us.total_bets, 0),
		COALESCE(us.total_wins, 0),
		COALESCE(us.total_losses, 0),
		COALESCE(us.total_profit, 0),
		COALESCE(us.total_amount_bet, 0)
		FROM users u
		LEFT JOIN user_stats us ON u.id = us.user_id
		ORDER BY COALESCE(us.balance, 0) DESC
		LIMIT 10
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar ranking"})
		return
	}
	defer rows.Close()

	var ranking []RankingPlayer
	for rows.Next() {
		var p RankingPlayer
		if err := rows.Scan(&p.ID, &p.Username, &p.Name, &p.AvatarURL, &p.Balance, &p.TotalBets, &p.TotalWins, &p.TotalLosses, &p.TotalProfit, &p.TotalAmountBet); err == nil {
			ranking = append(ranking, p)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": ranking})
}
