import { logger } from "../helpers";

const baseServingRoute = `${__dirname}/../public`

const parsePath = (path: string) => {
  const _path = path.replace(/^\//, '')

  if (_path === '/') {
    return { path: 'index.html' };
  }

  if (!/\..+$/.test(path)) {
    return { path: `${_path}.html` };
  }

  if (!/\.(html|css|js)$/.test(_path)) {
    return { path: 'index.html' };
  }

  return { path: _path };
}

export const fetchRoute = async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname.includes('..')) {
    return new Response("Invalid Path", { status: 400 });
  }

  const { path } = parsePath(url.pathname);

  console.log(path)

  const fileName = `${baseServingRoute}/${path}`
  const file = Bun.file(fileName);
  
  if (await file.exists()) {
    return new Response(file);
  }

  const { status } = await fetch(`https://wikipedia.com/${url.pathname}`)

  if (status !== 200) {
    return Response.redirect("/wiki/404.html", 302)
  }

  const { stdout } = Bun.spawn(["/bin/bash", "createWikiPage", "--slug", url.pathname])
  logger('[fetching]', url.pathname)

  return new Response(`
    <html>
      <body>
        <!-- Redirect user after 5 seconds -->
        <meta http-equiv="refresh" content="5;url=${url.hostname}/${url.pathname}">
        <p>We are generating your page for you, please wait 5 seconds to be redirected</p>
      </body>
    </html>
  `, { 
    headers: {
      'Content-Type': 'text/html'
    } 
  });
  
  
}