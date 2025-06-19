package auth

import (
	"berry_bet/config"
	"database/sql"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"`
	Phone        string `json:"phone"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

func GetUserByUsernameOrEmail(identifier string) (*User, error) {
	row := config.DB.QueryRow(
		"SELECT id, username, email, password_hash, phone, created_at, updated_at FROM users WHERE username = ? OR email = ?",
		identifier, identifier,
	)
	var user User
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.Phone, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateUser(username, email, password, phone string) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = config.DB.Exec(
		"INSERT INTO users (username, email, password_hash, phone) VALUES (?, ?, ?, ?)",
		username, email, string(hashed), phone,
	)
	return err
}

func CheckPassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}
