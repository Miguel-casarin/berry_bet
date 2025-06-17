package main

import (
	"berry_bet/api"
	"berry_bet/config"

	"github.com/gin-gonic/gin"
)

func main() {
	config.SetupDatabase()

	router := gin.Default()
	api.RegisterUserRoutes(router)
	api.RegisterBetRoutes(router)
	router.Run(":8080")
}
