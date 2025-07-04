package transactions

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/transactions"

	"github.com/gin-gonic/gin"
)

func RegisterTransactionRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	v1.Use(auth.JWTAuthMiddleware())
	{
		v1.GET("/transactions", transactions.GetTransactionsHandler)
		v1.GET("/transactions/:id", transactions.GetTransactionByIDHandler)
		v1.POST("/transactions", transactions.AddTransactionHandler)
		v1.PUT("/transactions/:id", transactions.UpdateTransactionHandler)
		v1.DELETE("/transactions/:id", transactions.DeleteTransactionHandler)
		v1.OPTIONS("/transactions", transactions.OptionsHandler)
	}

	// Rotas específicas do usuário
	userRoutes := router.Group("/api/transactions")
	userRoutes.Use(auth.JWTAuthMiddleware())
	{
		userRoutes.GET("/me", transactions.GetMeTransactionsHandler)
	}
}
