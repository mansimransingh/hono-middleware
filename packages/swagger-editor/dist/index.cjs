"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  MODERN_NORMALIZE_CSS: () => MODERN_NORMALIZE_CSS,
  swaggerEditor: () => swaggerEditor
});
module.exports = __toCommonJS(src_exports);
var DEFAULT_VERSION = "4.13.1";
var CDN_LINK = "https://cdn.jsdelivr.net/npm/swagger-editor-dist";
var MODERN_NORMALIZE_CSS = `
*,
::before,
::after {
    box-sizing: border-box;
}

html {
    font-family:
        system-ui,
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif,
        'Apple Color Emoji',
        'Segoe UI Emoji';
    line-height: 1.15; /* 1. Correct the line height in all browsers. */
    -webkit-text-size-adjust: 100%; /* 2. Prevent adjustments of font size after orientation changes in iOS. */
    tab-size: 4; /* 3. Use a more readable tab size (opinionated). */
}

body {
    margin: 0;
}

b,
strong {
    font-weight: bolder;
}

code,
kbd,
samp,
pre {
    font-family:
        ui-monospace,
        SFMono-Regular,
        Consolas,
        'Liberation Mono',
        Menlo,
        monospace; /* 1 */
    font-size: 1em; /* 2 */
}

small {
    font-size: 80%;
}

sub,
sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
}

sub {
    bottom: -0.25em;
}

sup {
    top: -0.5em;
}

table {
    border-color: currentcolor;
}

button,
input,
optgroup,
select,
textarea {
    font-family: inherit; /* 1 */
    font-size: 100%; /* 1 */
    line-height: 1.15; /* 1 */
    margin: 0; /* 2 */
}

button,
[type='button'],
[type='reset'],
[type='submit'] {
    -webkit-appearance: button;
}

legend {
    padding: 0;
}

progress {
    vertical-align: baseline;
}

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
    height: auto;
}

[type='search'] {
    -webkit-appearance: textfield; /* 1 */
    outline-offset: -2px; /* 2 */
}

::-webkit-search-decoration {
    -webkit-appearance: none;
}

::-webkit-file-upload-button {
    -webkit-appearance: button; /* 1 */
    font: inherit; /* 2 */
}

summary {
    display: list-item;
}

.Pane2 {
    overflow-y: scroll;
}
`;
function getUrl(version) {
  return `${CDN_LINK}@${version ? version : DEFAULT_VERSION}`;
}
function swaggerEditor(options = {}) {
  const url = getUrl();
  options.layout = "StandaloneLayout";
  const optionString = Object.entries(options).map(([key, value]) => {
    if (typeof value === "string") {
      return `${key}:'${value}'`;
    }
    if (Array.isArray(value)) {
      return `${key}:${value.map((v) => `${v}`).join(", ")}`;
    }
    if (typeof value === "object") {
      return `${key}:${JSON.stringify(value)}`;
    }
    return `${key}: ${value}`;
  }).join(",");
  return async (c) => c.html(`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Swagger Editor</title>
        <style>
            ${MODERN_NORMALIZE_CSS}
        </style>
        <link href="${url}/swagger-editor.css" rel="stylesheet">
        <link rel="icon" type="image/png" href="${url}/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="${url}/favicon-16x16.png" sizes="16x16" />
    </head>

    <body>
        <div id="swagger-editor"></div>
        <script src="${url}/swagger-editor-bundle.js"> </script>
        <script src="${url}/swagger-editor-standalone-preset.js"> </script>
        <script>
        window.onload = function() {
            const editor = SwaggerEditorBundle({
            dom_id: '#swagger-editor',
            presets: [
                SwaggerEditorStandalonePreset
            ],
            queryConfigEnabled: true,
            ${optionString}
            })
            window.editor = editor
        }
        </script>
    </body>
</html>
`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MODERN_NORMALIZE_CSS,
  swaggerEditor
});
