package bets

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBetsHandler(c *gin.Context) {
	bets, err := GetBets(10)
	utils.CheckError(err)

	if bets == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Records found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"data": bets})
	}
}

func GetBetByIDHandler(c *gin.Context) {
	id := c.Param("id")

	bet, err := GetBetByID(id)
	utils.CheckError(err)

	if bet.BetStatus == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Record Found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"data": bet})
	}
}

func AddBetHandler(c *gin.Context) {
	var json Bet
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	success, err := AddBet(json)

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func UpdateBetHandler(c *gin.Context) {
	var json Bet
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	betId, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
	}

	success, err := UpdateBet(json, int64(betId))

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func DeleteBetHandler(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "DeleteBetHandler " + id + " Called"})
}
