package bets

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBetsHandler(c *gin.Context) {
	bets, err := GetBets(10)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch bets.", err.Error())
		return
	}
	if bets == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "No bets found.", nil)
		return
	}
	utils.RespondSuccess(c, bets, "Bets found")
}

func GetBetByIDHandler(c *gin.Context) {
	id := c.Param("id")
	bet, err := GetBetByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch bet.", err.Error())
		return
	}
	if bet.BetStatus == "" {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "Bet not found.", nil)
		return
	}
	utils.RespondSuccess(c, bet, "Bet found")
}

func AddBetHandler(c *gin.Context) {
	var json Bet
	if err := c.ShouldBindJSON(&json); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	if err := ValidateBet(json); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "BUSINESS_RULE", err.Error(), nil)
		return
	}
	success, err := AddBet(json)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to register bet.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Bet registered successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "INSERT_FAIL", "Could not register bet.", nil)
	}
}

func UpdateBetHandler(c *gin.Context) {
	var json Bet
	if err := c.ShouldBindJSON(&json); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	betId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := UpdateBet(json, int64(betId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update bet.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Bet updated successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "UPDATE_FAIL", "Could not update bet.", nil)
	}
}

func DeleteBetHandler(c *gin.Context) {
	betId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := DeleteBet(betId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to delete bet.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Bet deleted successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete bet.", nil)
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
