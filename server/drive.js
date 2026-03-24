const { google } = require('googleapis');
const fs = require('fs');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const uploadFileToDrive = async (file, folderId, accessToken) => {
  oauth2Client.setCredentials({ access_token: accessToken });

  const fileMetadata = {
    name: file.name,
    parents: [folderId]
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.tempFilePath)
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });
    return response.data.id;
  } catch (err) {
    console.error('Drive upload error:', err);
    throw err;
  }
};

module.exports = { uploadFileToDrive };
