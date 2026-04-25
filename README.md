`docker-compose -f docker-compose.dev.yaml up -d` to instantiate postgres db container
-f means to read specific file
-d means to run docker in the background without locking the terminal window
`docker-compose -f docker-compose.dev.yaml stop` to stop db container without deleting the data
`docker compose -f docker-compose.dev.yaml down -v` to close and destroy volume
`docker volume rm` to remove container
`docker ps` to check all runing containers
