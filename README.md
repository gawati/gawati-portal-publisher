# Portal Publisher Component for Gawati Publishing
- Reads the zip package path from ZIP_Q
- Extracts the zip folder
- Syncs docs with Portal DB (gawati-data)
- Writes updated status on STATUS_Q 

### Setup
1. Clone the repo
    ```
    git clone git@gitlab.com:bungenicom/gawati/gawati-portal-publisher.git
    ```
2. Install packages
    ```
    npm install
    ```
3. Run
    ```
    node index.js
    ```

### Dependencies
1. This component needs to on the same system as gawati-portal-qprocessor.
2. It depends on several other components which are a part of the *Publishing Workflow*. The following components need to be started, in the given order, prior to gawati-editor-qprocessor:
    - gawati-data

### Config
2. Package path: This is set in `constants.js` and refers to the filesystem path where extracted zip packages are stored.
3. Service end points: Endpoints for talking to gawati-data. Set in `configs/dataServer.json`

##### The full documentation of the *Publishing Workflow* is [here]