docker network create --driver bridge --internal internal-net

docker run -d \
 --name redis-internal \
 --network internal-net \
 -e ALLOW_EMPTY_PASSWORD=yes \
 bitnami/redis:latest

docker run -d \
 --name redis-external \
 -e ALLOW_EMPTY_PASSWORD=yes \
 -p 6379:6379 \
 bitnami/redis:latest
