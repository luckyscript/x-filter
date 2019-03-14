'use strict';

const Parser = require('./parser');
const parseInstance = new Parser();
exports = module.exports = (tag) => parseInstance.parse(tag);
