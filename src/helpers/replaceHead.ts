import type { BunFile } from "bun";

const oneHour = 1000 * 60 * 60;
const filePath = "/home/gravy/docker/wiki.gravy.cc/latestHeader.txt"
let lastUpdated = null as null | Date

const storeHeaderInFile = async (header: string) => {
  await Bun.write(filePath, header)
  lastUpdated = new Date();
}

const getHeaderFromFile = async () => {
  const file = Bun.file(filePath);
  const header = await file.text();
  return header;
}

const isLastUpdatedOverOneHourAgo = () => {
  if (!lastUpdated) {
    return true;
  }

  return new Date().getTime() - lastUpdated.getTime() > oneHour;
}

const invokeScraper = async (...args: string[]) => {
  if (!isLastUpdatedOverOneHourAgo()) {
    return getHeaderFromFile();
  } else {
    const process = Bun.spawn(["/home/gravy/.nvm/versions/node/v20.12.2/bin/npx", "tsx", "/home/gravy/docker/wiki.gravy.cc-scraper/index.ts", ...args])
    
    const header = await new Response(process.stdout).text(); 

    //write to file
    storeHeaderInFile(header);

    return header;
  }
}

export const replaceHead = async (file: BunFile): Promise<string> => {
  const content = await file.text();
  const updatedHead = await invokeScraper("--head")
  const replacedHead = content.replace(/<head>.*<\/head>/s, updatedHead)

  return replacedHead;
}
