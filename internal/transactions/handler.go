package transactions

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetTransactionsHandler(c *gin.Context) {
	transactions, err := GetTransactions(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if transactions == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No records found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": transactions, "message": "Transações encontradas"})
}

func GetTransactionByIDHandler(c *gin.Context) {
	id := c.Param("id")
	transaction, err := GetTransactionByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if transaction.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No record found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": transaction, "message": "Transação encontrada"})
}

func AddTransactionHandler(c *gin.Context) {
	var json Transaction
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	success, err := AddTransaction(json)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusCreated, gin.H{"success": true, "data": nil, "message": "Transação registrada com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível registrar a transação"})
	}
}

func UpdateTransactionHandler(c *gin.Context) {
	var json Transaction
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	transactionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}
	success, err := UpdateTransaction(json, int64(transactionId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Transação atualizada com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível atualizar a transação"})
	}
}

func DeleteTransactionHandler(c *gin.Context) {
	transactionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}
	success, err := DeleteTransaction(transactionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Transação deletada com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível deletar a transação"})
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
