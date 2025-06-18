package bets

import (
	"berry_bet/internal/bets"

	"github.com/gin-gonic/gin"
)

func RegisterBetRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	{
		v1.GET("/bets", bets.GetBets)
		v1.GET("/bets/:id", bets.GetBetByID)
		v1.POST("/bets", bets.AddBet)
		v1.PUT("/bets/:id", bets.UpdateBet)
		v1.DELETE("/bets/:id", bets.DeleteBet)
	}
}
