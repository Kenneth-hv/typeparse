import { TypeParse, Types as T } from "../TypeParse";

const tp = new TypeParse(
  T.Object({
    id: T.String("data.id").optional(),
    name: T.String("user.public.name"),
    phone: T.Number("user.public.phone"),
    extra: T.Object({}),
    union: T.Union([
      T.Object({
        a: T.String(),
      }),
      T.Number(),
    ]),
  })
);

const result = tp.parse({
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
});

console.log(result);
