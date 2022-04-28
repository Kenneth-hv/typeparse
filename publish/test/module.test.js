const { TypeParse, Types } = require("../out");

const tp = new TypeParse(Types.String({ path: "obj.string" }));

if (tp.parse({ obj: { string: "123" } }) !== "123") {
  throw new Error("Failed module test");
}
