package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"io"
	"terminator-desktop/backend/internal/apperror"

	"golang.org/x/crypto/argon2"
)

const (
	aesGcmIvLength = 12
	aesGcmTagSize  = 16

	// argon is hardcoded because this must match android app settings
	argonTimeCost   = 3
	argonMemoryCost = 128 * 1024 // 128MB
	argonThreads    = 4
	argonKeyLength  = 32
)

func deriveArgon2id(password, saltBase64 string) ([]byte, error) {
	salt, err := base64.StdEncoding.DecodeString(saltBase64)
	if err != nil {
		return nil, err
	}

	key := argon2.IDKey([]byte(password), salt, argonTimeCost, argonMemoryCost, argonThreads, argonKeyLength)
	return key, nil
}

func DeriveKEK(password string, keySaltBase64 string) ([]byte, error) {
	return deriveArgon2id(password, keySaltBase64)
}

func DeriveLoginKey(password, authSaltBase64 string) ([]byte, error) {
	return deriveArgon2id(password, authSaltBase64)
}

// EncryptAndPack
// input -> [IV (12) + ciphertext (N) + tag (16)] -> base64
func EncryptAndPack(plaintext []byte, key []byte) (string, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	iv := make([]byte, aesGcmIvLength)
	if _, err = io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	versionByte := []byte{0x01}

	payload := append(versionByte, iv...)

	// tag is auto appended here
	packedBytes := aesGcm.Seal(payload, iv, plaintext, nil)

	return base64.StdEncoding.EncodeToString(packedBytes), nil
}

func UnpackAndDecrypt(packedBase64 string, key []byte) ([]byte, error) {
	packedBytes, err := base64.StdEncoding.DecodeString(packedBase64)
	if err != nil {
		return nil, apperror.Validation("invalid base64 blob")
	}

	if len(packedBytes) < 1+aesGcmIvLength+aesGcmTagSize {
		return nil, apperror.Validation("blob is too short")
	}

	if packedBytes[0] != 0x01 {
		return nil, apperror.Validation("unsupported crypto version")
	}

	cryptoPayload := packedBytes[1:]

	iv := cryptoPayload[:aesGcmIvLength]
	ciphertextWithTag := cryptoPayload[aesGcmIvLength:]

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesGcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	plaintext, err := aesGcm.Open(nil, iv, ciphertextWithTag, nil)
	if err != nil {
		return nil, apperror.DecryptionFailed(err)
	}

	return plaintext, nil
}
