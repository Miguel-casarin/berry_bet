package auth

import (
	"berry_bet/internal/auth"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.Engine) {
	router.POST("/login", auth.LoginHandler)
	router.POST("/register", auth.RegisterHandler)
}
