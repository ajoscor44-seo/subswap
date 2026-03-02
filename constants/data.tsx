import { TViewState } from "./types";
import type { OnboardingStep } from "./types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "What do you want to share?",
    subtitle: "Pick the category you're most interested in.",
    field: "useCase",
    options: [
      { icon: <i className="fa-solid fa-film" />, label: "Movies & Shows" },
      { icon: <i className="fa-solid fa-music" />, label: "Music Streaming" },
      {
        icon: <i className="fa-solid fa-laptop-code" />,
        label: "Software & Dev Tools",
      },
      {
        icon: <i className="fa-solid fa-graduation-cap" />,
        label: "Online Courses",
      },
      { icon: <i className="fa-solid fa-gamepad" />, label: "Gaming" },
      {
        icon: <i className="fa-solid fa-briefcase" />,
        label: "Business & Productivity",
      },
    ],
  },
  {
    title: "How will you use the platform?",
    subtitle: "This helps us tailor your dashboard experience.",
    field: "role",
    options: [
      {
        icon: <i className="fa-solid fa-crown" />,
        label: "I want to host a slot",
      },
      {
        icon: <i className="fa-solid fa-ticket" />,
        label: "I want to join a slot",
      },
      {
        icon: <i className="fa-solid fa-shuffle" />,
        label: "Both — host & join",
      },
      {
        icon: <i className="fa-solid fa-eye" />,
        label: "Just browsing for now",
      },
    ],
  },
  {
    title: "How did you find us?",
    subtitle: "We'd love to know where you came from.",
    field: "referralSource",
    options: [
      { icon: <i className="fa-brands fa-instagram" />, label: "Instagram" },
      { icon: <i className="fa-brands fa-tiktok" />, label: "TikTok" },
      { icon: <i className="fa-brands fa-x-twitter" />, label: "Twitter / X" },
      { icon: <i className="fa-solid fa-users" />, label: "Friend or Family" },
      { icon: <i className="fa-brands fa-google" />, label: "Google Search" },
      { icon: <i className="fa-solid fa-microphone" />, label: "Podcast" },
    ],
  },
];

export const pageViews: TViewState[] = [
  "home",
  "dashboard",
  "admin",
  "about",
  "contact",
  "transactions",
  "marketplace",
  "settings",
];
