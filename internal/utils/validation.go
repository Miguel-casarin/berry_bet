package utils

import (
	"regexp"
	"strconv"
	"time"
)

// IsValidEmail validates the format of an email.
func IsValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

// IsValidPhone validates the format of a Brazilian phone number.
func IsValidPhone(phone string) bool {
	re := regexp.MustCompile(`^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$`)
	return re.MatchString(phone)
}

// IsValidCPF validates the format and check digits of a CPF.
func IsValidCPF(cpf string) bool {
	re := regexp.MustCompile(`^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$`)
	if !re.MatchString(cpf) {
		return false
	}
	clean := regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")
	if len(clean) != 11 {
		return false
	}
	for i := 1; i < 11; i++ {
		if clean[i] != clean[0] {
			goto calc
		}
	}
	return false
calc:
	for t := 9; t < 11; t++ {
		d := 0
		for i := 0; i < t; i++ {
			num, _ := strconv.Atoi(string(clean[i]))
			d += num * (t + 1 - i)
		}
		d = ((10 * d) % 11) % 10
		if d != int(clean[t]-'0') {
			return false
		}
	}
	return true
}

// IsValidDate validates the YYYY-MM-DD format.
func IsValidDate(dateStr string) bool {
	_, err := time.Parse("2006-01-02", dateStr)
	return err == nil
}
