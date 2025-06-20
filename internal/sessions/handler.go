package sessions

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSessionsHandler(c *gin.Context) {
	sessions, err := GetSessions(10)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch sessions.", err.Error())
		return
	}
	if sessions == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "No sessions found.", nil)
		return
	}
	utils.RespondSuccess(c, sessions, "Sessions found")
}

func GetSessionByIDHandler(c *gin.Context) {
	id := c.Param("id")
	session, err := GetSessionByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch session.", err.Error())
		return
	}
	if session.Token == "" {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "Session not found.", nil)
		return
	}
	utils.RespondSuccess(c, session, "Session found")
}

func AddSessionHandler(c *gin.Context) {
	var json Session
	if err := c.ShouldBindJSON(&json); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	success, err := AddSession(json)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to register session.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Session created successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "INSERT_FAIL", "Could not create session.", nil)
	}
}

func UpdateSessionHandler(c *gin.Context) {
	var json Session
	if err := c.ShouldBindJSON(&json); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	sessionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := UpdateSession(json, int64(sessionId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update session.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Session updated successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "UPDATE_FAIL", "Could not update session.", nil)
	}
}

func DeleteSessionHandler(c *gin.Context) {
	sessionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := DeleteSession(sessionId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to delete session.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Session deleted successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete session.", nil)
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
