package main

import (
	"fmt"
	"math/rand"
	"time"
)

type cartinha string

const (
	Cinco   cartinha = "cinco"
	Dez     cartinha = "dez"
	Vinte   cartinha = "vinte"
	Master  cartinha = "master"
	Miseria cartinha = "miseria"
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

func cartinha_aleatoria() cartinha {
	numero_cartinha := rand.Intn(99) + 1
	if EhPrimo(numero_cartinha) {
		if numero_cartinha <= 90 && numero_cartinha > 70 {
			return Cinco
		}
		if numero_cartinha <= 70 && numero_cartinha > 50 {
			return Dez
		}
		if numero_cartinha <= 50 && numero_cartinha > 10 {
			return Vinte
		}
		if numero_cartinha <= 10 {
			return Master
		}
	}
	return Miseria
}

// cálculo da porcentagem para o multiplicador
func Porcentagem(porcentagem, valor float64) float64 {
	return (porcentagem / 100) * valor
}

func op_valor(salddo float64) float64 {
	if Randon_fdp() {
		carta := cartinha_aleatoria()
		var resultado float64

		switch carta {
		case Miseria:
			resultado = Porcentagem(0.5, salddo)
		case Cinco:
			resultado = Porcentagem(5, salddo)
		case Dez:
			resultado = Porcentagem(10, salddo)
		case Vinte:
			resultado = Porcentagem(20, salddo)
		case Master:
			resultado = Porcentagem(70, salddo)
		}

		fmt.Printf("Cartinha: %s -> Ganhou R$ %.2f\n", carta, resultado)
		return resultado
	} else {
		fmt.Print("Foi jogar no Vasco\n")
		return 0
	}
}

func Randon_inicial(saldo float64) float64 {
	var numero_inicial int = 0
	var resultado float64

	for numero_inicial <= 6 {
		if numero_inicial == 1 || EhPrimo(numero_inicial) {
			fmt.Printf("Ganhou -> numero %d\n", numero_inicial)
			resultado += Porcentagem(10, saldo)
		}
		numero_inicial++
	}
	return resultado
}

func Randon_fdp() bool {
	numero_a := rand.Intn(99) + 1
	max := 100
	numero_b := rand.Intn(max-numero_a+1) + numero_a

	if EhPrimo(numero_b) {
		fmt.Printf("Ganhou -> numero %d\n", numero_b)
		return true
	} else {
		fmt.Printf("NAO ganhou -> numero %d\n", numero_b)
		return false
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())
	saldo := 100.0

	fmt.Println("Rodada inicial")
	ganho_inicial := Randon_inicial(saldo)
	saldo += ganho_inicial
	fmt.Printf("Ganho da rodada inicial: R$ %.2f\n", ganho_inicial)
	fmt.Printf("Saldo após rodada inicial: R$ %.2f\n", saldo)

	fmt.Println("Rodada FDP")
	ganho_fdp := op_valor(saldo)
	saldo += ganho_fdp
	fmt.Printf("Ganho da rodada FDP: R$ %.2f\n", ganho_fdp)

	fmt.Printf("Saldo final: R$ %.2f\n", saldo)
}
