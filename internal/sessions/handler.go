package sessions

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSessionsHandler(c *gin.Context) {
	sessions, err := GetSessions(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if sessions == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No records found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sessions, "message": "Sessões encontradas"})
}

func GetSessionByIDHandler(c *gin.Context) {
	id := c.Param("id")
	session, err := GetSessionByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if session.Token == "" {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No record found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": session, "message": "Sessão encontrada"})
}

func AddSessionHandler(c *gin.Context) {
	var json Session
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	success, err := AddSession(json)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusCreated, gin.H{"success": true, "data": nil, "message": "Sessão criada com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível criar a sessão"})
	}
}

func UpdateSessionHandler(c *gin.Context) {
	var json Session
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	sessionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}
	success, err := UpdateSession(json, int64(sessionId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Sessão atualizada com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível atualizar a sessão"})
	}
}

func DeleteSessionHandler(c *gin.Context) {
	sessionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}
	success, err := DeleteSession(sessionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Sessão deletada com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível deletar a sessão"})
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
