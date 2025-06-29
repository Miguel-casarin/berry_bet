package users

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/users"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware())
	{
		v1.GET("/users", users.GetUsersHandler)
		v1.GET("/users/:id", users.GetUserByIDHandler)
		v1.POST("/users", users.AddUserHandler)
		v1.PUT("/users/:id", users.UpdateUserHandler)
		v1.DELETE("/users/:id", users.DeleteUserHandler)
		v1.GET("/users/:id/balance", users.GetUserBalanceHandler)
	}

	me := router.Group("/api/users")
	me.Use(auth.JWTAuthMiddleware())
	{
		me.GET("/me", users.GetMeHandler)
		me.PUT("/me", users.UpdateMeHandler)
		me.GET("/me/balance", users.GetMeBalanceHandler)
		me.POST("/avatar", users.UploadAvatarHandler)
		me.POST("/change_password", users.ChangePasswordHandler)
	}
}
