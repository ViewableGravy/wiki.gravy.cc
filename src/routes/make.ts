import { z } from "zod";
import { conditional, logger } from "../helpers";

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
        condition: ({ password }) => password === Bun.env.PASSWORD,
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
      .then(async ({ path, file }) => {
        const directory = `${__dirname}/../public/${path}`;

        await logger('[creating]', directory);
        await Bun.write(directory, file, { createPath: true });
        
        return new Response("Success\n", { status: 200 });
      })
      .catch((error) => {
        return new Response(error, { status: 400 });
      });

    return result;
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return new Response("Something went wrong\n", { status: 500 });
  }
}