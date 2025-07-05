package roleta

import (
	"berry_bet/internal/common"
	"berry_bet/internal/user_stats"
	"berry_bet/internal/users"
	"berry_bet/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RoletaBetRequest struct {
	Amount float64 `json:"amount"`
}

type RoletaBetResponse struct {
	Result       string  `json:"result"` // "win" ou "lose"
	AmountWon    float64 `json:"amount_won"`
	Odd          float64 `json:"odd"`
	TipoCartinha string  `json:"tipo_cartinha"`
	Balance      float64 `json:"balance"`
}

func RoletaBetHandler(c *gin.Context) {
	userI, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_USER", "Usuário não autenticado", nil)
		return
	}
	var req RoletaBetRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Amount <= 0 {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Valor inválido", nil)
		return
	}
	userCommon, err := common.GetUserByUsername(userI.(string))
	if err != nil || userCommon == nil {
		utils.RespondError(c, http.StatusInternalServerError, "USER_NOT_FOUND", "Usuário não encontrado", nil)
		return
	}
	user := &users.User{
		ID:           userCommon.ID,
		Username:     userCommon.Username,
		Email:        userCommon.Email,
		PasswordHash: userCommon.PasswordHash,
		CPF:          userCommon.CPF,
		Phone:        userCommon.Phone,
		AvatarURL:    userCommon.AvatarURL,
		CreatedAt:    userCommon.CreatedAt,
		UpdatedAt:    userCommon.UpdatedAt,
	}
	if err != nil || user == nil {
		utils.RespondError(c, http.StatusInternalServerError, "USER_NOT_FOUND", "Usuário não encontrado", nil)
		return
	}

	// Buscar saldo real em user_stats
	balance, err := user_stats.GetUserBalance(user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Erro ao buscar saldo", nil)
		return
	}
	println("[DEBUG] Saldo do usuário:", balance, "| Valor da aposta:", req.Amount)
	if balance < req.Amount {
		utils.RespondError(c, http.StatusBadRequest, "NO_FUNDS", "Saldo insuficiente", nil)
		return
	}
	// Decrementa saldo localmente
	balance -= req.Amount
	// Sorteia resultado
	ganho, carta := op_valor(req.Amount)
	var result string
	var odd float64 = 0
	var tipoCartinha string = "perca"
	if carta != nil {
		result = "win"
		odd = ganho / req.Amount
		tipoCartinha = string(*carta)
		balance += ganho + req.Amount // devolve aposta + prêmio
	} else {
		result = "lose"
	}
	// Atualiza saldo no banco (user_stats)
	err = users.UpdateUserBalance(user.ID, balance)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Erro ao atualizar saldo", nil)
		return
	}
	resp := RoletaBetResponse{
		Result:       result,
		AmountWon:    ganho,
		Odd:          odd,
		TipoCartinha: tipoCartinha,
		Balance:      balance,
	}
	utils.RespondSuccess(c, resp, "Aposta realizada")
}
