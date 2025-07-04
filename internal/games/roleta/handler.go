package roleta

import (
	"berry_bet/internal/user_stats"
	"berry_bet/internal/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetBetValueHandler(c *gin.Context) {
	var req RoletaBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}

	userID := req.UserID
	betValue := req.BetValue

	if userID <= 0 || betValue <= 0 {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "User ID and bet value must be greater than zero.", nil)
		return
	}
	user, err := user_stats.GetUserStatsByID(fmt.Sprintf("%d", userID))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", err.Error())
		return
	}

	if user.ID == 0 {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}

	if user.Balance < betValue {
		utils.RespondError(c, http.StatusBadRequest, "INSUFFICIENT_FUNDS", "User does not have enough balance to place this bet.", nil)
		return
	}
}

func RoletaBetHandler(c *gin.Context) {
	var req RoletaBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}

	user, err := user_stats.GetUserStatsByID(fmt.Sprintf("%d", req.UserID))
	if err != nil || user.ID == 0 {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}

	if user.Balance < req.BetValue {
		utils.RespondError(c, http.StatusBadRequest, "INSUFFICIENT_FUNDS", "User does not have enough balance to place this bet.", nil)
		return
	}

	res := ExecutaRoleta(req.UserID, req.BetValue)

	if res == nil {
		utils.RespondError(c, http.StatusInternalServerError, "GAME_ERROR", "Failed to execute roleta game.", nil)
		return
	}

	type RoletaResult struct {
		cartinha_sorteada string
		lucro             int
	}

	type RoletaBetResponse struct {
		Result         string  `json:"result"`
		WinAmount      float64 `json:"win_amount"`
		Card           string  `json:"card"`
		CurrentBalance float64 `json:"current_balance"`
		Message        string  `json:"message"`
	}

	roletaRes, ok := res.(RoletaResult)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "GAME_ERROR", "Unexpected result type from roleta game.", nil)
		return
	}

	if roletaRes.cartinha_sorteada != "perca" {
		user.TotalBets += 1
		user.TotalWins += 1
		user.TotalAmountBet += req.BetValue
		user.TotalProfit += float64(roletaRes.lucro)
		user.Balance += float64(roletaRes.lucro) // lucro
		user.Balance += req.BetValue             //

		// Persistir no banco
		_, err := user_stats.UpdateUserStats(user, user.ID)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update user stats.", err.Error())
			return
		}

		resp := RoletaBetResponse{
			Result:         "win",
			WinAmount:      float64(roletaRes.lucro) + req.BetValue,
			Card:           roletaRes.cartinha_sorteada, // ajuste tipo se for matriz
			CurrentBalance: user.Balance,
			Message:        "Parabéns, você ganhou!",
		}
		c.JSON(http.StatusOK, resp)
		return
	} else {
		user.TotalBets += 1
		user.TotalAmountBet += req.BetValue
		user.TotalLosses += 1
		user.Balance -= req.BetValue

		_, err := user_stats.UpdateUserStats(user, user.ID)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update user stats.", err.Error())
			return
		}

		resp := RoletaBetResponse{
			Result:         "lose",
			WinAmount:      0,
			Card:           roletaRes.cartinha_sorteada,
			CurrentBalance: user.Balance,
			Message:        "Que pena, você perdeu.",
		}
		c.JSON(http.StatusOK, resp)
		return
	}
}


