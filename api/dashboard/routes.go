package dashboard

import (
	"berry_bet/internal/auth"
	"berry_bet/internal/dashboard"
	"database/sql"

	"github.com/gin-gonic/gin"
)

// RegisterDashboardRoutes registra as rotas do dashboard
func RegisterDashboardRoutes(router *gin.Engine, db *sql.DB) {
	// Criar o service e handler
	service := dashboard.NewService(db)
	handler := dashboard.NewHandler(service)

	// Grupo de rotas protegidas por autenticação
	api := router.Group("/api/dashboard")
	api.Use(auth.JWTAuthMiddleware())

	// Rotas principais do dashboard
	api.GET("/complete", handler.GetCompleteDashboard)
	api.GET("/stats", handler.GetDashboardStats)
	api.GET("/weekly", handler.GetWeeklyData)
	api.GET("/activity", handler.GetRecentActivity)
	api.GET("/games", handler.GetGameStats)

	// Rota para registrar apostas
	api.POST("/record-bet", handler.RecordBet)
}
