package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"terminator-desktop/backend/internal/api"
	"terminator-desktop/backend/internal/apperror"
	"terminator-desktop/backend/internal/crypto"
	"terminator-desktop/backend/internal/dbgen"
	"terminator-desktop/backend/internal/vault"
	"time"

	"github.com/google/uuid"
)

type AuthService struct {
	q      *dbgen.Queries
	vault  *vault.Vault
	client *api.Client
}

const (
	saltLength = 16
	keyLength  = 32
)

func NewAuthService(
	q *dbgen.Queries,
	vault *vault.Vault,
	client *api.Client) *AuthService {
	return &AuthService{
		q:      q,
		vault:  vault,
		client: client,
	}
}

// generateSalt returns a new random 16-byte salt, base64 encoded
func generateSalt() (string, error) {
	salt := make([]byte, saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(salt), nil
}

func (s *AuthService) HasUser(ctx context.Context) (bool, error) {
	count, err := s.q.HasUser(ctx)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (s *AuthService) RegisterLocal(ctx context.Context, username, password string) error {
	masterKey := make([]byte, keyLength)
	if _, err := rand.Read(masterKey); err != nil {
		return err
	}

	keySalt, err := generateSalt()
	if err != nil {
		return err
	}

	authSalt, err := generateSalt()
	if err != nil {
		return err
	}

	kek, err := crypto.DeriveKEK(password, keySalt)
	if err != nil {
		return err
	}

	loginKey, err := crypto.DeriveLoginKey(password, authSalt)
	if err != nil {
		return err
	}

	encryptedMasterKey, err := crypto.EncryptAndPack(masterKey, kek)
	if err != nil {
		return err
	}

	err = s.q.CreateUser(ctx, dbgen.CreateUserParams{
		ID:                 uuid.New().String(),
		Username:           username,
		KeySalt:            keySalt,
		AuthSalt:           sql.NullString{String: authSalt, Valid: true},
		EncryptedMasterKey: encryptedMasterKey,
		ServerUrl:          sql.NullString{Valid: false},
		LastSyncTime:       sql.NullString{Valid: false},
	})
	if err != nil {
		return err
	}

	s.vault.Unlock(masterKey, loginKey)
	return nil
}

// Login - "unlock vault"
func (s *AuthService) Login(ctx context.Context, password string) error {
	dbUser, err := s.q.GetUser(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return apperror.NotFound("User not found", err)
		}
		return err
	}

	kek, err := crypto.DeriveKEK(password, dbUser.KeySalt)
	if err != nil {
		return err
	}

	loginKey := make([]byte, keyLength)
	if dbUser.AuthSalt.Valid {
		loginKey, err = crypto.DeriveLoginKey(password, dbUser.AuthSalt.String)
		if err != nil {
			return err
		}
	}

	masterKey, err := crypto.UnpackAndDecrypt(dbUser.EncryptedMasterKey, kek)
	if err != nil {
		return err
	}

	s.vault.Unlock(masterKey, loginKey)

	return nil
}

// LoginFromSync - "connect and restore"
func (s *AuthService) LoginFromSync(ctx context.Context, serverUrl, username, password string) error {
	preflightRes, err := s.client.Preflight(ctx, serverUrl, &api.PreflightRequest{
		Username: username,
	})
	if err != nil {
		return err
	}

	kek, err := crypto.DeriveKEK(password, preflightRes.KeySalt)
	if err != nil {
		return err
	}
	loginKey, err := crypto.DeriveLoginKey(password, preflightRes.AuthSalt)
	if err != nil {
		return err
	}

	loginKeyBase64 := base64.StdEncoding.EncodeToString(loginKey)
	authRes, err := s.client.Login(ctx, serverUrl, &api.LoginRequest{
		Username: username,
		LoginKey: loginKeyBase64,
	})
	if err != nil {
		return err
	}

	masterKey, err := crypto.UnpackAndDecrypt(preflightRes.EncryptedMasterKey, kek)
	if err != nil {
		return err
	}

	epochZero := time.Unix(0, 0).UTC().Format(time.RFC3339)
	err = s.q.CreateUser(ctx, dbgen.CreateUserParams{
		ID:                 uuid.New().String(),
		Username:           username,
		KeySalt:            preflightRes.KeySalt,
		AuthSalt:           sql.NullString{String: preflightRes.AuthSalt, Valid: true},
		EncryptedMasterKey: preflightRes.EncryptedMasterKey,
		ServerUrl:          sql.NullString{String: serverUrl, Valid: true},
		LastSyncTime:       sql.NullString{String: epochZero, Valid: true},
	})
	if err != nil {
		return err
	}

	s.client.SetToken(authRes.AccessToken)
	s.vault.Unlock(masterKey, loginKey)

	return nil
}

func (s *AuthService) RegisterOnServer(ctx context.Context, serverURL string) error {
	user, err := s.q.GetUser(ctx)
	if err != nil {
		return err
	}

	loginKey, err := s.vault.GetLoginKey()
	if err != nil {
		return err
	}

	authRes, err := s.client.Register(ctx, serverURL, &api.RegisterRequest{
		Username:           user.Username,
		AuthSalt:           user.AuthSalt.String,
		KeySalt:            user.KeySalt,
		EncryptedMasterKey: user.EncryptedMasterKey,
		LoginKey:           base64.StdEncoding.EncodeToString(loginKey),
	})
	if err != nil {
		return err
	}

	s.client.SetToken(authRes.AccessToken)

	epochZero := time.Unix(0, 0).UTC().Format(time.RFC3339Nano)
	err = s.q.UpdateUserServerUrl(ctx, dbgen.UpdateUserServerUrlParams{
		ServerUrl:    sql.NullString{String: serverURL, Valid: true},
		LastSyncTime: sql.NullString{String: epochZero, Valid: true},
		ID:           user.ID,
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *AuthService) WipeData(ctx context.Context) error {
	if err := s.q.WipeBlobs(ctx); err != nil {
		return err
	}
	if err := s.q.WipeUsers(ctx); err != nil {
		return err
	}

	s.vault.Lock()
	s.client.ClearToken()

	return nil
}
