import React from "react";
import { Error } from "../components/Error";
import { useRouter } from "next/router";

export default function Error500() {
  const router = useRouter()
  return <Error
    label="500 error"
    description="Internal server error."
    descriptionDetails="Oops! Something went wrong on our server. We apologize for the inconvenience. Our team has been notified and is working to fix the issue."
    backAction={() => router.back()}
    homeAction={() => router.push('/')}
  />;
}
