package main

import (
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"os"
	"path/filepath"
	"terminator-desktop/backend/cmd/terminator-desktop/emitters"
	"terminator-desktop/backend/internal/api"
	"terminator-desktop/backend/internal/dbgen"
	"terminator-desktop/backend/internal/migration"
	"terminator-desktop/backend/internal/present"
	"terminator-desktop/backend/internal/services/auth"
	"terminator-desktop/backend/internal/services/blob"
	"terminator-desktop/backend/internal/services/ssh"
	"terminator-desktop/backend/internal/services/sync"
	"terminator-desktop/backend/internal/vault"

	_ "github.com/mattn/go-sqlite3"

	root "terminator-desktop"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.

	application.RegisterEvent[sync.SyncStatus](emitters.SyncStatusEvent)
	application.RegisterEvent[*present.UIError](emitters.SyncErrorEvent)
	application.RegisterEvent[any](emitters.SyncUpdatesAvailableEvent)

	application.RegisterEvent[emitters.SSHDataPayload](emitters.SSHDataEvent)
	application.RegisterEvent[emitters.SSHClosedPayload](emitters.SSHClosedEvent)
}

const AppName = "Terminator"

func main() {
	//logHandler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
	//	Level: slog.LevelInfo,
	//})
	//logger := slog.New(logHandler)
	//slog.SetDefault(logger)

	var mainWindow *application.WebviewWindow

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	app := application.New(application.Options{
		Name:        AppName,
		Description: "SSH client",
		//Services: []application.Service{
		//},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(root.Frontend),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		SingleInstance: &application.SingleInstanceOptions{
			UniqueID: "com.terminator.desktop",
			OnSecondInstanceLaunch: func(data application.SecondInstanceData) {
				if mainWindow != nil {
					mainWindow.Restore()
					mainWindow.Focus()
				}

				slog.Info("Second instance launched with args: %v", data.Args)
				slog.Info("Working directory: %s", data.WorkingDir)
				slog.Info("Additional data: %v", data.AdditionalData)
			},
		},
		MarshalError: globalErrorHandler,
	})

	slog.SetDefault(app.Logger)

	isDebug := app.Env.Info().Debug
	dbPath, err := getDbPath(isDebug)
	if err != nil {
		log.Fatal(fmt.Errorf("error getting database path: %w", err))
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(fmt.Errorf("error building db: %w", err))
	}
	defer func(db *sql.DB) {
		_ = db.Close()
	}(db)
	queries := dbgen.New(db)

	err = migration.RunMigrations(db)
	if err != nil {
		log.Fatal(fmt.Errorf("error migrating db: %w", err))
	}

	v := vault.New()
	client := api.NewClient()

	syncEmitter := emitters.NewWailsSyncEmitter(app)
	sshEmitter := emitters.NewWailsSSHEmitter(app)

	authService := auth.NewAuthService(queries, v, client)
	syncService := sync.NewSyncService(queries, client, v, syncEmitter, nil)
	sshService := ssh.NewSshService(sshEmitter)
	hostService := blob.NewHostService(queries, v)
	keyService := blob.NewKeyService(queries, v)

	app.RegisterService(application.NewService(authService))
	app.RegisterService(application.NewService(syncService))
	app.RegisterService(application.NewService(sshService))
	app.RegisterService(application.NewService(hostService))
	app.RegisterService(application.NewService(keyService))

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	mainWindow = app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: AppName,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(9, 9, 11),
		URL:              "/",
	})

	defer v.Lock() // eh why not
	defer syncService.StopAutoSync()

	// Run the application. This blocks until the application has been exited.
	err = app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}

func getDbPath(isDebug bool) (string, error) {
	if isDebug {
		executablePath, err := os.Executable()
		if err != nil {
			return "", err
		}
		executableDir := filepath.Dir(executablePath)

		return filepath.Join(executableDir, "../dev.db"), nil
	}

	userDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	appDir := filepath.Join(userDir, AppName)

	if err = os.MkdirAll(appDir, 0755); err != nil {
		return "", err
	}

	return filepath.Join(appDir, "terminator.db"), nil
}
