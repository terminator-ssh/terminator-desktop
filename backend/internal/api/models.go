package api

import "time"

type ErrorResponse struct {
	Errors []ErrorDetail `json:"errors"`
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type RegisterRequest struct {
	Username           string `json:"username"`
	AuthSalt           string `json:"authSalt"`
	KeySalt            string `json:"keySalt"`
	EncryptedMasterKey string `json:"encryptedMasterKey"`
	LoginKey           string `json:"loginKey"`
}

type LoginRequest struct {
	Username string `json:"username"`
	LoginKey string `json:"loginKey"`
}

type AuthResponse struct {
	AccessToken string `json:"accessToken"`
}

type PreflightRequest struct {
	Username string `json:"username"`
}

type PreflightResponse struct {
	AuthSalt           string `json:"authSalt"`
	KeySalt            string `json:"keySalt"`
	EncryptedMasterKey string `json:"encryptedMasterKey"`
}

type EncryptedBlob struct {
	ID        string    `json:"id"`
	UpdatedAt time.Time `json:"updatedAt"`
	IsDeleted bool      `json:"isDeleted"`
	Blob      string    `json:"blob"`
}

type SyncRequest struct {
	Blobs        []EncryptedBlob `json:"blobs"`
	LastSyncTime time.Time       `json:"lastSyncTime"`
}

type SyncResponse struct {
	Blobs    []EncryptedBlob `json:"blobs"`
	SyncTime time.Time       `json:"syncTime"`
}
