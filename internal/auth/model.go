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
		return errors.New("username must have at least 3 characters")
	}
	if len(password) < 6 {
		return errors.New("password must have at least 6 characters")
	}
	if len(email) < 5 || !strings.Contains(email, "@") {
		return errors.New("invalid email")
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	newUser := users.User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hashed),
		CPF:          cpf,
		Phone:        phone,
	}
	_, err = users.AddUser(newUser)
	return err
}
