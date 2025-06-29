package transactions

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetTransactionsHandler returns a list of transactions (DTO response).
func GetTransactionsHandler(c *gin.Context) {
	transactions, err := GetTransactions(10)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch transactions.", err.Error())
		return
	}
	if transactions == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "No transactions found.", nil)
		return
	}
	responses := make([]TransactionResponse, 0, len(transactions))
	for _, t := range transactions {
		responses = append(responses, ToTransactionResponse(&t))
	}
	utils.RespondSuccess(c, responses, "Transactions found")
}

// GetTransactionByIDHandler returns a transaction by ID (DTO response).
func GetTransactionByIDHandler(c *gin.Context) {
	id := c.Param("id")
	transaction, err := GetTransactionByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch transaction.", err.Error())
		return
	}
	if transaction.ID == 0 {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "Transaction not found.", nil)
		return
	}
	utils.RespondSuccess(c, ToTransactionResponse(&transaction), "Transaction found")
}

// AddTransactionHandler creates a new transaction (DTO request/response).
func AddTransactionHandler(c *gin.Context) {
	var req TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	transaction := Transaction{
		UserID:      req.UserID,
		Type:        req.Type,
		Amount:      req.Amount,
		Description: req.Description,
	}
	success, err := AddTransaction(transaction)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to register transaction.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Transaction registered successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "INSERT_FAIL", "Could not register transaction.", nil)
	}
}

// UpdateTransactionHandler updates an existing transaction (DTO request/response).
func UpdateTransactionHandler(c *gin.Context) {
	var req TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	transactionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	transaction := Transaction{
		ID:          int64(transactionId),
		UserID:      req.UserID,
		Type:        req.Type,
		Amount:      req.Amount,
		Description: req.Description,
	}
	success, err := UpdateTransaction(transaction, int64(transactionId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update transaction.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Transaction updated successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "UPDATE_FAIL", "Could not update transaction.", nil)
	}
}

// DeleteTransactionHandler deletes a transaction by ID.
func DeleteTransactionHandler(c *gin.Context) {
	transactionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := DeleteTransaction(transactionId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DELETE_FAIL", "Could not delete transaction.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Transaction deleted successfully.")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete transaction.", nil)
	}
}

// OptionsHandler handles preflight requests.
func OptionsHandler(c *gin.Context) {
	ourOptions := "HTTP/1.1 200 OK\n" +
		"Allow: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Origin: http://localhost:8080\n" +
		"Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Headers: Content-Type\n"

	c.String(200, ourOptions)
}
