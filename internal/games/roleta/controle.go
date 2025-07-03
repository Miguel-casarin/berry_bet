package roleta

// função para atualizar a quantidade de percas
func Loser_count(value int) int {
	return value + 1
}

func Statistical_loser(old_value int) int {
	return old_value + 1
}

// conta o total já gasto
func Count_money(spent, saldo float64) float64 {
	return spent + saldo
}
