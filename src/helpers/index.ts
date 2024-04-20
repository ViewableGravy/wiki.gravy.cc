import { appendFile } from "node:fs/promises";

export const conditional = <T>({ condition, error }: { condition: (value: NoInfer<T>) => boolean, error?: string }) => {
  return (data: T) => {
    if (!condition(data)) {
      throw new Error(error ?? "Something went wrong")
    }

    return data;
  }
}

export const logger = async (prefix: `[${string}]`, log: string) => {
  const logDir = Bun.env.NODE_ENV === 'production' ? '/usr/src/app' : `${__dirname}/..`;
  const logFileLocation = `${logDir}/bun.log`;
  const logFile = Bun.file(logFileLocation);

  const message = `${prefix}: ${log}\n`
  console.log(message)

  if (!await logFile.exists()) {
    await Bun.write(logFileLocation, message, { createPath: true });
  } else {
    await appendFile(logFileLocation, message);
  }
}