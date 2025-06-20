package utils

import "golang.org/x/crypto/bcrypt"

func CheckPassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}
