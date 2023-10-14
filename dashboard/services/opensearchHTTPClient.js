import axios from "axios";


const httpClient = axios.create({
    baseURL: 'https://andrew-timeseries.students-epitech.ovh',
    timeout: 1000,
    headers: { 'Content-Type': 'application/json' }
})


export async function getCoinBars(token, options = {
    coin: 'BTC',
    barInterval: '1m', //  1h 2h 4h 6h 12h 1d
    barFrom: 1697111787000,
    barTo: 1697198187000,
}, controller = null) {

    const body = {
        "size": 0,
        "query": {
            "bool": {
                "must": [
                    {
                        "range": {
                            "timestamp": {
                                "gte": options.barFrom,
                                "lte": options.barTo
                            }
                        }
                    },
                    {
                        "term": {
                            "name": options.coin
                        }
                    }
                ]
            }
        },
        "aggs": {
            "time_periods": {
                "date_histogram": {
                    "field": "timestamp",
                    "interval": options.barInterval, // 1h 2h 4h 6h 12h 1d
                    "format": "epoch_millis",
                    "extended_bounds": {
                        "min": options.barFrom,
                        "max": options.barTo
                    },
                    "min_doc_count": 0
                },
                "aggs": {
                    "avg": {
                        "avg": {
                            'field': 'price'
                        }
                    }
                }
            }
        }
    }

    const headers = {
        'Authorization': 'Bearer ' + token,
    }
    const endpoint = `/cryptoviz-price/_search`
    try {
        const { data } = await httpClient.post(
            endpoint,
            body,
            {
                headers,
                signal: controller?.signal,
                timeout: 0
            }
        );
        return data?.aggregations?.time_periods?.buckets?.length ? data.aggregations.time_periods.buckets.map(({
            key,
            avg
        }) => avg.value ? ({
            value: avg.value,
            time: Math.ceil(key / 1000)
        }) : ({
            time: Math.ceil(key / 1000)
        })) : []
    } catch (error) {
        console.log(error)
    }
}

export const getFeedAnalytics = async (token, controller = null) => {
    const now = Math.floor(Date.now() / 1000) * 1000
    const body = {
        "size": 0,
        "aggs": {
            "group_by_name": {
                "terms": {
                    "field": "name",
                    "size": 1000
                },
                "aggs": {
                    "last_hour": {
                        "range": {
                            "field": "timestamp",
                            "ranges": [
                                { "from": now - (60 * 60 * 1000), "to": now }
                            ]
                        },
                        "aggs": {
                            "avg_price": {
                                "avg": {
                                    "field": "price"
                                }
                            },
                            "avg_volume": {
                                "avg": {
                                    "field": "volume"
                                }
                            },
                            "max_price": {
                                "max": {
                                    "field": "price"
                                }
                            },
                            "max_volume": {
                                "max": {
                                    "field": "volume"
                                }
                            },
                            "min_price": {
                                "min": {
                                    "field": "price"
                                }
                            },
                            "min_volume": {
                                "min": {
                                    "field": "volume"
                                }
                            }

                        }
                    },
                    "last_day": {
                        "range": {
                            "field": "timestamp",
                            "ranges": [
                                { "from": now - (24 * 60 * 60 * 1000), "to": now }
                            ]
                        },
                        "aggs": {

                            "avg_price": {
                                "avg": {
                                    "field": "price"
                                }
                            },
                            "avg_volume": {
                                "avg": {
                                    "field": "volume"
                                }
                            },
                            "max_price": {
                                "max": {
                                    "field": "price"
                                }
                            },
                            "max_volume": {
                                "max": {
                                    "field": "volume"
                                }
                            },
                            "min_price": {
                                "min": {
                                    "field": "price"
                                }
                            },
                            "min_volume": {
                                "min": {
                                    "field": "volume"
                                }
                            }

                        }
                    },
                    "last_week": {
                        "range": {
                            "field": "timestamp",
                            "ranges": [
                                { "from": now - (7 * 24 * 60 * 60 * 1000), "to": now }
                            ]
                        },
                        "aggs": {
                            "avg_price": {
                                "avg": {
                                    "field": "price"
                                }
                            },
                            "avg_volume": {
                                "avg": {
                                    "field": "volume"
                                }
                            },
                            "max_price": {
                                "max": {
                                    "field": "price"
                                }
                            },
                            "max_volume": {
                                "max": {
                                    "field": "volume"
                                }
                            },
                            "min_price": {
                                "min": {
                                    "field": "price"
                                }
                            },
                            "min_volume": {
                                "min": {
                                    "field": "volume"
                                }
                            }

                        }
                    }
                },
            }
        }
    }
    const headers = {
        'Authorization': 'Bearer ' + token,
    }
    const endpoint = '/cryptoviz-price/_search'
    try {
        const { data } = await httpClient.post(
            endpoint,
            body,
            {
                headers,
                signal: controller?.signal,
                timeout: 0
            }
        );
        return data.aggregations.group_by_name.buckets
            .map(({ last_day, last_week, last_hour, key, doc_count }) => {
                return ({
                    name: key,
                    doc_count,
                    last_day: last_day.buckets[0],
                    last_week: last_week.buckets[0],
                    last_hour: last_hour.buckets[0]
                })
            });
    } catch (error) {
        console.log(error)
    }
}

