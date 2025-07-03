package games

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/games"
	"berry_bet/internal/games/roleta"

	"github.com/gin-gonic/gin"
)

func RegisterGameRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware())
	{
		v1.GET("/games", games.GetGamesHandler)
		v1.GET("/games/:id", games.GetGameByIDHandler)
		v1.POST("/games", games.AddGameHandler)
		v1.PUT("/games/:id", games.UpdateGameHandler)
		v1.DELETE("/games/:id", games.DeleteGameHandler)
		// Adiciona rota da roleta
		v1.POST("/roleta/bet", roleta.RoletaBetHandler)
	}
}
