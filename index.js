import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.mjs';
import { commandHandler, createCommands } from './commands/index.mjs';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.get('/healthcheck', (req, res) => res.send('ok'));

app.get('/verify-user', (req, res) => {
    res.send('verified');
})

app.get('/terms-of-service', (req, res) => {
  res.send('use at your own risk.');
})

app.get('/privacy-policy', (req, res) => {
  res.send('I might save your discord info to reference later. But I don\'t know your real name or anything... Nancy.');
})

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) commandHandler(req, res);
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);

  createCommands();
});
