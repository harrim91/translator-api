# Translator API

Web API providing language translation functionality using AWS.

## Endpoints

### `POST /translate`

#### Request Params

```json
{
  "text": "String - The text to translate. Defaults to empty string.",
  "file": "String - Optional file key provided when calling the `upload` endpoint. If provided, it will take override the `text` key. The service will extract text from the image and translate the text.",
  "to": "String - required - The language code to translate to. See below for supported languages.",
  "from": "String - The language code to translate from. If not provided, the service will try to detect the language automatically."
}
```

#### Response

```json
{
  "source": "Text sent in the request",
  "translation": "The translated text",
  "audio": "URL of translation audio if the target language is supported",
  "sourceLanguage": "Source language code from request, or auto-detected",
  "targetLanguage": "Target language code from request",
}
```

### `GET /upload`

Returns a signed URL to upload an image for text extraction.

#### Response

```json
{
  "url": "Make a PUT request to this URL with binary image data to upload it",
  "key": "filename of the uploaded file. Once the file is uploaded, use this to call the `translate` endpoint.",
}
```

## Supported Languages

- **Code / Language / Supports Voice**
- ar / Arabic / yes
- cs / Czech / no
- da / Danish / yes
- de / German / yes
- en / English / yes
- es / Spanish / yes
- fi / Finnish / no
- fr / French / yes
- he / Hebrew / no
- id / Indonesian / no
- it / Italian / yes
- ja / Japanese / yes
- ko / Korean / yes
- nl / Dutch / yes
- no / Norwegian / yes
- pl / Polish / yes
- pt / Portuguese / yes
- ru / Russian / yes
- sv / Swedish / yes
- tr / Turkish / yes
- zh / Chinese / yes
