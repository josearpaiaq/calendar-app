package models

import (
	"time"
)

type Event struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Date        string    `json:"date" gorm:"not null"` // format: YYYY-MM-DD
	StartTime   string    `json:"start_time"`           // format: HH:MM, empty = all day
	EndTime     string    `json:"end_time"`             // format: HH:MM
	Color       string    `json:"color" gorm:"default:'#3B82F6'"`
	ImagePath   string    `json:"image_path"`
	AllDay      bool      `json:"all_day" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
