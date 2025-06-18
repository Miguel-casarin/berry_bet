package users

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUsersHandler(c *gin.Context) {
	users, err := GetUsers(10)
	utils.CheckError(err)

	if users == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Records found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"data": users})
	}
}

func GetUserByIDHandler(c *gin.Context) {
	id := c.Param("id")

	user, err := GetUserByID(id)
	utils.CheckError(err)

	if user.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Record Found"})
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"data": user})
	}
}

func AddUserHandler(c *gin.Context) {
	var json User
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	success, err := AddUser(json)

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func UpdateUserHandler(c *gin.Context) {
	var json User
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userId, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
	}

	success, err := UpdateUser(json, int64(userId))

	if success {
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}
}

func DeleteUserHandler(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
	}
	success, err := DeleteUser(userId)

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
