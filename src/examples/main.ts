import { TypeParse, Types as B } from "../TypeParse";

const tp = new TypeParse(
  B.Object({
    id: B.String("data.id").optional(),
    name: B.String("user.public.name"),
    phone: B.Number("user.public.phone"),
    extra: B.Object({}),
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
});

console.log(result);
