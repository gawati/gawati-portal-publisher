const axios = require("axios");

/**
 * Extract zip and sync docs with gawati-data.
 * Publish status of pkg processed by the gawati-data.
 */
const toGawatiData = (zipObj) => {
  console.log(" IN: toGawatiData");
  //Extract zip

  //Sync docs with gawati-data

  //Publish on STATUS_Q
  const msg = {
    "iri": zipObj.iri,
    "status": "published" 
  }
  const mq = require("./queues");
  const qName = 'STATUS_Q';
  const ex = mq.getExchange();
  const key = mq.getQKey(qName);
  mq.getChannel(qName).publish(ex, key, new Buffer(JSON.stringify(msg)));
  console.log(" Status published on STATUS_Q");
};

module.exports.toGawatiData = toGawatiData;