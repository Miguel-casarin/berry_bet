package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Ocorreu um erro inesperado.", rec)
				c.Abort()
			}
		}()
		c.Next()
	}
}
