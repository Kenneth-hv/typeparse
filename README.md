# TypeParse

Runtime object transformation, parsing and validation with inferred static TypeScript typing.

## Install

### Using npm

```Bash
npm install typeparse
```

### Using yarn

```Bash
yarn add typeparse
```

## Example

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
const tp = new TypeParse(
  T.Object({
    id: T.Number("id"),
    name: T.String("userInfo.name"),
    phoneNumber: T.String("userInfo.phone"),
    address: T.String("userInfo.address", { defaultValue: "no-address" }),
    email: T.String("userInfo.email").optional(),
  })
);

const user = tp.parse(input); // User is parsed with inferred type

console.log(user);
// {
//   id: 12345,
//   name: 'John Doe',
//   phoneNumber: '+1 234 567 890',
//   address: 'no-address',
//   email: undefined
// }
```
