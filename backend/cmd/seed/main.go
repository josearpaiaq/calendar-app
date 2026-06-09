package main

import (
	"calendar-app/backend/config"
	"calendar-app/backend/database"
	"calendar-app/backend/models"
	"log"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load("../../backend/.env"); err != nil {
		if err2 := godotenv.Load(".env"); err2 != nil {
			log.Println("no .env file found, using system env")
		}
	}

	database.Connect()

		password := config.GetEnv("SEED_USER_PASSWORD", "")
		if password == "" {
			log.Fatal("SEED_USER_PASSWORD is required")
		}

    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        log.Fatal(err)
    }

		email := config.GetEnv("SEED_USER_EMAIL", "")
		if email == "" {
			log.Fatal("SEED_USER_EMAIL is required")
		}

    user := models.User{
        ID:           uuid.NewString(),
        Name:         "Test User",
        Email:        email,
        PasswordHash: string(hash),
    }

    if err := database.DB.Create(&user).Error; err != nil {
        log.Fatal("seed failed:", err)
    }

    log.Println("user created:", user.Email)
}
