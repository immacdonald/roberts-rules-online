# Robert's Rules of Order Website

### Development

This project is a [React](https://react.dev/) website written in [TypeScript](https://www.typescriptlang.org/) built with [Vite](https://vitejs.dev/). The backend is [Express](https://expressjs.com/) and also uses TypeScript. Packages and dependencies are managed with [npm](https://www.npmjs.com/). In order to develop and deploy this website you will need to have installed `npm` on your system.

#### Frontend

On the top level of the project are all the configuration files related to Vite, TypeScript, the [package.json](package.json), and utilities related to linting and formatting. The [src](src/) folder contains the contents of the React app.

The main file of the React app is [index.tsx](src/index.tsx), which contains the contexts for persistent data, URL routing, responsive styling, and the application itself. [App.tsx](src/App.tsx) contains the actual routing (done with [react-router-dom](https://reactrouter.com/en/main)).

##### Styling

Styling for this project is done with [SCSS](https://sass-lang.com/) contained in [CSS Modules](https://github.com/css-modules/css-modules). Combining both the SCSS pre-processor with the flexibility of CSS modules leads to a much better developer experience and a smoother user experience on the website. The "core" styles are located in [styles/core](src/styles/core) and are responsible for CSS variables relating to color and effects, element default styling, and more.

#### Backend

The backend is still a work in progress, it uses Express.

#### Running Locally

To run the web app locally for development, use the following command from the root directory:

```
npm run dev
```

The project is then accessible at `localhost:3000`. Note that quick refreshing is not enabled yet, so to see changes make sure to refresh the page.

#### Linting & Formatting

Linting is done with [ESLint](https://eslint.org/) while code formatting is done with [Prettier](https://prettier.io/) and [Stylelint](https://stylelint.io/). These can be triggered by executing `npm run format`.

### Best Practices

#### Pre-Commit Hooks

All linting, formatting, and TypeScript checking is automatically ran using Husky and lint-staged upon each commit.

#### Branches

While developing, to keep the repository more organized, try to work on a seperate branch following the naming convention of {_name or username_}/{_short description of issue / feature_}. This will be helpful for writing weekly progress reports to get a sense of what everyone has been working on. The `main` branch has branch protection enabled, so just make a pull request to merge in the feature branch when done.

### Design

#### Color Tokens

Primary: #09BC8A

Darker Primary: #004346
