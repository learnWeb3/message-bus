# CryptoViz Scrapper 

This module is a web scrapper allowing to scrappe continuously crypto news and prices in order to feed data to the analytics systems components for the crypto viz project

This repository contains code for a general purpose scrapper confifgurable using a simple config.yaml file.
It leverages selenium library in order to crawl client side only websites.
The configuration file must be mounted at /usr/share/crawler/config path inside the container.
It offers a declarative interface to instruct the crawler what to do.
The following actions are available through the crawler config.yaml file.
- navigate: go to a specific url 
- checkPresence: wait for a cssSelector until a specific timeout 
- extract: target a specific cssSelector and extract href and/or text attribute
The extracted data is made available outside the container using an HTTP POST webhook call that can be configured using the configuration file.

The scrapper uses external selenium webdriver server: 

[SeleniumHQ/Selenium](https://github.com/SeleniumHQ/selenium)

## Environnement variables

Environnement variables are used in debug mode only and allow to set a custom selenium binary webdriver path.

```bash
# configure a path for the selenium webdriver binary
ENV SELENIUM_SERVER_URL="<URL TO YOUR SELENIUM SERVER URL>"
ENV WEBDRIVER_BINARY_PATH=""
# configure the headless mode
ENV DEBUG=0
```

## Configuration file

Here is a little example of the config.yaml file for the u.today website: 

```yaml
domain: "u.today"
tasks:
  - type: "navigate"
    params:
      url: "https://u.today/latest-cryptocurrency-news"
  - type: "checkPresence"
    params:
      timeout: 1000
      cssSelector: "body > div.page-container.container > div > main"
  - type: "extract"
    params:
      cssSelector: "main .category-item .category-item__title-link"
      extractAttributes:
        text:
          as: "title"
        href:
          as: "link"
    tasks:
      - type: "navigate"
        params:
          url: "$link"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .article_main-info__humble"
      - type: "extract"
        params:
          cssSelector: "main .article .article_main-info__humble .time"
          extractAttributes:
            text:
              as: "publishedAt"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .article__content"
      - type: "extract"
        params:
          cssSelector: "main .article .article__content"
          extractAttributes:
            text:
              as: "content"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author .about-author_name"
      - type: "extract"
        params:
          cssSelector: "main .article .about-author .about-author_name"
          extractAttributes:
            text:
              as: "authorName"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author .about-author_name"
      - type: "extract"
        params:
          cssSelector: "main .article .about-author .about-author_name"
          extractAttributes:
            text:
              as: "authorName"

      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author .social"
      - type: "extract"
        params:
          cssSelector: "main .article .about-author .social .social__link"
          extractAttributes:
            href:
              as: "authorLink"

webhook:
  url: "http://localhost:9000"
  headers:
    Authorization: "Basic xxxx"

```


## Deployment 

k8s manifests have been crafted leveraging kubernetes cronjob api/resource in order to schedule the scrappers.

[k8s manifest](./k8s/)

## Warning

The docker image is built for ARM architecture and is not compatible for AMD.

## Scrapped website

- [UToday - news](https://u.today)
- [Coindesk - news](https://www.coindesk.com/)
- [cryptocompare - prices](https://cryptocompare.com)
