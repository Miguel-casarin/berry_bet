package main

import (
	"berry_bet/api"
	"berry_bet/config"

	"github.com/gin-gonic/gin"
)

func main() {
	config.SetupDatabase()

	r := gin.Default()
	api.RegisterRoutes(r)
	r.Run(":8080")
}
