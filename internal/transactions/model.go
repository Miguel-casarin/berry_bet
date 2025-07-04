package transactions

import (
	"berry_bet/config"
	"errors"
)

type Transaction struct {
	ID          int64   `json:"id"`
	UserID      int64   `json:"user_id"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	CreatedAt   string  `json:"created_at"`
}

func GetTransactions(count int) ([]Transaction, error) {
	rows, err := config.DB.Query("SELECT id, user_id, type, amount, description, created_at FROM transactions LIMIT ?", count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	transactions := make([]Transaction, 0)
	for rows.Next() {
		var t Transaction
		err := rows.Scan(&t.ID, &t.UserID, &t.Type, &t.Amount, &t.Description, &t.CreatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}
	return transactions, nil
}

func GetTransactionByID(id string) (Transaction, error) {
	stmt, err := config.DB.Prepare("SELECT id, user_id, type, amount, description, created_at FROM transactions WHERE id = ?")
	if err != nil {
		return Transaction{}, err
	}
	defer stmt.Close()
	var t Transaction
	sqlErr := stmt.QueryRow(id).Scan(&t.ID, &t.UserID, &t.Type, &t.Amount, &t.Description, &t.CreatedAt)
	if sqlErr != nil {
		return Transaction{}, sqlErr
	}
	return t, nil
}

// GetTransactionsByUserIDWithFilter returns transactions for a specific user with pagination and type filter
func GetTransactionsByUserIDWithFilter(userID int64, page, limit int, typeFilter string) ([]Transaction, error) {
	offset := (page - 1) * limit

	var query string
	var args []interface{}

	if typeFilter != "" {
		query = `
			SELECT id, user_id, type, amount, description, created_at 
			FROM transactions 
			WHERE user_id = ? AND type = ?
			ORDER BY created_at DESC 
			LIMIT ? OFFSET ?`
		args = []interface{}{userID, typeFilter, limit, offset}
	} else {
		query = `
			SELECT id, user_id, type, amount, description, created_at 
			FROM transactions 
			WHERE user_id = ? 
			ORDER BY created_at DESC 
			LIMIT ? OFFSET ?`
		args = []interface{}{userID, limit, offset}
	}

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	transactions := make([]Transaction, 0)
	for rows.Next() {
		var t Transaction
		err := rows.Scan(&t.ID, &t.UserID, &t.Type, &t.Amount, &t.Description, &t.CreatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}
	return transactions, nil
}

// GetTransactionsByUserID returns transactions for a specific user with pagination
func GetTransactionsByUserID(userID int64, page, limit int) ([]Transaction, error) {
	offset := (page - 1) * limit

	rows, err := config.DB.Query(`
		SELECT id, user_id, type, amount, description, created_at 
		FROM transactions 
		WHERE user_id = ? 
		ORDER BY created_at DESC 
		LIMIT ? OFFSET ?`,
		userID, limit, offset)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	transactions := make([]Transaction, 0)
	for rows.Next() {
		var t Transaction
		err := rows.Scan(&t.ID, &t.UserID, &t.Type, &t.Amount, &t.Description, &t.CreatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}
	return transactions, nil
}

// AddTransaction adiciona uma nova transação ao banco de dados após validação dos dados.
func AddTransaction(newT Transaction) (bool, error) {
	if newT.UserID <= 0 {
		return false, errors.New("invalid user id")
	}
	if newT.Type == "" {
		return false, errors.New("transaction type cannot be empty")
	}
	if newT.Amount == 0 {
		return false, errors.New("transaction amount cannot be zero")
	}
	stmt, err := config.DB.Prepare("INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newT.UserID, newT.Type, newT.Amount, newT.Description)
	if err != nil {
		return false, err
	}
	return true, nil
}

// UpdateTransaction atualiza uma transação existente após validação dos dados.
func UpdateTransaction(t Transaction, id int64) (bool, error) {
	if t.UserID <= 0 {
		return false, errors.New("user_id inválido")
	}
	if t.Type == "" {
		return false, errors.New("tipo da transação não pode ser vazio")
	}
	if t.Amount == 0 {
		return false, errors.New("valor da transação não pode ser zero")
	}
	stmt, err := config.DB.Prepare("UPDATE transactions SET user_id = ?, type = ?, amount = ?, description = ? WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(t.UserID, t.Type, t.Amount, t.Description, id)
	if err != nil {
		return false, err
	}
	return true, nil
}

// DeleteTransaction remove uma transação do banco de dados pelo ID.
func DeleteTransaction(transactionId int) (bool, error) {
	stmt, err := config.DB.Prepare("DELETE FROM transactions WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(transactionId)
	if err != nil {
		return false, err
	}
	return true, nil
}

// GetTransactionsByType busca transações por tipo
func GetTransactionsByType(transactionType string, limit int) ([]Transaction, error) {
	rows, err := config.DB.Query(`
		SELECT id, user_id, type, amount, description, created_at 
		FROM transactions 
		WHERE type = ? 
		ORDER BY created_at DESC 
		LIMIT ?`, transactionType, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	transactions := make([]Transaction, 0)
	for rows.Next() {
		var t Transaction
		err := rows.Scan(&t.ID, &t.UserID, &t.Type, &t.Amount, &t.Description, &t.CreatedAt)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}

	return transactions, rows.Err()
}

// CreateBetTransaction cria uma transação de aposta (debita do usuário)
func CreateBetTransaction(userID int64, amount float64, betID int64) error {
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
		INSERT INTO transactions (user_id, type, amount, description, created_at) 
		VALUES (?, 'bet', ?, ?, datetime('now'))`, userID, amount, "Bet #"+string(rune(betID)))

	if err != nil {
		return err
	}

	return tx.Commit()
}

// CreateWinTransaction cria uma transação de ganho (credita para o usuário)
func CreateWinTransaction(userID int64, amount float64, betID int64) error {
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
		INSERT INTO transactions (user_id, type, amount, description, created_at) 
		VALUES (?, 'win', ?, ?, datetime('now'))`, userID, amount, "Win from Bet #"+string(rune(betID)))

	if err != nil {
		return err
	}

	return tx.Commit()
}

// CreateDepositTransaction cria uma transação de depósito
func CreateDepositTransaction(userID int64, amount float64, description string) error {
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
		INSERT INTO transactions (user_id, type, amount, description, created_at) 
		VALUES (?, 'deposit', ?, ?, datetime('now'))`, userID, amount, description)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Atualiza o saldo do usuário em user_stats
	var currentBalance float64
	err = tx.QueryRow(`SELECT balance FROM user_stats WHERE user_id = ?`, userID).Scan(&currentBalance)
	if err != nil {
		tx.Rollback()
		return err
	}
	newBalance := currentBalance + amount
	_, err = tx.Exec(`UPDATE user_stats SET balance = ?, updated_at = datetime('now') WHERE user_id = ?`, newBalance, userID)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

// CreateWithdrawTransaction cria uma transação de saque
func CreateWithdrawTransaction(userID int64, amount float64, description string) error {
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
		INSERT INTO transactions (user_id, type, amount, description, created_at) 
		VALUES (?, 'withdraw', ?, ?, datetime('now'))`, userID, amount, description)

	if err != nil {
		return err
	}

	return tx.Commit()
}
