package games

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetGamesHandler(c *gin.Context) {
	games, err := GetGames(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if games == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No records found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": games, "message": "Jogos encontrados"})
}

func GetGameByIDHandler(c *gin.Context) {
	id := c.Param("id")
	game, err := GetGameByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if game.GameName == "" {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No record found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": game, "message": "Jogo encontrado"})
}

func AddGameHandler(c *gin.Context) {
	var json Game
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}

	success, err := AddGame(json)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusCreated, gin.H{"success": true, "data": nil, "message": "Jogo adicionado com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível adicionar o jogo"})
	}
}

func UpdateGameHandler(c *gin.Context) {
	var json Game
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}

	gameId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}

	success, err := UpdateGame(json, int64(gameId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Failed to update game"})
	}
}

func DeleteGameHandler(c *gin.Context) {
	gameId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}

	success, err := DeleteGame(gameId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Failed to delete game"})
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
