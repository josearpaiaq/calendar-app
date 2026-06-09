package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"calendar-app/backend/database"
	"calendar-app/backend/models"

	"github.com/gin-gonic/gin"
)

var validMonths = map[string]bool{
	"01": true, "02": true, "03": true, "04": true,
	"05": true, "06": true, "07": true, "08": true,
	"09": true, "10": true, "11": true, "12": true,
}

func RegisterSettingsRoutes(rg *gin.RouterGroup) {
	settings := rg.Group("/settings")
	settings.GET("/months", GetMonthSettings)
	settings.PUT("/months/:month", UpdateMonthSetting)
}

func GetMonthSettings(c *gin.Context) {
	var records []models.MonthSetting
	if err := database.DB.Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	byMonth := make(map[string]models.MonthSetting, len(records))
	for _, r := range records {
		byMonth[r.Month] = r
	}

	months := []string{"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"}
	result := make([]models.MonthSetting, 12)
	for i, m := range months {
		if s, ok := byMonth[m]; ok {
			result[i] = s
		} else {
			result[i] = models.MonthSetting{Month: m}
		}
	}

	c.JSON(http.StatusOK, result)
}

func UpdateMonthSetting(c *gin.Context) {
	fmt.Println(c.Request.Form)
	month := c.Param("month")
	if !validMonths[month] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid month, must be 01–12"})
		return
	}

	var setting models.MonthSetting
	database.DB.FirstOrInit(&setting, models.MonthSetting{Month: month})

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file is required"})
		return
	}
	defer file.Close()

	if setting.ImagePath != "" {
		_ = os.Remove(filepath.Join(uploadsDir, filepath.Base(setting.ImagePath)))
	}

	imagePath, err := saveImage(file, header.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image"})
		return
	}
	setting.ImagePath = imagePath

	if err := database.DB.Save(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, setting)
}
