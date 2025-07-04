package roleta

import (
	"fmt"
	"math/rand"
)

type cartinha string

const (
	Cinco   cartinha = "cinco"
	Dez     cartinha = "dez"
	Vinte   cartinha = "vinte"
	Master  cartinha = "master"
	Miseria cartinha = "miseria"
	Perca   cartinha = "perca"
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
		} else if numero_cartinha <= 70 && numero_cartinha > 50 {
			return Dez
		} else if numero_cartinha <= 50 && numero_cartinha > 10 {
			return Vinte
		} else if numero_cartinha <= 10 {
			return Master
		} else {
			return Miseria
		}
	} else {
		return Perca
	}
}

// cálculo da porcentagem para o multiplicador
func Porcentagem(porcentagem, valor float64) float64 {
	return (porcentagem / 100) * valor
}

func op_valor(salddo float64) (float64, *cartinha) {
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
		return resultado, &carta
	} else {
		return 0, nil
	}
}

func Give_low(saldo_aposta float64) float64 {
	var resultado float64 = saldo_aposta + Porcentagem(0.5, saldo_aposta)
	return resultado
}

func Governo(saldo_aposta float64) float64 {
	numero := rand.Intn(99) + 1
	if EhPrimo(numero) && numero <= 5 {
		saldo_aposta = saldo_aposta + Give_low(saldo_aposta)
		return saldo_aposta
	} else {
		return 0
	}
}

func Randon_inicial(saldo float64) float64 {
	var numero_inicial int = 0
	var resultado float64

	for numero_inicial <= 3 {
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

// GovernoChance: função para quando o saldo é >= 1000, chances muito baixas de ganhar
func GovernoChance() bool {
	// Apenas 2% de chance de ganhar quando o governo interfere
	numero := rand.Intn(100) + 1
	return numero <= 2
}

// DeveGanhar: lógica normal de jogo, com chances balanceadas
func DeveGanhar() bool {
	// Aproximadamente 35% de chance de ganhar na lógica normal
	numero := rand.Intn(100) + 1
	return numero <= 35
}
