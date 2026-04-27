package apperror

import (
	"errors"
	"fmt"
)

// AppError something like a generic error or a domain error
type AppError struct {
	Code    ErrorCode
	Message string
	Err     error
}

func (e *AppError) Error() string {
	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func Validation(msg string) *AppError {
	return &AppError{Code: CodeValidationFailed, Message: msg,
		Err: errors.New(fmt.Sprintf("validation failed: %s", msg))}
}

func DecryptionFailed(err error) *AppError {
	return &AppError{Code: CodeDecryptionFailed, Message: "invalid password or corrupted data", Err: err}
}

func VaultLocked() *AppError {
	return &AppError{Code: CodeVaultLocked, Message: "vault is locked", Err: errors.New("vault is locked")}
}

func NotFound(msg string, err error) *AppError {
	return &AppError{Code: CodeNotFound, Message: msg, Err: err}
}

func Network(err error) *AppError {
	return &AppError{Code: CodeNetworkFailed, Message: "network request failed", Err: err}
}

func SSHConnectionFailed(msg string, err error) *AppError {
	return &AppError{Code: CodeSSHConnectionError, Message: msg, Err: err}
}

func SSHSessionNotFound() *AppError {
	return &AppError{Code: CodeSSHSessionNotFound, Message: "session not found", Err: errors.New("session not found")}
}
