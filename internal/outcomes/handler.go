package outcomes

import (
	"berry_bet/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetOutcomesHandler(c *gin.Context) {
	outcomes, err := GetOutcomes(10)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch outcomes.", err.Error())
		return
	}
	if outcomes == nil {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "No outcomes found.", nil)
		return
	}
	responses := make([]OutcomeResponse, 0, len(outcomes))
	for _, o := range outcomes {
		responses = append(responses, ToOutcomeResponse(&o))
	}
	utils.RespondSuccess(c, responses, "Outcomes found")
}

func GetOutcomeByIDHandler(c *gin.Context) {
	id := c.Param("id")
	outcome, err := GetOutcomeByID(id)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch outcome.", err.Error())
		return
	}
	if outcome.ID == 0 {
		utils.RespondError(c, http.StatusNotFound, "NOT_FOUND", "Outcome not found.", nil)
		return
	}
	utils.RespondSuccess(c, ToOutcomeResponse(&outcome), "Outcome found")
}

func AddOutcomeHandler(c *gin.Context) {
	var req OutcomeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	if err := ValidateOutcome(Outcome{GameID: req.GameID, Result: req.Result}); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error(), nil)
		return
	}
	success, err := AddOutcome(Outcome{GameID: req.GameID, Result: req.Result})
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to register outcome.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Outcome registered successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "INSERT_FAIL", "Could not register outcome.", nil)
	}
}

func UpdateOutcomeHandler(c *gin.Context) {
	var req OutcomeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid data.", err.Error())
		return
	}
	if err := ValidateOutcome(Outcome{GameID: req.GameID, Result: req.Result}); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error(), nil)
		return
	}
	outcomeId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := UpdateOutcome(Outcome{ID: int64(outcomeId), GameID: req.GameID, Result: req.Result}, int64(outcomeId))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to update outcome.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Outcome updated successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "UPDATE_FAIL", "Could not update outcome.", nil)
	}
}

func DeleteOutcomeHandler(c *gin.Context) {
	outcomeId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "INVALID_ID", "Invalid ID.", err.Error())
		return
	}
	success, err := DeleteOutcome(outcomeId)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "DB_ERROR", "Failed to delete outcome.", err.Error())
		return
	}
	if success {
		utils.RespondSuccess(c, nil, "Outcome deleted successfully")
	} else {
		utils.RespondError(c, http.StatusBadRequest, "DELETE_FAIL", "Could not delete outcome.", nil)
	}
}
