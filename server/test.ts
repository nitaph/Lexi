import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConversationsModel } from './src/models/ConversationsModel';
import { conversationsService } from './src/services/conversations.service';

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'lexi-test' });

  const conversationId = 'test-conv';

  // seed two messages
  await ConversationsModel.create({
    conversationId,
    content: 'Hello from user',
    role: 'user',
    messageNumber: 1,
  });
  await ConversationsModel.create({
    conversationId,
    content: 'Hello from assistant',
    role: 'assistant',
    messageNumber: 2,
  });

  const messages = await conversationsService.getConversation(conversationId);
  console.log('Retrieved messages:', messages);

  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
}

run().catch((err) => console.error(err));
