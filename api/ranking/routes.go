package ranking

import (
	"github.com/gin-gonic/gin"
)

func RegisterRankingRoutes(router *gin.Engine) {
	router.GET("/api/ranking", GetRankingHandler)
}
