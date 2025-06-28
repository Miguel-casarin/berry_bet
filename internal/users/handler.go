package users

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// GetUsersHandler returns a list of users (DTO response).
func GetUsersHandler(c *gin.Context) {
	users, err := GetUsers(10)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch users.", err.Error())
		return
	}
	if users == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "No users found.", nil)
		return
	}
	responses := make([]UserResponse, 0, len(users))
	for _, u := range users {
		responses = append(responses, ToUserResponse(&u))
	}
	utils.RespondSuccess(c, responses, "Users found")
}

// GetUserByIDHandler returns a user by ID (DTO response).
func GetUserByIDHandler(c *gin.Context) {
	id := c.Param("id")
	user, err := GetUserByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", err.Error())
		return
	}
	if user.Username == "" {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}
	utils.RespondSuccess(c, ToUserResponse(&user), "User found")
}

// AddUserHandler creates a new user (DTO request/response).
func AddUserHandler(c *gin.Context) {
	var req UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	if !utils.IsValidEmail(req.Email) {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_EMAIL", "Invalid email.", nil)
		return
	}
	if !utils.IsValidCPF(req.CPF) {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_CPF", "Invalid CPF.", nil)
		return
	}
	if req.Phone != "" && !utils.IsValidPhone(req.Phone) {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_PHONE", "Invalid phone number.", nil)
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "HASH_ERROR", "Failed to hash password.", err.Error())
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
		utils.RespondError(c, http.StatusBadRequest, "REGISTER_FAIL", "Could not register user.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, ToUserResponse(&user), "User registered successfully.")
	} else {
		utils.RespondError(c, http.StatusInternalServerError, "REGISTER_FAIL", "Could not register user.", nil)
	}
}

// UpdateUserHandler updates an existing user (DTO request/response).
func UpdateUserHandler(c *gin.Context) {
	var req UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
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
			utils.RespondError(c, http.StatusInternalServerError, "HASH_ERROR", "Failed to hash password.", err.Error())
			return
		}
		user.PasswordHash = string(hashed)
	}
	success, err := UpdateUser(user, int64(userId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "UPDATE_FAIL", "Could not update user.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, ToUserResponse(&user), "User updated successfully.")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "UPDATE_FAIL", "Could not update user.", nil)
	}
}

// DeleteUserHandler deletes a user by ID.
func DeleteUserHandler(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := DeleteUser(userId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DELETE_FAIL", "Could not delete user.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "User deleted successfully.")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete user.", nil)
	}
}

// OptionsHandler handles preflight requests.
func OptionsHandler(c *gin.Context) {
	ourOptions := "HTTP/1.1 200 OK\n" +
		"Allow: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Origin: http://localhost:8080\n" +
		"Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\n" +
		"Access-Control-Allow-Headers: Content-Type\n"

	c.String(200, ourOptions)
}

// GetUserBalanceHandler returns the balance of a user by ID.
func GetUserBalanceHandler(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid user ID.", err.Error())
		return
	}
	balance, err := CalculateUserBalance(int64(userId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch balance.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"balance": balance}, "Balance fetched successfully")
}

// GetMeHandler returns the authenticated user's data.
func GetMeHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	user, err := GetUserByUsername(username.(string))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", err.Error())
		return
	}
	if user == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}
	user.PasswordHash = ""
	utils.RespondSuccess(c, user, "User data fetched successfully.")
}

// UpdateMeHandler updates the authenticated user's data.
func UpdateMeHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	user, err := GetUserByUsername(username.(string))
	if err != nil || user == nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", nil)
		return
	}
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password,omitempty"`
		CPF      string `json:"cpf"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.CPF != "" {
		user.CPF = req.CPF
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "HASH_ERROR", "Failed to hash password.", err.Error())
			return
		}
		user.PasswordHash = string(hashed)
	}
	success, err := UpdateUser(*user, user.ID)
	if err != nil || !success {
		utils.RespondError(c, http.StatusInternalServerError, "UPDATE_FAIL", "Could not update user.", err.Error())
		return
	}
	utils.RespondSuccess(c, nil, "User updated successfully.")
}

// GetMeBalanceHandler returns the balance of the authenticated user.
func GetMeBalanceHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	user, err := GetUserByUsername(username.(string))
	if err != nil || user == nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", nil)
		return
	}
	balance, err := CalculateUserBalance(user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch balance.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"balance": balance}, "Balance fetched successfully.")
}
