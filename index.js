"use strict";

const path = require("path");

const metalsmith = require("metalsmith");
const markdown = require("metalsmith-markdown");
const assets = require("metalsmith-assets");
const layouts = require("metalsmith-layouts");
const multiLanguage = require("metalsmith-multi-language");
const permalinks = require("metalsmith-permalinks");
const collections = require("metalsmith-collections");
const rewrite = require("metalsmith-rewrite");
const slug = require("metalsmith-slug");
const relative = require("metalsmith-relative");
const prefixoid = require("metalsmith-prefixoid");

const argv = require("minimist")(process.argv.slice(2));

const DEFAULT_LOCALE = "en";
const LOCALES = ["en", "es"];

metalsmith(__dirname)
  .source("src")
  .use(relative())
  .use(assets({ source: "src/" }))
  .use(
    prefixoid({
      prefix: argv.base || "",
      tag: "a",
      attr: "href",
    })
  )
  .use(
    prefixoid({
      prefix: argv.base || "",
      tag: "img",
      attr: "src",
    })
  )
  .destination("dist")
  .build(function (err) {
    if (err) {
      console.error(err);
    }
  });
