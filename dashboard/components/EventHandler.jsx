import React, { useEffect, useState } from "react";
import { EventContext } from "../context/EventContext";
import { MqttClient } from "../services/MqttClient";
import { useDebounce } from "../hooks/useDebounce";

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
  const [eventsBuffer, setEventsBuffer] = useState({});

  useEffect(() => {
    const MQTT_CLIENT = new MqttClient({
      clientId: "dashboard",
      hostUrl,
      auth,
      topics,
      onMessage: (topic, message) => {
        setEventsBuffer(formatter(message, events));
      },
    });

    return () => MQTT_CLIENT && MQTT_CLIENT.close();
  }, []);

  const debouncedEvents = useDebounce(eventsBuffer, 250);

  useEffect(() => {
    setEvents(eventsBuffer);
  }, [eventsBuffer]);

  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
}
