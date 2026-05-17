package settings

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type AppSettings struct {
	Language string `json:"language"`
}

type SettingsService struct {
	configPath string
	mutex      sync.RWMutex
}

func NewSettingsService(appDir string) *SettingsService {
	return &SettingsService{
		configPath: filepath.Join(appDir, "settings.json"),
	}
}

func (s *SettingsService) GetSettings() (AppSettings, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	settings := AppSettings{
		Language: "en",
	}

	data, err := os.ReadFile(s.configPath)
	if err != nil {
		if os.IsNotExist(err) {
			return settings, nil
		}
		return settings, err
	}

	err = json.Unmarshal(data, &settings)
	if err != nil {
		return settings, err
	}

	return settings, nil
}

func (s *SettingsService) SaveSettings(settings AppSettings) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	data, err := json.MarshalIndent(settings, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.configPath, data, 0644)
}