const axios = require("axios");
const path = require("path");
const extract = require("extract-zip");
const mkdirp = require("mkdirp");
const constants = require("./constants");
const qh = require("./utils/QueueHelper");

const unzip = (src, dest) => {
  return new Promise(function(resolve, reject) {
    extract(src, {dir: dest}, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

/**
 * Extract zip and sync docs with gawati-data.
 * Publish status of pkg processed by the gawati-data.
 */
const toGawatiData = (zipObj) => {
  console.log(" IN: toGawatiData");
  const {iri, zipPath: src} = zipObj;
  const targetName = src.split("/").pop().split(".")[0];
  const dest = constants.TMP_AKN_FOLDER();

  //Extract zip
  unzip(src, path.resolve(dest))
  .then((res) => {
    console.log("Extracted to ", targetName);
    //Sync docs with gawati-data

    //Publish on STATUS_Q
    qh.publishStatus(qh.formMsg(iri, 'published', 'Published on Gawati-Data'));
  })
  .catch((err) => {
    qh.publishStatus(qh.formMsg(iri, 'failed', 'Error on Portal Publisher'));
    console.log(err);
  });
};

module.exports.toGawatiData = toGawatiData;