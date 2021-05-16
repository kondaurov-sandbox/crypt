dockerImage = "kondaurov/cryptcmp"

dev:
	pnpx tsc -w

build-docker:
	docker build . -t ${dockerImage}

attach-docker:
	docker run --rm -it --entrypoint=sh ${dockerImage}

run:
	node dist/main.js

pm2-reload:
	pm2 delete all
	pm2 start ecosystem.yaml