package urubu

import (
	"berry_bet/config"
	"berry_bet/internal/user_stats"
	"fmt"
	"math/rand"
)

func Sorteio() int {
	numero := rand.Intn(99) + 1
	return numero
}

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

var tabelaTrading = map[int]int{
	200: 2000,
	250: 2500,
	300: 3000,
	350: 3500,
	400: 4000,
	500: 5000,
}

func Retorno(valor int) (int, bool) {
	retorno, ok := tabelaTrading[valor]
	return retorno, ok
}

// ATENÇÃO: Função para atualizar o saldo do usuário no banco de dados
func UpdateUserBalance(userID int64, newBalance float64) error {
	stmt, err := config.DB.Prepare("UPDATE user_stats SET balance = ?, updated_at = datetime('now') WHERE user_id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newBalance, userID)
	return err
}

// Função para obter o saldo atual do usuário (OK)
func Get_Saldo_Atual(userID int64) (float64, error) {
	return user_stats.GetUserBalance(userID)
}

// Função para incrementar (ou decrementar) o saldo do usuário no banco de dados
func Inclement_amount(userID int64, valor float64) (float64, error) {
	balance, err := user_stats.GetUserBalance(userID)
	if err != nil {
		return 0, err
	}
	new_balance := balance + valor
	// >>> ALTERAÇÃO: Agora salva o novo saldo no banco <<<
	err = UpdateUserBalance(userID, new_balance)
	if err != nil {
		return 0, err
	}
	return new_balance, nil
}

// Função para debitar o valor da aposta do saldo do usuário no banco de dados
func Value_aport(userID int64, valor float64) (float64, error) {
	balance, err := user_stats.GetUserBalance(userID)
	if err != nil {
		return 0, err
	}
	if balance < valor {
		return 0, fmt.Errorf("saldo insuficiente")
	}
	new_balance := balance - valor
	// >>> ALTERAÇÃO: Agora salva o novo saldo no banco <<<
	err = UpdateUserBalance(userID, new_balance)
	if err != nil {
		return 0, err
	}
	return valor, nil
}

// Função principal do jogo Urubu do Pix
func JogadaUrubu(userID int64, valor int) (int, error) {
	// Debita o valor da aposta do saldo do usuário
	_, err := Value_aport(userID, float64(valor))
	if err != nil {
		return 0, err
	}

	numero := Sorteio()
	if EhPrimo(numero) && numero <= 5 {
		// Se for primo, retorna o prêmio correspondente
		premio, ok := Retorno(valor)
		if !ok {
			return 0, fmt.Errorf("valor de aposta inválido")
		}
		// Credita o prêmio no saldo do usuário
		_, err := Inclement_amount(userID, float64(premio))
		if err != nil {
			return 0, err
		}
		return premio, nil
	} else {
		// Não ganhou nada
		return 0, nil
	}
}
