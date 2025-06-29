package outcomes

import (
	"berry_bet/config"
	"errors"
)

func GetOutcomes(count int) ([]Outcome, error) {
	rows, err := config.DB.Query("SELECT id, game_id, outcome FROM outcomes LIMIT ?", count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	outcomes := make([]Outcome, 0)
	for rows.Next() {
		var o Outcome
		err := rows.Scan(&o.ID, &o.GameID, &o.Result)
		if err != nil {
			return nil, err
		}
		outcomes = append(outcomes, o)
	}
	return outcomes, nil
}

func GetOutcomeByID(id string) (Outcome, error) {
	stmt, err := config.DB.Prepare("SELECT id, game_id, outcome FROM outcomes WHERE id = ?")
	if err != nil {
		return Outcome{}, err
	}
	defer stmt.Close()
	var o Outcome
	sqlErr := stmt.QueryRow(id).Scan(&o.ID, &o.GameID, &o.Result)
	if sqlErr != nil {
		return Outcome{}, sqlErr
	}
	return o, nil
}

// AddOutcome adiciona um novo resultado ao banco de dados após validação dos dados.
func AddOutcome(newOutcome Outcome) (bool, error) {
	if newOutcome.GameID <= 0 {
		return false, errors.New("invalid game id")
	}
	if newOutcome.Result == "" {
		return false, errors.New("result cannot be empty")
	}

	stmt, err := config.DB.Prepare("INSERT INTO outcomes (game_id, outcome) VALUES (?, ?)")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newOutcome.GameID, newOutcome.Result)
	if err != nil {
		return false, err
	}
	return true, nil
}

// UpdateOutcome atualiza um resultado existente após validação dos dados.
func UpdateOutcome(outcome Outcome, id int64) (bool, error) {
	if outcome.GameID <= 0 {
		return false, errors.New("game_id inválido")
	}
	if outcome.Result == "" {
		return false, errors.New("resultado não pode ser vazio")
	}

	stmt, err := config.DB.Prepare("UPDATE outcomes SET game_id = ?, outcome = ? WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(outcome.GameID, outcome.Result, id)
	if err != nil {
		return false, err
	}
	return true, nil
}

// DeleteOutcome remove um resultado do banco de dados pelo ID.
func DeleteOutcome(outcomeId int) (bool, error) {
	stmt, err := config.DB.Prepare("DELETE FROM outcomes WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(outcomeId)
	if err != nil {
		return false, err
	}
	return true, nil
}
