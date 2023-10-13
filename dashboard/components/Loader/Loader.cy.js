import React from "react";
import { Loader } from "./Loader";

describe("<Loader />", () => {
  it("should render and display expected content", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Loader />);
    cy.get("span.sr-only").contains("Loading...");
  });
});
