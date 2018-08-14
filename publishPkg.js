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
const readFile = (filename, encoding="utf8") => {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, encoding, function(err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Check if file exists
 */
const fileExists = (path) => {
  return new Promise(function(resolve, reject) {
    fs.access(path, fs.constants.R_OK, function(err) {
      if (err) {
        err.code === 'ENOENT' ? resolve(false) : reject(err);
      } else {
        resolve(true)
      }
    })
  });
}

/**
 * Syncs doc with gawati-data
 */
const syncPkg = (publishPkg) => {
  console.log(" IN: syncPkg");
  const syncPkgApi = sh.getApi("xmlServer", "syncPkg");
  const {url, method} = syncPkgApi;
  return axios({
      method: method,
      url: url,
      data: publishPkg
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
  const keyName = uh.fileNameFromIRI(iri, "public");

  //Use resolve to avoid repeated paths in windows.
  const docPath = path.resolve(constants.TMP_AKN_FOLDER(), targetName, docName);
  const keyPath = path.resolve(constants.TMP_AKN_FOLDER(), targetName, keyName);
  console.log(" docPath: ", docPath);
  let keyExists = false;

  unzip(src, path.resolve(dest))
  .then(res => {
    console.log("Extracted to ", targetName);
    return fileExists(keyPath)
  })
  .then(res => {
    keyExists = res; 
    return keyExists 
      ? Promise.all([readFile(docPath), readFile(keyPath, "base64")])
      : readFile(docPath)
  })
  .then(data => {
    let publishPkg = {
      "key": keyExists ? data[1] : '',
      "iri": iri,
      "doc": keyExists ? data[0] : data
    };
    return syncPkg(publishPkg);
  })
  .then((res) => {
    console.log(res.data);
    res.data.success
    ? qh.publishStatus(qh.formMsg(iri,'published','Published on Gawati-Data', ACTION))
    : qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher', ACTION));
  })
  .catch((err) => {
    qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher', ACTION));
    console.log(err);
  });
};

module.exports.toGawatiData = toGawatiData;