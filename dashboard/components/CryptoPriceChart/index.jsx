import { createChart, ColorType } from "lightweight-charts";
import React, { useContext, useEffect, useRef, useState } from "react";
import { getCoinBars } from "../../services/opensearchHTTPClient";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { EventContext } from "../../context/EventContext";

export const CryptoPriceChart = ({
  from,
  to,
  live = true,
  coin = "BTC",
  textColor = "white",
  backgroundColor = "rgb(17,24,39,1)",
  timeseriesColors = {
    upColor: "#26a69a",
    downColor: "#ef5350",
    borderVisible: false,
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
  },
}) => {
  const chartParentContainerRef = useRef();
  const chartContainerRef = useRef();
  const chart = useRef(null);
  const series = useRef(null);

  const { accessToken } = useOidcAccessToken();
  const { events } = useContext(EventContext);

  const [bars, setBars] = useState([]);

  useEffect(() => {
    accessToken &&
      coin &&
      getCoinBars(accessToken, {
        coin,
        barInterval: live ? "1m" : "30m",
        barFrom: from,
        barTo: to,
      }).then((bars) => setBars(bars));
  }, [coin, accessToken, from, to, live]);

  useEffect(() => {
    if (
      live &&
      bars?.length &&
      events?.last &&
      events?.last.timestamp &&
      series?.current
    ) {
      const lastBar = bars[bars.length - 1];
      const lastEventTime = Math.ceil(events.last.timestamp / 1000);
      if (lastBar?.time < lastEventTime) {
        setBars([
          ...bars,
          {
            time: lastEventTime,
            value: events.last.price,
          },
        ]);
      }
      if (
        lastBar?.time >= lastEventTime &&
        lastBar.value !== events.last.price
      ) {
        setBars([
          ...bars.filter((bar) => bar.time !== lastBar?.time),
          {
            time: lastBar.time,
            value: events.last.price,
          },
        ]);
      }
    }
  }, [events, series, live]);

  function handleResize() {
    chart.current.applyOptions({
      width: chartContainerRef.current.clientWidth,
    });
  }

  // function onVisibleLogicalRangeChanged(newVisibleLogicalRange) {
  //   const barsInfo = series.current.barsInLogicalRange(newVisibleLogicalRange);
  //   // if there less than 50 bars to the left of the visible area
  //   if (barsInfo !== null && barsInfo.barsBefore < -50) {
  //     const time = (bars[0].time - 60) * 1000;
  //     getCoinBars(accessToken, {
  //       coin,
  //       barInterval: timeframe,
  //       barFrom: time - 24 * 60 * 60 * 1000,
  //       barTo: time,
  //     }).then((newBars) => {
  //       console.log(newBars, "newBars");
  //       newBars && newBars.length && setBars([...newBars, ...bars]);
  //     });
  //   }
  // }

  useEffect(() => {
    if (chartParentContainerRef?.current && chartContainerRef.current) {
      const _chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor,
        },
        width: chartContainerRef.current.clientWidth,
        height: chartParentContainerRef.current.getBoundingClientRect().height,
      });

      const _series = _chart.addAreaSeries({
        backgroundColor: "white",
        lineColor: "#2962FF",
        textColor: "black",
        areaTopColor: "#2962FF",
        areaBottomColor: "rgba(41, 98, 255, 0.28)",
      });

      _chart.applyOptions({
        timeScale: {
          secondsVisible: false,
          fixLeftEdge: true,
          fixRightEdge: true,
          timeVisible: true,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: false,
          shiftVisibleRangeOnNewBar: false,
        },
        leftPriceScale: {
          autoScale: false,
        },
        rightPriceScale: {
          autoScale: false,
        },
      });

      chart.current = _chart;
      series.current = _series;
    }
  }, [
    timeseriesColors,
    backgroundColor,
    textColor,
    chartContainerRef,
    chartParentContainerRef,
  ]);

  useEffect(() => {
    chart.current && window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart?.current && chart?.current.remove();
    };
  }, [chart.current]);

  useEffect(() => {
    series.current && bars?.length && series.current.setData(bars);
    if (!live && chart.current) {
      chart.current.timeScale().fitContent();
    }
  }, [chart.current, bars, series.current]);

  return (
    <div className="w-full h-full" ref={chartParentContainerRef}>
      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  );
};
