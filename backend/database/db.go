package database

import (
	"fmt"
	"log"

	"calendar-app/backend/config"
	"calendar-app/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		config.GetEnv("DB_HOST", "localhost"),
		config.GetEnv("DB_USER", ""),
		config.GetEnv("DB_PASSWORD", ""),
		config.GetEnv("DB_NAME", "calendardb"),
		config.GetEnv("DB_PORT", "5432"),
		config.GetEnv("DB_SSLMODE", "disable"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&models.Event{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Printf("Database connected: %s@%s/%s\n",
		config.GetEnv("DB_USER", ""),
		config.GetEnv("DB_HOST", "localhost"),
		config.GetEnv("DB_NAME", "calendardb"),
	)
}
