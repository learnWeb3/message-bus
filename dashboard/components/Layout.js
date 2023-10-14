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
            <Error
              label="Authentication Session Lost"
              description="Please log in again to continue securely."
              descriptionDetails={null}
              backAction={null}
              homeAction={() => window.location.href = '/'}
            />
          </FullScreenContainer>
        )}
        authenticatingComponent={() => (
          <FullScreenContainer>
            <Loader />
          </FullScreenContainer>
        )}
        authenticatingErrorComponent={() => (
          <FullScreenContainer>
            <Error
              label="Authentication error"
              description="Please log in again to continue securely."
              descriptionDetails={null}
              backAction={null}
              homeAction={() => window.location.href = '/'}
            />
          </FullScreenContainer>
        )}
        loadingComponent={() => (
          <FullScreenContainer>
            <Loader />
          </FullScreenContainer>
        )}
        serviceWorkerNotSupportedComponent={() => (
          <FullScreenContainer>
            <Error
              label="Service Worker Not Supported"
              description="Your browser does not support service workers."
              descriptionDetails="Please consider using a modern browser that supports service workers for an optimal user experience."
              backAction={null}
              homeAction={() => window.location.href = '/'}
            />
          </FullScreenContainer>
        )}
        configuration={configuration}
        onEvent={onEvent}
        withCustomHistory={withCustomHistory}
      >
        <main className="bg-gray-900">{children}</main>
      </OidcProvider>

    </>
  );
}
