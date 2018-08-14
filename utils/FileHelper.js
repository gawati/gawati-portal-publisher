const mkdirp = require("mkdirp");
const fs = require("fs-extra");

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
 * Copy files from src to dest.
 */
const copyFiles = (src, dest) => {
  return new Promise(function(resolve, reject) {
    fs.access(src, fs.constants.R_OK, (err) => {
      if (err) reject(err);
      else {
        fs.copy(src, dest, function(err) {
          if (err) reject(err);
          else resolve(true);
        })
      }
    });
  });
}

/**
 * Creates folder structure
 */
const mkdir = (path) => {
  return new Promise(function(resolve, reject) {
    mkdirp(path, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

/**
 * Remove file/folder at path.
 * Removes files in folder recursively (like rm -rf)
 */
const removeFileFolder = (path) => {
  return new Promise(function(resolve, reject) {
    fs.remove(path, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

module.exports = {
  readFile: readFile,
  fileExists: fileExists,
  copyFiles: copyFiles,
  mkdir: mkdir,
  removeFileFolder: removeFileFolder
}