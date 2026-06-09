package main

import (
	"log"
	"net/http"
	"strings"

	"calendar-app/backend/config"
	"calendar-app/backend/database"
	"calendar-app/backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func buildCORSConfig() cors.Config {
	raw := config.GetEnv("CORS_ORIGINS", "*")
	if strings.TrimSpace(raw) == "*" {
		return cors.Config{
			AllowAllOrigins: true,
			AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:    []string{"Origin", "Content-Type", "Accept", "Authorization"},
		}
	}

	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	database.Connect()

	r := gin.Default()

	r.Use(cors.New(buildCORSConfig()))

	uploadsDir := config.GetEnv("UPLOADS_DIR", "./uploads")
	r.Static("/uploads", uploadsDir)

	routes.Register(r)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	port := config.GetEnv("PORT", "8080")
	log.Printf("Server running on :%s\n", port)
	r.Run(":" + port)
}
