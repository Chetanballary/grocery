import { shadcn } from "@clerk/themes";

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

export const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl:
      typeof window !== "undefined"
        ? `${window.location.origin}${basePath}/logo.svg`
        : "",
  },
  variables: {
    colorPrimary: "#15803d",
    colorForeground: "#0a0a0a",
    colorMutedForeground: "#525252",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#0a0a0a",
    colorNeutral: "#d4d4d4",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox:
      "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-stone-200",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-stone-900 font-display",
    headerSubtitle: "text-stone-600",
    socialButtonsBlockButtonText: "text-stone-900 font-medium",
    formFieldLabel: "text-stone-800 font-medium",
    footerActionLink: "text-green-700 font-semibold hover:text-green-800",
    footerActionText: "text-stone-600",
    dividerText: "text-stone-500",
    identityPreviewEditButton: "text-green-700",
    formFieldSuccessText: "text-green-700",
    alertText: "text-stone-800",
    logoBox: "mb-2",
    logoImage: "h-10",
    socialButtonsBlockButton:
      "border border-stone-200 hover:bg-stone-50 transition-colors",
    formButtonPrimary:
      "bg-green-700 hover:bg-green-800 text-white font-semibold transition-colors",
    formFieldInput:
      "border border-stone-300 focus:border-green-700 focus:ring-1 focus:ring-green-700",
    footerAction: "text-stone-600",
    dividerLine: "bg-stone-200",
    alert: "border border-stone-200 bg-stone-50",
    otpCodeFieldInput: "border-stone-300",
    formFieldRow: "",
    main: "",
  },
};

export function getMockUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mock_user_id");
}

export function setMockUserId(): string {
  const userId = "user_guest_" + Math.random().toString(36).slice(2, 9);
  localStorage.setItem("mock_user_id", userId);
  return userId;
}

export function clearMockUserId() {
  localStorage.removeItem("mock_user_id");
}

export const ROLE_INTENT_KEY = "aaharaam:intended-role";

export function setIntendedRole(role: "buyer" | "seller") {
  try {
    sessionStorage.setItem(ROLE_INTENT_KEY, role);
  } catch {
    // ignore
  }
}

export function consumeIntendedRole(): "buyer" | "seller" | null {
  try {
    const v = sessionStorage.getItem(ROLE_INTENT_KEY);
    sessionStorage.removeItem(ROLE_INTENT_KEY);
    return v === "buyer" || v === "seller" ? v : null;
  } catch {
    return null;
  }
}
