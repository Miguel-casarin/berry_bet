package bets

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/bets"

	"github.com/gin-gonic/gin"
)

func RegisterBetRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware())
	{
		v1.GET("/bets", bets.GetBetsHandler)
		v1.GET("/bets/:id", bets.GetBetByIDHandler)
		v1.POST("/bets", bets.AddBetHandler)
		v1.PUT("/bets/:id", bets.UpdateBetHandler)
		v1.DELETE("/bets/:id", bets.DeleteBetHandler)
	}
}
