import React, { useContext, useEffect, useState } from "react";
import { EventContext } from "../../context/EventContext";
import { getFeedAnalytics } from "../../services/opensearchHTTPClient";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useDebounce } from "../../hooks/useDebounce";
import { useRouter } from "next/router";

export const humanizeNumber = (number) => {
  const units = {
    1000: "k",
    1000000: "M",
    1000000000: "B",
  };
  for (const unit in units) {
    const div = number / unit;
    if (div > 0 && div < 10) {
      return div + " " + units[unit];
    }
  }
};

export const financializeNumber = (number) => {
  if (number / 1000 > 0) {
    const splitted = `${number}`.split(".");
    const decimals = splitted[1] || null;
    const numberLetters = splitted[0].split("").reverse();
    let financializedNumber = "";
    for (let index = 0; index < numberLetters.length; index++) {
      if ((index + 1) % 3 === 0 && index !== numberLetters.length - 1) {
        financializedNumber += `${numberLetters[index]},`;
      } else {
        financializedNumber += `${numberLetters[index]}`;
      }
    }
    return `${financializedNumber.split("").reverse().join("")}.${
      decimals ? decimals : "00"
    }`;
  }
  return number;
};

export const formatPercentage = (percentage) =>
  Math.floor(percentage * 100) / 100;

export function UpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="18" y1="11" x2="12" y2="5"></line>
      <line x1="6" y1="11" x2="12" y2="5"></line>
    </svg>
  );
}

export function DownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="18" y1="13" x2="12" y2="19"></line>
      <line x1="6" y1="13" x2="12" y2="19"></line>
    </svg>
  );
}

export function CryptoPriceFeedCard({
  name = "BTC",
  price = 27900,
  volume = 27000000000,
  percentChange1HourAgo = 27900,
  percentChange1DayAgo = 27900,
  percentChange1WeekAgo = 27900,
  isUp = false,
  isDown = false,
  isUp1HourAgo = false,
  isDown1HourAgo = false,
  isUp1DayAgo = false,
  isDown1DayAgo = false,
  isUp1WeekAgo = false,
  isDown1WeekAgo = false,
}) {
  const router = useRouter();
  const priceChangeStyles = {
    isUp: "text-green-500",
    isDown: "text-red-500",
  };
  function handleClick() {
    router.push(`/${name}`);
  }
  return (
    <div
      className="text-sm flex w-full hover:text-gray-100 hover:border-gray-100 border-b-[1px] border-gray-600 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2 mt-5 w-4/12 lg:w-2/12">
        <div>{name}</div>
      </div>
      <div
        className={`flex items-center space-x-2 mt-5 w-4/12 lg:w-2/12 transform hover:scale-105 duration-200 ${
          isUp ? priceChangeStyles.isUp : ""
        } ${isDown ? priceChangeStyles.isDown : ""}`}
      >
        {isUp ? <UpIcon /> : null}
        {isDown ? <DownIcon /> : null}${financializeNumber(price)}
      </div>
      <div
        className={`hidden lg:flex items-center space-x-2 mt-5 w-2/12 transform hover:scale-105 duration-200 ${
          isUp1HourAgo ? priceChangeStyles.isUp : ""
        } ${isDown1HourAgo ? priceChangeStyles.isDown : ""}`}
      >
        {isUp1HourAgo ? <UpIcon /> : null}
        {isDown1HourAgo ? <DownIcon /> : null}
        {percentChange1HourAgo !== null
          ? formatPercentage(percentChange1HourAgo) + "%"
          : null}
      </div>
      <div
        className={`flex items-center space-x-2 mt-5 w-4/12 lg:w-2/12 transform hover:scale-105 duration-200 ${
          isUp1DayAgo ? priceChangeStyles.isUp : ""
        } ${isDown1DayAgo ? priceChangeStyles.isDown : ""}`}
      >
        {isUp1DayAgo ? <UpIcon /> : null}
        {isDown1DayAgo ? <DownIcon /> : null}
        {percentChange1DayAgo !== null
          ? formatPercentage(percentChange1DayAgo) + "%"
          : null}
      </div>
      <div
        className={`hidden lg:flex items-center space-x-2 mt-5 w-2/12 transform hover:scale-105 duration-200 ${
          isUp1WeekAgo ? priceChangeStyles.isUp : ""
        } ${isDown1WeekAgo ? priceChangeStyles.isDown : ""}`}
      >
        {isUp1WeekAgo ? <UpIcon /> : null}
        {isDown1WeekAgo ? <DownIcon /> : null}
        {percentChange1WeekAgo !== null
          ? formatPercentage(percentChange1WeekAgo) + "%"
          : null}
      </div>
      <div className="hidden lg:flex items-center space-x-2 mt-5 w-2/12 flex transform hover:scale-105 duration-200">
        <span>{humanizeNumber(volume)}</span>
      </div>
    </div>
  );
}

export function CryptoPriceFeed() {
  const { accessToken } = useOidcAccessToken();
  const { events } = useContext(EventContext);
  const debouncedEvents = useDebounce(events, 500);
  const [feedData, setFeedData] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    events &&
      getFeedAnalytics(accessToken, abortController).then((data) => {
        if (data && data.length) {
          const currentEvents = { ...events };
          for (const { name, last_hour, last_day, last_week } of data) {
            if (currentEvents[name]) {
              currentEvents[name] = {
                ...currentEvents[name],
                current1HourAgo: last_hour.avg_price.value,
                current1DayAgo: last_day.avg_price.value,
                current1WeekAgo: last_week.avg_price.value,
              };
            }
          }
          setFeedData(
            Object.values(currentEvents).sort(
              (a, b) => a.current.price > b.current.price
            )
          );
        }
      });
    return () => abortController?.abort();
  }, [debouncedEvents]);
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative font-inter grid grid-cols-12 gap-4 p-4">
        <div className="col-span-12 lg:col-span-12 rounded-xl w-full text-gray-300">
          <div className="text-2xl font-bold mb-4 text-white">Crypto Rates</div>
          <div className="flex text-sm font-semibold text-gray-100">
            <div className="w-4/12 lg:w-2/12">Currency</div>
            <div className="w-4/12 lg:w-2/12">Price</div>
            <div className="hidden lg:flex w-2/12">1h %</div>
            <div className="w-4/12 lg:w-2/12">24h %</div>
            <div className="hidden lg:flex w-2/12">7d %</div>
            <div className="hidden lg:flex w-2/12">Volume</div>
          </div>

          {feedData.map(
            ({
              previous,
              current,
              current1HourAgo,
              current1DayAgo,
              current1WeekAgo,
            }) => (
              <CryptoPriceFeedCard
                key={current.name}
                {...current}
                percentChange1HourAgo={
                  current1HourAgo
                    ? (current.price - current1HourAgo) / 100
                    : null
                }
                percentChange1DayAgo={
                  current1DayAgo ? (current.price - current1DayAgo) / 100 : null
                }
                percentChange1WeekAgo={
                  current1WeekAgo
                    ? (current.price - current1WeekAgo) / 100
                    : null
                }
                isUp={previous?.price < current.price}
                isDown={previous?.price > current.price}
                isUp1HourAgo={current1HourAgo < current.price}
                isDown1HourAgo={current1HourAgo > current.price}
                isUp1DayAgo={current1DayAgo < current.price}
                isDown1DayAgo={current1DayAgo > current.price}
                isUp1WeekAgo={current1WeekAgo < current.price}
                isDown1WeekAgo={current1WeekAgo > current.price}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
