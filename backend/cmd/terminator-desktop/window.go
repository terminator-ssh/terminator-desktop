package main

import "github.com/wailsapp/wails/v3/pkg/application"

type WindowControls struct {
	window *application.WebviewWindow
}

func (wc *WindowControls) Minimise() {
	wc.window.Minimise()
}

func (wc *WindowControls) Maximise() {
	if wc.window.IsMaximised() {
		wc.window.UnMaximise()
	} else {
		wc.window.Maximise()
	}
}

func (wc *WindowControls) Close() {
	wc.window.Close()
}
