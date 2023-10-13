import React, { useContext, useEffect } from "react";
import { EventContext } from "../../context/EventContext";

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
  isUp = false,
  isDown = true,
}) {
  const priceChangeStyles = {
    isUp: "text-green-500",
    isDown: "text-red-500",
  };
  return (
    <div className="text-sm flex w-full">
      <div className="flex items-center space-x-2 mt-5 w-4/12">
        <div>{name}</div>
      </div>
      <div
        className={`flex items-center space-x-2 mt-5 w-4/12 transform hover:scale-105 duration-200 ${
          isUp ? priceChangeStyles.isUp : ""
        } ${isDown ? priceChangeStyles.isDown : ""}`}
      >
        {isUp ? <UpIcon /> : null}
        {isDown ? <DownIcon /> : null}${price}
      </div>
      <div className="flex items-center space-x-2 mt-5 w-4/12 flex transform hover:scale-105 duration-200">
        <span>{volume}</span>
      </div>
    </div>
  );
}

export function CryptoPriceFeed(
  {
    //   data = [
    //     {
    //       previous: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //       current: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //     },
    //     {
    //       previous: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //       current: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //     },
    //     {
    //       previous: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //       current: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //     },
    //     {
    //       previous: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //       current: {
    //         name: "BTC",
    //         price: 27900,
    //         volume: 27000000000,
    //       },
    //     },
    //   ],
  }
) {
  const { events } = useContext(EventContext);
  useEffect(() => {
    console.log(events, "EVENTS");
  }, [events]);
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative font-inter grid grid-cols-12 gap-4 p-4">
        <div className="col-span-12 lg:col-span-9 rounded-xl bg-white p-6 w-full text-gray-700">
          <div className="font-semibold text-gray-800 mb-4">Crypto Rates</div>
          <div className="flex text-sm font-semibold text-gray-600">
            <div className="w-4/12">Currency</div>
            <div className="w-4/12">Price</div>
            <div className="w-4/12">Volume</div>
          </div>

          {Object.values(events)
            .sort((a, b) => a.current.price > b.current.price)
            .map(({ previous, current }) => (
              <CryptoPriceFeedCard
                key={current.name}
                {...current}
                isUp={previous?.price < current.price}
                isDown={previous?.price > current.price}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
