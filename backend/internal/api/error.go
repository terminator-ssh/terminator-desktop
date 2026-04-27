package api

import "fmt"

type APIError struct {
	StatusCode int
	Details    []ErrorDetail
}

func (e *APIError) Error() string {
	return fmt.Sprintf("server rejected the request with code: %d", e.StatusCode)
}
