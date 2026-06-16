package service_test

// This file contains shared test helpers used across all service tests.
// Service tests are pure unit tests — they use fake in-memory repositories
// and never touch the database. This makes them fast and runnable anywhere
// without Docker.

import (
	"context"

	"github.com/lifygo/lifygo/apps/api/internal/model"
)

// -----------------------------------------------------------------------
// Fake UserRepository
// -----------------------------------------------------------------------

// fakeUserRepository is an in-memory implementation of service.UserRepository.
// It stores users in a map and returns the same errors a real repository would.
type fakeUserRepository struct {
	users         map[string]*model.User // keyed by ID
	byClerkID     map[string]*model.User // keyed by ClerkUserID
	createErr     error                  // if set, Create always returns this error
	getByIDErr    error                  // if set, GetByID always returns this error
	getByClerkErr error                  // if set, GetByClerkUserID always returns this error
	deleteErr     error                  // if set, Delete always returns this error
}

func newFakeUserRepository() *fakeUserRepository {
	return &fakeUserRepository{
		users:     make(map[string]*model.User),
		byClerkID: make(map[string]*model.User),
	}
}

func (f *fakeUserRepository) Create(_ context.Context, input model.CreateUserInput) (*model.User, error) {
	if f.createErr != nil {
		return nil, f.createErr
	}
	for _, u := range f.users {
		if u.ClerkUserID == input.ClerkUserID || u.Email == input.Email {
			return nil, model.ErrAlreadyExists
		}
	}
	user := &model.User{
		ID:          "user_" + input.ClerkUserID,
		ClerkUserID: input.ClerkUserID,
		Name:        input.Name,
		Email:       input.Email,
	}
	f.users[user.ID] = user
	f.byClerkID[user.ClerkUserID] = user
	return user, nil
}

func (f *fakeUserRepository) GetByID(_ context.Context, id string) (*model.User, error) {
	if f.getByIDErr != nil {
		return nil, f.getByIDErr
	}
	user, ok := f.users[id]
	if !ok {
		return nil, model.ErrNotFound
	}
	return user, nil
}

func (f *fakeUserRepository) GetByClerkUserID(_ context.Context, clerkUserID string) (*model.User, error) {
	if f.getByClerkErr != nil {
		return nil, f.getByClerkErr
	}
	user, ok := f.byClerkID[clerkUserID]
	if !ok {
		return nil, model.ErrNotFound
	}
	return user, nil
}

func (f *fakeUserRepository) Delete(_ context.Context, id string) error {
	if f.deleteErr != nil {
		return f.deleteErr
	}
	user, ok := f.users[id]
	if !ok {
		return model.ErrNotFound
	}
	delete(f.byClerkID, user.ClerkUserID)
	delete(f.users, id)
	return nil
}
