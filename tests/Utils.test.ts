import { expect } from "chai";
import { get } from "../src/Utils";

describe("Get method", () => {
  const obj = {
    a: 1,
    b: {
      c: "c",
      d: undefined,
    },
    e: [
      12,
      {
        f: 13,
      },
      14,
    ],
    g: {
      "[]": "15",
      "[0]": "16",
      "[45]": "17",
      "[-12]": "18",
      "\\": "19",
    },
  };
  it("Simple index", () => {
    expect(get(obj, "a")).to.be.equal(1);
  });
  it("Nested index", () => {
    expect(get(obj, "b.c")).to.be.equal("c");
  });
  it("Simple index of undefined", () => {
    expect(get(obj, "b.d.x")).to.be.equal(undefined);
  });
  it("Simple array index", () => {
    expect(get(obj, "e.[0]")).to.be.equal(12);
  });
  it("Simple array index nested", () => {
    expect(get(obj, "e.[1].f")).to.be.equal(13);
  });
  it("Simple array negative index", () => {
    expect(get(obj, "e.[-1]")).to.be.equal(14);
  });
  describe("Escaped index", () => {
    expect(get(obj, "g.\\")).to.be.equal("19");
    expect(get(obj, "g.\\[]")).to.be.equal("15");
    expect(get(obj, "g.\\[0]")).to.be.equal("16");
    expect(get(obj, "g.\\[45]")).to.be.equal("17");
    expect(get(obj, "g.\\[-12]")).to.be.equal("18");
  });
});
