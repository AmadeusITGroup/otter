# How to generate screenshots for the visual testing

To minimize discrepancies on the screenshots between different operating systems, we are generating the screenshots from inside a docker.

## From a fork

Open a PR on your fork, it will run the [Main CI](../../../../.github/workflows/main.yml) workflow.
This one will call the [E2E Tests](../../../../.github/workflows/e2e-tests.yml) workflow.
If the visual testing is failing, it will open a PR for you with the updated screenshots, targeting your branch.

## Locally

The procedure is the following:

1. Prerequisite: you need a docker setup (or podman), `docker` should be available globally
2. Build your application with your latest modifications `yarn nx build showcase`.
3. Serve the application on port 8080 `npx http-server ./apps/showcase/dist/browser`\
     The script will look on all local interfaces for an app running on `http://localhost:8080`
4. Make sure all your changes on the spec files are committed `git commit`\
     The project is cloned inside the docker image using `git clone` to avoid polluting the original folder.\
     Only the screenshots are exported.
5. Run the script to launch the e2e-tests inside the docker image `yarn workspace @o3r/showcase run update-screenshots`
6. You should now have the updated screenshots in your project.

> [!NOTE]
> The following options can be configured :
>
> - The local application dev-server port via the option `--port=<port>` or the environment variable `UPDATE_SCREENSHOTS_PORT` *(default: 8080)*
> - The docker client via the option `--docker=<docker|podman>` or the environment variable `UPDATE_SCREENSHOTS_DOCKER` *(default: docker)*
