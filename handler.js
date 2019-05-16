'use strict';

const AWS = require('aws-sdk');
const { supported, voices } = require('./languages.json');

const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

module.exports.translate = async (event) => {
  const body = JSON.parse(event.body);

  if (!(body.to && supported.includes(body.to.toLowerCase()))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid target language code provided.' }),
    };
  }

  try {
    const s3 = new AWS.S3();

    let text = body.text || '';


    if (body.file) {
      const { Body } = await s3.getObject({
        Bucket: process.env.TRANSLATION_BUCKET_NAME,
        Key: body.file,
      }).promise();

      const { TextDetections } = await new AWS.Rekognition().detectText({
        Image: {
          Bytes: Body,
        },
      }).promise();

      // const { Labels } = await new AWS.Rekognition().detectLabels({
      //   Image: {
      //     Bytes: Body,
      //   },
      //   MaxLabels: 1,
      // }).promise();

      if (TextDetections.some(({ Type }) => Type === 'LINE')) {
        text = TextDetections
          .filter(({ Type }) => Type === 'LINE')
          .map(({ DetectedText }) => DetectedText)
          .join(' ');
      }

      // if (Labels.length > 0) {
      //   text = Labels[0].Name;
      // }
    }

    const data = await new AWS.Translate().translateText({
      Text: text,
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

      file = await s3.upload({
        Bucket: process.env.TRANSLATION_BUCKET_NAME,
        Key: `translations/translation-${new Date().valueOf()}.mp3`,
        Body: AudioStream,
      }).promise();
    }

    return respond(200, {
      source: text,
      translation: data.TranslatedText,
      audio: file && file.Location,
      sourceLanguage: data.SourceLanguageCode,
      targetLanguage: data.TargetLanguageCode,
    });
  } catch (error) {
    return respond(error.statusCode, { error: error.message });
  }
};

module.exports.upload = () => {
  const s3 = new AWS.S3({ signatureVersion: 'v4' });
  const key = `files/upload-${new Date().valueOf()}`;

  return new Promise((resolve) => {
    s3.getSignedUrl('putObject', {
      Bucket: process.env.TRANSLATION_BUCKET_NAME,
      Key: key,
      Expires: 300,
    }, (error, url) => {
      if (error) {
        resolve(respond(error.statusCode, { error: error.message }));
      } else {
        resolve(respond(200, { url, key }));
      }
    });
  });
};
