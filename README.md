# Translator API

Web API providing language translation functionality using AWS.

## Endpoints

### `POST /translate`

#### Request Params

```json
{
  "text": "String - The text to translate. Defaults to empty string.",
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

## Supported Languages

- **Code / Language / Supports Voice**
- ar - Arabic - yes
- cs - Czech - no
- da - Danish - yes
- de - German - yes
- en - English - yes
- es - Spanish - yes
- fi - Finnish - no
- fr - French - yes
- he - Hebrew - no
- id - Indonesian - no
- it - Italian - yes
- ja - Japanese - yes
- ko - Korean - yes
- nl - Dutch - yes
- no - Norwegian - yes
- pl - Polish - yes
- pt - Portuguese - yes
- ru - Russian - yes
- sv - Swedish - yes
- tr - Turkish - yes
- zh - Chinese - yes
