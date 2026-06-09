package models

import "time"

type MonthSetting struct {
	Month     string    `json:"month" gorm:"primaryKey"` // "01"–"12"
	ImagePath string    `json:"image_path"`
	UpdatedAt time.Time `json:"updated_at"`
}
