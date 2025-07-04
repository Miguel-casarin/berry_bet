package roleta

import (
	"berry_bet/internal/user_stats"
	"berry_bet/internal/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetBetValueHandler(c *gin.Context) {
	userIDInterface, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Usuário não autenticado.", nil)
		return
	}
	userID, ok := userIDInterface.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "SERVER_ERROR", "Erro ao recuperar ID do usuário.", nil)
		return
	}

	var req RoletaBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}

	betValue := req.BetValue

	if betValue <= 0 {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Bet value must be greater than zero.", nil)
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
	userIDInterface, exists := c.Get("userID")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Usuário não autenticado.", nil)
		return
	}
	userID, ok := userIDInterface.(int64)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "SERVER_ERROR", "Erro ao recuperar ID do usuário.", nil)
		return
	}

	fmt.Println("DEBUG userID passado para GetUserStatsByID:", userID)

	var req RoletaBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}

	user, err := user_stats.GetUserStatsByID(fmt.Sprintf("%d", userID))
	if err != nil || user.ID == 0 {
		fmt.Println("DEBUG user_stats.GetUserStatsByID erro ou user.ID == 0:", err, user)
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}

	if user.Balance < req.BetValue {
		utils.RespondError(c, http.StatusBadRequest, "INSUFFICIENT_FUNDS", "User does not have enough balance to place this bet.", nil)
		return
	}

	res := ExecutaRoleta(userID, req.BetValue)

	if res == nil {
		utils.RespondError(c, http.StatusInternalServerError, "GAME_ERROR", "Failed to execute roleta game.", nil)
		return
	}

	roletaRes, ok := res.(RoletaResult)
	if !ok {
		utils.RespondError(c, http.StatusInternalServerError, "GAME_ERROR", "Unexpected result type from roleta game.", nil)
		return
	}

	if roletaRes.CartinhaSorteada != "perca" {
		user.TotalBets += 1
		user.TotalWins += 1
		user.TotalAmountBet += req.BetValue
		user.TotalProfit += roletaRes.Lucro
		user.Balance += roletaRes.Lucro // lucro
		user.Balance += req.BetValue    //

		// Persistir no banco
		_, err := user_stats.UpdateUserStats(user, user.ID)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update user stats.", err.Error())
			return
		}

		resp := RoletaBetResponse{
			Result:         "win",
			WinAmount:      roletaRes.Lucro + req.BetValue,
			Card:           roletaRes.CartinhaSorteada,
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
			Card:           roletaRes.CartinhaSorteada,
			CurrentBalance: user.Balance,
			Message:        "Que pena, você perdeu.",
		}
		c.JSON(http.StatusOK, resp)
		return
	}
}
