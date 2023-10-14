import { useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";

export function AreaChart({
  series = [
    {
      data: [
        {
          x: "Apple",
          y: 54,
        },
        {
          x: "Orange",
          y: 66,
        },
      ],
    },
  ],
}) {
  const chartContainerRef = useRef(null);
  const [options, setOptions] = useState({
    chart: {
      type: "area",
      height: 350,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: true,
      },
    },
  });

  return (
    <div id="chart" className="h-full w-full" ref={chartContainerRef}>
      {chartContainerRef?.current ? (
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={chartContainerRef.current.clientHeight}
        />
      ) : null}
    </div>
  );
}
