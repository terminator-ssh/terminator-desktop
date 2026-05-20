package blob

type ItemType string

const (
	TypeHost ItemType = "host"
	TypeKey  ItemType = "key"
)

type VaultItemHeader struct {
	Type ItemType `json:"type"`
}

type Host struct {
	ID       string   `json:"id"`
	Type     ItemType `json:"type"`
	Name     string   `json:"name"`
	Host     string   `json:"host"`
	Port     int      `json:"port"`
	Username string   `json:"username"`
	Password string   `json:"password,omitempty"`
	KeyID    string   `json:"keyId,omitempty"`
}

type KeyKind string

const (
	KeyKindPrivateKey  KeyKind = "private_key"
	KeyKindHardwareKey KeyKind = "hardware_key"
)

type SavedKey struct {
	ID             string   `json:"id"`
	Type           ItemType `json:"type"`
	Name           string   `json:"name"`
	Kind           KeyKind  `json:"kind,omitempty"`
	PrivateKey     string   `json:"privateKey,omitempty"`
	PrivateKeyPath string   `json:"privateKeyPath,omitempty"`
}
