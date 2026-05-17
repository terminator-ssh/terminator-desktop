package apperror

type ErrorCode string

const (
	CodeNotFound           = ErrorCode("NOT_FOUND")
	CodeValidationFailed   = ErrorCode("VALIDATION_FAILED")
	CodeDecryptionFailed   = ErrorCode("DECRYPTION_FAILED")
	CodeVaultLocked        = ErrorCode("VAULT_LOCKED")
	CodeNetworkFailed      = ErrorCode("NETWORK_FAILED")
	CodeSSHConnectionError = ErrorCode("SSH_CONNECTION_FAILED")
	CodeSSHSessionNotFound = ErrorCode("SSH_SESSION_NOT_FOUND")

	CodeInternalError = ErrorCode("INTERNAL_ERROR")
	CodeUnknownError  = ErrorCode("UNKNOWN_ERROR")
	CodeAPIError      = ErrorCode("API_ERROR")
)
