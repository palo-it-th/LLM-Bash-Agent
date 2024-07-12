package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

func main() {
	router := mux.NewRouter()

	db, err := sql.Open("postgres", "user:password@localhost/database")
	if err != nil {
		log.Fatal(err)
	}

	router.HandleFunc("/api/data/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]
		row := db.QueryRow("SELECT * FROM data WHERE id = '" + id + "'")
		var data struct {
			Message string
		}
		err := row.Scan(&data.Message)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(data)
	}).Methods("GET")

	log.Fatal(http.ListenAndServe("localhost:8080", router))
}
