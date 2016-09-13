#!/usr/bin/env bash
CI_BUILD_REF=$TRAVIS_BUILD_ID
CI_BUILD_REF_NAME=$TRAVIS_BRANCH
POSTGRES_PASSWORD="zup"
POSTGRES_USER="zup"
POSTGRES_DB="zup"
SHARED_BUFFERS=128MB
POSTGRES_NAME="postgres$CI_BUILD_ID"
REDIS_NAME="redis$CI_BUILD_ID"
API_NAME="zup-api-$CI_BUILD_ID"
BUILDER_NAME="zup-painel-builder-$CI_BUILD_ID"
API_BRANCH=$CI_BUILD_REF_NAME

# Script setup
cleanup() {
    docker rm -f $POSTGRES_NAME 2>/dev/null
    docker rm -f $REDIS_NAME 2>/dev/null
    docker rm -f $API_NAME 2>/dev/null
    docker rm -f $BUILDER_NAME 2>/dev/null
    rm build.env || true
    rm api.env || true
    rm -rf zup-web || true
}

error_handler() {
    exit_code=$?
    echo "Error on line $1"
    cleanup
    exit $exit_code
}

trap 'error_handler $LINENO' ERR

# API env vars
echo API_URL=http://localhost:3000 >> api.env
echo WEB_URL=http://localhost:3000 >> api.env
echo SMTP_ADDRESS=smtp.sendgrid.net >> api.env
echo SMTP_PORT=587 >> api.env
echo SMTP_USER=zup >> api.env
echo SMTP_PASS=zup >> api.env
echo SMTP_TTLS=true >> api.env
echo SMTP_AUTH=plain >> api.env
echo REDIS_URL=redis://redis:6379 >> api.env
echo RACK_ENV=production >> api.env
echo DISABLE_EMAIL_SENDING=true >> api.env
echo DATABASE_URL=postgis://zup:zup@postgres:5432/zup >> api.env
echo ADMIN_PASSWORD=123456 >> api.env
echo SIDEKIQ_USER=admin >> api.env
echo SIDEKIQ_PASSWORD=admin >> api.env

set -xe

setup_api() {
    # Run redis and postgres
    docker run -d --name $POSTGRES_NAME -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -e POSTGRES_USER=$POSTGRES_USER -e POSTGRES_DB=$POSTGRES_DB -e SHARED_BUFFERS=128MB ntxcode/postgresql:9.4
    docker run --privileged -d --name $REDIS_NAME redis:2.8

    # Download image, loads schema and start the API
    docker pull institutotim/zup-api:$API_BRANCH || docker pull institutotim/zup-api:master && API_BRANCH="master"
    docker run --rm --link $REDIS_NAME:redis --link $POSTGRES_NAME:postgres -a stdout -a stderr --env-file api.env institutotim/zup-api:$API_BRANCH cat db/structure.sql > structure.sql
    docker cp structure.sql $POSTGRES_NAME:/tmp
    TIMEOUT=5
    until docker exec $POSTGRES_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB -c "select 1" > /dev/null 2>&1 || [ $TIMEOUT -eq 0 ]; do
      echo "Waiting for postgres server, $((TIMEOUT--)) remaining attempts..."
      sleep 15
    done
    docker exec $POSTGRES_NAME psql -f /tmp/structure.sql -U $POSTGRES_USER $POSTGRES_DB
    docker run --rm --link $REDIS_NAME:redis --link $POSTGRES_NAME:postgres -a stdout -a stderr --env-file api.env institutotim/zup-api:$API_BRANCH /bin/bash -c "bundle exec rake db:seed WITH_FAKE_DATA=true"
    docker run -d --link $REDIS_NAME:redis --link $POSTGRES_NAME:postgres --env-file api.env --name $API_NAME institutotim/zup-api:$API_BRANCH
    docker run --rm -a stdout -a stderr --link $API_NAME:api institutotim/zup-api:$API_BRANCH /bin/bash -c "while ! curl --silent --fail http://api/feature_flags; do sleep 1 && echo -n .; done;"
}

setup_api &
API_PID=$!

# Painel env vars
echo API_URL=http://api:80 >> build.env
echo MAP_LAT=-23.549671 >> build.env
echo MAP_LNG=-46.6321713 >> build.env
echo MAP_ZOOM=11 >> build.env
echo DEFAULT_CITY="São Paulo" >> build.env
echo DEFAULT_STATE=SP >> build.env
echo DEFAULT_COUNTRY=Brasil >> build.env
echo SERVER_IP=localhost >> build.env
echo SERVER_PORT=9001 >> build.env
echo USER_EMAIL=admin@zeladoriaurbana.com.br >> build.env
echo USER_PASSWORD=123456 >> build.env
echo FLOWS_ENABLED=true >> build.env
echo SENTRY_DSN=SENTRY_DSN >> build.env
echo GOOGLE_ANALYTICS=GOOGLE_ANALYTICS_KEY >> build.env

# Build & test
docker build -t $BUILDER_NAME .
wait $API_PID
docker run -v /dev/shm:/dev/shm -a stdout -a stderr --link $API_NAME:api --name $BUILDER_NAME $BUILDER_NAME

deploy() {
  if [ "$CI_BUILD_REF_NAME" = "unicef" ]; then
    rm -rf zup-web || true
    mkdir -p ~/.ssh
    SSH_DEPLOY_KEY=~/.ssh/id_rsa
    openssl aes-256-cbc -K $encrypted_407d56f21fee_key -iv $encrypted_407d56f21fee_iv -in .travis/deploy_key.enc -out $SSH_DEPLOY_KEY -d
    chmod 600 $SSH_DEPLOY_KEY
    eval `ssh-agent -s`
    ssh-add $SSH_DEPLOY_KEY
    git clone --depth 1 --branch $CI_BUILD_REF_NAME $ZUP_WEB_REPO_ACCESS || git clone --depth 1 --branch master $ZUP_WEB_REPO_ACCESS
    cd zup-web
    [[ $(git symbolic-ref --short -q HEAD) = $CI_BUILD_REF_NAME ]] || git checkout -b $CI_BUILD_REF_NAME
    rm -rf zup-painel
    docker cp $BUILDER_NAME:/tmp/zup-painel/dist ./zup-painel
    git config --global user.name 'CI'
    git config --global user.email 'ci@zeladoriaurbana.com.br'
    git add --all zup-painel
    git commit --allow-empty -m "Painel build $CI_BUILD_ID"
    git push origin $CI_BUILD_REF_NAME --force
    cd ..
  fi
}

[[ "$1" = "--deploy" ]] && deploy

cleanup
