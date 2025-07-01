package main

import (
	"berry_bet/internal/games/roleta"
	"fmt"
)

func main() {
	// Simule um userID válido cadastrado no banco
	var userID int64 = 1

	// Valor da aposta para o teste
	valorAposta := 50.0

	fmt.Println("=== Teste da função Start ===")
	resultadoStart := roleta.Start(userID, valorAposta)
	fmt.Printf("Resultado Start: %.2f\n", resultadoStart)

	fmt.Println("\n=== Teste da função Final ===")
	resultadoFinal := roleta.Final(userID, valorAposta)
	fmt.Printf("Resultado Final: %+v\n", resultadoFinal)

	fmt.Println("\n=== Teste da função ExecutaRoleta ===")
	resultadoExec := roleta.ExecutaRoleta(userID, valorAposta)
	fmt.Printf("Resultado ExecutaRoleta: %+v\n", resultadoExec)
}
