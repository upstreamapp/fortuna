.PHONY: docker-compose-dev
docker-compose-dev:
	DOPPLER_CONFIG=dev doppler run -- docker-compose -f docker-compose.yaml up -d

.PHONY: docker-compose-dev-no-doppler
docker-compose-dev-no-doppler:
	docker-compose -f docker-compose.yaml up -d
