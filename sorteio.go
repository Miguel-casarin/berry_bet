package main

import (
	"fmt"
	"math/rand"
)

func EhPrimo(n int) bool {
	if n < 2 {
		return false
	}

	for i := 2; i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}

	return true
}

func Randon_inicial() {
	// controle para nas 5 primeiras partidas ganhe muito
	var numero_inicial int = 0

	for numero_inicial <= 6 {
		if numero_inicial == 1 || EhPrimo(numero_inicial) {
			fmt.Printf("Ganhou -> numero %d\n", numero_inicial)
		}
		numero_inicial++
	}

}

func Randon_fdp() {
	numero_a := rand.Intn(100) // entre 0 e 99
	max := 100                 // limite superior desejado

	// Garante que numero_b >= numero_a
	numero_b := rand.Intn(max-numero_a+1) + numero_a

	if EhPrimo(numero_b) {
		fmt.Printf("Ganhou -> numero %d\n", numero_b)

	} else {
		fmt.Printf("NAO ganhou -> numero %d\n", numero_b)

	}

}

func main() {
	fmt.Print("Rodada inicial\n")
	Randon_inicial()
	fmt.Print("Rodada FDP\n")
	Randon_fdp()
}
