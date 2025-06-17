package bets

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetBets(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "GetBets Called"})
}

func GetBetByID(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "GetBetByID" + id + " Called"})
}

func AddBet(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "AddBet Called"})
}

func UpdateBet(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "UpdateBet Called"})
}

func DeleteBet(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "DeleteBet" + id + " Called"})
}
