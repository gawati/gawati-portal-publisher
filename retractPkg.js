const axios = require("axios");
const qh = require("./utils/QueueHelper");
const sh = require("./utils/ServiceHelper");

/**
 * Delete package for IRI from gawati-data.
 * Publish status of pkg deleted by the gawati-data.
 */
const toGawatiData = ({iri, action}) => {
  console.log(" IN: toGawatiData");
  const deletePkgApi = sh.getApi("xmlServer", "deletePkg");
  const {url, method} = deletePkgApi;
  const data = {iri};

  return axios({
      method: method,
      url: url,
      data: data
  })
  .then((res) => {
    console.log(res.data);
    res.data.success
    ? qh.publishStatus(qh.formMsg(iri,'retracted','Retracted from Gawati-Data'))
    : qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher'));
  })
  .catch((err) => {
    qh.publishStatus(qh.formMsg(iri,'failed','Error on Portal Publisher'));
    console.log(err);
  });
};

module.exports.toGawatiData = toGawatiData;