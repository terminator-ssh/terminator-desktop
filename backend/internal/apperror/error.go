package apperror

import (
	"errors"
	"fmt"
)

// AppError something like a generic error or a domain error
type AppError struct {
	Code        ErrorCode
	Message     string
	Err         error
	ErrorString string
}

func (e *AppError) Error() string {
	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func Validation(msg string) *AppError {
	return &AppError{
		Code:        CodeValidationFailed,
		Message:     msg,
		Err:         errors.New(fmt.Sprintf("validation failed: %s", msg)),
		ErrorString: msg,
	}
}

func DecryptionFailed(err error) *AppError {
	message := "invalid password or corrupted data"
	errorString := message
	if err != nil {
		errorString = err.Error()
	}

	return &AppError{
		Code:        CodeDecryptionFailed,
		Message:     message,
		Err:         err,
		ErrorString: errorString,
	}
}

func VaultLocked() *AppError {
	message := "vault is locked"

	return &AppError{
		Code:        CodeVaultLocked,
		Message:     message,
		Err:         errors.New(message),
		ErrorString: message,
	}
}

func NotFound(msg string, err error) *AppError {
	errorString := msg
	if err != nil {
		errorString = err.Error()
	}

	return &AppError{
		Code:        CodeNotFound,
		Message:     msg,
		Err:         err,
		ErrorString: errorString,
	}
}

func Network(err error) *AppError {
	message := "network request failed"
	errorString := message
	if err != nil {
		errorString = err.Error()
	}

	return &AppError{
		Code:        CodeNetworkFailed,
		Message:     message,
		Err:         err,
		ErrorString: errorString,
	}
}

func SSHConnectionFailed(msg string, err error) *AppError {
	errorString := msg
	if err != nil {
		errorString = err.Error()
	}

	return &AppError{
		Code:        CodeSSHConnectionError,
		Message:     msg,
		Err:         err,
		ErrorString: errorString,
	}
}

func SSHSessionNotFound() *AppError {
	message := "session not found"

	return &AppError{
		Code:        CodeSSHSessionNotFound,
		Message:     message,
		Err:         errors.New(message),
		ErrorString: message,
	}
}
