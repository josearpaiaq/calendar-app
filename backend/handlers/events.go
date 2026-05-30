package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"calendar-app/backend/database"
	"calendar-app/backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const uploadsDir = "./uploads"

func GetEvents(c *gin.Context) {
	month := c.Query("month") // format: YYYY-MM

	var events []models.Event
	query := database.DB

	if month != "" {
		query = query.Where("date LIKE ?", month+"%")
	}

	if err := query.Order("date, start_time").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}

func GetEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := database.DB.First(&event, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

func CreateEvent(c *gin.Context) {
	title := c.PostForm("title")
	description := c.PostForm("description")
	date := c.PostForm("date")
	startTime := c.PostForm("start_time")
	endTime := c.PostForm("end_time")
	color := c.PostForm("color")
	allDay := c.PostForm("all_day") == "true"

	if title == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and date are required"})
		return
	}

	if color == "" {
		color = "#3B82F6"
	}

	imagePath := ""
	file, header, err := c.Request.FormFile("image")
	if err == nil {
		defer file.Close()
		imagePath, err = saveImage(file, header.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}
	}

	event := models.Event{
		ID:          uuid.New().String(),
		Title:       title,
		Description: description,
		Date:        date,
		StartTime:   startTime,
		EndTime:     endTime,
		Color:       color,
		ImagePath:   imagePath,
		AllDay:      allDay,
	}

	if err := database.DB.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, event)
}

func UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := database.DB.First(&event, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	if title := c.PostForm("title"); title != "" {
		event.Title = title
	}
	event.Description = c.PostForm("description")
	if date := c.PostForm("date"); date != "" {
		event.Date = date
	}
	event.StartTime = c.PostForm("start_time")
	event.EndTime = c.PostForm("end_time")
	if color := c.PostForm("color"); color != "" {
		event.Color = color
	}
	event.AllDay = c.PostForm("all_day") == "true"

	file, header, err := c.Request.FormFile("image")
	if err == nil {
		defer file.Close()
		// Remove old image if exists
		if event.ImagePath != "" {
			_ = os.Remove(filepath.Join(uploadsDir, filepath.Base(event.ImagePath)))
		}
		imagePath, err := saveImage(file, header.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}
		event.ImagePath = imagePath
	}

	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, event)
}

func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := database.DB.First(&event, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	if event.ImagePath != "" {
		_ = os.Remove(filepath.Join(uploadsDir, filepath.Base(event.ImagePath)))
	}

	if err := database.DB.Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted"})
}

func saveImage(file io.Reader, originalName string) (string, error) {
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", err
	}

	ext := strings.ToLower(filepath.Ext(originalName))
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	destPath := filepath.Join(uploadsDir, filename)

	dst, err := os.Create(destPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}

	return "/uploads/" + filename, nil
}
