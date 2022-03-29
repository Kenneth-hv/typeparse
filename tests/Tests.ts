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
    parser: new TypeParse(T.Number("obj.value")),
    expected: 123.4,
  },
  {
    name: "Nested string parse",
    input: {
      obj: {
        value: 123.4,
      },
    },
    parser: new TypeParse(T.String("obj.value")),
    expected: "123.4",
  },
  {
    name: "Nested boolean (true) parse",
    input: {
      obj: {
        value: true,
      },
    },
    parser: new TypeParse(T.Boolean("obj.value")),
    expected: true,
  },
  {
    name: "Nested boolean (false) parse",
    input: {
      obj: {
        value: false,
      },
    },
    parser: new TypeParse(T.Boolean("obj.value")),
    expected: false,
  },
  {
    name: "Nested string array parse",
    input: {
      obj: {
        value: [1, 2, 3],
      },
    },
    parser: new TypeParse(T.Array(T.String(), "obj.value")),
    expected: ["1", "2", "3"],
  },
  {
    name: "Nested number array parse",
    input: {
      obj: {
        value: ["1.23", "-4.56", "100.1010"],
      },
    },
    parser: new TypeParse(T.Array(T.Number(), "obj.value")),
    expected: [1.23, -4.56, 100.101],
  },
  {
    name: "Nested boolean array parse",
    input: {
      obj: {
        value: [true, false, false],
      },
    },
    parser: new TypeParse(T.Array(T.Boolean(), "obj.value")),
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
          pnumber: T.Number("number"),
          pstring: T.String("string"),
          pboolean: T.Boolean("boolean"),
        }),
        "obj.value"
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
          pnumber: T.Number("number"),
          pstring: T.String("string"),
          pboolean: T.Boolean("boolean"),
        }),
        "obj.value.[0]"
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
];

export default tests;
