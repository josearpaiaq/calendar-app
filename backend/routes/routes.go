package routes

import (
	"calendar-app/backend/handlers"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine) {
	api := r.Group("/api")

	RegisterPublic(api)
	RegisterProtected(api)

}

func RegisterPublic(r *gin.RouterGroup) {
	public := r.Group("")
	handlers.RegisterAuthRoutes(public)
}

func RegisterProtected(r *gin.RouterGroup) {
	protected := r.Group("", handlers.AuthRequired())
	handlers.RegisterEventRoutes(protected)
	handlers.RegisterSettingsRoutes(protected)
}
