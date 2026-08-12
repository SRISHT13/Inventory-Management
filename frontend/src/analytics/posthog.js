import posthog from "posthog-js";

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com",

    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,

    persistence: "localStorage",

    person_profiles: "identified_only",
  });
}

export default posthog;