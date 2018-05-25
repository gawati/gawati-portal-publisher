const axios = require("axios");
const path = require("path");
const extract = require("extract-zip");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const constants = require("./constants");
const qh = require("./utils/QueueHelper");
const uh = require("./utils/UriHelper");
const sh = require("./utils/ServiceHelper");

/**
 * Extract a zip folder
 */
const unzip = (src, dest) => {
  return new Promise(function(resolve, reject) {
    extract(src, {dir: dest}, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

/**
 * Reads a given file to string.
 */
const readFile = (filename) => {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, "utf8", function(err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Syncs doc with gawati-data
 */
const syncPkg = (xmlPackage) => {
  console.log(" IN: syncPkg");
  const syncPkgApi = sh.getApi("xmlServer", "syncPkg");
  const {url, method} = syncPkgApi;
  return axios({
      method: method,
      url: url,
      data: xmlPackage
  })
}

/**
 * Extract zip and sync docs with gawati-data.
 * Publish status of pkg processed by the gawati-data.
 * To-Do: Status fail messages
 */
const toGawatiData = (zipObj) => {
  console.log(" IN: toGawatiData");
  const {iri, zipPath: src} = zipObj;
  const targetName = src.split("/").pop().split(".")[0];
  const dest = constants.TMP_AKN_FOLDER();

  //XML doc name and path
  const docName = uh.fileNameFromIRI(iri, "xml");
  const docPath = path.join(constants.TMP_AKN_FOLDER(), targetName, docName);

  unzip(src, path.resolve(dest))
  .then((res) => {
    console.log("Extracted to ", targetName);
    return readFile(docPath);
  })
  .then((data) => {
    xmlPackage = {
      "fileXml": docName,
      "iri": iri,
      "data": data
    };
    return syncPkg(xmlPackage);
  })
  .then((res) => {
    console.log(res.data);
    res.data.success
    ? qh.publishStatus(qh.formMsg(iri,'published','Published on Gawati-Data'))
    : qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher'));
  })
  .catch((err) => {
    qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher'));
    console.log(err);
  });
};

module.exports.toGawatiData = toGawatiData;