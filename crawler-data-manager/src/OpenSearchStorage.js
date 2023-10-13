const axios = require('axios');
const https = require('https');
const { nanoid } = require('nanoid');

class OpenSearchStorage {
    constructor(params = {
        topic: '',
        basicAuth: '',
        rootUrl: ''
    }) {
        this.rootUrl = params.rootUrl
        this.basicAuth = params.basicAuth
        this.topic = params.topic;
    }

    async search(searchParams = {
        title: "",
        tag: ""
    }) {
        const basicAuth = Buffer.from(this.basicAuth).toString('base64')
        const topicUrl = `${this.rootUrl}/${this.topic}/_search`
        const headers = {
            'Content-Type': 'application/json',
            "Authorization": `Basic ${basicAuth}`
        }
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        return await axios.post(
            topicUrl
            , {
                "query": {
                    "term": {
                        ...searchParams
                    }
                }
            },
            {
                headers,
                httpsAgent: agent
            }
        ).then(({ data }) => data.hits.hits)
            .catch((error) => {
                console.log(error);
                error?.response?.data && console.log(error.response.data)
            })

    }

    async writeData(tag = "latest", data = []) {
        const basicAuth = Buffer.from(this.basicAuth).toString('base64')
        const headers = {
            'Content-Type': 'application/json',
            "Authorization": `Basic ${basicAuth}`
        }
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        const newEntries = []
        for (let index = 0; index < data.length; index++) {
            // lookup 
            const existingEntries = await this.search({
                title: data[index].title
            })
            if (existingEntries.length === 0) {
                try {
                    // qualify data 
                    // send to MQTT broker
                    // write data
                    const id = nanoid()
                    const topicUrl = `${this.rootUrl}/${this.topic}/_doc/${id}`
                    const newEntry = {
                        ...data[index],
                        tag,
                    }
                    await axios.post(
                        topicUrl,
                        newEntry,
                        {
                            headers,
                            httpsAgent: agent,
                        }
                    )
                    newEntries.push(newEntry)
                } catch (error) {
                    console.log(`error writing data to topic ${this.topic}`, error)
                    error?.response?.data && console.log(error.response.data)
                    continue;
                }
            }
        }
        return newEntries
    }
}

module.exports = { OpenSearchStorage }
