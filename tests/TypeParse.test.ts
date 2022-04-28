/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kenneth Herrera. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TypeParse, Types as T } from "../src/TypeParse";
import { expect } from "chai";
import { describe } from "mocha";
import tests from "./Tests";

describe("Primitive types", () => {
  const subject = {
    obj: {
      numberValue: 123.4,
      stringValue: "Hello world!",
      booleanValue: false,
    },
  };

  it("Number", () => {
    const tp = new TypeParse(T.Number({ path: "obj.numberValue" }));
    const result = tp.parse(subject);
    expect(result).to.be.equal(subject.obj.numberValue);
  });

  it("String", () => {
    const tp = new TypeParse(T.String({ path: "obj.stringValue" }));
    const result = tp.parse(subject);
    expect(result).to.be.equal(subject.obj.stringValue);
  });

  it("Boolean", () => {
    const tp = new TypeParse(T.Boolean({ path: "obj.booleanValue" }));
    const result = tp.parse(subject);
    expect(result).to.be.equal(subject.obj.booleanValue);
  });
});

describe("Simple type parsing", () => {
  const subject = {
    string: {
      fromNumber: 1234.67,
      fromString: "Hello world!",
      fromBoolean: false,
    },
    number: {
      fromNumber: 1234.67,
      fromString: "999",
      fromStringInvalid: "invalid",
      fromBoolean: true,
    },
    boolean: {
      fromNumber: 123,
      fromString: "",
      fromBoolean: false,
    },
  };

  describe("String", () => {
    it("from number", () => {
      const tp = new TypeParse(T.String({ path: "string.fromNumber" }));
      expect(tp.parse(subject)).to.be.equal("1234.67");
    });
    it("from string", () => {
      const tp = new TypeParse(T.String({ path: "string.fromString" }));
      expect(tp.parse(subject)).to.be.equal("Hello world!");
    });
    it("from boolean", () => {
      const tp = new TypeParse(T.String({ path: "string.fromBoolean" }));
      expect(tp.parse(subject)).to.be.equal("false");
    });
  });

  describe("Number", () => {
    it("from number", () => {
      const tp = new TypeParse(T.Number({ path: "string.fromNumber" }));
      expect(tp.parse(subject)).to.be.equal(1234.67);
    });
    it("from string", () => {
      const tp = new TypeParse(T.Number({ path: "number.fromString" }));
      expect(tp.parse(subject)).to.be.equal(999);
    });
    it("from string (invalid)", () => {
      const tp = new TypeParse(T.Number({ path: "number.fromStringInvalid" }));
      expect(() => {
        const result = tp.parse(subject);
        console.log(result);
      }).to.throw("Unable to convert [string] to [number]");
    });
    it("from boolean", () => {
      const tp = new TypeParse(T.Number({ path: "number.fromBoolean" }));
      expect(() => tp.parse(subject)).to.throw(
        "Unable to convert [boolean] to [number]"
      );
    });
  });

  describe("Boolean", () => {
    describe("Strict", () => {
      it("from number", () => {
        const tp = new TypeParse(T.Boolean({ path: "boolean.fromNumber" }));
        expect(() => tp.parse(subject)).to.throw();
      });
      it("from string", () => {
        const tp = new TypeParse(T.Boolean({ path: "boolean.fromString" }));
        expect(() => tp.parse(subject)).to.throw();
      });
      it("from boolean", () => {
        const tp = new TypeParse(T.Boolean({ path: "boolean.fromBoolean" }));
        expect(tp.parse(subject)).to.be.equal(false);
      });
    });
    describe("Non-Strict", () => {
      it("from number", () => {
        const tp = new TypeParse(
          T.Boolean({ path: "boolean.fromNumber", strict: false })
        );
        expect(tp.parse(subject)).to.be.equal(true);
      });
      it("from string", () => {
        const tp = new TypeParse(
          T.Boolean({ path: "boolean.fromString", strict: false })
        );
        expect(tp.parse(subject)).to.be.equal(false);
      });
      it("from boolean", () => {
        const tp = new TypeParse(
          T.Boolean({ path: "boolean.fromBoolean", strict: false })
        );
        expect(tp.parse(subject)).to.be.equal(false);
      });
    });
  });
});

