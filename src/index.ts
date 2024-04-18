import z from 'zod';

const parser = z.object({
  path: z.string(),
  file: z.string(),
  password: z.string(),
});

const conditional = <T>({ condition, error }: { condition: (value: NoInfer<T>) => boolean, error?: string }) => {
  return (data: T) => {
    if (!condition(data)) {
      throw new Error(error ?? "Something went wrong")
    }

    return data;
  }
}

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);

    switch (req.method) {
      case 'POST': {
        switch (url.pathname) {
          case '/make': {
            try {
              const result = await parser
                .parseAsync(await req.json())
                .then(conditional({
                  condition: ({ password }) => password === "12345",
                  error: "Invalid Password\n"
                }))
                .then(({ path, file }) => {
                  Bun.write(path, file, { createPath: true });
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
        }
      }
    }

    return new Response("Bun!\n");
  },
});

console.log('hot reload');
