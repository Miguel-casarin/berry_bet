package user_stats

import (
	"berry_bet/config"
	"berry_bet/internal/common"
	"berry_bet/internal/utils"
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetUserStatsHandler returns a list of user stats (DTO response).
func GetUserStatsHandler(c *gin.Context) {
	stats, err := GetUserStats(10)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user stats.", err.Error())
		return
	}
	if stats == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "No user stats found.", nil)
		return
	}
	responses := make([]UserStatsResponse, 0, len(stats))
	for _, s := range stats {
		responses = append(responses, ToUserStatsResponse(&s))
	}
	utils.RespondSuccess(c, responses, "User stats found")
}

// GetUserStatsByIDHandler returns user stats by ID (DTO response).
func GetUserStatsByIDHandler(c *gin.Context) {
	id := c.Param("id")
	stats, err := GetUserStatsByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user stats.", err.Error())
		return
	}
	if stats.ID == 0 {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User stats not found.", nil)
		return
	}
	utils.RespondSuccess(c, ToUserStatsResponse(&stats), "User stats found")
}

// AddUserStatsHandler creates new user stats (DTO request/response).
func AddUserStatsHandler(c *gin.Context) {
	var req UserStatsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	stats := UserStats{
		UserID:         req.UserID,
		TotalBets:      req.TotalBets,
		TotalWins:      req.TotalWins,
		TotalLosses:    req.TotalLosses,
		TotalAmountBet: req.TotalAmountBet,
		TotalProfit:    req.TotalProfit,
		Balance:        req.Balance,
		LastBetAt:      sql.NullString{String: req.LastBetAt, Valid: req.LastBetAt != ""},
	}
	success, err := AddUserStats(stats)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to register user stats.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "User stats registered successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "INSERT_FAIL", "Could not register user stats.", nil)
	}
}

// UpdateUserStatsHandler updates user stats (DTO request/response).
func UpdateUserStatsHandler(c *gin.Context) {
	var req UserStatsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	statsId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	stats := UserStats{
		ID:             int64(statsId),
		UserID:         req.UserID,
		TotalBets:      req.TotalBets,
		TotalWins:      req.TotalWins,
		TotalLosses:    req.TotalLosses,
		TotalAmountBet: req.TotalAmountBet,
		TotalProfit:    req.TotalProfit,
		Balance:        req.Balance,
		LastBetAt:      sql.NullString{String: req.LastBetAt, Valid: req.LastBetAt != ""},
	}
	success, err := UpdateUserStats(stats, int64(statsId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update user stats.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "User stats updated successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "UPDATE_FAIL", "Could not update user stats.", nil)
	}
}

// DeleteUserStatsHandler deletes user stats by ID.
func DeleteUserStatsHandler(c *gin.Context) {
	statsId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := DeleteUserStats(statsId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DELETE_FAIL", "Could not delete user stats.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "User stats deleted successfully.")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete user stats.", nil)
	}
}

func OptionsHandler(c *gin.Context) {
	ourOptions := "HTTP/1.1 200 OK\n" +
		"Allow: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Origin: http://localhost:8080\n" +
		"Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Headers: Content-Type\n"

	c.String(200, ourOptions)
}

func GetMeStatsHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	user, err := common.GetUserByUsername(username.(string))
	if err != nil || user == nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", nil)
		return
	}
	stats, err := GetUserStatsByUserID(user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user stats.", err.Error())
		return
	}
	if stats == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User stats not found.", nil)
		return
	}
	utils.RespondSuccess(c, stats, "User stats fetched successfully.")
}

// Busca estatísticas do usuário pelo user_id
func GetUserStatsByUserID(userID int64) (*UserStats, error) {
	stmt, err := config.DB.Prepare("SELECT id, user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, last_bet_at, created_at, updated_at FROM user_stats WHERE user_id = ?")
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	stats := UserStats{}
	err = stmt.QueryRow(userID).Scan(&stats.ID, &stats.UserID, &stats.TotalBets, &stats.TotalWins, &stats.TotalLosses, &stats.TotalAmountBet, &stats.TotalProfit, &stats.Balance, &stats.LastBetAt, &stats.CreatedAt, &stats.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &stats, nil
}

// GetUserBalanceHandler retorna o saldo de um usuário pelo ID
func GetUserBalanceHandler(c *gin.Context) {
	userID := c.Param("id")
	balance, err := GetUserBalanceByID(userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user balance.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"user_id": userID, "balance": balance}, "User balance fetched successfully")
}

// GetMeBalanceHandler retorna o saldo do usuário autenticado
func GetMeBalanceHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	user, err := common.GetUserByUsername(username.(string))
	if err != nil || user == nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", nil)
		return
	}
	balance, err := GetUserBalance(user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch balance.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"user_id": user.ID, "balance": balance}, "Balance fetched successfully")
}
