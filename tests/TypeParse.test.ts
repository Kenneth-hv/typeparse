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
    const tp = new TypeParse(T.Number("obj.numberValue"));

    const result = tp.parse(subject);

    expect(result).to.be.equal(subject.obj.numberValue);
  });

  it("String", () => {
    const tp = new TypeParse(T.String("obj.stringValue"));

    const result = tp.parse(subject);

    expect(result).to.be.equal(subject.obj.stringValue);
  });

  it("Boolean", () => {
    const tp = new TypeParse(T.Boolean("obj.booleanValue"));

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
      const tp = new TypeParse(T.String("string.fromNumber"));
      expect(tp.parse(subject)).to.be.equal("1234.67");
    });
    it("from string", () => {
      const tp = new TypeParse(T.String("string.fromString"));
      expect(tp.parse(subject)).to.be.equal("Hello world!");
    });
    it("from boolean", () => {
      const tp = new TypeParse(T.String("string.fromBoolean"));
      expect(tp.parse(subject)).to.be.equal("false");
    });
  });

  describe("Number", () => {
    it("from number", () => {
      const tp = new TypeParse(T.Number("string.fromNumber"));
      expect(tp.parse(subject)).to.be.equal(1234.67);
    });
    it("from string", () => {
      const tp = new TypeParse(T.Number("number.fromString"));
      expect(tp.parse(subject)).to.be.equal(999);
    });
    it("from string (invalid)", () => {
      const tp = new TypeParse(T.Number("number.fromStringInvalid"));
      expect(() => {
        const result = tp.parse(subject);
        console.log(result);
      }).to.throw("Cannot parse number");
    });
    it("from boolean", () => {
      const tp = new TypeParse(T.Number("number.fromBoolean"));
      expect(() => tp.parse(subject)).to.throw("Cannot parse number");
    });
  });

  describe("Boolean", () => {
    describe("Strict", () => {
      it("from number", () => {
        const tp = new TypeParse(T.Boolean("boolean.fromNumber"));
        expect(() => tp.parse(subject)).to.throw();
      });
      it("from string", () => {
        const tp = new TypeParse(T.Boolean("boolean.fromString"));
        expect(() => tp.parse(subject)).to.throw();
      });
      it("from boolean", () => {
        const tp = new TypeParse(T.Boolean("boolean.fromBoolean"));
        expect(tp.parse(subject)).to.be.equal(false);
      });
    });
    describe("Non-Strict", () => {
      it("from number", () => {
        const tp = new TypeParse(
          T.Boolean("boolean.fromNumber", { strict: false })
        );
        expect(tp.parse(subject)).to.be.equal(true);
      });
      it("from string", () => {
        const tp = new TypeParse(
          T.Boolean("boolean.fromString", { strict: false })
        );
        expect(tp.parse(subject)).to.be.equal(false);
      });
      it("from boolean", () => {
        const tp = new TypeParse(
          T.Boolean("boolean.fromBoolean", { strict: false })
        );
        expect(tp.parse(subject)).to.be.equal(false);
      });
    });
  });
});

describe("Default values", () => {
  it("(String)", () => {
    const tp = new TypeParse(T.String("x", { defaultValue: "<default>" }));
    expect(tp.parse(undefined)).to.be.equal("<default>");
  });
  it("(Number)", () => {
    const tp = new TypeParse(T.Number("x", { defaultValue: 123 }));
    expect(tp.parse(undefined)).to.be.equal(123);
  });
  it("(Boolean)", () => {
    const tp = new TypeParse(T.Boolean("x", { defaultValue: false }));
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
          v1: T.Number("v1"),
          v2: T.Number("v2"),
          v3: T.Boolean("v3"),
        }),
        "array"
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
});

describe("Optional types", () => {
  it("(string)", () => {
    const tp = new TypeParse(T.String("x").optional());
    expect(tp.parse({})).to.be.equal(undefined);
  });
  it("(number)", () => {
    const tp = new TypeParse(T.Number("x").optional());
    expect(tp.parse({})).to.be.equal(undefined);
  });
  it("(boolean)", () => {
    const tp = new TypeParse(T.Boolean("x").optional());
    expect(tp.parse({})).to.be.equal(undefined);
  });
  it("(object)", () => {
    const tp = new TypeParse(
      T.Object({
        obj: T.Object({
          value: T.String("value"),
        }).optional(),
      })
    );
    const result = tp.parse({});
    expect(result).to.be.deep.equal({ obj: undefined });
  });
  it("(object)", () => {
    const tp = new TypeParse(
      T.Object({
        obj: T.Object({
          value: T.String("value"),
        }).optional(),
      })
    );
    const result = tp.parse({});
    expect(result).to.be.deep.equal({ obj: undefined });
  });
});

describe("Multiple testing", () => {
  tests.forEach((test, index) => {
    it(`Test #${index + 1}: ${test.name}`, () => {
      expect(test.parser.parse(test.input)).to.be.deep.equal(test.expected);
    });
  });
});

describe("Edge cases", () => {
  describe("Undefined input", () => {
    describe("Primitive types", () => {
      it("(string)", () => {
        const tp = new TypeParse(T.String("x"));
        expect(() => tp.parse(undefined)).to.throw("Cannot parse string");
      });
      it("(string, optional)", () => {
        const tp = new TypeParse(T.String("x").optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
      it("(number)", () => {
        const tp = new TypeParse(T.Number("x"));
        expect(() => tp.parse(undefined)).to.throw("Cannot parse number");
      });
      it("(number, optional)", () => {
        const tp = new TypeParse(T.Number("x").optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
      it("(boolean)", () => {
        const tp = new TypeParse(T.Boolean("x"));
        expect(() => tp.parse(undefined)).to.throw("Cannot parse boolean");
      });
      it("(boolean, optional)", () => {
        const tp = new TypeParse(T.Boolean("x").optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });

      it("(boolean)", () => {
        const tp = new TypeParse(T.Boolean("x"));
        expect(() => tp.parse(undefined)).to.throw("Cannot parse boolean");
      });
      it("(boolean, optional)", () => {
        const tp = new TypeParse(T.Boolean("x").optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
    });
    describe("Array and object", () => {
      it("(array)", () => {
        const tp = new TypeParse(T.Array(T.String("x")));
        expect(() => tp.parse(undefined)).to.throw("Is not array");
      });
      it("(array, optional)", () => {
        const tp = new TypeParse(T.Array(T.String("x")).optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
      it("(object)", () => {
        const tp = new TypeParse(T.Object({ x: T.String("x") }));
        expect(() => tp.parse(undefined)).to.throw("Is not object");
      });
      it("(object, optional)", () => {
        const tp = new TypeParse(T.Object({ x: T.String("x") }).optional());
        expect(tp.parse(undefined)).to.be.equal(undefined);
      });
    });
  });
});
