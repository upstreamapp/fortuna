.PHONY: docker-compose-dev
docker-compose-dev:
	DOPPLER_CONFIG=dev doppler run -- docker-compose -f docker-compose.yaml up -d

#  builds the test database images and runs them. waits for the database to
#  be ready
.PHONY: database-connect-test
database-connect-test:
	@DOPPLER_CONFIG=test doppler run -- docker-compose --file docker-compose-test.yaml up -d
	@npx wait-on tcp:localhost:5434

.PHONY: database-test-destroy
database-test-destroy:
	docker-compose --file docker-compose-test.yaml down -v && docker-compose --file docker-compose-test.yaml rm -v

.PHONY: database-test-init
database-test-init: database-connect-test
	DOPPLER_CONFIG=test doppler run --command="npm run migration:up"

.PHONY: run-test
run-test: database-test-destroy database-test-init
	DOPPLER_CONFIG=test doppler run --command="npm run test:quick"
	docker-compose --file docker-compose-test.yaml down -v && docker-compose --file docker-compose-test.yaml rm -v


# ----- No Doppler Commands -----

.PHONY: docker-compose-dev-no-doppler
docker-compose-dev-no-doppler:
	docker-compose -f docker-compose.yaml up -d
