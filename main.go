package main

import (
	"berry_bet/db"
)

func main() {
	db.InitDB("data/database.db")
}