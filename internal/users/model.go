package users

import (
	"berry_bet/config"
	"database/sql"
	"errors"
	"strings"
)

type User struct {
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
	CPF          string `json:"cpf"`
	Phone        string `json:"phone"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// Busca os usuários do banco de dados, limitando o número de resultados retornados

func GetUsers(count int) ([]User, error) {
	rows, err := config.DB.Query("SELECT id, username, email, password_hash, cpf, phone, created_at, updated_at FROM users LIMIT ?", count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]User, 0)

	for rows.Next() {
		singleUser := User{}
		err := rows.Scan(&singleUser.ID, &singleUser.Username, &singleUser.Email, &singleUser.PasswordHash, &singleUser.CPF, &singleUser.Phone, &singleUser.CreatedAt, &singleUser.UpdatedAt)

		if err != nil {
			return nil, err
		}
		users = append(users, singleUser)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return users, nil
}

// Busca um usuário pelo ID no banco de dados

func GetUserByID(id string) (User, error) {
	stmt, err := config.DB.Prepare("SELECT id, username, email, password_hash, cpf, phone, created_at, updated_at FROM users WHERE id = ?")

	if err != nil {
		return User{}, err
	}

	user := User{}

	sqlErr := stmt.QueryRow(id).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.CPF, &user.Phone, &user.CreatedAt, &user.UpdatedAt)

	if sqlErr != nil {
		if sqlErr == sql.ErrNoRows {
			return User{}, nil
		}
		return User{}, sqlErr
	}
	return user, nil
}

// AddUser adiciona um novo usuário ao banco de dados após validação dos dados.
func AddUser(newUser User) (bool, error) {
	if len(newUser.Username) < 3 {
		return false, errors.New("username must have at least 3 characters")
	}
	if len(newUser.Email) < 5 || !strings.Contains(newUser.Email, "@") {
		return false, errors.New("invalid email")
	}
	if len(newUser.PasswordHash) < 6 {
		return false, errors.New("invalid password hash")
	}
	tx, err := config.DB.Begin()
	if err != nil {
		return false, err
	}
	stmt, err := config.DB.Prepare("INSERT INTO users (username, email, password_hash, cpf, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))")
	if err != nil {
		tx.Rollback()
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newUser.Username, newUser.Email, newUser.PasswordHash, newUser.CPF, newUser.Phone)
	if err != nil {
		tx.Rollback()
		return false, err
	}
	err = tx.Commit()
	if err != nil {
		return false, err
	}
	return true, nil
}

// UpdateUser atualiza um usuário existente após validação dos dados.
func UpdateUser(ourUser User, id int64) (bool, error) {
	if len(ourUser.Username) < 3 {
		return false, errors.New("username deve ter pelo menos 3 caracteres")
	}
	if len(ourUser.Email) < 5 || !strings.Contains(ourUser.Email, "@") {
		return false, errors.New("email inválido")
	}
	if len(ourUser.PasswordHash) < 6 {
		return false, errors.New("hash da senha inválido")
	}
	tx, err := config.DB.Begin()
	if err != nil {
		return false, err
	}
	stmt, err := config.DB.Prepare("UPDATE users SET username = ?, email = ?, password_hash = ?, cpf = ?, phone = ?, updated_at = datetime('now') WHERE id = ?")
	if err != nil {
		tx.Rollback()
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(ourUser.Username, ourUser.Email, ourUser.PasswordHash, ourUser.CPF, ourUser.Phone, id)
	if err != nil {
		tx.Rollback()
		return false, err
	}
	err = tx.Commit()
	if err != nil {
		return false, err
	}
	return true, nil
}

// DeleteUser remove um usuário do banco de dados pelo ID.
func DeleteUser(userId int) (bool, error) {
	tx, err := config.DB.Begin()
	if err != nil {
		return false, err
	}
	stmt, err := config.DB.Prepare("DELETE FROM users WHERE id = ?")
	if err != nil {
		tx.Rollback()
		return false, err
	}
	_, err = stmt.Exec(userId)
	if err != nil {
		tx.Rollback()
		return false, err
	}
	err = tx.Commit()
	if err != nil {
		return false, err
	}
	return true, nil
}

// GetUserByUsername busca um usuário pelo username
func GetUserByUsername(username string) (*User, error) {
	row := config.DB.QueryRow(`
		SELECT id, username, email, password_hash, cpf, phone, created_at, updated_at 
		FROM users 
		WHERE username = ?`, username)

	var user User
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.CPF, &user.Phone, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUserByEmail busca um usuário pelo email
func GetUserByEmail(email string) (*User, error) {
	row := config.DB.QueryRow(`
		SELECT id, username, email, password_hash, cpf, phone, created_at, updated_at 
		FROM users 
		WHERE email = ?`, email)

	var user User
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.CPF, &user.Phone, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// UpdateUserPassword atualiza apenas a senha de um usuário
func UpdateUserPassword(userID int64, newPasswordHash string) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	_, err = tx.Exec(`
		UPDATE users 
		SET password_hash = ?, updated_at = datetime('now') 
		WHERE id = ?`, newPasswordHash, userID)

	if err != nil {
		return err
	}

	return tx.Commit()
}

// CheckUserExists verifica se um usuário existe por username ou email
func CheckUserExists(username, email string) (bool, error) {
	var count int
	err := config.DB.QueryRow(`
		SELECT COUNT(*) 
		FROM users 
		WHERE username = ? OR email = ?`, username, email).Scan(&count)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}
