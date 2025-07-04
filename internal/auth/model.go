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
		"SELECT id, username, name, email, password_hash, cpf, phone, date_birth, avatar_url, created_at, updated_at FROM users WHERE username = ? OR email = ?",
		identifier, identifier,
	)
	var user users.User
	var avatar sql.NullString
	var dateBirth sql.NullString
	err := row.Scan(&user.ID, &user.Username, &user.Name, &user.Email, &user.PasswordHash, &user.CPF, &user.Phone, &dateBirth, &avatar, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if avatar.Valid {
		user.AvatarURL = avatar.String
	}
	if dateBirth.Valid {
		user.DateBirth = dateBirth.String
	}
	return &user, nil
}

// CreateUser cria um novo usuário após validação básica dos dados.
func CreateUser(username, name, email, password, cpf, phone, dateBirth string) error {
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
		Name:         name,
		Email:        email,
		PasswordHash: string(hashed),
		CPF:          cpf,
		Phone:        phone,
		DateBirth:    dateBirth,
	}
	_, err = users.AddUser(newUser)
	return err
}
