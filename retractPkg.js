const axios = require("axios");
const path = require("path");
const constants = require("./constants");
const qh = require("./utils/QueueHelper");
const sh = require("./utils/ServiceHelper");
const fh = require("./utils/FileHelper");

const ACTION = 'retract';

/**
 * Delete attachments (if present) from the filesystem
 */
const deleteAtt = (iri) => {
  return new Promise(function(resolve, reject) {
    let arrIri = iri.split("/");
    let subPath = arrIri.slice(1, arrIri.length - 1 ).join("/");
    const attPath = path.join(constants.AKN_ATT_FOLDER(), subPath);

    fh.fileExists(attPath)
    .then(res => {
      return res 
      ? fh.removeFileFolder(attPath)
      : resolve(true)
    })
    .then(res => resolve(true))
    .catch(err => reject(err))
  });
}

/**
 * Delete package for IRI from gawati-data
 */
const deleteFromDB = (iri) => {
  console.log(" IN: deleteFromDB");
  const deletePkgApi = sh.getApi("xmlServer", "deletePkg");
  const {url, method} = deletePkgApi;
  const data = {iri};

  return axios({
      method: method,
      url: url,
      data: data
  })
}

/**
 * Delete package for IRI from gawati-data.
 * Publish status of pkg deleted by the gawati-data.
 */
const toGawatiData = ({iri, action}) => {
  console.log(" IN: toGawatiData");
  const deletePkgApi = sh.getApi("xmlServer", "deletePkg");
  const {url, method} = deletePkgApi;
  const data = {iri};

  deleteAtt(iri)
  .then(res => {
    return deleteFromDB(iri)
  })
  .then(res => {
    console.log(res.data);
    res.data.success
    ? qh.publishStatus(qh.formMsg(iri,'retracted','Retracted from Gawati-Data', ACTION))
    : qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher', ACTION));
  })
  .catch(err => {
    qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher', ACTION));
    console.log(err);
  })
};

module.exports.toGawatiData = toGawatiData;