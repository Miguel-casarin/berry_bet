package sessions

import (
	"berry_bet/config"
	"database/sql"
)

type Session struct {
	ID        int64  `json:"id"`
	UserID    int64  `json:"user_id"`
	Token     string `json:"token"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at"`
}

func GetSessions(count int) ([]Session, error) {
	rows, err := config.DB.Query("SELECT id, user_id, token, created_at, expires_at FROM sessions LIMIT ?", count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	sessions := make([]Session, 0)
	for rows.Next() {
		s := Session{}
		err := rows.Scan(&s.ID, &s.UserID, &s.Token, &s.CreatedAt, &s.ExpiresAt)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return sessions, nil
}

func GetSessionByID(id string) (Session, error) {
	stmt, err := config.DB.Prepare("SELECT id, user_id, token, created_at, expires_at FROM sessions WHERE id = ?")
	if err != nil {
		return Session{}, err
	}
	defer stmt.Close()

	s := Session{}
	sqlErr := stmt.QueryRow(id).Scan(&s.ID, &s.UserID, &s.Token, &s.CreatedAt, &s.ExpiresAt)
	if sqlErr != nil {
		if sqlErr == sql.ErrNoRows {
			return Session{}, nil
		}
		return Session{}, sqlErr
	}
	return s, nil
}

func AddSession(newSession Session) (bool, error) {
	stmt, err := config.DB.Prepare("INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, datetime('now'), ?)")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(newSession.UserID, newSession.Token, newSession.ExpiresAt)
	if err != nil {
		return false, err
	}
	return true, nil
}

func UpdateSession(session Session, id int64) (bool, error) {
	stmt, err := config.DB.Prepare("UPDATE sessions SET user_id = ?, token = ?, expires_at = ? WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(session.UserID, session.Token, session.ExpiresAt, id)
	if err != nil {
		return false, err
	}
	return true, nil
}

func DeleteSession(sessionId int) (bool, error) {
	stmt, err := config.DB.Prepare("DELETE FROM sessions WHERE id = ?")
	if err != nil {
		return false, err
	}
	defer stmt.Close()
	_, err = stmt.Exec(sessionId)
	if err != nil {
		return false, err
	}
	return true, nil
}
