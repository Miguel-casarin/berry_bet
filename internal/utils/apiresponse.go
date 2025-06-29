package utils

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

type APIResponse struct {
	Success bool      `json:"success"`
	Data    any       `json:"data,omitempty"`
	Error   *APIError `json:"error,omitempty"`
}

func RespondError(c *gin.Context, status int, code, message string, details any) {
	log.Printf("API error [%s]: %s | details: %v", code, message, details)
	c.JSON(status, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}

func RespondSuccess(c *gin.Context, data any, message string) {
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
	})
}
