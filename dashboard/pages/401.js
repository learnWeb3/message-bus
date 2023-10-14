import React, { useReducer } from "react";
import { Error } from "../components/Error";
import { useRouter } from "next/router";

export default function Error401() {
  const router = useRouter()
  return <Error
    label="401 error"
    description="Unauthorized."
    descriptionDetails="You are not authenticated to access this resource or do not have the right to access it."
    backAction={() => router.back()}
    homeAction={() => router.push('/')}
  />;
}
