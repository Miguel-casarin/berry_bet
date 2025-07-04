package auth

import (
	"berry_bet/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func LoginHandler(c *gin.Context) {
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&creds); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request.", err.Error())
		return
	}

	user, err := GetUserByUsernameOrEmail(creds.Username)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch user.", err.Error())
		return
	}
	if user == nil {
		utils.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid username or password.", nil)
		return
	}

	err = utils.CheckPassword(user.PasswordHash, creds.Password)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid username or password.", nil)
		return
	}

	token, err := GenerateJWT(user.ID, user.Username)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "JWT_ERROR", "Could not generate token.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"token": token}, "Login successful")
}

func RegisterHandler(c *gin.Context) {
	var req struct {
		Username  string `json:"username"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		CPF       string `json:"cpf"`
		Phone     string `json:"phone"`
		DateBirth string `json:"date_birth"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request.", err.Error())
		return
	}
	if req.Username == "" || req.Name == "" || req.Email == "" || req.Password == "" || req.CPF == "" {
		utils.RespondError(c, http.StatusBadRequest, "MISSING_FIELDS", "Username, name, email, password and cpf are required.", nil)
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
	err := CreateUser(req.Username, req.Name, req.Email, req.Password, req.CPF, req.Phone, req.DateBirth)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "REGISTER_FAIL", "Could not register user.", err.Error())
		return
	}
	utils.RespondSuccess(c, nil, "User registered successfully.")
}

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		bearer := c.GetHeader("Authorization")
		if bearer == "" || len(bearer) < 8 {
			utils.RespondError(c, http.StatusUnauthorized, "MISSING_TOKEN", "Token not provided.", nil)
			c.Abort()
			return
		}
		tokenStr := bearer[7:]
		claims, err := ParseJWT(tokenStr)
		if err != nil {
			utils.RespondError(c, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid token.", err.Error())
			c.Abort()
			return
		}
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}
