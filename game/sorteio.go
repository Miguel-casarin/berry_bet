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

func Cartinha_aleatoria() cartinha {
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

func Op_valor(salddo float64) float64 {

	carta := Cartinha_aleatoria()
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

}
func Give_low(saldo float64) float64 {
	var resultado float64 = saldo + Porcentagem(0.5, saldo)
	return resultado
}

func Haddad(saldo float64) float64 {
	numero := rand.Intn(99) + 1

	if EhPrimo(numero) && numero <= 5 {
		saldo = saldo + Give_low(saldo)
		return saldo
	} else {
		return 0
	}
}

func Randon_inicial(saldo float64) float64 {
	var numero_inicial int = 0
	var resultado float64

	// vou precisar verificar esse numero
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
