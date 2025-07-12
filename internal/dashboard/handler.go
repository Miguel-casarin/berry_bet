package dashboard

import (
	"net/http"
	"strconv"

	"berry_bet/internal/utils"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// GetCompleteDashboard retorna dados completos do dashboard
func (h *Handler) GetCompleteDashboard(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Usuário não autenticado", nil)
		return
	}

	uid, ok := userID.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "INVALID_USER_ID", "Erro ao obter ID do usuário", nil)
		return
	}

	// Buscar dados completos do dashboard
	dashboard, err := h.service.GetCompleteDashboard(int(uid))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DASHBOARD_ERROR", "Erro ao buscar dados do dashboard", err.Error())
		return
	}

	utils.RespondSuccess(c, dashboard, "Dashboard carregado com sucesso")
}

// GetDashboardStats retorna estatísticas básicas do dashboard
func (h *Handler) GetDashboardStats(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Usuário não autenticado", nil)
		return
	}

	uid, ok := userID.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "INVALID_USER_ID", "Erro ao obter ID do usuário", nil)
		return
	}

	dashboard, err := h.service.GetDashboardData(int(uid))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DASHBOARD_ERROR", "Erro ao buscar estatísticas", err.Error())
		return
	}

	utils.RespondSuccess(c, dashboard, "Estatísticas carregadas com sucesso")
}

// GetWeeklyData retorna dados de performance semanal
func (h *Handler) GetWeeklyData(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Usuário não autenticado", nil)
		return
	}

	uid, ok := userID.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "INVALID_USER_ID", "Erro ao obter ID do usuário", nil)
		return
	}

	weeklyData, err := h.service.GetWeeklyData(int(uid))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "WEEKLY_DATA_ERROR", "Erro ao buscar dados semanais", err.Error())
		return
	}

	utils.RespondSuccess(c, weeklyData, "Dados semanais carregados com sucesso")
}

// GetRecentActivity retorna atividade recente do usuário
func (h *Handler) GetRecentActivity(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Usuário não autenticado", nil)
		return
	}

	uid, ok := userID.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "INVALID_USER_ID", "Erro ao obter ID do usuário", nil)
		return
	}

	// Parâmetro opcional para número de atividades
	limitParam := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit < 1 || limit > 100 {
		limit = 20
	}

	activities, err := h.service.GetRecentActivity(int(uid), limit)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "ACTIVITY_ERROR", "Erro ao buscar atividade recente", err.Error())
		return
	}

	utils.RespondSuccess(c, activities, "Atividade recente carregada com sucesso")
}

// GetGameStats retorna estatísticas por jogo
func (h *Handler) GetGameStats(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Usuário não autenticado", nil)
		return
	}

	uid, ok := userID.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "INVALID_USER_ID", "Erro ao obter ID do usuário", nil)
		return
	}

	// Buscar dados do dashboard que incluem game_stats
	dashboard, err := h.service.GetDashboardData(int(uid))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "GAME_STATS_ERROR", "Erro ao buscar estatísticas por jogo", err.Error())
		return
	}

	utils.RespondSuccess(c, dashboard.GameStats, "Estatísticas por jogo carregadas com sucesso")
}

// RecordBet registra uma nova aposta no histórico
func (h *Handler) RecordBet(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Usuário não autenticado", nil)
		return
	}

	uid, ok := userID.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "INVALID_USER_ID", "Erro ao obter ID do usuário", nil)
		return
	}

	var req RecordBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_REQUEST", "Dados inválidos", err.Error())
		return
	}

	// Validar dados
	if err := req.Validate(); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "VALIDATION_ERROR", "Dados inválidos", err.Error())
		return
	}

	// Registrar aposta
	err := h.service.RecordBet(int(uid), &req)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "RECORD_BET_ERROR", "Erro ao registrar aposta", err.Error())
		return
	}

	utils.RespondSuccess(c, nil, "Aposta registrada com sucesso")
}
