package user_stats

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUserStatsHandler(c *gin.Context) {
	stats, err := GetUserStats(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if stats == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Records found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func GetUserStatsByIDHandler(c *gin.Context) {
	id := c.Param("id")
	stats, err := GetUserStatsByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if stats.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Record Found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func AddUserStatsHandler(c *gin.Context) {
	var json UserStats
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	success, err := AddUserStats(json)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to add user stats"})
	}
}

func UpdateUserStatsHandler(c *gin.Context) {
	var json UserStats
	statsId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	success, err := UpdateUserStats(json, int64(statsId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update user stats"})
	}
}

func DeleteUserStatsHandler(c *gin.Context) {
	statsId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	success, err := DeleteUserStats(statsId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete user stats"})
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
