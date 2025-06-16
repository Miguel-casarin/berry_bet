package main

import (
	"log"
	"net/http"

	"berry_bet/internal/db"

	"github.com/gorilla/mux"
)

func main() {
	database, err := db.Open("data/database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	r := mux.NewRouter()
	http.Handle("/", r)
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Servidor rodando!"))
	})

	log.Println("Servidor rodando em :8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}
