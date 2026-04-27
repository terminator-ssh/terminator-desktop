package main

import (
	"encoding/json"
	"log/slog"
	"terminator-desktop/backend/internal/present"
)

func globalErrorHandler(err error) []byte {
	if err == nil {
		return nil
	}

	uiErr := present.FormatUIError(err)

	result, err := json.Marshal(uiErr)
	if err != nil {
		slog.Error("Failed to marshal error", "error", err)
		return nil
	}
	return result
}

// wails default:
//
//func defaultMarshalError(err error) []byte {
//	result, jsonErr := json.Marshal(&err)
//	if jsonErr != nil {
//		return nil
//	}
//	return result
//}
