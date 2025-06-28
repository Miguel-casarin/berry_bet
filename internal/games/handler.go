package games

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetGamesHandler returns a list of games (DTO response).
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
	responses := make([]GameResponse, 0, len(games))
	for _, g := range games {
		responses = append(responses, ToGameResponse(&g))
	}
	utils.RespondSuccess(c, responses, "Games found")
}

// GetGameByIDHandler returns a game by ID (DTO response).
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
	utils.RespondSuccess(c, ToGameResponse(&game), "Game found")
}

// AddGameHandler creates a new game (DTO request/response).
func AddGameHandler(c *gin.Context) {
	var req GameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	game := Game{
		GameName:        req.GameName,
		GameDescription: req.GameDescription,
		StartTime:       req.StartTime,
		EndTime:         req.EndTime,
		GameStatus:      req.GameStatus,
	}
	success, err := AddGame(game)
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

// UpdateGameHandler updates an existing game (DTO request/response).
func UpdateGameHandler(c *gin.Context) {
	var req GameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	gameId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	game := Game{
		ID:              int64(gameId),
		GameName:        req.GameName,
		GameDescription: req.GameDescription,
		StartTime:       req.StartTime,
		EndTime:         req.EndTime,
		GameStatus:      req.GameStatus,
	}
	success, err := UpdateGame(game, int64(gameId))
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

// DeleteGameHandler deletes a game by ID.
func DeleteGameHandler(c *gin.Context) {
	gameId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := DeleteGame(gameId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DELETE_FAIL", "Could not delete game.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Game deleted successfully.")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete game.", nil)
	}
}

// OptionsHandler handles preflight requests for CORS.
func OptionsHandler(c *gin.Context) {
	ourOptions := "HTTP/1.1 200 OK\n" +
		"Allow: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Origin: http://localhost:8080\n" +
		"Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Headers: Content-Type\n"

	c.String(200, ourOptions)
}
