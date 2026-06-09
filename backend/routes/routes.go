package routes

import (
	"calendar-app/backend/handlers"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine) {
	api := r.Group("/api")
	handlers.RegisterEventRoutes(api)
	handlers.RegisterSettingsRoutes(api)
}
