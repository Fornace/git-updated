# GIT UPDATED
![GitHub](https://img.shields.io/github/license/Fornace/git-updated)
![npm](https://img.shields.io/npm/v/git-updated)


## About
`git-updated` is a Node.js module that automatically updates a JSON file with the last modified dates of files in your Git repository. This tool is designed to run as a Git `pre-push` hook, ensuring your file modification records are always up-to-date with your latest commits.

## Features

- **Automatic Tracking:** Automatically track the last modified dates of all files in your Git repository.
- **Zero Configuration:** Install the package, and you're all set – no additional setup required.
- **Non-Intrusive:** Works seamlessly with your existing Git workflow.

## Installation

Install `git-updated` using npm:

```bash
npm install simple-git-hooks
npm install git-updated
```

That's it! `git-updated` will automatically set up a `pre-push` Git hook in your repository.

## How It Works

Once installed, `git-updated` adds a `pre-push` hook to your Git repository. Before each push, it generates or updates a `.git-updated/file_dates.json` file in your repository root. This file contains a JSON object mapping each file in your repository to its last modified date, based on your Git commit history.

## Structure of the JSON File

The `file_dates.json` file has the following structure:

```json
{
    "src/index.js": "2023-12-09 07:37:33",
    "src/utils.js": "2023-12-09 07:37:33",
    "README.md": "2023-12-09 07:37:33",
    "package.json": "2023-12-09 07:37:33"
}
```

## Compatibility

`git-updated` is designed to work with any standard Git repository. It requires Node.js to be installed in your environment.

## Customization

While `git-updated` is designed to work out of the box with no configuration, you can customize the behavior by editing the `.husky/pre-push` file in your project.


## Contributing

Contributions to `git-updated` are welcome! Please submit pull requests, report issues, or request features.

## License

`git-updated` is using [Unlicense](./LICENSE).