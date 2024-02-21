"use strict";

const metalsmith = require("metalsmith");
const assets = require("metalsmith-assets");
const relative = require("metalsmith-relative");
const prefixoid = require("metalsmith-prefixoid");

const argv = require("minimist")(process.argv.slice(2));

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
