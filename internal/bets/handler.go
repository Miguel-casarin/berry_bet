package bets

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBetsHandler(c *gin.Context) {
	bets, err := GetBets(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if bets == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No records found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": bets, "message": "Apostas encontradas"})
}

func GetBetByIDHandler(c *gin.Context) {
	id := c.Param("id")
	bet, err := GetBetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if bet.BetStatus == "" {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No record found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": bet, "message": "Aposta encontrada"})
}

func AddBetHandler(c *gin.Context) {
	var json Bet
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	success, err := AddBet(json)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusCreated, gin.H{"success": true, "data": nil, "message": "Aposta registrada com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível registrar a aposta"})
	}
}

func UpdateBetHandler(c *gin.Context) {
	var json Bet
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	betId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}
	success, err := UpdateBet(json, int64(betId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err})
	}
}

func DeleteBetHandler(c *gin.Context) {
	betId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}
	success, err := DeleteBet(betId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err})
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
