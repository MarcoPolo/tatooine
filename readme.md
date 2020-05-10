# Tatooine: A pluggable, simple and powerful web scraper.

<!-- [![Dependency Status](https://dependencyci.com/github/obetomuniz/tatooine/badge)](https://dependencyci.com/github/obetomuniz/tatooine)
[![Build Status](https://travis-ci.org/obetomuniz/tatooine.svg?branch=master)](https://travis-ci.org/obetomuniz/tatooine)
[![Coverage Status](https://coveralls.io/repos/github/obetomuniz/tatooine/badge.svg?branch=master)](https://coveralls.io/github/obetomuniz/tatooine?branch=master) -->

<img src="https://cloud.githubusercontent.com/assets/1680157/17003290/a47ea06a-4ea5-11e6-8fc0-c36988534226.png" />

## Installation

```ssh
$ npm install tatooine --save
```

## Documentation

```js
const result = Tatooine(schemas, customEngines)
```

**@param schemas {Array\<Object\>}**

A list of schemas following the default and/or custom engines registered.

**@param customEngines {Array\<Promise\>}**

A list of custom engines to be registered.

**@return {Promise}**

Returns a promise with data sources. If configured schemas are not valid, it return `[]`.

## Default Engines

For commodity, Tatooine comes for you with two default engines.

- [Nodes Engine docs](https://github.com/obetomuniz/tatooine/tree/master/examples/nodes)
- [JSON Engine docs](https://github.com/obetomuniz/tatooine/tree/master/examples/json)

## Custom Engines

Beyond of the default engines provided by default, you can create and plugin custom engines with yours specific rules. Basically, you should follow the below to extend Tatooine capabilities:

```js
// customengine.js

function getSourcesFromSomewhere(schema) {
  // Your engine logic
}

export default {
  type: "customschema",
  runtime: getSourcesFromSomewhere,
}
```

```js
// schemas.js

export default [{
  type: "customschema",
  ...
}];
```

```js
// index.js

import Tatooine from "tatooine"

import customengine from "./customengine.js"
import schemas from "./schemas.js"

const result = await Tatooine(schemas, [customengine])
```

#### License

[The MIT License (MIT)](https://betomuniz.mit-license.org/)

Copyright (c) 2016 Beto Muniz (http://betomuniz.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
