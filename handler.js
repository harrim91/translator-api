'use strict';

const AWS = require('aws-sdk');
const { supported, voices } = require('./languages.json');

module.exports.translate = async (event) => {
  const body = JSON.parse(event.body);

  if (!(body.to && supported.includes(body.to.toLowerCase()))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid target language code provided.' }),
    };
  }

  try {
    const data = await new AWS.Translate().translateText({
      Text: body.text || '',
      SourceLanguageCode: body.from || 'auto',
      TargetLanguageCode: body.to,
    }).promise();

    let file = null;

    if (voices.some(v => v.languageCode === body.to)) {
      const voice = voices.find(v => v.languageCode === body.to);
      const { AudioStream } = await new AWS.Polly().synthesizeSpeech({
        OutputFormat: 'mp3',
        Text: data.TranslatedText,
        VoiceId: voice.id,
      }).promise();

      file = await new AWS.S3().upload({
        Bucket: process.env.TRANSLATION_BUCKET_NAME,
        Key: `translation-${new Date().valueOf()}.mp3`,
        Body: AudioStream,
      }).promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        source: body.text || '',
        translation: data.TranslatedText,
        audio: file && file.Location,
        sourceLanguage: data.SourceLanguageCode,
        targetLanguage: data.TargetLanguageCode,
      }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
