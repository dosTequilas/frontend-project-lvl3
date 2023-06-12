   
install:
	npm ci

lint:
	npx eslint .

# test-coverage:
# 	npm test -- --coverage --coverageProvider=v8

test:
	npm run test

build:
	npm run build