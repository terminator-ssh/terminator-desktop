package backend

import "embed"

//go:embed all:frontend/dist
var Frontend embed.FS
