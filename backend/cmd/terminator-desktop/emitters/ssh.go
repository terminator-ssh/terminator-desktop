package emitters

import "github.com/wailsapp/wails/v3/pkg/application"

type WailsSSHEmitter struct {
	app *application.App
}

type SSHDataPayload struct {
	ID   string `json:"id"`
	Data string `json:"data"`
}

type SSHClosedPayload struct {
	ID string `json:"id"`
}

const (
	SSHDataEvent   = "ssh:data"
	SSHClosedEvent = "ssh:closed"
)

func NewWailsSSHEmitter(app *application.App) *WailsSSHEmitter {
	return &WailsSSHEmitter{app: app}
}

func (e *WailsSSHEmitter) EmitData(sessionID string, data string) {
	e.app.Event.Emit(SSHDataEvent, SSHDataPayload{
		ID:   sessionID,
		Data: data,
	})
}

func (e *WailsSSHEmitter) EmitClosed(sessionID string) {
	e.app.Event.Emit(SSHClosedEvent, SSHClosedPayload{
		ID: sessionID,
	})
}