describe("Default values", () => {
  it("(String)", () => {
    const tp = new TypeParse(
      T.String({ path: "x", defaultValue: "<default>" })
    );
    expect(tp.parse(undefined)).to.be.equal("<default>");
  });
  it("(Number)", () => {
    const tp = new TypeParse(T.Number({ path: "x", defaultValue: 123 }));
    expect(tp.parse(undefined)).to.be.equal(123);
  });
  it("(Boolean)", () => {
    const tp = new TypeParse(T.Boolean({ path: "x", defaultValue: false }));
    expect(tp.parse(undefined)).to.be.equal(false);
  });
});

describe("Array parsing", () => {
  const subject = {
    array: [
      {
        v1: 123.4,
        v2: "333.3",
        v3: false,
      },
      {
        v1: 123.4,
        v2: "333.3",
        v3: false,
      },
      {
        v1: 123.4,
        v2: "333.3",
        v3: false,
      },
    ],
  };

  it("Multiple parsing", () => {
    const tp = new TypeParse(
      T.Array(
        T.Object({
          v1: T.Number({ path: "v1" }),
          v2: T.Number({ path: "v2" }),
          v3: T.Boolean({ path: "v3" }),
        }),
        { path: "array" }
      )
    );

    const result = tp.parse(subject);

    expect(result).to.be.deep.equal([
      {
        v1: 123.4,
        v2: 333.3,
        v3: false,
      },
      {
        v1: 123.4,
        v2: 333.3,
        v3: false,
      },
      {
        v1: 123.4,
        v2: 333.3,
        v3: false,
      },
    ]);
  });

  describe("Error handling", () => {
    const obj = {
      a: [123, -123, "hello"],
    };
    it("#1", () => {
      const tp = new TypeParse(T.Array(T.Number(), { path: "array" }));
      expect(() => tp.parse(obj)).to.throw(
        "Unable to find a valid [array] value at [array]"
      );
    });
    it("#2", () => {
      const tp = new TypeParse(T.Array(T.Number()));
      expect(() => tp.parse(undefined)).to.throw(
        "Invalid type, expected [array] but found [undefined]"
      );
    });
  });
});

describe("Optional types", () => {
  it("(string)", () => {
    const tp = new TypeParse(T.String({ path: "x" }).optional());
    expect(tp.parse({})).to.be.equal(undefined);
  });
  it("(number)", () => {
    const tp = new TypeParse(T.Number({ path: "x" }).optional());
    expect(tp.parse({})).to.be.equal(undefined);
  });
  it("(boolean)", () => {
    const tp = new TypeParse(T.Boolean({ path: "x" }).optional());
    expect(tp.parse({})).to.be.equal(undefined);
  });
  it("(object)", () => {
    const tp = new TypeParse(
      T.Object({
        obj: T.Object({
          value: T.String({ path: "value" }),
        }).optional(),
      })
    );
    const result = tp.parse({});
    expect(result).to.be.deep.equal({ obj: undefined });
  });
  it("(array)", () => {
    const tp = new TypeParse(
      T.Object({
        array: T.Array(T.String({ path: "value" })).optional(),
      })
    );
    const result = tp.parse({});
    expect(result).to.be.deep.equal({ array: undefined });
  });
  it("(not optional object, throws error)", () => {
    const tp = new TypeParse(
      T.Object({
        obj: T.Object({
          value: T.String({ path: "value" }),
        }),
      })
    );
    expect(() => tp.parse({})).to.throw(
      "Unable to find a valid [string] value at [value]"
    );
  });
  it("(not optional array, throws error #1)", () => {
    const tp = new TypeParse(
      T.Object({
        array: T.Array(T.String({ path: "value" })),
      })
    );
    expect(() => tp.parse({})).to.throw(
      "Unable to find a valid [array] value at [array]"
    );
  });
  it("(not optional number array, throws error #2)", () => {
    const tp = new TypeParse(
      T.Object({
        array: T.Array(T.Number({ path: "value" })),
      })
    );
    expect(() => tp.parse({ array: ["Hello"] })).to.throw(
      "Unable to find a valid [number] value at [value]"
    );
  });
});

