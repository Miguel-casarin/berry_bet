package utils

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("[PANIC] %v | path: %s | method: %s", rec, c.Request.URL.Path, c.Request.Method)
				RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred.", rec)
				c.Abort()
			}
		}()
		c.Next()
		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				log.Printf("[HANDLER ERROR] %v | path: %s | method: %s", e.Err, c.Request.URL.Path, c.Request.Method)
			}
			RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred.", c.Errors.String())
			c.Abort()
		}
	}
}
