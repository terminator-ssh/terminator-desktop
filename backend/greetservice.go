package backend

import "terminator-desktop/backend/internal/apperror"

type GreetService struct{}

func (g *GreetService) Greet(name string) (string, error) {
	return "Hello " + name + "!", apperror.NotFound(name, nil)
}
