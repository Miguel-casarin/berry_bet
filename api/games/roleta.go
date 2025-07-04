package games

import (
	"berry_bet/internal/games/roleta"

	"github.com/gin-gonic/gin"
)

func RegisterRoletaRoutes(rg *gin.RouterGroup) {
	r := rg.Group("/roleta")
	r.POST("/bet", roleta.RoletaBetHandler)
}
