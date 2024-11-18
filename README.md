# Robert's Rules of Order Website

### Development

This project is a [React](https://react.dev/) website written in [TypeScript](https://www.typescriptlang.org/) built with [Vite](https://vitejs.dev/). The backend is [Express](https://expressjs.com/) and also uses TypeScript. Packages and dependencies are managed with [npm](https://www.npmjs.com/). In order to develop and deploy this website you will need to have installed `npm` on your system. Deployments for the project are hosted on [Render](https://render.com/).

#### Frontend

On the top level of the project are all the configuration files related to Vite, TypeScript, the [package.json](package.json), and utilities related to linting and formatting. The [src](src/) folder contains the contents of the React app.

The main file of the React app is [main.tsx](src/main.tsx), which contains the contexts for persistent data, URL routing, responsive styling, and the application itself. [App.tsx](src/app/App.tsx) contains the actual routing (done with [react-router-dom](https://reactrouter.com/en/main)).

##### Styling

Styling for this project is done with [SCSS](https://sass-lang.com/) contained in [CSS Modules](https://github.com/css-modules/css-modules). Combining both the SCSS pre-processor with the flexibility of CSS modules leads to a much better developer experience and a smoother user experience on the website. The core styles are located in [styles/](src/styles/) and are responsible for CSS variables relating to color and effects, element default styling, and more.

#### Backend

The backend is built using Express and [socket.io](https://socket.io/). All authentication-related methods (`/api/v1/login` and `/api/v1/signup`) are handled through an Express API, returning a JWT token that is used for authorizing the user's connection to the website. That token is passed in when initializing a socket.io connection, which is used for realtime communication for all committee-related data.

#### Operation

##### Running Locally

To run the web app locally for development, use the following commands from the root directory:

```
npm install
npm run dev
```

The project is then accessible at `localhost:3000`. Note that quick refreshing is possible for frontend changes but any modifications of the backend require the development server to be restarted.

##### Building for Production

To simulate building and running the website for production use:

```
npm run build
npm run start
```

These are the build and activation scripts used by the deployment platform. Upon any successful merge into the `main` branch the CI/CD pipeline will automatically trigger and deploy the new version of the website to production.

#### Linting & Formatting

Linting is done with [ESLint 9](https://eslint.org/) while code formatting is done with [Prettier](https://prettier.io/) and [Stylelint](https://stylelint.io/). These can be triggered by executing `npm run format`.

### Best Practices

#### Pre-Commit Hooks

All linting, formatting, and TypeScript checking is automatically ran using [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) upon each commit.

#### Branches

While developing, to keep the repository more organized, try to work on a separate branch following the naming convention of {_name or username_}/{_short description of issue / feature_}. This will be helpful for writing weekly progress reports to get a sense of what everyone has been working on. The `main` branch has branch protection enabled, so just make a pull request to merge in the feature branch when done.

### Design

#### Color Tokens

Primary: #09BC8A

Darker Primary: #004346
