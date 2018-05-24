/**
 * Construct msg for STATUS_Q
 */
const formMsg = (iri, status, message) => {
  return msg = {
    "iri": iri,
    "status": status,
    "message": message
  };
}

/**
 * Publish on STATUS_Q
 */
const publishStatus = (msg) => {
  console.log(" IN: publishStatus");
  console.log(msg);
  const mq = require("../queues");
  const qName = 'STATUS_Q';
  const ex = mq.getExchange();
  const key = mq.getQKey(qName);
  mq.getChannel(qName).publish(ex, key, new Buffer(JSON.stringify(msg)));
  console.log(" Status dispatched to Portal Q Processor");
}

module.exports = {
  formMsg: formMsg,
  publishStatus: publishStatus
}