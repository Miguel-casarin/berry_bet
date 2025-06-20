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

	err = CheckPassword(user.PasswordHash, creds.Password)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid username or password.", nil)
		return
	}

	token, err := GenerateJWT(user.Username)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "JWT_ERROR", "Could not generate token.", err.Error())
		return
	}
	utils.RespondSuccess(c, gin.H{"token": token}, "Login successful")
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
		c.Set("username", claims.Username)
		c.Next()
	}
}
