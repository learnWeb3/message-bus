import React from "react";
import { Error } from "../components/Error";
import { useRouter } from "next/router";

export default function Error404() {
  const router = useRouter()
  return <Error homeAction={() => router.push('/')} />;
}
