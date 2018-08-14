const path = require("path");
const API_PROTOCOL = process.env.API_PROTOCOL || 'http' ;
const API_HOST = process.env.API_HOST || 'localhost' ;
const API_PORT = process.env.API_PORT || '8080' ;

/** Folders */
const TMP_AKN_FOLDER = () => path.join(".", "tmp");
const AKN_ATT_FOLDER = () => path.join(".", "akn_data");

const API_SERVER_BASE = () =>
    API_PROTOCOL + '://' + API_HOST + ":" + API_PORT + '/exist/restxq';

const PROCESS_NAME = "GAWATI-PORTAL-PUBLISHER";

module.exports = {
    TMP_AKN_FOLDER: TMP_AKN_FOLDER,
    API_SERVER_BASE: API_SERVER_BASE,
    PROCESS_NAME: PROCESS_NAME,
    AKN_ATT_FOLDER: AKN_ATT_FOLDER
};