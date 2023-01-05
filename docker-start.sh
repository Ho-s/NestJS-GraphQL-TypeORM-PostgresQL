docker-compose --env-file ./.development.env down --volumes &&
docker-compose --env-file ./.development.env up --build --force-recreate