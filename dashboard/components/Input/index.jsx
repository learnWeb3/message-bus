import { MobileDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import React from "react";

export function DateTimeInput({
  label = "label",
  min = "2018-06-07T00:00",
  max = "2019-06-07T00:00",
  value = "2018-07-07T00:00",
  setValue = (value) => {
    console.log(value);
  },
}) {
  return (
    <MobileDateTimePicker
      minDate={dayjs(min)}
      maxDate={dayjs(max)}
      sx={{
        "& input": {
          color: "white",
          border: "2px solid white",
          "&:focus": {
            color: "white",
            border: "2px solid white",
          },
          "&:hover": {
            color: "white",
            border: "2px solid white",
          },
        },
        "& label": {
          color: "white",
        },
      }}
      defaultValue={dayjs(value)}
      onChange={(newValue) => setValue(newValue.toISOString())}
      orientation="portrait"
    />
  );
}
