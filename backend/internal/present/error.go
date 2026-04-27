package present

import (
	"errors"
	"terminator-desktop/backend/internal/api"
	"terminator-desktop/backend/internal/apperror"
)

type UIError struct {
	Code       string            `json:"code"`
	Message    string            `json:"message"`
	APIDetails []api.ErrorDetail `json:"apiDetails,omitempty"`
}

func FormatUIError(err error) *UIError {
	if err == nil {
		return nil
	}

	uiErr := UIError{
		Code:    "INTERNAL_ERROR",
		Message: err.Error(),
	}

	var appErr *apperror.AppError
	if errors.As(err, &appErr) {
		uiErr.Code = string(appErr.Code)
		uiErr.Message = appErr.Message
	}

	var apiErr *api.APIError
	if errors.As(err, &apiErr) {
		uiErr.Code = "API_ERROR"
		uiErr.Message = apiErr.Error()
		uiErr.APIDetails = apiErr.Details
	}

	return &uiErr
}
