package outcomes

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/outcomes"

	"github.com/gin-gonic/gin"
)

func RegisterOutcomeRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware())
	{
		v1.GET("/outcomes", outcomes.GetOutcomesHandler)
		v1.GET("/outcomes/:id", outcomes.GetOutcomeByIDHandler)
		v1.POST("/outcomes", outcomes.AddOutcomeHandler)
		v1.PUT("/outcomes/:id", outcomes.UpdateOutcomeHandler)
		v1.DELETE("/outcomes/:id", outcomes.DeleteOutcomeHandler)
	}
}
