package users

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func GetUsersHandler(c *gin.Context) {
	users, err := GetUsers(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if users == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No records found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": users, "message": "Usuários encontrados"})
}

func GetUserByIDHandler(c *gin.Context) {
	id := c.Param("id")
	user, err := GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if user.Username == "" {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "message": "No record found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": user, "message": "Usuário encontrado"})
}

func AddUserHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
		CPF      string `json:"cpf"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": "Failed to hash password"})
		return
	}

	user := User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashed),
		CPF:          req.CPF,
		Phone:        req.Phone,
	}

	success, err := AddUser(user)
	if err != nil {
		errMsg := err.Error()
		if errMsg == "cpf is already taken" || errMsg == "email is already taken" || errMsg == "username is already taken" {
			c.JSON(http.StatusConflict, gin.H{"success": false, "data": nil, "message": errMsg})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": errMsg})
		return
	}
	if success {
		c.JSON(http.StatusCreated, gin.H{"success": true, "data": nil, "message": "Usuário criado com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível criar o usuário"})
	}
}

func UpdateUserHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password,omitempty"`
		CPF      string `json:"cpf"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}

	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}

	user := User{
		ID:       int64(userId),
		Username: req.Username,
		Email:    req.Email,
		CPF:      req.CPF,
		Phone:    req.Phone,
	}

	if req.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": "Failed to hash password"})
			return
		}
		user.PasswordHash = string(hashed)
	}

	success, err := UpdateUser(user, int64(userId))
	if err != nil {
		errMsg := err.Error()
		if errMsg == "cpf is already taken" || errMsg == "email is already taken" || errMsg == "username is already taken" {
			c.JSON(http.StatusConflict, gin.H{"success": false, "data": nil, "message": errMsg})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": errMsg})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Usuário atualizado com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível atualizar o usuário"})
	}
}

func DeleteUserHandler(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid ID"})
		return
	}
	success, err := DeleteUser(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	if success {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "message": "Usuário deletado com sucesso"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Não foi possível deletar o usuário"})
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

func GetUserBalanceHandler(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Invalid user ID"})
		return
	}
	balance, err := CalculateUserBalance(int64(userId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"balance": balance}, "message": "Saldo consultado com sucesso"})
}
