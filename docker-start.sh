docker-compose --env-file ./.production.env down --volumes &&
docker-compose --env-file ./.production.env up --build --force-recreate