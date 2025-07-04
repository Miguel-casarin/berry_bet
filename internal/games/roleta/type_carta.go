package roleta

import (
	"encoding/json"
	"fmt"
)

type RespostaCartinha struct {
	TipoCartinha string `json:"tipo_cartinha"`
}

func CartinhaJSON(cartinha *string) (string, error) {
	if cartinha == nil {
		return "", fmt.Errorf("nenhuma cartinha foi sorteada")
	}

	r := RespostaCartinha{TipoCartinha: *cartinha}
	jsonData, err := json.Marshal(r)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}
