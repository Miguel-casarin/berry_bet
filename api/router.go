package api

import (
	"berry_bet/api/auth"
	"berry_bet/api/bets"
	"berry_bet/api/games"
	"berry_bet/api/outcomes"
	"berry_bet/api/ranking"
	"berry_bet/api/sessions"
	"berry_bet/api/transactions"
	"berry_bet/api/user_stats"
	"berry_bet/api/users"
	

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	auth.RegisterAuthRoutes(router)
	users.RegisterUserRoutes(router)
	bets.RegisterBetRoutes(router)
	sessions.RegisterSessionRoutes(router)
	user_stats.RegisterUserStatsRoutes(router)
	games.RegisterGameRoutes(router)
	transactions.RegisterTransactionRoutes(router)
	outcomes.RegisterOutcomeRoutes(router)
	ranking.RegisterRankingRoutes(router)
	games.RegisterRoletaRoutes(router)
}
