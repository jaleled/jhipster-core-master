/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  readFile,
  readFiles
};

function readFiles(iterable) {
  if (!iterable) {
    throw new BuildException(exceptions.NullPointer, 'The passed files must not be nil.');
  }
  return iterable.map(path => readFile(path));
}

function readFile(path) {
  if (!path) {
    throw new BuildException(exceptions.NullPointer, 'The passed file must not be nil.');
  }
  if (isFileADirectoryOrInvalid(path)) {
    throw new BuildException(
      exceptions.WrongFile,
      `The passed file '${path}' must exist and must not be a directory.`);
  }
  return fs.readFileSync(path, 'utf-8').toString();
}

function isFileADirectoryOrInvalid(file) {
  let isDirOrInvalid = false;
  try {
    isDirOrInvalid = fs.statSync(file).isDirectory();
  } catch (error) { // doesn't exist
    isDirOrInvalid = true;
  }
  return isDirOrInvalid;
}