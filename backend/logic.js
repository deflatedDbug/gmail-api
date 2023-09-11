const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
 async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deletes emails based on a query filter
 *
 *  @param {google.auth.OAuth2} auth An authorized oAuth2 client
 */
 async function deleteEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  let totalDeleted = 0;
  let nextPageToken = null;
  let backoffTime = 1000;

  do {
    try {
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'is: unread Subject: ',
        maxResults: 100,
        pageToken: nextPageToken,
      });

      const messages = listResponse.data.messages;
      nextPageToken = listResponse.data.nextPageToken;

      if (messages && messages.length > 0) {
        console.log(`Found ${messages.length} matching emails`);

        const deletePromises = messages.map(message => 
          gmail.users.messages.delete({
            userId: 'me',
            id: message.id,
          })
        );

        await Promise.all(deletePromises);

        console.log(`Deleted ${messages.length} messages.`);
        totalDeleted += 50;
      } else {
        console.log('No messages found.');
        console.log(`Total messages deleted: ${totalDeleted}.`)
        break;
      }

      await sleep(500);  // sleep for 500 milliseconds
      backoffTime = 1000;  // Reset backoff time if successful

    } catch (error) {
      console.log(`The API returned an error: ${error}`);

      if (error.message.includes('Quota exceeded') || error.message.includes('Too many concurrent requests for user')) {
        console.log(`Rate limit hit. Backing off for ${backoffTime / 1000} seconds.`);
        await sleep(backoffTime);
        backoffTime *= 2;  // Double the backoff time
      }
    }
  } while (nextPageToken);
}

// authorize().then(deleteEmails).catch(console.error);


module.exports = {
  deleteEmails, 
  authorize,
};