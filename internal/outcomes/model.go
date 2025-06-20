package outcomes

import (
	"berry_bet/config"
	"strconv"
)

func GetOutcomes(count int) ([]Outcome, error) {
	rows, err := config.DB.Query("SELECT id, game_id, outcome FROM outcomes LIMIT " + strconv.Itoa(count))
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

func AddOutcome(newOutcome Outcome) (bool, error) {
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

func UpdateOutcome(outcome Outcome, id int64) (bool, error) {
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
