install: install-deps

start:
	heroku local -f Procfile.dev

start-backend:
	npx nodemon bin/slack.js

start-frontend:
	npx webpack serve

install-deps:
	npm ci

build:
	npm run build

lint:
	npx eslint . --ext js,jsx,ts,tsx

publish:
	npm publish

deploy:
	git push heroku

test:
	npm test -s

test-coverage:
	npm test -- --coverage --coverageProvider=v8

.PHONY: install start start-backend start-frontend install-deps build lint publish deploy test test-coverage
