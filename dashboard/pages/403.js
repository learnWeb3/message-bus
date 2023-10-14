import React from "react";
import { Error } from "../components/Error";
import { useRouter } from "next/router";

export default function Error403() {
  const router = useRouter()
  return <Error
    label="403 error"
    description="Forbiden."
    descriptionDetails="You do not have permission to view this page or resource. Please contact the administrator if you believe this is an error."
    backAction={() => router.back()}
    homeAction={() => router.push('/')}
  />;
}
