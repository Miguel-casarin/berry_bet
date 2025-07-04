package users

import (
	"berry_bet/internal/common"
	"berry_bet/internal/token"
	"berry_bet/internal/user_stats"
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
		balance, _ := user_stats.GetUserBalance(u.ID)
		responses = append(responses, ToUserResponseWithBalance(&u, balance))
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
	balance, _ := user_stats.GetUserBalance(user.ID)
	utils.RespondSuccess(c, ToUserResponseWithBalance(&user, balance), "User found")
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
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashed),
		CPF:          req.CPF,
		Phone:        req.Phone,
		DateBirth:    req.DateBirth,
	}
	success, err := AddUser(user)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "REGISTER_FAIL", "Could not register user.", err.Error())
		return
	}
	if success {
		balance, _ := user_stats.GetUserBalance(user.ID)
		utils.RespondSuccess(c, ToUserResponseWithBalance(&user, balance), "User registered successfully.")
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
		ID:        int64(userId),
		Username:  req.Username,
		Name:      req.Name,
		Email:     req.Email,
		CPF:       req.CPF,
		Phone:     req.Phone,
		DateBirth: req.DateBirth,
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
		balance, _ := user_stats.GetUserBalance(user.ID)
		utils.RespondSuccess(c, ToUserResponseWithBalance(&user, balance), "User updated successfully.")
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
	balance, err := user_stats.GetUserBalance(int64(userId))
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
	userCommon, err := common.GetUserByUsername(username.(string))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", err.Error())
		return
	}
	if userCommon == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}
	// Convert common.User to users.User
	user := &User{
		ID:           userCommon.ID,
		Username:     userCommon.Username,
		Name:         userCommon.Name,
		Email:        userCommon.Email,
		PasswordHash: userCommon.PasswordHash,
		CPF:          userCommon.CPF,
		Phone:        userCommon.Phone,
		DateBirth:    userCommon.DateBirth,
		AvatarURL:    userCommon.AvatarURL,
		CreatedAt:    userCommon.CreatedAt,
		UpdatedAt:    userCommon.UpdatedAt,
	}
	balance, _ := user_stats.GetUserBalance(user.ID)
	user.PasswordHash = ""
	utils.RespondSuccess(c, ToUserResponseWithBalance(user, balance), "User data fetched successfully.")
}

// UpdateMeHandler updates the authenticated user's data.
func UpdateMeHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	userCommon, err := common.GetUserByUsername(username.(string))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", err.Error())
		return
	}
	if userCommon == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "User not found.", nil)
		return
	}
	user := &User{
		ID:           userCommon.ID,
		Username:     userCommon.Username,
		Name:         userCommon.Name,
		Email:        userCommon.Email,
		PasswordHash: userCommon.PasswordHash,
		CPF:          userCommon.CPF,
		Phone:        userCommon.Phone,
		DateBirth:    userCommon.DateBirth,
		AvatarURL:    userCommon.AvatarURL,
		CreatedAt:    userCommon.CreatedAt,
		UpdatedAt:    userCommon.UpdatedAt,
	}
	var req struct {
		Username  string `json:"username"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		Password  string `json:"password,omitempty"`
		CPF       string `json:"cpf"`
		Phone     string `json:"phone"`
		DateBirth string `json:"date_birth"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Name != "" {
		user.Name = req.Name
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
	if req.DateBirth != "" {
		user.DateBirth = req.DateBirth
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

	// Gerar novo token JWT com o username atualizado
	tokenStr, err := token.GenerateJWT(user.Username)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "TOKEN_ERROR", "Failed to generate new token.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"token": tokenStr}, "User updated successfully.")
}

// GetMeBalanceHandler returns the balance of the authenticated user.
func GetMeBalanceHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	userCommon, err := common.GetUserByUsername(username.(string))
	if err != nil || userCommon == nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", nil)
		return
	}
	balance, err := user_stats.GetUserBalance(userCommon.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch balance.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"balance": balance}, "Balance fetched successfully.")
}

// UploadAvatarHandler faz upload da foto de perfil do usuário autenticado
func UploadAvatarHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	userCommon, err := common.GetUserByUsername(username.(string))
	if err != nil || userCommon == nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", nil)
		return
	}
	user := &User{
		ID:           userCommon.ID,
		Username:     userCommon.Username,
		Email:        userCommon.Email,
		PasswordHash: userCommon.PasswordHash,
		CPF:          userCommon.CPF,
		Phone:        userCommon.Phone,
		AvatarURL:    userCommon.AvatarURL,
		CreatedAt:    userCommon.CreatedAt,
		UpdatedAt:    userCommon.UpdatedAt,
	}
	file, err := c.FormFile("avatar")
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "NO_FILE", "No file uploaded.", err.Error())
		return
	}
	// Cria pasta se não existir
	dir := "uploads/avatars/"
	_ = utils.EnsureDir(dir)
	filename := dir + username.(string) + "_" + file.Filename
	if err := c.SaveUploadedFile(file, filename); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "UPLOAD_FAIL", "Failed to save file.", err.Error())
		return
	}
	avatarURL := "/" + filename
	user.AvatarURL = avatarURL
	_, err = UpdateUser(*user, user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "UPDATE_FAIL", "Failed to update user avatar.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{
		"avatarUrl": avatarURL,
		"user": ToUserResponseWithBalance(user, 0), // Retorna os dados atualizados do usuário
	}, "Avatar updated successfully.")
}

// ChangePasswordRequest representa o payload para troca de senha
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// ChangePasswordHandler permite ao usuário autenticado trocar sua senha
func ChangePasswordHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "NO_AUTH", "User not authenticated.", nil)
		return
	}
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	if len(req.NewPassword) < 6 {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_PASSWORD", "A nova senha deve ter pelo menos 6 caracteres.", nil)
		return
	}
	userCommon, err := common.GetUserByUsername(username.(string))
	if err != nil || userCommon == nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", nil)
		return
	}
	user := &User{
		ID:           userCommon.ID,
		Username:     userCommon.Username,
		Email:        userCommon.Email,
		PasswordHash: userCommon.PasswordHash,
		CPF:          userCommon.CPF,
		Phone:        userCommon.Phone,
		AvatarURL:    userCommon.AvatarURL,
		CreatedAt:    userCommon.CreatedAt,
		UpdatedAt:    userCommon.UpdatedAt,
	}
	// Verifica senha atual
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword))
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "WRONG_PASSWORD", "Senha atual incorreta.", nil)
		return
	}
	// Gera hash da nova senha
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "HASH_ERROR", "Failed to hash password.", err.Error())
		return
	}
	err = UpdateUserPassword(user.ID, string(hashed))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "UPDATE_FAIL", "Could not update password.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"message": "Senha alterada com sucesso!"}, "Password changed successfully.")
}
