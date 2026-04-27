package emitters

import (
	"terminator-desktop/backend/internal/present"
	"terminator-desktop/backend/internal/services/sync"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type WailsSyncEmitter struct {
	app *application.App
}

const (
	SyncStatusEvent           = "sync:status"
	SyncUpdatesAvailableEvent = "sync:updates-available"
	SyncErrorEvent            = "sync:error"
)

func NewWailsSyncEmitter(app *application.App) *WailsSyncEmitter {
	return &WailsSyncEmitter{app: app}
}

func (e *WailsSyncEmitter) EmitStatus(status sync.SyncStatus) {
	e.app.Event.Emit(SyncStatusEvent, status)
}

func (e *WailsSyncEmitter) EmitUpdatesAvailable() {
	e.app.Event.Emit(SyncUpdatesAvailableEvent, nil)
}

func (e *WailsSyncEmitter) EmitSyncError(err error) {
	uiErr := present.FormatUIError(err)

	e.app.Event.Emit(SyncErrorEvent, uiErr)
}
