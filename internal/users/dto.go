package users

// ToUserResponseWithBalance monta o UserResponse recebendo o saldo como argumento
func ToUserResponseWithBalance(u *User, balance float64) UserResponse {
	return UserResponse{
		ID:       u.ID,
		Username: u.Username,
		Email:    u.Email,
		CPF:      u.CPF,
		Phone:    u.Phone,
		Balance:  balance,
	}
}

type UserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	CPF      string `json:"cpf"`
	Phone    string `json:"phone"`
}

type UserResponse struct {
	ID       int64   `json:"id"`
	Username string  `json:"username"`
	Email    string  `json:"email"`
	CPF      string  `json:"cpf"`
	Phone    string  `json:"phone"`
	Balance  float64 `json:"balance"`
}

// ToUserResponse monta o UserResponse buscando o saldo em user_stats

// REMOVED: ToUserResponse. Use ToUserResponseWithBalance instead.
