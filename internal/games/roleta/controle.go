package main

import (
	"fmt"
)

func Get_value() float64 {
	var value float64 = 0
	fmt.Print("Entre com seu valor:")
	fmt.Scan(&value)
	return value
}

// função para atualizar a quantidade de percas
func Loser_count(value int) int {
	return value + 1
}

func Statistical_loser(old_value int) int {
	return old_value + 1
}

// conta o total já gasto
func Count_money(spent, saldo float64) float64 {
	return spent + saldo
}
