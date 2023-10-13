import { OidcProvider } from "@axa-fr/react-oidc";
import { useRouter } from "next/router";
import React from "react";
import { Loader } from "./Loader/Loader";
import { Error } from "./Error";
import { FullScreenContainer } from "./FullScreenContainer";

const configuration = {
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
  redirect_uri:
    process.env.NEXT_PUBLIC_FRONTEND_URL + "/#authentication/callback",
  silent_redirect_uri:
    process.env.NEXT_PUBLIC_FRONTEND_URL + "/#authentication/silent-callback", // Optional activate silent-signin that use cookies between OIDC server and client javascript to restore the session
  scope: process.env.NEXT_PUBLIC_OIDC_SCOPES,
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY,
};

const onEvent = (configurationName, eventName, data) => {
  // eslint-disable-next-line no-undef
  console.log(`oidc:${configurationName}:${eventName}`, data);
};

export default function Layout({ children }) {
  const router = useRouter();
  const withCustomHistory = () => {
    return {
      replaceState: (url) => {
        router
          .replace({
            pathname: url,
          })
          .then(() => {
            // eslint-disable-next-line no-undef
            window.dispatchEvent(new Event("popstate"));
          });
      },
    };
  };
  return (
    <>
      <OidcProvider
        sessionLostComponent={() => (
          <FullScreenContainer>
            <Error />
          </FullScreenContainer>
        )}
        authenticatingComponent={() => (
          <FullScreenContainer>
            <Loader />
          </FullScreenContainer>
        )}
        authenticatingErrorComponent={() => (
          <FullScreenContainer>
            <Error />
          </FullScreenContainer>
        )}
        loadingComponent={() => (
          <FullScreenContainer>
            <Loader />
          </FullScreenContainer>
        )}
        serviceWorkerNotSupportedComponent={() => (
          <FullScreenContainer>
            <Error />
          </FullScreenContainer>
        )}
        configuration={configuration}
        onEvent={onEvent}
        withCustomHistory={withCustomHistory}
      >
        <main classNameName="bg-red-600">{children}</main>
      </OidcProvider>
    </>
  );
}
