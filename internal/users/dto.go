package users

type UserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	CPF      string `json:"cpf"`
	Phone    string `json:"phone"`
}

type UserResponse struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	CPF      string `json:"cpf"`
	Phone    string `json:"phone"`
}

func ToUserResponse(u *User) UserResponse {
	return UserResponse{
		ID:       u.ID,
		Username: u.Username,
		Email:    u.Email,
		CPF:      u.CPF,
		Phone:    u.Phone,
	}
}
