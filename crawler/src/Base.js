const { join } = require("path");
const { Builder, By, Key, until } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class Base {
  constructor(domain, url, authenticationCookie = null) {
    this.driver = this._buildDriver()
    this.domain = domain;
    this.page = 1;
    this.url = url;
    this.authenticationCookie = authenticationCookie;
  }

  async fillInputByCssSelector(selector, content = "some text") {
    await this.driver
      .findElement(By.css(selector))
      .sendKeys(content);
  }

  async clickOnElement(element) {
    await this.driver.executeScript("arguments[0].click();", element);
  }

  async clickOnElementByCssSelector(selector) {
    await this.driver.executeScript(
      "return document.querySelector(`" + `${selector}` + "`).click()"
    );
  }

  async _checkElementIsPresent(selector, timeout) {
    return await this.driver
      .wait(
        until.elementLocated(By.css(selector)),
        timeout,
        "timed out"
      )
      .then(async (element) => true)
      .catch((error) => false);
  }

  async _checkCookieIsPresent(cookieKey) {
    // read the cookie
    try {
      await this.driver
        .manage()
        .getCookie(cookieKey)
        .then(function (cookie) {
          return cookie;
        });
    } catch (error) {
      console.log("Error while retrieving authentication cookie");
      await this.driver.quit();
    }
  }

  async _addAuthenticationCookie() {
    if (this.authenticationCookie) {
      await this.driver.get(this.domain);
      await this.driver.manage().addCookie(this.authenticationCookie);
      return this.driver;
    } else {
      throw new Error("Authenticatioon cookie has not been set");
    }
  }

  async _dumpHTML() {
    const self = this;
    const html_doc = await self.driver.executeScript(
      "return document.documentElement.outerHTML"
    );
    return html_doc;
  }

  _nextPage() {
    this.page = this.page + 1;
  }
  _previousPage() {
    this.page = this.page - 1;
  }

  async navigate() {
    if (this.url) {
      const isAbsolute = /http|https\:\/\//.test(this.url)
      const pageUrl = isAbsolute ? this.url : `https://${this.domain}` + this.url
      console.log(`navigating to ${pageUrl}`)
      await this.driver.get(pageUrl);
    }
  }

  async extractFromPage(
    targetedSelector,
    extractOptions = {
      text: true,
      href: true,
    }
  ) {
    const cheerio = require("cheerio");
    const html_doc = await this._dumpHTML();

    let $ = cheerio.load(html_doc);
    const elements = Array.from($(targetedSelector));
    // console.log(targetedSelector, 'element HTML')
    return elements.map((e) => {
      const obj = {};
      for (const key in extractOptions) {
        obj[key] =
          key === "text"
            ? $(e).text()
              ? $(e).text().trim()
              : ""
            : $(e).attr(key)
              ? $(e).attr(key).trim()
              : "";
      }
      return obj;
    });
  }

  async quit() {
    await this.driver.quit()
  }

  _buildDriver() {
    const isDebug = process.env.DEBUG && +process.env.DEBUG ? true : false
    const webDriverPath = process.env.WEBDRIVER_BINARY_PATH;
    if (isDebug && !webDriverPath) {
      console.log(`missing environnement variable WEBDRIVER_BINARY_PATH`)
      process.exit(255)
    }
    if (isDebug && webDriverPath) {
      const options = new chrome.Options();
      const service = new chrome.ServiceBuilder(
        join(webDriverPath)
      )
      const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeService(service)
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();

      return driver;
    }

    if (!isDebug && webDriverPath) {
      const options = new chrome.Options();
      const service = new chrome.ServiceBuilder(
        join(webDriverPath)
      )
      options.addArguments("--no-sandbox");
      options.addArguments("--disable-dev-shm-usage");
      options.addArguments('--headless')
      const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeService(service)
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();

      return driver;
    }

    const options = new chrome.Options();
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments('--headless')
    const driver = new Builder()
      .usingServer(process.env.SELENIUM_SERVER_URL)
      .withCapabilities(webdriver.Capabilities.chrome())
      .setChromeOptions(options)
      .build();

    return driver;

  }
}

module.exports = Base;
