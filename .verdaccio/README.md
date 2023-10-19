# Verdaccio

Verdaccio is a tool used to publish npm packages in a local registry (https://verdaccio.org/)

You can run the following commands inside this folder

## How to start

Unix:
```bash
docker run -d -it --rm --name verdaccio -p 4873:4873 -v "$(pwd)/conf":/verdaccio/conf -v "$(pwd)/storage":/verdaccio/storage:z verdaccio/verdaccio
```

Windows:
```bash
docker run -d -it --rm --name verdaccio -p 4873:4873 -v "%cd%/conf":/verdaccio/conf -v "%cd%/storage":/verdaccio/storage verdaccio/verdaccio
```

## How to stop

```bash
docker ps -a -q --filter="name=verdaccio" | xargs docker container stop
```

## How to use

Add `registry=http://127.0.0.1:4873` in your `.npmrc` / `yarnrc.yml` files or as a parameter of the install command
