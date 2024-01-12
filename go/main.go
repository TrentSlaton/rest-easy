package main

import (
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

var db *gorm.DB
var err error

type Todo struct {
	ID   uint   `json:"id"`
	Text string `json:"task"`
}

func main() {
	// Connect to SQLite database
	db, err = gorm.Open("sqlite3", "database.sqlite")
	if err != nil {
		panic("Failed to connect to database")
	}
	defer db.Close()

	// Migrate the schema
	db.AutoMigrate(&Todo{})

	// Initialize Gin router
	r := gin.Default()

	// Define CRUD endpoints
	r.GET("/todos", getTodos)
	r.GET("/todos/:id", getTodo)
	r.POST("/todos", createTodo)
	r.PUT("/todos/:id", updateTodo)
	r.DELETE("/todos/:id", deleteTodo)

	// Run the server
	r.Run(":8080")
}

// Handler functions
func getTodos(c *gin.Context) {
	var todos []Todo
	db.Find(&todos)

	c.JSON(200, todos)
}

func getTodo(c *gin.Context) {
	id := c.Params.ByName("id")
	var todo Todo
	if err := db.Where("id = ?", id).First(&todo).Error; err != nil {
		c.AbortWithStatus(404)
		return
	}

	c.JSON(200, todo)
}

func createTodo(c *gin.Context) {
	var todo Todo
	c.BindJSON(&todo)

	db.Create(&todo)
	c.JSON(200, todo)
}

func updateTodo(c *gin.Context) {
	id := c.Params.ByName("id")
	var todo Todo
	if err := db.Where("id = ?", id).First(&todo).Error; err != nil {
		c.AbortWithStatus(404)
		return
	}

	c.BindJSON(&todo)
	db.Save(&todo)
	c.JSON(200, todo)
}

func deleteTodo(c *gin.Context) {
	id := c.Params.ByName("id")
	var todo Todo
	if err := db.Where("id = ?", id).First(&todo).Error; err != nil {
		c.AbortWithStatus(404)
		return
	}

	db.Delete(&todo)
	c.JSON(200, gin.H{"id #" + id: "deleted"})
}
