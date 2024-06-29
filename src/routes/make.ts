import { z } from "zod";
import { conditional, logger } from "../helpers";
import { readdir } from 'node:fs/promises'
import { baseServingRoute } from "./fetch";

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

        await fetch('https://discord.com/api/webhooks/1231615680608997516/2z96ZhDmu_udPpHISAMDwapJQMeO0hFW5lHUvKjCAq5QB0QB73TmpLwAJZk-ViA5CXWC', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `New file created at ${path}`
          })
        })

        const totalFiles = (await readdir(`${baseServingRoute}/wiki`)).length;

        if (totalFiles % 1000 === 0) {
          await fetch('https://discord.com/api/webhooks/1231615680608997516/2z96ZhDmu_udPpHISAMDwapJQMeO0hFW5lHUvKjCAq5QB0QB73TmpLwAJZk-ViA5CXWC', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: `@here We have reached ${totalFiles} files`
            })
          })
        }
        
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