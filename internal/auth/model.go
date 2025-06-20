package auth

import (
	"berry_bet/config"
	"berry_bet/internal/users"
	"database/sql"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// GetUserByUsernameOrEmail busca um usuário pelo username ou email.
func GetUserByUsernameOrEmail(identifier string) (*users.User, error) {
	row := config.DB.QueryRow(
		"SELECT id, username, email, password_hash, phone, created_at, updated_at FROM users WHERE username = ? OR email = ?",
		identifier, identifier,
	)
	var user users.User
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.Phone, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// CreateUser cria um novo usuário após validação básica dos dados.
func CreateUser(username, email, password, cpf, phone string) error {
	if len(username) < 3 {
		return errors.New("username deve ter pelo menos 3 caracteres")
	}
	if len(password) < 6 {
		return errors.New("senha deve ter pelo menos 6 caracteres")
	}
	if len(email) < 5 || !strings.Contains(email, "@") {
		return errors.New("email inválido")
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = config.DB.Exec(
		"INSERT INTO users (username, email, password_hash, cpf, phone) VALUES (?, ?, ?, ?, ?)",
		username, email, string(hashed), cpf, phone,
	)
	return err
}


