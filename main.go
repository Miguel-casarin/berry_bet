package main

import (
	"berry_bet/api/auth"
	"berry_bet/api/bets"
	"berry_bet/api/users"
	"berry_bet/config"

	"github.com/gin-gonic/gin"
)

func main() {
	config.SetupDatabase()

	router := gin.Default()
	auth.RegisterAuthRoutes(router)
	users.RegisterUserRoutes(router)
	bets.RegisterBetRoutes(router)
	router.Run(":8080")
}
