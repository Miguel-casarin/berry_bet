package common

import (
	"berry_bet/config"
	"database/sql"
)

// User is a minimal struct for lookup (copied from users.User to avoid import cycle)
type User struct {
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
	CPF          string `json:"cpf"`
	Phone        string `json:"phone"`
	DateBirth    string `json:"date_birth"`
	AvatarURL    string `json:"avatar_url"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// GetUserByUsername fetches a user by username (moved from users/model.go to break import cycle)
func GetUserByUsername(username string) (*User, error) {
	row := config.DB.QueryRow(`
		SELECT id, username, name, email, password_hash, cpf, phone, date_birth, avatar_url, created_at, updated_at 
		FROM users 
		WHERE username = ?`, username)

	u, err := scanUser(row)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// scanUser is a copy of the helper from users/model.go, but only for this lookup
func scanUser(rows interface{ Scan(dest ...any) error }) (User, error) {
	var u User
	var avatar sql.NullString
	var dateBirth sql.NullString
	err := rows.Scan(&u.ID, &u.Username, &u.Name, &u.Email, &u.PasswordHash, &u.CPF, &u.Phone, &dateBirth, &avatar, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return u, err
	}
	if avatar.Valid {
		u.AvatarURL = avatar.String
	} else {
		u.AvatarURL = ""
	}
	if dateBirth.Valid {
		u.DateBirth = dateBirth.String
	} else {
		u.DateBirth = ""
	}
	return u, nil
}
