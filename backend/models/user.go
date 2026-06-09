package models

import "time"

type User struct {
	ID string `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"not null"`
	Email string `json:"email"`
	PasswordHash string `json:"password_hash"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}