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

// Função auxiliar para lidar com avatar_url nulo
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

// Busca os usuários do banco de dados, limitando o número de resultados retornados

func GetUsers(count int) ([]User, error) {
	rows, err := config.DB.Query("SELECT id, username, name, email, password_hash, cpf, phone, date_birth, avatar_url, created_at, updated_at FROM users LIMIT ?", count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]User, 0)

	for rows.Next() {
		u, err := scanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}
	return users, nil
}

// Busca um usuário pelo ID no banco de dados

func GetUserByID(id string) (User, error) {
	stmt, err := config.DB.Prepare("SELECT id, username, name, email, password_hash, cpf, phone, date_birth, avatar_url, created_at, updated_at FROM users WHERE id = ?")
	if err != nil {
		return User{}, err
	}
	defer stmt.Close()
	row := stmt.QueryRow(id)
	return scanUser(row)
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
	stmt, err := config.DB.Prepare("INSERT INTO users (username, name, email, password_hash, cpf, phone, date_birth, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))")
	if err != nil {
		tx.Rollback()
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newUser.Username, newUser.Name, newUser.Email, newUser.PasswordHash, newUser.CPF, newUser.Phone, newUser.DateBirth, newUser.AvatarURL)
	if err != nil {
		tx.Rollback()
		return false, err
	}

	// Recupera o ID do usuário recém-criado
	var userID int64
	row := tx.QueryRow("SELECT id FROM users WHERE username = ?", newUser.Username)
	err = row.Scan(&userID)
	if err != nil {
		tx.Rollback()
		return false, err
	}

	// Cria registro em user_stats para o novo usuário
	_, err = tx.Exec(`INSERT INTO user_stats (user_id, total_bets, total_wins, total_losses, total_amount_bet, total_profit, balance, created_at, updated_at) VALUES (?, 0, 0, 0, 0.0, 0.0, 0.0, datetime('now'), datetime('now'))`, userID)
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
	stmt, err := config.DB.Prepare("UPDATE users SET username = ?, name = ?, email = ?, password_hash = ?, cpf = ?, phone = ?, date_birth = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?")
	if err != nil {
		tx.Rollback()
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(ourUser.Username, ourUser.Name, ourUser.Email, ourUser.PasswordHash, ourUser.CPF, ourUser.Phone, ourUser.DateBirth, ourUser.AvatarURL, id)
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
// GetUserByUsername moved to internal/common/user_lookup.go to break import cycle

// GetUserByEmail busca um usuário pelo email
func GetUserByEmail(email string) (*User, error) {
	row := config.DB.QueryRow(`
		SELECT id, username, email, password_hash, cpf, phone, avatar_url, created_at, updated_at 
		FROM users 
		WHERE email = ?`, email)

	u, err := scanUser(row)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
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

// UpdateUserBalance atualiza apenas o saldo do usuário em user_stats
func UpdateUserBalance(userID int64, newBalance float64) error {
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
			   UPDATE user_stats 
			   SET balance = ?, updated_at = datetime('now') 
			   WHERE user_id = ?`, newBalance, userID)

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
