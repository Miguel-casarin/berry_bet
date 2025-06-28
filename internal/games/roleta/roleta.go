package roleta

import (
	"berry_bet/api/user_stats"
	"berry_bet/internal/user_stats"
	"fmt"
	"strconv"
)

// Conagem de ganhos e percas
func Update_wins_losses(userID int64, ganhou bool) error {
	stats, err := user_stats.GetUserStatsByID(strconv.FormatInt(userID, 10))
	if err != nil {
		return err
	}
	if ganhou {
		stats.TotalWins++
	} else {
		stats.TotalLosses++
	}
	_, err = user_stats.UpdateUserStats(stats, stats.ID)
	return err
}

func Get_Saldo_Atual(userID int64) (float64, error) {
	return user_stats.GetUserBalance(userID)
}

func Discount(userID int64, value float64) (float64, error) {
	saldo, err := user_stats.GetUserBalance(userID)
	if err != nil {
		return 0, err
	}
	if value <= saldo {
		novoSaldo := saldo - value
		err = user_stats.UpdateUserBalance(userID, novoSaldo)
		if err != nil {
			return 0, err
		}
		return value, nil
	}
	return 0, fmt.Errorf("saldo insuficiente")
}

// cona o numero de partidas
func Count_partidas(num_parttidas int) int {
	num_partidas = user_stats.UpdateUserStatsAfterBet
	num_partidas++
}

// Criar uma função para acessar essa querry no banco
var numero_rodadas int = 0

// retorna as cartinhas
func (d Dados_rodadas) CartinhaSorteada() *string {
	if d.cartinha_sorteada == nil {
		return nil
	}
	c := string(*d.cartinha_sorteada)
	return &c
}

func Start(saldo_aposta float64) float64 {
	saldo_aposta = saldo_aposta + Randon_inicial(saldo_aposta)
	_ = Update_wins_losses(userID, true)
	return saldo_aposta
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
}

func Final(saldo_aposta float64) Dados_rodadas {
	data := Dados_rodadas{
		valor_aposta:      saldo_aposta,
		historical_value:  0,
		loser_count:       0,
		statistical_loser: 0,
		limit:             1000.00,
		victory:           0,
		cartinha_sorteada: nil,
	}

	if Randon_fdp() {
		new_value := op_valor(data.valor_aposta)
		data.valor_aposta = data.valor_aposta + new_value
		data.historical_value = data.historical_value + Count_money(data.historical_value, data.valor_aposta)
		data.victory = data.victory + 1
		data.cartinha_sorteada = carta

		_ = Update_wins_losses(userID, true)
	} else {
		data.valor_aposta = 0
		data.historical_value = data.historical_value + Count_money(data.historical_value, data.valor_aposta)
		data.loser_count = Loser_count(data.loser_count)
		data.victory = 0
		data.cartinha_sorteada = nil

		_ = Update_wins_losses(userID, false)
	}

	if data.loser_count == 3 {
		data.valor_aposta = Give_low(data.valor_aposta)
		data.statistical_loser = data.statistical_loser + Statistical_loser(data.loser_count)
		data.loser_count = 0
	}

	if data.historical_value >= data.limit {
		Governo(data.valor_aposta)
	}

	if data.victory >= 5 {
		Governo(data.valor_aposta)
	}

	return data
}
