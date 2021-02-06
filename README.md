# @keqingrong/http-client

[![npm version](https://img.shields.io/npm/v/@keqingrong/http-client.svg)](https://www.npmjs.com/package/@keqingrong/http-client)

A JavaScript HTTP client based on axios and fetch-jsonp

## Installation

```bash
# npm
npm install @keqingrong/http-client

# yarn
yarn add @keqingrong/http-client
```

## Usage

```ts
import { http, HttpClient } from '@keqingrong/http-client';

interface ResponseData { }

(async () => {
  try {
    const response = await http.get<ResponseData>(url);
    // ...
  } catch(err) {
    // ...
  }
})();
```

## API

```js
// GET method
http.get(url);
http.get(url, { foo: 'bar' });
http.get(url, new URLSearchParams());

// POST method
http.post(url, { foo: 'bar' });

// Shortcuts POST method
http.postFormUrlencoded(url, { foo: 'bar' });
http.postFormUrlencoded(url, new URLSearchParams());
http.postFormData(url, new FormData());
http.postJSON(url, { foo: 'bar' });

// JSONP
http.jsonp(url);
http.jsonp(url, { foo: 'bar' });
http.jsonp(url, new URLSearchParams());

// Custom
http.request({
  url,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
  data: { foo: 'bar' }
});
```

## License

MIT © Qingrong Ke
