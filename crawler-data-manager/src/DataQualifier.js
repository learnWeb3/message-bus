const axios = require('axios')

class DataQualifier {
    constructor(params = {
        sentimentExtractorUrl: "",
        summarizerUrl: "",
        keywordsExtractorUrl: ""
    }) {
        this.sentimentExtractorUrl = params.sentimentExtractorUrl;
        this.summarizerUrl = params.summarizerUrl;
        this.keywordsExtractorUrl = params.keywordsExtractorUrl;
    }

    textToSentences(text) {
        return text
            .replaceAll(/(?<=\d+)\.(?=\d+)/g, "_SEP_")
            .replaceAll("\n", "")
            .split('.')
            .map(
                (e) => e.replaceAll(/(?<=\d+)\_SEP\_(?=\d+)/g, ".").trim()
            ).filter((e) => e.length)
    }

    async extractSentiment(sentences = []) {
        try {
            const {
                global_label,
                global_score,
                details
            } = await axios.post(this.sentimentExtractorUrl, {
                sentences
            }).then(({ data }) => data)

            return {
                global_label,
                global_score,
                details
            }
        } catch (error) {
            console.log(error)
        }
    }

    async extractKeywords(text = "") {
        try {
            const {
                keywords
            } = await axios.post(this.keywordsExtractorUrl, {
                sentence: text
            }).then(({ data }) => data)

            return {
                keywords
            }
        } catch (error) {
            console.log(error)
        }
    }

    async summarize(text = "") {
        try {
            const {
                summary
            } = await axios.post(this.summarizerUrl, {
                sentence: text
            }).then(({ data }) => data)

            return {
                summary
            }
        } catch (error) {
            console.log(error)
        }
    }

    async qualify(data = []) {

        const qualifiedData = []
        let index = 0;
        for (const item of data) {

            try {
                if (item.title && item.content) {
                    const parsedContentAsSentencesArr = this.textToSentences(item.content)
                    await Promise.all([
                        // news article title
                        this.extractSentiment([item.title]).then(({
                            global_label: title_global_sentiment,
                            global_score: title_global_score,
                            details: title_details
                        }) => {
                            console.log(`extracted title sentiment for item n° ${index + 1}/${data.length} items`)
                            Object.assign(item, {
                                title_global_sentiment,
                                title_global_score,
                                title_details,
                            })
                        }).catch((error) => {
                            console.log(error)
                        }),
                        // news article content
                        this.extractKeywords(item.content).then(({
                            keywords
                        }) => {
                            console.log(`extracted keywords for item n° ${index + 1}/${data.length} items`)
                            Object.assign(item, {
                                keywords,
                            })
                        }).catch((error) => {
                            console.log(error)
                        }),
                        // summarize and extract sentiment from summary
                        this.summarize(item.content).then(async ({
                            summary
                        }) => {
                            const {
                                global_label: summary_global_sentiment,
                                global_score: summary_global_score,
                                details: summary_details
                            } = await this.extractSentiment([summary])
                            console.log(`summarized item n° ${index + 1}/${data.length} items`)
                            Object.assign(item, {
                                summary,
                                summary_global_sentiment,
                                summary_global_score,
                                summary_details
                            })
                        }).catch((error) => {
                            console.log(error)
                        }),
                        // extract sentiment
                        await this.extractSentiment(parsedContentAsSentencesArr).then(({
                            global_label: content_global_sentiment,
                            global_score: content_global_score,
                            details: content_details
                        }) => {
                            console.log(`extracted content sentiment for item n° ${index + 1}/${data.length} items`)
                            Object.assign(item, {
                                content_global_sentiment,
                                content_global_score,
                                content_details
                            })
                        }).catch((error) => {
                            console.log(error)
                        }),

                    ])

                    console.log(`qualified item n° ${index + 1}/${data.length} items`)
                    qualifiedData.push(item)
                    index += 1
                }
            } catch (error) {
                console.log(error)
                continue;
            }

        }

        return qualifiedData;
    }
}

module.exports = { DataQualifier }