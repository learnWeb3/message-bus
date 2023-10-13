
const https = require('https');
const axios = require('axios')

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
        ).then(({ data }) => data?.hits?.hits || [])
            .catch((error) => {
                console.log(error);
                error?.response?.data && console.log(error.response.data)
            })

    }
}

module.exports = { OpenSearchStorage }
