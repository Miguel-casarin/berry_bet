package roleta

import (
	"berry_bet/config"
	"berry_bet/internal/user_stats"
	"fmt"
	"strconv"
)

// Conagem de ganhos e percas
func Update_wins_losses(userID int64, ganhou bool) int {
	stats, err := user_stats.GetUserStatsByID(strconv.FormatInt(userID, 10))
	if err != nil {
		return int(stats.TotalLosses)
	}
	if ganhou {
		stats.TotalWins++
	} else {
		stats.TotalLosses++
	}
	_, _ = user_stats.UpdateUserStats(stats, stats.ID)
	return int(stats.TotalLosses)
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

// Atualiza o total de apostas do usuário
func UpdateUserTotalBets(userID int64, totalBets int64) error {
	stmt, err := config.DB.Prepare("UPDATE user_stats SET total_bets = ?, updated_at = datetime('now') WHERE user_id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(totalBets, userID)
	return err
}


// Atualiza o lucro do usuário
func UpdateUserTotalProfit(userID int64, totalProfit float64) error {
	stmt, err := config.DB.Prepare("UPDATE user_stats SET total_profit = ?, updated_at = datetime('now') WHERE user_id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(totalProfit, userID)
	return err
}

// criar uma struct para guardar os resultados
type Dados_rodadas struct {
	valor_aposta      float64
	historical_value  float64
	loser_count       int
	statistical_loser int
	limit             float64
	victory           int
	cartinha_sorteada *cartinha
	tatal_apostas     int64
	tatal_vitorias    int64
	lucro             float64
}

func Start(userID int64, valor_aposta float64) float64 {
	valor_aposta = valor_aposta + Randon_inicial(valor_aposta)
	_ = Update_wins_losses(userID, true)
	user_stats.IncrementUserTotalBets(userID)
	return valor_aposta
}

func Final(userID int64, valor_aposta float64) Dados_rodadas {
	stats, err := user_stats.GetUserStatsByID(strconv.FormatInt(userID, 10))
	if err != nil {
		return Dados_rodadas{}
	}

	aposta, err := Value_aport(userID, valor_aposta)
	if err != nil {
		return Dados_rodadas{}
	}

	data := Dados_rodadas{
		valor_aposta:      aposta,
		historical_value:  stats.TotalAmountBet,
		loser_count:       0, // local
		statistical_loser: int(stats.TotalLosses),
		limit:             1000.00,
		victory:           0, // local
		cartinha_sorteada: nil,
		tatal_apostas:     stats.TotalBets,
		tatal_vitorias:    stats.TotalWins,
		lucro:             stats.TotalProfit,
	}

	if Randon_fdp() {
		new_value, carta := op_valor(data.valor_aposta)
		data.valor_aposta += new_value
		data.historical_value += Count_money(data.historical_value, data.valor_aposta)
		data.victory++
		data.cartinha_sorteada = carta

		novoStatisticalLoser := Update_wins_losses(userID, true)
		data.statistical_loser = novoStatisticalLoser
		user_stats.IncrementUserTotalBets(userID)
	} else {
		data.valor_aposta = 0
		data.historical_value += Count_money(data.historical_value, data.valor_aposta)
		data.loser_count = Loser_count(data.loser_count)
		data.victory = 0

		perca := Perca
		data.cartinha_sorteada = &perca

		novoStatisticalLoser := Update_wins_losses(userID, false)
		data.statistical_loser = novoStatisticalLoser
		user_stats.IncrementUserTotalBets(userID)
	}

	if data.loser_count == 3 {
		data.valor_aposta = Give_low(data.valor_aposta)
		data.statistical_loser += Statistical_loser(data.loser_count)
		data.loser_count = 0

		miseria := Miseria
		data.cartinha_sorteada = &miseria

		user_stats.IncrementUserTotalBets(userID)
	}

	if data.historical_value >= data.limit {
		Governo(data.valor_aposta)
		user_stats.IncrementUserTotalBets(userID)

		// Exemplo: se considera "ganho" ao atingir o limite
		miseria := Miseria
		data.cartinha_sorteada = &miseria
	} else {
		// Aqui você pode colocar a condição de perda, se houver
		perca := Perca
		data.cartinha_sorteada = &perca
	}

	if data.victory >= 5 {
		Governo(data.valor_aposta)
		user_stats.IncrementUserTotalBets(userID)

		miseria := Miseria
		data.cartinha_sorteada = &miseria
	} else {
		// Aqui você pode colocar a condição de perda, se houver
		perca := Perca
		data.cartinha_sorteada = &perca
	}

	return data
}

func ExecutaRoleta(userID int64, valor_aposta float64) interface{} {
	stats, err := user_stats.GetUserStatsByID(strconv.FormatInt(userID, 10))
	if err != nil {
		// Trate o erro conforme necessário
		return nil
	}

	if stats.TotalBets < 3 {
		// Executa Start
		resultado := Start(userID, valor_aposta)
		return resultado
	} else {
		// Executa Final
		resultado := Final(userID, valor_aposta)
		return resultado
	}
}
