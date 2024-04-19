import { z } from "zod";
import { conditional } from "../helpers";
import { appendFile } from "node:fs/promises";

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
        console.log('here')
        const directory = `${__dirname}/../public/${path}`

        const logDir = Bun.env.NODE_ENV === 'production' ? '/usr/src/app' : `${__dirname}/..`;
        const logFile = Bun.file(`${logDir}/bun.log`);
        const fileExists = Bun.file(directory);

        console.log('there')
        if (!await logFile.exists()) {
          console.log(`creating: ${directory}\n`)
          await Bun.write(`${logDir}/bun.log`, `creating: ${directory}\n`, { createPath: true });
        } else {
          console.log(`${await fileExists.exists() ? 'updating' : 'creating'}: ${directory}\n`)
          await appendFile(`${logDir}/bun.log`, `${await fileExists.exists() ? 'updating' : 'creating'}: ${directory}\n`);
        }


        const result = await Bun.write(directory, file, { createPath: true });
        
        console.log('result')
        
        return new Response("Success", { status: 200 });
      })
      .catch((error) => {
        return new Response(error, { status: 400 })
      });

    return result;
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return new Response("Something went wrong\n", { status: 500 });
  }

  return new Response("Bun!\n");
}