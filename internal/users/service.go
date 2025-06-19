package users

import (
	"berry_bet/config"
	"errors"
	"regexp"
)

func ValidateUser(user User, plainPassword string) error {
	if user.Username == "" {
		return errors.New("username is required")
	}
	if len(user.Username) < 3 {
		return errors.New("username must be at least 3 characters long")
	}
	if user.Email == "" {
		return errors.New("email is required")
	}
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(user.Email) {
		return errors.New("invalid email format")
	}
	if plainPassword != "" && len(plainPassword) < 6 {
		return errors.New("password must be at least 6 characters long")
	}
	if user.Phone != "" {
		phoneRegex := regexp.MustCompile(`^\+?[0-9]{8,15}$`)
		if !phoneRegex.MatchString(user.Phone) {
			return errors.New("invalid phone number")
		}
	}
	if user.CPF == "" {
		return errors.New("cpf is required")
	}
	cpfRegex := regexp.MustCompile(`^[0-9]{11}$`)
	if !cpfRegex.MatchString(user.CPF) {
		return errors.New("invalid cpf format")
	}
	var count int
	err := config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", user.Username).Scan(&count)
	if err == nil && count > 0 {
		return errors.New("username is already taken")
	}
	err = config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", user.Email).Scan(&count)
	if err == nil && count > 0 {
		return errors.New("email is already taken")
	}
	err = config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE cpf = ?", user.CPF).Scan(&count)
	if err == nil && count > 0 {
		return errors.New("cpf is already taken")
	}
	return nil
}

func ValidateUserUpdate(user User, userID int64) error {
	if user.Username != "" {
		if len(user.Username) < 3 {
			return errors.New("username must be at least 3 characters long")
		}
		var count int
		err := config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?", user.Username, userID).Scan(&count)
		if err == nil && count > 0 {
			return errors.New("username is already taken")
		}
	}
	if user.Email != "" {
		emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
		if !emailRegex.MatchString(user.Email) {
			return errors.New("invalid email format")
		}
		var count int
		err := config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = ? AND id != ?", user.Email, userID).Scan(&count)
		if err == nil && count > 0 {
			return errors.New("email is already taken")
		}
	}
	if user.Phone != "" {
		phoneRegex := regexp.MustCompile(`^\+?[0-9]{8,15}$`)
		if !phoneRegex.MatchString(user.Phone) {
			return errors.New("invalid phone number")
		}
	}
	if user.CPF != "" {
		cpfRegex := regexp.MustCompile(`^[0-9]{11}$`)
		if !cpfRegex.MatchString(user.CPF) {
			return errors.New("invalid cpf format")
		}
		var count int
		err := config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE cpf = ? AND id != ?", user.CPF, userID).Scan(&count)
		if err == nil && count > 0 {
			return errors.New("cpf is already taken")
		}
	}
	return nil
}

func ValidatePasswordChange(newPassword, confirmPassword string) error {
	if len(newPassword) < 6 {
		return errors.New("password must be at least 6 characters long")
	}
	if newPassword != confirmPassword {
		return errors.New("passwords do not match")
	}
	return nil
}
