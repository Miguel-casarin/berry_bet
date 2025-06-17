package api_users

import (
	"berry_bet/internal/users"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	{
		v1.GET("/users", users.GetUsers)
		v1.GET("/users/:id", users.GetUserByID)
		v1.POST("/users", users.AddUser)
		v1.PUT("/users/:id", users.UpdateUser)
		v1.DELETE("/users/:id", users.DeleteUser)
	}
}
