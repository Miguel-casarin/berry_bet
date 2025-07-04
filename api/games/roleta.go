package games

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/games/roleta"

	"github.com/gin-gonic/gin"
)

func RegisterRoletaRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware())
	{
		v1.POST("/roleta/apostar", roleta.RoletaBetHandler)
		v1.POST("/roleta/bet_value", roleta.GetBetValueHandler)
	}
	me := router.Group("/api/roleta")
	me.Use(auth.JWTAuthMiddleware())
	{
		me.POST("/apostar", roleta.RoletaBetHandler)
		me.POST("/bet_value", roleta.GetBetValueHandler)
	}
}

		