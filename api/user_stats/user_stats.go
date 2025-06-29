package user_stats

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/user_stats"

	"github.com/gin-gonic/gin"
)

func RegisterUserStatsRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware())
	{
		v1.GET("/user_stats", user_stats.GetUserStatsHandler)
		v1.GET("/user_stats/:id", user_stats.GetUserStatsByIDHandler)
		v1.GET("/user_stats/:id/balance", user_stats.GetUserBalanceHandler)
		v1.POST("/user_stats", user_stats.AddUserStatsHandler)
		v1.PUT("/user_stats/:id", user_stats.UpdateUserStatsHandler)
		v1.DELETE("/user_stats/:id", user_stats.DeleteUserStatsHandler)
	}

	me := router.Group("/api/user_stats")
	me.Use(auth.JWTAuthMiddleware())
	{
		me.GET("/me", user_stats.GetMeStatsHandler)
		me.GET("/me/balance", user_stats.GetMeBalanceHandler)
	}
}
