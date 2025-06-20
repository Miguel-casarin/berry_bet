package transactions

import (
	"berry_bet/config"
	"errors"
	"strconv"
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
	rows, err := config.DB.Query("SELECT id, user_id, type, amount, description, created_at FROM transactions LIMIT " + strconv.Itoa(count))
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
