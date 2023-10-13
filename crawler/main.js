const fs = require("fs/promises");
const { join } = require("path");
const { parse } = require("yaml");
const Base = require("./src/Base");
const { validateConfigSchema, executeTasks } = require("./src/lib/helpers");
const axios = require("axios").default;

async function main() {
  try {
    // get crawler tasks and validate format
    const configPath = join(process.cwd(), "config", "config.yaml");
    const configSchemaPath = join(process.cwd(), "config", "config.schema.json")
    const { domain, tasks, webhook, tag } = await fs
      .readFile(configPath, {
        encoding: "utf-8",
      })
      .then((data) => parse(data));
    const configSchema = await fs.readFile(configSchemaPath, {
      encoding: "utf-8",
    }).then((data) => JSON.parse(data));
    validateConfigSchema({ domain, tasks, webhook, tag }, configSchema)

    // execute crawler
    const crawler = new Base(domain);
    const crawlerData = await executeTasks(crawler, tasks);
    await crawler.quit()

    console.log(JSON.stringify(crawlerData, null, 4))

    // send data over http 
    if (webhook?.url) {
      const options = {};
      if (webhook.headers) {
        Object.assign(options, webhook.headers)
      }
      await axios.post(webhook.url, { tag, data: crawlerData, timestamp: Date.now() }, options)
        .then(() => console.log(`successfully HTTP POSTed crawled data to ${webhook.url}`))
        .catch((error) => console.error(`Failed HTTP POST crawled data to ${webhook.url} reason ${error}`));
    }

    process.exit(0)

  } catch (error) {
    console.log(error)
    console.error(`${error.constructor.name}, ${error.message}`)
    process.exit(1)

  }
}

main();
