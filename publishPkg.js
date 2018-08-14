const axios = require("axios");
const path = require("path");
const extract = require("extract-zip");
const constants = require("./constants");
const qh = require("./utils/QueueHelper");
const uh = require("./utils/UriHelper");
const sh = require("./utils/ServiceHelper");
const fh = require("./utils/FileHelper");

const ACTION = 'publish';

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
 * Get src and dest paths for attachments
 */
const getAttPathStruct = (iri, unzippedTmpDir) => {
  let arrIri = iri.split("/");
  let subPath = arrIri.slice(1, arrIri.length - 1 ).join("/");
  let attSrc = path.join(constants.TMP_AKN_FOLDER(), unzippedTmpDir, subPath);
  let attDest = path.join(constants.AKN_ATT_FOLDER(), subPath);
  return {attSrc, attDest};
}

/**
 * Save attachments (if present) to the filesystem
 */
const saveAtt = (attSrc, attDest) => {
  return new Promise(function(resolve, reject) {
    fh.fileExists(attSrc)
    .then(res => {
      if (res) {
        fh.mkdir(attDest)
        .then(res => fh.copyFiles(attSrc, attDest))
        .then(res => resolve(true))
        .catch(err => reject(err))
      } else {
        resolve(true)
      }
    })
    .catch(err => reject(err))
  });
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

  //Attachments paths
  const {attSrc, attDest} = getAttPathStruct(iri, targetName);

  unzip(src, path.resolve(dest))
  .then(res => {
    console.log("Extracted to ", targetName);
    return fh.fileExists(keyPath)
  })
  .then(res => {
    keyExists = res; 
    return keyExists 
      ? Promise.all([fh.readFile(docPath), fh.readFile(keyPath, "base64"), saveAtt(attSrc, attDest)])
      : Promise.all([fh.readFile(docPath), saveAtt(attSrc, attDest)])
  })
  .then(data => {
    let publishPkg = {
      "key": keyExists ? data[1] : '',
      "iri": iri,
      "doc": data[0]
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