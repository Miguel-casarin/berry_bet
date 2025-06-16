package main

import (
	"berry_bet/internal/db"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	database, err := db.Open("data/database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	r := mux.NewRouter()
	// aqui você registra seus handlers
	http.Handle("/", r)

	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
