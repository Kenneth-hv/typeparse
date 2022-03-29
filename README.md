# TypeParse

Runtime object parsing and validation with static TypeScript typing.

:warning: This package is currently under development and is not stable.

## Install

### Using npm
```Bash
npm install typeparse
```

### Using yarn
```Bash
yarn add typeparse
```

## Example of use

```TypeScript
import { TypeParse, Types as T } from "typeparse";

const input = JSON.parse(
  `{
    "id": "12345",
    "userInfo": {
      "name": "John Doe",
      "phone": "+1 234 567 890"
    }
  }`
);

// Parsing configuration
const tp = new TypeParse({
  option: T.Object({
    id: T.Number({ from: "id" }),
    name: T.String({ from: "userInfo.name" }),
    phoneNumber: T.String({ from: "userInfo.phone" }),
  }),
});

const user = tp.parse(input); // Parsed with inferred type

console.log(user.id);

```
