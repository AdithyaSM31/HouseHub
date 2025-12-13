/**
 * Model Index
 * Exports all Mongoose models
 */

const User = require('./User');
const Property = require('./Property');
const Bookmark = require('./Bookmark');
const Conversation = require('./Conversation');
const Message = require('./Message');

module.exports = {
  User,
  Property,
  Bookmark,
  Conversation,
  Message
};
