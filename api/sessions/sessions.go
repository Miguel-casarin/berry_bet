package sessions

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/sessions"

	"github.com/gin-gonic/gin"
)

func RegisterSessionRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware()) 
	{
		v1.GET("/sessions", sessions.GetSessionsHandler)
		v1.GET("/sessions/:id", sessions.GetSessionByIDHandler)
		v1.POST("/sessions", sessions.AddSessionHandler)
		v1.PUT("/sessions/:id", sessions.UpdateSessionHandler)
		v1.DELETE("/sessions/:id", sessions.DeleteSessionHandler)
		v1.OPTIONS("/sessions", sessions.OptionsHandler)
	}
}
