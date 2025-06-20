package transactions

type TransactionRequest struct {
	UserID      int64   `json:"user_id"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

type TransactionResponse struct {
	ID          int64   `json:"id"`
	UserID      int64   `json:"user_id"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	CreatedAt   string  `json:"created_at"`
}

func ToTransactionResponse(t *Transaction) TransactionResponse {
	return TransactionResponse{
		ID:          t.ID,
		UserID:      t.UserID,
		Type:        t.Type,
		Amount:      t.Amount,
		Description: t.Description,
		CreatedAt:   t.CreatedAt,
	}
}
