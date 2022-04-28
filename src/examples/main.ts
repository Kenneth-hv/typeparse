import { TypeParse, Types as T } from "../TypeParse";

const tp = new TypeParse(
  T.Object({
    a: T.Number(),
    id: T.String({ path: "data.id" }).optional(),
    name: T.String({ path: "user.public.name" }),
    phone: T.Number({ path: "user.public.phone" }),
    extra: T.Object({}),
    union: T.Union([
      T.Object({
        a: T.String(),
      }),
      T.Number(),
    ]),
    custom: T.Custom((input: unknown): boolean =>
      input === "1" ? true : false
    ),
  })
);

const result = tp.parse(
  {
    a: "asd",
    data: {
      id: 12,
    },
    user: {
      public: {
        name: "Kenneth",
        phone: "8182381283",
      },
    },
    union: {
      a: "Hello!",
    },
    custom: "1",
  },
  {
    safeParse: true,
  }
);

console.log(result.data);
