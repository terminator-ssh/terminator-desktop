package crypto

import (
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strings"
	"terminator-desktop/backend/internal/apperror"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestDeriveKeys(t *testing.T) {
	password := "Timber-Hearth"

	// yes this is exactly 16 bytes!
	saltBase64 := base64.StdEncoding.EncodeToString([]byte("Ash Twin Project"))

	// 1. Ensure derivation succeeds
	key1, err := DeriveKEK(password, saltBase64)
	require.NoError(t, err)
	require.Len(t, key1, 32, "Argon2id should produce exactly 32 bytes")

	// 2. Ensure deterministic output (same password + salt = same key)
	key2, err := DeriveKEK(password, saltBase64)
	require.NoError(t, err)
	require.Equal(t, key1, key2, "Derivation must be deterministic")

	// 3. Ensure different salt = different key
	salt2Base64 := base64.StdEncoding.EncodeToString([]byte("Hollow's Lantern")) // also 16 bytes!!
	key3, err := DeriveKEK(password, salt2Base64)
	require.NoError(t, err)
	require.NotEqual(t, key1, key3, "Different salts must produce different keys")
}

func TestEncryptAndDecrypt_Symmetry(t *testing.T) {
	// Arrange
	key := make([]byte, 32) // Dummy 32-byte key for AES-256
	plaintext := []byte("secret SSH payload: username=root, password=admin")

	// Act - Encrypt
	packedBase64, err := EncryptAndPack(plaintext, key)
	require.NoError(t, err, "Encryption should succeed")
	require.NotEmpty(t, packedBase64)

	// Act - Decrypt
	decrypted, err := UnpackAndDecrypt(packedBase64, key)

	// Assert
	require.NoError(t, err, "Decryption should succeed")
	require.Equal(t, plaintext, decrypted, "Decrypted data must match original plaintext")
}

func TestEncryptAndDecrypt_TamperResistance(t *testing.T) {
	// Arrange
	key := make([]byte, 32)
	plaintext := []byte("eye of the universe")

	packedBase64, err := EncryptAndPack(plaintext, key)
	require.NoError(t, err)

	// Tamper with the base64 string (change the last character, which ruins the Auth Tag)
	var tamperedBase64 string
	if strings.HasSuffix(packedBase64, "A") {
		tamperedBase64 = packedBase64[:len(packedBase64)-1] + "B"
	} else {
		tamperedBase64 = packedBase64[:len(packedBase64)-1] + "A"
	}

	// Try to decrypt tampered data
	_, err = UnpackAndDecrypt(tamperedBase64, key)

	// Assert it fails securely
	require.Error(t, err, "Decryption should fail on tampered data")

	// Assert it returns the specific AppError
	var appErr *apperror.AppError
	require.True(t, errors.As(err, &appErr), "Error should be an AppError")
	require.Equal(t, apperror.CodeDecryptionFailed, appErr.Code, "Error code should be DECRYPTION_FAILED")
}

func TestDecryptRealMasterKeyFromOldClient(t *testing.T) {
	// Arrange
	password := "test-pass"
	keySaltBase64 := "bNxDwKxB3xsIHc14sUcAIg=="
	packedBase64 := "nzwwSiOx4AQXwqP/FTPXaO0jkLwpfWxy9cA1KybmT6ct1OKg51vQlYYhrHraJzgANxgNkEUbKsU5m1Ve"
	expectedMasterKeyHex := "5dc40c6c8f776180bc7a7dfcfd1534eb6e8f9ba79f9ab9a4b63da8e3161648cb"

	kek, err := DeriveKEK(password, keySaltBase64)
	require.NoError(t, err)

	decryptedMasterKey, err := UnpackAndDecrypt(packedBase64, kek)
	require.NoError(t, err)

	actualHex := hex.EncodeToString(decryptedMasterKey)
	require.Equal(t, expectedMasterKeyHex, actualHex, "Decrypted master key must match")
}

func TestDecryptRealPayloadFromOldClient(t *testing.T) {
	// Arrange
	masterKeyHex := "5dc40c6c8f776180bc7a7dfcfd1534eb6e8f9ba79f9ab9a4b63da8e3161648cb"
	masterKey, _ := hex.DecodeString(masterKeyHex)
	blob := "vWM6Gc3+ocjUtpfPOLuSn9byiwgOVoD+iZgboRxASQ/URQoAlgJHenyTWw+xSwmgdGcsQXLhnSoWB+8FDSc8/p0FTitJ4DdJr9arpzNfCvo4+AcLbcOkC+BsA6I5u1Br63Y05w4JAencw8r9wYCwMFxE678iLgpQKqRBaru56eXebfZ/f6KSG/fI1w=="
	expectedPayload := `{"port":22,"username":"root","host":"127.0.0.1","name":"test-host","id":"1e3a4d78-fe83-47b3-abf2-9bd94ac19b0f"}`

	// Act
	decrypt, _ := UnpackAndDecrypt(blob, masterKey)

	// Assert
	require.Equal(t, expectedPayload, string(decrypt), "Decrypted payload must match")
}
