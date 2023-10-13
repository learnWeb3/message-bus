import { OidcSecure, useOidcAccessToken } from "@axa-fr/react-oidc";
import Layout from "../components/Layout";
import { EventHandler } from "../components/EventHandler";
import { CryptoPriceFeed } from "../components/CryptoPriceFeed";
import { useState } from "react";


export const getServerSideProps = (async (context) => {
  const MQTT_BROKER_HOST_URL = process.env.MQTT_BROKER_HOST_URL
  const MQTT_AUTH_USERNAME = process.env.MQTT_AUTH_USERNAME
  const MQTT_AUTH_PASSWORD = process.env.MQTT_AUTH_PASSWORD
  return {
    props: {
      MQTT_BROKER_HOST_URL,
      MQTT_AUTH_USERNAME,
      MQTT_AUTH_PASSWORD
    }
  }
})


export default function HomePage({
  MQTT_BROKER_HOST_URL = "",
  MQTT_AUTH_USERNAME = "",
  MQTT_AUTH_PASSWORD
}) {
  const { accessToken } = useOidcAccessToken();

  return (
    <OidcSecure>
      <EventHandler hostUrl={MQTT_BROKER_HOST_URL}
        auth={{
          username: MQTT_AUTH_USERNAME,
          password: MQTT_AUTH_PASSWORD,
        }}
        topics={["cryptoviz/price-feed/+/notify/data"]}
        formatter={(item, events) => {
          if (events[item.name]) {
            events[item.name] = {
              previous: events[item.name].current,
              current: item
            }
          } else {
            events[item.name] = {
              previous: item,
              current: item
            }
          }
          return { ...events };
        }}>
        <div>{JSON.stringify(accessToken)}</div>
        {/* <CryptoPriceFeed /> */}
      </EventHandler>
    </OidcSecure >
  );
}

HomePage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
