package games

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetGamesHandler(c *gin.Context) {
	games, err := GetGames(10)
	utils.CheckError(err)

	if games == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Records found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"data": games})
	}
}

func GetGameByIDHandler(c *gin.Context) {
	id := c.Param("id")
	game, err := GetGameByID(id)
	utils.CheckError(err)

	if game.GameName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Record Found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"data": game})
	}
}

func AddGameHandler(c *gin.Context) {
	var json Game
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	success, err := AddGame(json)

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func UpdateGameHandler(c *gin.Context) {
	var json Game
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	gameId, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
	}

	success, err := UpdateGame(json, int64(gameId))

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func DeleteGameHandler(c *gin.Context) {
	gameId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
	}

	success, err := DeleteGame(gameId)

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
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
