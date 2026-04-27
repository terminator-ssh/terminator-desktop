package vault

import (
	"sync"
	"terminator-desktop/backend/internal/apperror"
)

// Vault holds sensitive keys in memory.
// This exists mostly so the keys can be passed around.
// Safe for concurrent access
type Vault struct {
	mutex     sync.RWMutex
	masterKey []byte
	loginKey  []byte
}

func New() *Vault {
	return &Vault{}
}

// Unlock stores keys in memory
func (v *Vault) Unlock(masterKey []byte, loginKey []byte) {
	v.mutex.Lock()
	defer v.mutex.Unlock()

	v.masterKey = masterKey
	v.loginKey = loginKey
}

// Lock clears keys from memory
func (v *Vault) Lock() {
	v.mutex.Lock()
	defer v.mutex.Unlock()

	clear(v.masterKey)
	v.masterKey = nil

	clear(v.loginKey)
	v.loginKey = nil
}

// IsUnlocked returns true if we have the master key
func (v *Vault) IsUnlocked() bool {
	v.mutex.RLock()
	defer v.mutex.RUnlock()
	return v.masterKey != nil
}

// GetMasterKey returns the master key, error if locked
func (v *Vault) GetMasterKey() ([]byte, error) {
	v.mutex.RLock()
	defer v.mutex.RUnlock()

	if v.masterKey == nil {
		return nil, apperror.VaultLocked()
	}
	return v.masterKey, nil
}

// GetLoginKey returns the login key, error if locked
func (v *Vault) GetLoginKey() ([]byte, error) {
	v.mutex.RLock()
	defer v.mutex.RUnlock()

	if v.loginKey == nil {
		return nil, apperror.VaultLocked()
	}
	return v.loginKey, nil
}
