package emitters

import "github.com/wailsapp/wails/v3/pkg/application"

const (
	UpdaterProgressEvent = "updater:progress"
)

type WailsUpdaterEmitter struct {
	app *application.App
}

func NewWailsUpdaterEmitter(app *application.App) *WailsUpdaterEmitter {
	return &WailsUpdaterEmitter{app: app}
}

func (e *WailsUpdaterEmitter) EmitProgress(percent uint) {
	e.app.Event.Emit(UpdaterProgressEvent, percent)
}
