package users

import (
	"berry_bet/config"
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
	Phone        string `json:"phone"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// Busca os usuários do banco de dados, limitando o número de resultados retornados

func GetUsers(count int) ([]User, error) {
	rows, err := config.DB.Query("SELECT id, username, email, password_hash, phone, created_at, updated_at FROM users LIMIT ?", count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]User, 0)

	for rows.Next() {
		singleUser := User{}
		err := rows.Scan(&singleUser.ID, &singleUser.Username, &singleUser.Email, &singleUser.PasswordHash, &singleUser.Phone, &singleUser.CreatedAt, &singleUser.UpdatedAt)

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
	stmt, err := config.DB.Prepare("SELECT id, username, email, password_hash, phone, created_at, updated_at FROM users WHERE id = ?")

	if err != nil {
		return User{}, err
	}

	user := User{}

	sqlErr := stmt.QueryRow(id).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.Phone, &user.CreatedAt, &user.UpdatedAt)

	if sqlErr != nil {
		if sqlErr == sql.ErrNoRows {
			return User{}, nil
		}
		return User{}, sqlErr
	}
	return user, nil
}

// Adiciona um novo usuário ao banco de dados

func AddUser(newUser User) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("INSERT INTO users (username, email, password_hash, phone, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))")

	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(newUser.Username, newUser.Email, newUser.PasswordHash, newUser.Phone)

	if err != nil {
		return false, err
	}

	tx.Commit()

	return true, nil
}

// Atualiza um usuário existente no banco de dados

func UpdateUser(ourUser User, id int64) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("UPDATE users SET username = ?, email = ?, password_hash = ?, phone = ?, updated_at = datetime('now') WHERE id = ?")

	if err != nil {
		return false, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(ourUser.Username, ourUser.Email, ourUser.PasswordHash, ourUser.Phone, id)

	if err != nil {
		return false, err
	}

	tx.Commit()

	return true, nil
}

// Deleta um usuário do banco de dados pelo ID

func DeleteUser(userId int) (bool, error) {
	tx, err := config.DB.Begin()

	if err != nil {
		return false, err
	}

	stmt, err := config.DB.Prepare("DELETE FROM users WHERE id = ?")

	if err != nil {
		return false, err
	}

	_, err = stmt.Exec(userId)
	if err != nil {
		return false, err
	}

	tx.Commit()
	return true, nil
}
