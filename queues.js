const amqp = require('amqplib/callback_api');
const publish = require('./publishPkg');
const retract = require('./retractPkg');

/**
 * Important: mqConfig channels get set in the async calls.
 */
let mqConfig = {
  "exchange" : "portal_doc_publish",
  "ZIP_Q": {
    "key": "zipQ",
    "channel": {}
  },
  "STATUS_Q": {
    "key": "statusQ",
    "channel": {}
  },
  "IRI_Q": {
    "key": "iriQ",
    "channel": {}
  }
}
 
function bail(err) {
  console.error(err);
  process.exit(1);
}

function getExchange() {
  return mqConfig.exchange;
}

function getChannel(qName) {
  return mqConfig[qName].channel;
}

function setChannel(qName, ch) {
  mqConfig[qName].channel = ch;
}

function getQKey(qName) {
  return mqConfig[qName].key;
}
 
// Publisher
function publisherStatusQ(conn) {
  const qName = 'STATUS_Q';
  const ex = getExchange();
  const key = getQKey(qName);

  conn.createChannel(onOpen);
  function onOpen(err, channel) {
    if (err != null) bail(err);
    setChannel(qName, channel);
    channel.assertExchange(ex, 'direct', {durable: true});
    console.log(" %s publisher channel opened", qName);

    //Test Message
    // let msg = 'Hello World!';
    // let msg = "/akn/ke/act/legge/1970-06-03/Cap_44/eng@/!main";
    // channel.publish(ex, key, new Buffer(msg));
    // console.log(" [x] Sent %s: '%s'", key, msg);
  }
}
 
// Consumer for zipped pkgs to be published
function consumerZipQ(conn) {
  const qName = 'ZIP_Q';
  const ex = getExchange();
  const key = getQKey(qName);

  conn.createChannel(onOpen);
  function onOpen(err, channel) {
    if (err != null) bail(err);
    channel.assertExchange(ex, 'direct', {durable: true});
    channel.assertQueue('portal_zip_q', {exclusive: false, durable: true}, function(err, q) {
      console.log(" %s consumer channel opened.", qName);
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
      channel.bindQueue(q.queue, ex, key);
      channel.consume(q.queue, function(msg) {
        console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
        const zipObj = JSON.parse(msg.content.toString());
        publish.toGawatiData(zipObj);
      }, {noAck: true});

      //For standalone testing only
      // publisherZipQ(conn);
    });
  }
}

// Consumer for IRIs to be retracted
function consumerIriQ(conn) {
  const qName = 'IRI_Q';
  const ex = getExchange();
  const key = getQKey(qName);

  conn.createChannel(onOpen);
  function onOpen(err, channel) {
    if (err != null) bail(err);
    channel.assertExchange(ex, 'direct', {durable: true});
    channel.assertQueue('portal_iri_q', {exclusive: false, durable: true}, function(err, q) {
      console.log(" %s consumer channel opened.", qName);
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
      channel.bindQueue(q.queue, ex, key);
      channel.consume(q.queue, function(msg) {
        console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
        retract.toGawatiData(JSON.parse(msg.content.toString()));
      }, {noAck: true});
    });
  }
}
 
const rabbit = amqp.connect('amqp://localhost', function(err, conn) {
  console.log(" AMQP CONNECTED");
  if (err != null) bail(err);
  consumerZipQ(conn);
  consumerIriQ(conn);
  publisherStatusQ(conn);
});

module.exports = {
    rabbit: rabbit,
    getExchange: getExchange,
    getChannel: getChannel,
    getQKey: getQKey
};