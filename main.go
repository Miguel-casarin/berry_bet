package main

import (
	"berry_bet/api"
	"berry_bet/config"
	"berry_bet/internal/utils"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Aviso: .env não encontrado ou não pôde ser carregado")
	}

	config.SetupDatabase()

	r := gin.Default()
	r.Use(cors.Default())
	r.Use(utils.ErrorHandlingMiddleware())
	api.RegisterRoutes(r)
	r.Run(":8080")
}
