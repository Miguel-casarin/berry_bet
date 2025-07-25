package roleta

import (
	"berry_bet/User"
)

var saldo float64 = CalculateUserBalance(User.ID)

func Discount(value, solado float64) (float64, error) {
	if value <= saldo {
		saldo -= value
		// fazer o updat no banco depois
		credit := value
		return credit
	}
	return credit
}

func Update_saldo(saldo, credit float64) (float64, error) {
	if credit > 0 {
		saldo += credit
		return saldo, nil
	} else {
		return saldo, fmt.Errorf("crédito inválido: %.2f", credit)
	}
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
	} else {
		data.valor_aposta = 0
		data.historical_value = data.historical_value + Count_money(data.historical_value, data.valor_aposta)
		data.loser_count = Loser_count(data.loser_count)
		data.victory = 0
		data.cartinha_sorteada = nil
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

// Retorno da cartinha para o font 

if numero_rodadas <= 5 {
	Start()
} else {
	Final()
}