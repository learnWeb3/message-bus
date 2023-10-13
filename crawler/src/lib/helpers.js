const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const updateLocale = require('dayjs/plugin/updateLocale')
const Base = require('../Base');
const Validator = require('jsonschema').Validator;

dayjs.extend(customParseFormat)

// dayjs.extend(updateLocale)

// dayjs.updateLocale('en', {
//     monthsShort: [
//         "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//     ]
// })


class ConfigSchemaValidationError extends Error {
    constructor(message) {
        super(message)
    }
}

function format(formatter = "Date", regexMatch = new RegExp(`\d{2}\/\d{2}\/\d{4}\s\-\s\d{2}:\d{2}`), valueFormat = "MM/DD/YYYY - hh:mm", replacements = [], value = "Wed, 09/20/2023 - 09:42",) {
    switch (formatter) {
        case "Date":
            if (replacements.length) {
                for (const { regex, replacement } of replacements) {
                    value = value.replace(new RegExp(regex), replacement)
                }
            }
            value = value.trim()
            const regex = new RegExp(regexMatch);
            const match = value.match(regex)
            if (!match.length) {
                throw new Error(`regex match has not return any results`)
            }
            const formattedValue = dayjs(match[0], valueFormat).valueOf()
            return formattedValue
        case "Number":
            if (replacements.length) {
                for (const { regex, replacement } of replacements) {
                    value = value.replaceAll(new RegExp(regex, "g"), replacement)
                }
            }
            value = value.trim()
            // console.log(value)
            const numberRegex = new RegExp(regexMatch);
            const numberMatch = value.match(numberRegex)
            if (!numberMatch.length) {
                throw new Error(`regex match has not return any results`)
            }
            const numberFormattedValue = +numberMatch[0]
            return numberFormattedValue
        case "Unit":
            const units = {
                "B": 1000000000,
                "M": 1000000,
                "k": 1000,
            }
            if (replacements.length) {
                for (const { regex, replacement } of replacements) {
                    value = value.replaceAll(new RegExp(regex, "g"), replacement)
                }
            }
            value = value.trim()
            console.log(value)
            const unitRegex = new RegExp(regexMatch);
            const unitMatch = value.match(unitRegex)
            if (!unitMatch.length) {
                throw new Error(`regex match has not return any results`)
            }
            const unitFormattedValue = units[unitMatch[0]] || null
            return unitFormattedValue
        default:
            break
    }
}

function validateConfigSchema(config, configSchema) {
    try {
        const validator = new Validator();
        validator.validate(config, configSchema, {
            throwAll: true
        });
    } catch (error) {
        const message = error.errors.map(({ property, message }) => `${property} ${message}`).join(", ")
        throw new ConfigSchemaValidationError(message)
    }
}
async function executeTasks(
    crawler = new Base(),
    tasks = [],
    itemData = null,
    crawlerData = [] // [] || {}
) {
    for (const { type, params, tasks: subTasks } of tasks) {
        try {
            switch (type) {
                case "navigate":
                    const dollarSignCheck = params.url.includes("$");
                    // console.log(itemData, 'ITEMDATA')
                    if (dollarSignCheck && itemData) {
                        crawler.url = itemData[params.url.replace("$", "")];
                    } else {
                        crawler.url = params.url;
                    }
                    await crawler.navigate();
                    break;
                case "checkPresence":
                    await crawler._checkElementIsPresent(
                        params.cssSelector,
                        params.timeout
                    );
                    break;
                case "extract":
                    const extractOptions = Object.keys(params.extractAttributes).reduce(
                        (map, attribute) => {
                            map[attribute] = true;
                            return map;
                        },
                        {}
                    );
                    // console.log(extractOptions, params, 'extractedData')
                    let extractedData = await crawler.extractFromPage(
                        params.cssSelector,
                        extractOptions
                    );
                    // console.log(extractedData, 'extractedData')
                    extractedData = extractedData.map((extractedItem) => {
                        const formattedExtractedData = {};
                        for (const key in params.extractAttributes) {
                            if (extractedItem[key]) {
                                formattedExtractedData[params.extractAttributes[key].as] =
                                    params.formatter ? format(
                                        params.formatter.type,
                                        params.formatter.regexMatch,
                                        params.formatter.valueFormat,
                                        params.formatter.replacements || [],
                                        extractedItem[key]
                                    ) : extractedItem[key];
                            }
                        }
                        return formattedExtractedData;
                    });

                    // console.log(extractedData, 'extractedData')

                    if (typeof crawlerData === "object" && Array.isArray(crawlerData)) {
                        crawlerData = [...crawlerData, ...extractedData];
                    } else if (
                        typeof crawlerData === "object" &&
                        !Array.isArray(crawlerData)
                    ) {
                        Object.assign(crawlerData, extractedData[0]);
                    }
                    if (subTasks?.length) {
                        for (let index = 0; index <= extractedData.length; index++) {
                            const subTaskData = await executeTasks(
                                crawler,
                                subTasks,
                                extractedData[index],
                                extractedData[index]
                            );

                            if (subTaskData && crawlerData[index] && subTaskData[index]) {
                                Object.assign(crawlerData[index], {
                                    ...subTaskData[index],
                                });
                            }
                        }
                    }

                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error)
            continue;
        }
    }

    return crawlerData;
}

module.exports = { ConfigSchemaValidationError, validateConfigSchema, executeTasks, }