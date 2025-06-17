package main

import (
	"fmt"
)

var equity_value float64 = 0
var loser_count int = 0
var statistical_loser int = 0

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

func Statistical_loser(old_value, new_value int) int {
	return old_value + new_value
}

func main() {
	fmt.Print("Bem vindo ao Berry_bet\n")
	teste := Get_value()
	fmt.Print(teste)

}
