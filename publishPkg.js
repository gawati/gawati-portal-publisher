const axios = require("axios");
const path = require("path");
const extract = require("extract-zip");
const mkdirp = require("mkdirp");
const constants = require("./constants");

const unzip = (src, dest) => {
  return new Promise(function(resolve, reject) {
    extract(src, {dir: dest}, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

const publishStatus = (msg) => {
  const mq = require("./queues");
  const qName = 'STATUS_Q';
  const ex = mq.getExchange();
  const key = mq.getQKey(qName);
  mq.getChannel(qName).publish(ex, key, new Buffer(JSON.stringify(msg)));
  console.log(" Status published on STATUS_Q");
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
    const msg = {
      "iri": zipObj.iri,
      "status": "published"
    }
    publishStatus(msg);
  })
  .catch(err => console.log(err));
};

module.exports.toGawatiData = toGawatiData;