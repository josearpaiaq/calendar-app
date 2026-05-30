package main

import (
	"log"
	"net/http"
	"strings"

	"calendar-app/backend/config"
	"calendar-app/backend/database"
	"calendar-app/backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func getCORSOrigins() []string {
	raw := config.GetEnv("CORS_ORIGINS", "http://localhost:5173")
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	database.Connect()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     getCORSOrigins(),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	uploadsDir := config.GetEnv("UPLOADS_DIR", "./uploads")
	r.Static("/uploads", uploadsDir)

	api := r.Group("/api")
	{
		api.GET("/events", handlers.GetEvents)
		api.GET("/events/:id", handlers.GetEvent)
		api.POST("/events", handlers.CreateEvent)
		api.PUT("/events/:id", handlers.UpdateEvent)
		api.DELETE("/events/:id", handlers.DeleteEvent)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	port := config.GetEnv("PORT", "8080")
	log.Printf("Server running on :%s\n", port)
	r.Run(":" + port)
}