describe("Edge cases", () => {
  describe("Undefined input", () => {
    describe("Primitive types", () => {
      it("(string)", () => {
        const tp = new TypeParse(T.String({ path: "x" }));
        expect(() => tp.parse(undefined)).to.throw(
          "Unable to find a valid [string] value at [x]"
        );
      });
      it("(string, optional)", () => {
        const tp = new TypeParse(T.String({ path: "x" }).optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
      it("(number)", () => {
        const tp = new TypeParse(T.Number({ path: "x" }));
        expect(() => tp.parse(undefined)).to.throw(
          "Unable to find a valid [number] value at [x]"
        );
      });
      it("(number, optional)", () => {
        const tp = new TypeParse(T.Number({ path: "x" }).optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
      it("(boolean)", () => {
        const tp = new TypeParse(T.Boolean({ path: "x" }));
        expect(() => tp.parse(undefined)).to.throw(
          "Unable to find a valid [boolean] value at [x]"
        );
      });
      it("(boolean, optional)", () => {
        const tp = new TypeParse(T.Boolean({ path: "x" }).optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });

      it("(boolean)", () => {
        const tp = new TypeParse(T.Boolean({ path: "x" }));
        expect(() => tp.parse(undefined)).to.throw(
          "Unable to find a valid [boolean] value at [x]"
        );
      });
      it("(boolean, optional)", () => {
        const tp = new TypeParse(T.Boolean({ path: "x" }).optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
    });
    describe("Array and object", () => {
      it("(array)", () => {
        const tp = new TypeParse(T.Array(T.String({ path: "x" })));
        expect(() => tp.parse(undefined)).to.throw(
          "Invalid type, expected [array] but found [undefined]"
        );
      });
      it("(array, optional)", () => {
        const tp = new TypeParse(T.Array(T.String({ path: "x" })).optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
      it("(object)", () => {
        const tp = new TypeParse(T.Object({ x: T.String({ path: "x" }) }));
        expect(() => tp.parse(undefined)).to.throw(
          "Invalid type, expected [object] but found [undefined]"
        );
      });
      it("(object, optional)", () => {
        const tp = new TypeParse(
          T.Object({ x: T.String({ path: "x" }) }).optional()
        );
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
    });
  });
});

describe("Relative paths", () => {
  const obj = {
    value1: 123,
    value2: "123",
    value3: true,
    value4: [1, 2, 3],
    nested: {
      value1: 123,
      value2: "123",
      value3: true,
      value4: [1, 2, 3],
      nested: {
        value1: 123,
        value2: "123",
        value3: true,
        value4: [1, 2, 3],
      },
    },
  };
  it("(string)", () => {
    const tp = new TypeParse(T.Object({ value1: T.String() }));
    expect(tp.parse(obj)).to.be.deep.equal({ value1: "123" });
  });
  it("(number)", () => {
    const tp = new TypeParse(T.Object({ value2: T.Number() }));
    expect(tp.parse(obj)).to.be.deep.equal({ value2: 123 });
  });
  it("(boolean)", () => {
    const tp = new TypeParse(T.Object({ value3: T.Boolean() }));
    expect(tp.parse(obj)).to.be.deep.equal({ value3: true });
  });
  it("(array)", () => {
    const tp = new TypeParse(T.Object({ value4: T.Array(T.String()) }));
    expect(tp.parse(obj)).to.be.deep.equal({ value4: ["1", "2", "3"] });
  });
  describe("Nested object", () => {
    it("(string)", () => {
      const tp = new TypeParse(
        T.Object({
          nested: T.Object({
            value1: T.String(),
          }),
        })
      );
      expect(tp.parse(obj)).to.be.deep.equal({ nested: { value1: "123" } });
    });
    it("(number)", () => {
      const tp = new TypeParse(
        T.Object({
          nested: T.Object({
            value2: T.Number(),
          }),
        })
      );
      expect(tp.parse(obj)).to.be.deep.equal({ nested: { value2: 123 } });
    });
    it("(boolean)", () => {
      const tp = new TypeParse(
        T.Object({
          nested: T.Object({
            value3: T.Boolean(),
          }),
        })
      );
      expect(tp.parse(obj)).to.be.deep.equal({ nested: { value3: true } });
    });
    it("(array)", () => {
      const tp = new TypeParse(
        T.Object({
          nested: T.Object({
            nested: T.Object({ value4: T.Array(T.String()) }),
          }),
        })
      );
      expect(tp.parse(obj)).to.be.deep.equal({
        nested: { nested: { value4: ["1", "2", "3"] } },
      });
    });
  });
  describe("Double nested object", () => {
    it("(string)", () => {
      const tp = new TypeParse(
        T.Object({
          nested: T.Object({
            nested: T.Object({
              value1: T.String(),
            }),
          }),
        })
      );
      expect(tp.parse(obj)).to.be.deep.equal({
        nested: { nested: { value1: "123" } },
      });
    });
    it("(number)", () => {
      const tp = new TypeParse(
        T.Object({
          nested: T.Object({
            nested: T.Object({
              value2: T.Number(),
            }),
          }),
        })
      );
      expect(tp.parse(obj)).to.be.deep.equal({
        nested: { nested: { value2: 123 } },
      });
    });
    it("(boolean)", () => {
      const tp = new TypeParse(
        T.Object({
          nested: T.Object({
            nested: T.Object({
              value3: T.Boolean(),
            }),
          }),
        })
      );
      expect(tp.parse(obj)).to.be.deep.equal({
        nested: { nested: { value3: true } },
      });
    });
  });
});

describe("Union", () => {
  describe("(string, boolean, number)", () => {
    const tp = new TypeParse(T.Union([T.Boolean(), T.Number(), T.String()]));
    it("(boolean)", () => {
      expect(tp.parse(true)).to.be.equal(true);
      expect(tp.parse(false)).to.be.equal(false);
    });
    it("(number)", () => {
      expect(tp.parse(123.45)).to.be.equal(123.45);
      expect(tp.parse(-0.45)).to.be.equal(-0.45);
      expect(tp.parse("123.45")).to.be.equal(123.45);
      expect(tp.parse("-0.45")).to.be.equal(-0.45);
    });
    it("(string)", () => {
      expect(tp.parse("Hello!")).to.be.equal("Hello!");
    });
    it("(invalid parse)", () => {
      expect(() => tp.parse({})).to.throw(
        "Cannot parse to match any type of union"
      );
    });
  });
  describe("(Object, arrays, primitives)", () => {
    const tp = new TypeParse(
      T.Union([
        T.String(),
        T.Object({ value: T.Number() }),
        T.Array(T.Union([T.Number(), T.Boolean(), T.String()])),
      ])
    );
    it("(string)", () => {
      expect(tp.parse("Hello world!")).to.be.equal("Hello world!");
    });
    it("(object)", () => {
      expect(tp.parse({ value: "123.45" })).to.be.deep.equal({ value: 123.45 });
    });
    it("(array)", () => {
      expect(tp.parse([123, true, false, "hello", "-123"])).to.be.deep.equal([
        123,
        true,
        false,
        "hello",
        -123,
      ]);
    });
  });
});

describe("Any Type", () => {
  const obj = {
    a: {
      array: [1, 2, "3", false],
    },
    b: 1,
    c: "asd",
    d: true,
  };
  it("(primitive)", () => {
    const tp = new TypeParse(T.Any());
    expect(tp.parse(obj.b)).to.be.equal(1);
    expect(tp.parse(obj.c)).to.be.equal("asd");
    expect(tp.parse(obj.d)).to.be.equal(true);
  });
  it("(object)", () => {
    const tp = new TypeParse(
      T.Object({
        a: T.Any(),
      })
    );
    expect(tp.parse(obj)).to.be.deep.equal({
      a: {
        array: [1, 2, "3", false],
      },
    });
  });
  it("(array)", () => {
    const tp = new TypeParse(
      T.Object({
        a: T.Object({
          array: T.Any(),
        }),
      })
    );
    expect(tp.parse(obj)).to.be.deep.equal({
      a: {
        array: [1, 2, "3", false],
      },
    });
  });
});

describe("Custom parsing", () => {
  it(`(number to string)`, () => {
    const obj = {
      a: 123,
      b: 32,
      c: -23,
    };
    const tp = new TypeParse(
      T.Custom((input): "even" | "odd" | "none" => {
        if (typeof input !== "number") return "none";
        if (input % 2 === 0) return "even";
        return "odd";
      })
    );
    expect(tp.parse(obj.a)).to.be.deep.equal("odd");
    expect(tp.parse(obj.b)).to.be.deep.equal("even");
    expect(tp.parse(obj.c)).to.be.deep.equal("odd");
    expect(tp.parse(undefined)).to.be.deep.equal("none");
  });
  it(`(string transform)`, () => {
    const obj = {
      a: "hello world",
      b: 123,
      c: true,
      d: undefined,
    };
    const tp = new TypeParse(
      T.Custom((input): string => {
        const str = `${input}`;
        return str.toUpperCase();
      })
    );
    expect(tp.parse(obj.a)).to.be.equal("HELLO WORLD");
    expect(tp.parse(obj.b)).to.be.equal("123");
    expect(tp.parse(obj.c)).to.be.equal("TRUE");
    expect(tp.parse(obj.d)).to.be.equal("UNDEFINED");
  });
  it(`(throw errors)`, () => {
    const tp = new TypeParse(
      T.Custom((input): string => {
        if (typeof input !== "string") throw Error("Input should be string");
        return input;
      })
    );
    expect(() => tp.parse(1)).to.throw("Input should be string");
  });
  it(`(optional)`, () => {
    const tp = new TypeParse(
      T.Custom((input): string => {
        if (typeof input !== "string") throw Error("Input should be string");
        return input;
      }).optional()
    );
    expect(tp.parse(1)).to.be.equal(undefined);
  });
});

describe("Safe parsing", () => {
  it(`(Can parse)`, () => {
    const tp = new TypeParse(T.Number());
    expect(tp.parse("123", { safeParse: true })).to.be.deep.equal({
      success: true,
      data: 123,
    });
  });
  describe("Cannot parse", () => {
    it(`(number)`, () => {
      const tp = new TypeParse(T.Number());
      expect(tp.parse("Hello", { safeParse: true })).to.be.deep.equal({
        success: false,
        error: "TypeParse error: Unable to convert [string] to [number]",
      });
    });
    it(`(boolean)`, () => {
      const tp = new TypeParse(T.Boolean());
      expect(tp.parse("Hello", { safeParse: true })).to.be.deep.equal({
        success: false,
        error: "TypeParse error: Unable to convert [string] to [boolean]",
      });
    });
    it(`(array)`, () => {
      const tp = new TypeParse(T.Array(T.String()));
      expect(tp.parse("Hello", { safeParse: true })).to.be.deep.equal({
        success: false,
        error: "TypeParse error: Unable to convert [string] to [array]",
      });
    });
    it(`(object)`, () => {
      const tp = new TypeParse(T.Object({ str: T.String() }));
      expect(tp.parse("Hello", { safeParse: true })).to.be.deep.equal({
        success: false,
        error: "TypeParse error: Unable to convert [string] to [object]",
      });
    });
  });
});

describe("Type Any", () => {
  const obj = {
    string: "hello world",
    number: 123,
    boolean: true,
    array: [1, 2, "3"],
    object: {
      value: 1,
    },
  };
  it("From any", () => {
    const tp = new TypeParse(T.Any());
    expect(tp.parse(obj.string)).to.be.equal(obj.string);
    expect(tp.parse(obj.number)).to.be.equal(obj.number);
    expect(tp.parse(obj.boolean)).to.be.equal(obj.boolean);
    expect(tp.parse(obj.array)).to.be.deep.equal(obj.array);
    expect(tp.parse(obj.object)).to.be.deep.equal(obj.object);
  });
  it("Default value", () => {
    const tp = new TypeParse(
      T.Any({ path: "value", defaultValue: "<default>" })
    );
    expect(tp.parse(obj)).to.be.equal("<default>");
  });
  it("null and no default value", () => {
    const tp = new TypeParse(T.Any());
    expect(tp.parse(null)).to.be.equal(null);
  });
});

describe("Multiple testing", () => {
  tests.forEach((test, index) => {
    it(`Test #${index + 1}: ${test.name}`, () => {
      expect(test.parser.parse(test.input)).to.be.deep.equal(test.expected);
    });
  });
});
