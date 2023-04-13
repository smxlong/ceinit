#!/usr/bin/env node

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function downloadImage(url, filePath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.promises.writeFile(filePath, new Uint8Array(buffer));
}

// createChromeExtension creates a new Chrome Extension with the given name.
//
// Options:
// - defaultLocale: the default locale for the extension. Defaults to "en".
async function createChromeExtension(extensionName, options = {}) {
  // extensionDir is derived from the extensionName by lowercasing and replacing spaces with dashes
  const extensionDir = path.join(
    process.cwd(),
    extensionName.toLowerCase().replace(/ /g, "-")
  );

  // directories to create
  const directories = ["_locales", "_locales/en", "css", "js", "images"];

  // files to create
  const files = [
    {
      path: "manifest.json",
      content: `{
  "manifest_version": 3,
  "name": "${extensionName}",
  "default_locale": "${options.defaultLocale || "en"}",
  "description": "${options.description || ""}",
  "version": "1.0",
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    }
  },
  "permissions": [
    "activeTab"
  ],
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  }
}`,
    },
    {
      path: "_locales/en/messages.json",
      content: `{
  "appName": {
    "message": "${extensionName}"
  }
}`,
    },
    {
      path: "popup.html",
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="css/popup.css">
</head>
<body>
  <h1>${extensionName}</h1>
  <script src="js/popup.js"></script>
</body>
</html>`,
    },
    {
      path: "css/popup.css",
      content: "",
    },
    {
      path: "js/popup.js",
      content: "",
    },
  ];

  directories.forEach((dir) => {
    fs.mkdirSync(path.join(extensionDir, dir), { recursive: true });
  });

  files.forEach((file) => {
    fs.writeFileSync(path.join(extensionDir, file.path), file.content);
  });

  await Promise.all([
    downloadImage(
      "https://via.placeholder.com/16",
      path.join(extensionDir, "images/icon16.png")
    ),
    downloadImage(
      "https://via.placeholder.com/48",
      path.join(extensionDir, "images/icon48.png")
    ),
    downloadImage(
      "https://via.placeholder.com/128",
      path.join(extensionDir, "images/icon128.png")
    ),
  ]);

  console.log("Chrome Extension structure created successfully!");
}

// parse the command line with yargs
const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 <options> <extension-name>")
  .option("default-locale", {
    type: "string",
    description: "the default locale for the extension",
  })
  .option("description", {
    type: "string",
    description: "the description for the extension",
  })
  .demandCommand(1, "Please provide an extension name")
  .help().argv;

const extensionName = argv._[0];
const options = {
  defaultLocale: argv["default-locale"],
  description: argv.description,
};

createChromeExtension(extensionName, options);
