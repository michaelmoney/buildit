const Metalsmith = require("metalsmith");
let ms = Metalsmith(__dirname);
const fsMetadata = require("metalsmith-fs-metadata");
const pathNoIndex = require("./lib/metalsmith-path-noindex");
const buildInfo = require("./lib/metalsmith-build-info");
const envInfo = require("./lib/metalsmith-env-info");
const humanDate = require("./lib/metalsmith-humandate");
const collections = require("metalsmith-collections");
const frontmatterFileLoader = require("metalsmith-frontmatter-file-loader");
const frontmatterRenderer = require("metalsmith-frontmatter-renderer");
const inPlace = require("metalsmith-in-place");
const layouts = require("metalsmith-layouts");
const beautify = require("metalsmith-beautify");
const drafts = require("metalsmith-drafts");
const htmlMinifierOptimise = require("./lib/metalsmith-html-minifier-optimise");
const mapsiteCurrentenv = require("./lib/metalsmith-mapsite-currentenv");
const jobListings = require("./lib/metalsmith-job-listings");
const gravityPaths = require("@buildit/gravity-ui-web/build-api");
const namedIndexSort = require("./lib/sorts/named-index-sort");
const dateSort = require("./lib/sorts/date-sort");
const fs = require("fs");

ms.source("./pages")
  .destination("./dist")
  .clean(false)
  .metadata({
    gravitySvgContents: fs.readFileSync(
      gravityPaths.distPath(gravityPaths.distSvgSymbolsFilename),
      "utf8"
    )
  })
  .use(
    fsMetadata({
      config: "./config/site.json"
    })
  )
  .use(buildInfo())
  .use(envInfo())
  .use(humanDate())
  .use(jobListings())
  .use(
    collections({
      colMainNav: {
        sortBy: namedIndexSort("nav-index")
      },
      colArticles: {
        sortBy: namedIndexSort("article-index")
      },
      colStories: {
        sortBy: dateSort
      },
      colPeople: {
        sortBy: dateSort
      }
    })
  )
  .use(pathNoIndex())
  .use(
    inPlace({
      suppressNoFilesError: true
    })
  )
  .use(
    frontmatterFileLoader({
      key: "blocks-md",
      suppressNoFilesError: true
    })
  )
  .use(
    frontmatterRenderer({
      key: "blocks-md",
      out: "blocks",
      suppressNoFilesError: true,
      options: {
        html: true
      }
    })
  )
  .use(
    frontmatterFileLoader({
      key: "blocks-njk",
      suppressNoFilesError: true
    })
  )
  .use(
    frontmatterRenderer({
      key: "blocks-njk",
      out: "blocks",
      ext: "njk",
      suppressNoFilesError: true
    })
  )
  .use(layouts())
  .use(
    beautify({
      preserve_newlines: false
    })
  )
  .use(drafts())
  .use(
    htmlMinifierOptimise({
      minifierOptions: {
        removeComments: false
      }
    })
  )
  .use(
    mapsiteCurrentenv({
      omitIndex: true
    })
  )
  .build(function(err) {
    if (err) throw err;
    console.log("Metalsmith build complete!");
  });