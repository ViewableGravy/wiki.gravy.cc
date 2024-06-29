import { logger } from "../helpers";
import { readdir } from "node:fs/promises";
import { replaceHead } from "../helpers/replaceHead";
import { sleepSync } from "bun";
import { Queue } from "../helpers/queue";

export const baseServingRoute = `${__dirname}/../public`;

const parsePath = (path: string) => {
  const _path = path.replace(/^\//, "");

  if (_path === "/" || _path === "") {
    return { path: "index.html" };
  }

  if (!/\.(html|css|js)$/.test(path)) {
    return { path: `${_path}.html` };
  }

  return { path: _path };
};

const queue = new Queue();

let currentlyProcessingPages: string[] = [];

export const fetchRoute = async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname.includes("..")) {
    return new Response("Invalid Path", { status: 400 });
  }

  const { path } = parsePath(url.pathname);
  const fileName = `${baseServingRoute}/${path}`;
  const file = Bun.file(fileName);

  if (await file.exists()) {
    const withReplacedHead = await replaceHead(file);
    if (path === "index.html") {
      const totalFiles = (await readdir(`${baseServingRoute}/wiki`)).length;
      const fileSize = Bun.spawnSync(["du", "-h", `${baseServingRoute}/`])
        .stdout.toString()
        .split("\n")
        .at(-2)
        ?.split("\t")
        .at(0);

      const totalFilesMatcher = "DEEZ_NUTS__inject__site__Count$$$";
      const totalFileSizeMatcher = "DEEZ_NUTS__inject__site__Size$$$";

      return new Response(
        withReplacedHead
          .replace(totalFilesMatcher, `${totalFiles}`)
          .replace(totalFileSizeMatcher, `${fileSize}`),
        {
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    return new Response(withReplacedHead, {
      headers: { "Content-Type": "text/html" },
    });
  }

  const { status } = await fetch(`https://en.wikipedia.org/${url.pathname}`);

  if (status !== 200) {
    return Response.redirect("/wiki/404.html", 302);
  }

  const slug = url.pathname.split("/").pop();

  if (!slug) {
    return new Response("Invalid Path", { status: 400 });
  }

  // if (!currentlyProcessingPages.includes(slug)) {
  const callbackGenerate = async () => {
    console.log('here')
    if (await file.exists()) {
      console.log('exists')
      return;
    }

    const process = Bun.spawn([
      "/home/gravy/.nvm/versions/node/v20.12.2/bin/npx",
      "tsx",
      "/home/gravy/docker/wiki.gravy.cc-scraper/index.ts",
      "--slug",
      slug,
    ]);

    await process.exited;
    await logger("[processed]", slug);
    // process.exited.then(async () => {
    //   await logger('[processed]', slug)
    // })
  };

  queue.enqueue(callbackGenerate);

  // currentlyProcessingPages.push(slug);
  // const process = Bun.spawn(["/home/gravy/.nvm/versions/node/v20.12.2/bin/npx", "tsx", "/home/gravy/docker/wiki.gravy.cc-scraper/index.ts", "--slug", slug])

  // process.exited.then(async () => {
  //   currentlyProcessingPages = currentlyProcessingPages.filter((page) => page !== slug);
  //   await logger('[processed]', slug)
  // })
  // }

  logger("[fetching]", slug);

  return new Response(
    String.raw`
    <html>
      <body>
        <!-- Redirect user after 3 seconds -->
        <meta http-equiv="refresh" content="${
          queue.queue.length * 5
        };url=https://wiki.gravy.cc/wiki/${slug}">
        <p>We are generating your page for you, your website is in position ${
          queue.queue.length
        } in the quuee. ETA: ${
      5 * queue.queue.length
    } seconds, this page will intermittently refresh and will be redirected to https://wiki.gravy.cc/wiki/${slug}</p>'
      </body>
    </html>
  `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
};
