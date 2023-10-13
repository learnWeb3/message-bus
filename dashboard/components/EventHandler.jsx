import React, { useEffect, useState } from "react";
import { EventContext } from "../context/EventContext";
import { MqttClient } from "../services/MqttClient";

export function EventHandler({
  children,
  hostUrl = "",
  auth = {
    username: "",
    password: "",
  },
  // "cryptoviz/+/notify/data", "cryptoviz/price-feed/notify/data"
  topics = [],
  formatter = (message, events) => {
    return events;
  },
}) {
  const [events, setEvents] = useState({});
  useEffect(() => {
    const MQTT_CLIENT = new MqttClient({
      clientId: "dashboard",
      hostUrl,
      auth,
      topics,
      onMessage: (topic, message) => {
        setEvents(formatter(message, events));
      },
    });

    return () => MQTT_CLIENT && MQTT_CLIENT.close();
  }, []);

  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
}
