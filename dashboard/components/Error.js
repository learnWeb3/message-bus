import React from "react";

export function Error({
  label = "404 error",
  description = "Page not found",
  descriptionDetails = "Sorry, the page you are looking for doesn't exist.", backAction = null, homeAction = null }) {
  return (
    <section className="bg-gray-900 grid grid-cols-12">
      <div className="flex items-center min-h-screen col-span-12 lg:col-span-3 lg:col-start-5 p-4">
        <div className="w-full">
          <p className="text-sm font-medium text-blue-400">
            {label}
          </p>
          {description ? <h1 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
            {description}
          </h1> : null}
          {descriptionDetails ? <p className="mt-4 text-gray-400">
            {descriptionDetails}
          </p> : null}

          <div className="flex flex-col lg:flex-row items-center mt-6 gap-3">
            {backAction ? <button onClick={backAction} className="hidden lg:flex items-center justify-center w-full lg:w-1/2 px-5 py-2 text-sm transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-800 text-black hover:text-white border-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="w-5 h-5 rtl:rotate-180"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                />
              </svg>

              <span>Go back</span>
            </button>
              : null}
            {homeAction ? <button onClick={homeAction} className="w-full lg:w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 rounded-lg shrink-0 sm:w-auto hover:bg-blue-600 bg-blue-500">
              Take me home
            </button> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
