import { OidcSecure } from "@axa-fr/react-oidc";
import { useRouter } from "next/router";
import { EventHandler } from "../components/EventHandler";
import { CryptoPriceChart } from "../components/CryptoPriceChart";
import {  useState } from "react";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { DateTimeInput } from "../components/Input";


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



export default function CoinPage({
    MQTT_BROKER_HOST_URL = "",
    MQTT_AUTH_USERNAME = "",
    MQTT_AUTH_PASSWORD
}) {
    const router = useRouter()
    const [isLive, setIsLive] = useState(true)

    const [from, setFrom] = useState(new Date().getTime() - 24 * 60 * 60 * 100);
    const [to, setTo] = useState(new Date().getTime());



    return <OidcSecure>
        <EventHandler hostUrl={MQTT_BROKER_HOST_URL}
            auth={{
                username: MQTT_AUTH_USERNAME,
                password: MQTT_AUTH_PASSWORD,
            }}
            topics={[`cryptoviz/price-feed/${router.query.coin}/notify/data`]}
            formatter={(item, events) => {
                return { ...events, last: item };
            }}>

            <div className="grid grid-cols-12 gap-4 p-4 text-white">
                <div className="col-span-12 items-center flex gap-4 justify-between lg:h-[10vh]">
                    <span>
                        <h1 className="text-2xl font-bold">{router.query.coin}</h1>
                    </span>

                    <div className="flex items-center gap-4">
                        {!isLive ? <>

                            <div className="hidden lg:flex gap-2">
                                <DateTimeInput
                                    min={new Date(new Date().getTime() - (365 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16)}
                                    max={new Date(new Date().getTime()).toISOString().slice(0, 16)}
                                    value={new Date(from).toISOString().slice(0, 16)}
                                    setValue={(value) => setFrom(new Date(value).getTime())}
                                />
                                <DateTimeInput
                                    min={new Date(from).toISOString().slice(0, 16)}
                                    max={new Date(new Date().getTime()).toISOString().slice(0, 16)}
                                    value={new Date(to).toISOString().slice(0, 16)}
                                    setValue={(value) => setTo(new Date(value).getTime())}
                                />
                            </div>

                        </> : null}

                        <span>
                            <ToggleSwitch checked={isLive} setChecked={() => {
                                setFrom(new Date().getTime() - 24 * 60 * 60 * 100)
                                setTo(new Date().getTime())
                                setIsLive(!isLive)
                            }} />
                        </span>

                    </div>
                </div>
                <div className="col-span-12 flex lg:hidden flex-col gap-4">
                    <DateTimeInput
                        min={new Date(new Date().getTime() - (365 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16)}
                        max={new Date(new Date().getTime()).toISOString().slice(0, 16)}
                        value={new Date(from).toISOString().slice(0, 16)}
                        setValue={(value) => setFrom(new Date(value).getTime())}
                        label="start"
                    />
                    <DateTimeInput
                        min={new Date(from).toISOString().slice(0, 16)}
                        max={new Date(new Date().getTime()).toISOString().slice(0, 16)}
                        value={new Date(to).toISOString().slice(0, 16)}
                        setValue={(value) => setTo(new Date(value).getTime())}
                        label="end"
                    />
                </div>
                <div className="col-span-12 h-[66vh] lg:h-[85vh]">
                    <CryptoPriceChart live={isLive} from={from} to={to} coin={router.query.coin} />
                </div>
            </div>

        </EventHandler>
    </OidcSecure >
}