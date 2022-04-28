/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TypeParse, Types as T } from "../src/TypeParse";

export interface TestUnit {
  name: string;
  parser: TypeParse;
  input: unknown;
  expected: unknown;
}

const tests: TestUnit[] = [
  {
    name: "Nested number parse",
    input: {
      obj: {
        value: 123.4,
      },
    },
    parser: new TypeParse(T.Number({ path: "obj.value" })),
    expected: 123.4,
  },
  {
    name: "Nested string parse",
    input: {
      obj: {
        value: 123.4,
      },
    },
    parser: new TypeParse(T.String({ path: "obj.value" })),
    expected: "123.4",
  },
  {
    name: "Nested boolean (true) parse",
    input: {
      obj: {
        value: true,
      },
    },
    parser: new TypeParse(T.Boolean({ path: "obj.value" })),
    expected: true,
  },
  {
    name: "Nested boolean (false) parse",
    input: {
      obj: {
        value: false,
      },
    },
    parser: new TypeParse(T.Boolean({ path: "obj.value" })),
    expected: false,
  },
  {
    name: "Nested string array parse",
    input: {
      obj: {
        value: [1, 2, 3],
      },
    },
    parser: new TypeParse(T.Array(T.String(), { path: "obj.value" })),
    expected: ["1", "2", "3"],
  },
  {
    name: "Nested number array parse",
    input: {
      obj: {
        value: ["1.23", "-4.56", "100.1010"],
      },
    },
    parser: new TypeParse(T.Array(T.Number(), { path: "obj.value" })),
    expected: [1.23, -4.56, 100.101],
  },
  {
    name: "Nested boolean array parse",
    input: {
      obj: {
        value: [true, false, false],
      },
    },
    parser: new TypeParse(T.Array(T.Boolean(), { path: "obj.value" })),
    expected: [true, false, false],
  },
  {
    name: "Deep nested array value parse",
    input: {
      obj: {
        value: [
          {
            number: "123",
            string: "hello world!",
            boolean: false,
          },
          {
            number: "-123.123",
            string: "hello world! again",
            boolean: true,
          },
          {
            number: "0.0",
            string: "hello world! again, again",
            boolean: false,
          },
        ],
      },
    },
    parser: new TypeParse(
      T.Array(
        T.Object({
          pnumber: T.Number({ path: "number" }),
          pstring: T.String({ path: "string" }),
          pboolean: T.Boolean({ path: "boolean" }),
        }),
        { path: "obj.value" }
      )
    ),
    expected: [
      {
        pnumber: 123,
        pstring: "hello world!",
        pboolean: false,
      },
      {
        pnumber: -123.123,
        pstring: "hello world! again",
        pboolean: true,
      },
      {
        pnumber: 0.0,
        pstring: "hello world! again, again",
        pboolean: false,
      },
    ],
  },
  {
    name: "Deep nested indexed[0] array value parse",
    input: {
      obj: {
        value: [
          [
            {
              number: "123",
              string: "hello world!",
              boolean: false,
            },
            {
              number: "-123.123",
              string: "hello world! again",
              boolean: true,
            },
            {
              number: "0.0",
              string: "hello world! again, again",
              boolean: false,
            },
          ],
        ],
      },
    },
    parser: new TypeParse(
      T.Array(
        T.Object({
          pnumber: T.Number({ path: "number" }),
          pstring: T.String({ path: "string" }),
          pboolean: T.Boolean({ path: "boolean" }),
        }),
        { path: "obj.value.[0]" }
      )
    ),
    expected: [
      {
        pnumber: 123,
        pstring: "hello world!",
        pboolean: false,
      },
      {
        pnumber: -123.123,
        pstring: "hello world! again",
        pboolean: true,
      },
      {
        pnumber: 0.0,
        pstring: "hello world! again, again",
        pboolean: false,
      },
    ],
  },
  {
    name: "Partial array parse",
    input: {
      obj: {
        array: ["123", "asd", "123.35", "-2.3"],
      },
    },
    parser: new TypeParse(
      T.Array(T.Number().optional(), { path: "obj.array" })
    ),
    expected: [123, 123.35, -2.3],
  },
  {
    name: "Nested infered multiple values",
    input: {
      id: "123456",
      user: {
        name: "JohnD",
      },
      contactInfo: {
        phoneNumbers: ["123", "345", "567"],
      },
    },
    parser: new TypeParse(
      T.Object({
        id: T.Number(),
        userInfo: T.Object(
          {
            name: T.String(),
          },
          { path: "user" }
        ),
        phone: T.Number({ path: "contactInfo.phoneNumbers.[-2]" }),
      })
    ),
    expected: {
      id: 123456,
      userInfo: {
        name: "JohnD",
      },
      phone: 345,
    },
  },
  {
    name: "Type any",
    input: {
      id: "123456",
      user: {
        name: "JohnD",
      },
      contactInfo: {
        phoneNumbers: ["123", "345", "567"],
      },
    },
    parser: new TypeParse(
      T.Object({
        id: T.Number(),
        user: T.Any(),
        phone: T.Number({ path: "contactInfo.phoneNumbers.[-2]" }),
      })
    ),
    expected: {
      id: 123456,
      user: {
        name: "JohnD",
      },
      phone: 345,
    },
  },
  {
    name: "Deep nested unions",
    input: {
      value1: "invalid",
      value2: "-123",
      value3: "1",
      array: [
        { value: true },
        { value: false },
        "Hello world!",
        { value: "123" },
      ],
      array2: [1, 2, "A"],
    },
    parser: new TypeParse(
      T.Object({
        id: T.Union([
          T.Number({ path: "value1" }),
          T.Number({ path: "value2" }),
          T.String({ path: "value3" }),
        ]),
        array: T.Array(
          T.Union([
            T.Object({ value: T.Union([T.Boolean(), T.Number()]) }),
            T.String(),
          ])
        ),
        array2: T.Array(T.Union([T.Number(), T.Boolean()]).optional(), {
          path: "array",
        }),
      })
    ),
    expected: {
      id: -123,
      array: [
        { value: true },
        { value: false },
        "Hello world!",
        { value: 123 },
      ],
      array2: [],
    },
  },
  {
    name: "Nested infered multiple values",
    input: {
      id: "123456",
      user: {
        name: "JohnD",
      },
      contactInfo: {
        phoneNumbers: ["123", "345", "567"],
      },
    },
    parser: new TypeParse(
      T.Object({
        id: T.Number(),
        user: T.Object({
          name: T.String(),
        }),
        phone: T.Number({ path: "contactInfo.phoneNumbers.[-2]" }),
      })
    ),
    expected: {
      id: 123456,
      user: {
        name: "JohnD",
      },
      phone: 345,
    },
  },
  {
    name: "Type any",
    input: {
      id: "123456",
      user: {
        name: "JohnD",
      },
      contactInfo: {
        phoneNumbers: ["123", "345", "567"],
      },
    },
    parser: new TypeParse(
      T.Object({
        id: T.Number(),
        user: T.Any(),
        phone: T.Number({ path: "contactInfo.phoneNumbers.[-2]" }),
      })
    ),
    expected: {
      id: 123456,
      user: {
        name: "JohnD",
      },
      phone: 345,
    },
  },
  {
    name: "Custom parse",
    input: {
      value1: "invalid",
      value2: "-123",
      value3: "1",
    },
    parser: new TypeParse(
      T.Object({
        value1: T.Custom(
          (input: unknown): boolean => (input === "invalid" ? false : true),
          { path: "value1" }
        ),
        value2: T.Custom(
          (input: unknown): number => {
            if (typeof input !== "string") return 0;
            const number = parseInt(input);
            if (number < 0) return -number;
            return number;
          },
          { path: "value2" }
        ),
        value3: T.Custom(
          (input: unknown): boolean => (input === "1" ? true : false),
          { path: "value3" }
        ),
      })
    ),
    expected: {
      value1: false,
      value2: 123,
      value3: true,
    },
  },
];

export default tests;
