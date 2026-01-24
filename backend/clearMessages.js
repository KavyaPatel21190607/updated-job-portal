// Script to clear all messages from database
// Run with: node clearMessages.js

const mongoose = require('mongoose');
require('dotenv').config();

const Message = require('./src/models/Message');

async function clearMessages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Message.deleteMany({});
    console.log(`Deleted ${result.deletedCount} messages`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearMessages();
