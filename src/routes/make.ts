import { z } from "zod";
import { conditional } from "../helpers";

const parser = z.object({
  path: z.string(),
  file: z.string(),
  password: z.string(),
});

export const makeRoute = async (req: Request) => {
  try {
    const result = await parser
      .parseAsync(await req.json())
      .then(conditional({
        condition: ({ password }) => password === "12345",
        error: "Invalid Password\n"
      }))
      .then(conditional({
        condition: ({ path }) => !path.includes('..'),
        error: "Invalid Path, please don't try and hack me\n"
      }))
      .then((data) => {
        if (data.path.startsWith('/')) {
          data.path = data.path.slice(1);
        }

        return data;
      })
      .then(({ path, file }) => {
        Bun.write(`${__dirname}/public/${path}`, file, { createPath: true });
        return new Response("Success", { status: 200 });
      })
      .catch((error) => new Response(error.message, { status: 400 }));

    return result;
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return new Response("Something went wrong\n", { status: 500 });
  }
}