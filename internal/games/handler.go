package games

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetGamesHandler(c *gin.Context) {
	games, err := GetGames(10)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch games.", err.Error())
		return
	}
	if games == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "No games found.", nil)
		return
	}
	utils.RespondSuccess(c, games, "Games found")
}

func GetGameByIDHandler(c *gin.Context) {
	id := c.Param("id")
	game, err := GetGameByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch game.", err.Error())
		return
	}
	if game.GameName == "" {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "Game not found.", nil)
		return
	}
	utils.RespondSuccess(c, game, "Game found")
}

func AddGameHandler(c *gin.Context) {
	var json Game
	if err := c.ShouldBindJSON(&json); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}

	success, err := AddGame(json)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to add game.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Game added successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "INSERT_FAIL", "Could not add game.", nil)
	}
}

func UpdateGameHandler(c *gin.Context) {
	var json Game
	if err := c.ShouldBindJSON(&json); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}

	gameId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}

	success, err := UpdateGame(json, int64(gameId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update game.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Game updated successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "UPDATE_FAIL", "Could not update game.", nil)
	}
}

func DeleteGameHandler(c *gin.Context) {
	gameId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}

	success, err := DeleteGame(gameId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to delete game.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Game deleted successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete game.", nil)
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
