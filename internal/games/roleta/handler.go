package roleta

import (
	"berry_bet/internal/transactions"
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

	var req RoletaBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}

	// Busca dados do usuário
	user, err := user_stats.GetUserStatsByID(fmt.Sprintf("%d", userID))
	if err != nil || user.ID == 0 {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}

	// Verifica se tem saldo suficiente
	if user.Balance < req.BetValue {
		utils.RespondError(c, http.StatusBadRequest, "INSUFFICIENT_FUNDS", "User does not have enough balance to place this bet.", nil)
		return
	}

	// Executa a lógica da roleta
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

	// Atualiza estatísticas do usuário
	isWin := roletaRes.CartinhaSorteada != "perca"

	user.TotalBets += 1
	user.TotalAmountBet += req.BetValue
	user.Balance -= req.BetValue // Sempre debita a aposta

	// Cria transação da aposta
	betTransaction := transactions.Transaction{
		UserID:      userID,
		Type:        "bet",
		Amount:      -req.BetValue,
		Description: fmt.Sprintf("Aposta na roleta - Valor: R$ %.2f", req.BetValue),
	}
	transactions.AddTransaction(betTransaction)

	if isWin {
		// Vitória
		user.TotalWins += 1
		user.TotalProfit += roletaRes.Lucro
		user.Balance += roletaRes.Lucro + req.BetValue // Retorna a aposta + lucro
		user.ConsecutiveLosses = 0                     // Reseta perdas consecutivas

		// Cria transação do ganho
		winTransaction := transactions.Transaction{
			UserID:      userID,
			Type:        "win",
			Amount:      roletaRes.Lucro + req.BetValue,
			Description: fmt.Sprintf("Ganho na roleta - Carta: %s - Valor: R$ %.2f", roletaRes.CartinhaSorteada, roletaRes.Lucro+req.BetValue),
		}
		transactions.AddTransaction(winTransaction)
	} else {
		// Perda
		user.TotalLosses += 1
		user.ConsecutiveLosses += 1 // Incrementa perdas consecutivas
	}

	// Salva no banco
	_, err = user_stats.UpdateUserStats(user, user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update user stats.", err.Error())
		return
	}

	// Resposta para o frontend
	if isWin {
		resp := RoletaBetResponse{
			Result:         "win",
			WinAmount:      roletaRes.Lucro + req.BetValue,
			Card:           roletaRes.CartinhaSorteada,
			CurrentBalance: user.Balance,
			Message:        "Parabéns, você ganhou!",
		}
		c.JSON(http.StatusOK, resp)
	} else {
		resp := RoletaBetResponse{
			Result:         "lose",
			WinAmount:      0,
			Card:           roletaRes.CartinhaSorteada,
			CurrentBalance: user.Balance,
			Message:        "Que pena, você perdeu.",
		}
		c.JSON(http.StatusOK, resp)
	}
}
