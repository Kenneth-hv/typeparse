# TypeParse

Runtime object transformation, parsing and validation with inferred static TypeScript typing.

---

## Install

### Using npm

```Bash
npm install typeparse
```

### Using yarn

```Bash
yarn add typeparse
```

---

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

---

## Object transformation

In case we need to not only parse an object but also to trasform it (i.e.):

```JSON
{
  "user": {
    "name": "John",
    "lastName": "Doe",
  },
  "email": "john.doe.@mail.com",
  "phoneNumbers": ["123-456-7890", "321-654-0987"]
}

```

To

```JSON
{
  "name": "John",
  "lastName": "Doe",
  "contactInfo": {
    "email": "john.doe.@mail.com",
    "phone": "123-456-7890"
  }
}

```

We can use the `path` parameter in order to create a new object, specifying the path from the original objects root to define each value.

```TypeScript
import { TypeParse, Types as T } from "typeparse";

const input = {
  user: {
    name: "John",
    lastName: "Doe",
  },
  email: "4522 Sigley Road",
  phoneNumbers: ["123-456-7890", "321-654-0987"],
};

const tp = new TypeParse(
  T.Object({
    name: T.String("user.name"),
    lastName: T.String("user.lastName"),
    contactInfo: T.Object({
      email: T.String("email"),
      phone: T.String("phoneNumbers.[0]"),
    }),
  })
);

console.log(tp.parse(input));
// {
//   name: 'John',
//   lastName: 'Doe',
//   contactInfo: {
//     email: '4522 Sigley Road',
//     phone: '123-456-7890'
//   }
// }

```
