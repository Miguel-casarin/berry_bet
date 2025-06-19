package  roulette

import (
	"berry_bet/internal/roulette"

	 "github.com/gin-gonic/gin"
)

func RegisterRouletteRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	{
		v1.GET("/roulette", roulette.GetRouletteHandler)
		v1.GET("/roulette/:id", roulette.GetRouletteByIDHandler)
		v1.POST("/roulette", roulette.AddRouletteHandler)
		v1.PUT("/roulette/:id", roulette.UpdateRouletteHandler)
		v1.DELETE("/roulette/:id", roulette.DeleteRouletteHandler)
		v1.OPTIONS("/roulette", roulette.OptionsHandler)
	}
}