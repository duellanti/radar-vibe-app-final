@tailwind base;
@tailwind components;
@tailwind utilities;

/* LIGHT MODE */
:root {
  --button-outline: rgba(0,0,0, .10);
  --badge-outline: rgba(0,0,0, .05);
  --opaque-button-border-intensity: -8;
  --elevate-1: rgba(0,0,0, .03);
  --elevate-2: rgba(0,0,0, .08);
  --background: 0 0% 4%;
  --foreground: 43 30% 75%;
  --border: 0 0% 14%;
  --card: 0 0% 7%;
  --card-foreground: 43 30% 75%;
  --card-border: 0 0% 12%;
  --sidebar: 0 0% 5%;
  --sidebar-foreground: 43 30% 75%;
  --sidebar-border: 0 0% 12%;
  --sidebar-primary: 43 74% 49%;
  --sidebar-primary-foreground: 0 0% 4%;
  --sidebar-accent: 43 15% 12%;
  --sidebar-accent-foreground: 43 30% 80%;
  --sidebar-ring: 43 74% 49%;
  --popover: 0 0% 8%;
  --popover-foreground: 43 30% 75%;
  --popover-border: 0 0% 15%;
  --primary: 43 74% 49%;
  --primary-foreground: 0 0% 4%;
  --secondary: 43 10% 14%;
  --secondary-foreground: 43 30% 80%;
  --muted: 43 5% 12%;
  --muted-foreground: 43 10% 50%;
  --accent: 43 15% 12%;
  --accent-foreground: 43 30% 80%;
  --destructive: 0 84% 40%;
  --destructive-foreground: 0 0% 98%;
  --input: 0 0% 25%;
  --ring: 43 74% 49%;
  --chart-1: 43 74% 49%;
  --chart-2: 30 68% 50%;
  --chart-3: 20 65% 48%;
  --chart-4: 10 70% 45%;
  --chart-5: 0 75% 42%;
  --font-sans: Montserrat, sans-serif;
  --font-serif: Playfair Display, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: .5rem;
  --shadow-2xs: 0px 2px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-xs: 0px 2px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-sm: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow-md: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 2px 4px -1px hsl(0 0% 0% / 0.00);
  --shadow-lg: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 4px 6px -1px hsl(0 0% 0% / 0.00);
  --shadow-xl: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 8px 10px -1px hsl(0 0% 0% / 0.00);
  --shadow-2xl: 0px 2px 0px 0px hsl(0 0% 0% / 0.00);
  --tracking-normal: 0em;
  --spacing: 0.25rem;

/* Fallback for older browsers */
  --sidebar-primary-border: hsl(var(--sidebar-primary));
  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --sidebar-accent-border: hsl(var(--sidebar-accent));
  --sidebar-accent-border: hsl(from hsl(var(--sidebar-accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --primary-border: hsl(var(--primary));
  --primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --secondary-border: hsl(var(--secondary));
  --secondary-border: hsl(from hsl(var(--secondary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --muted-border: hsl(var(--muted));
  --muted-border: hsl(from hsl(var(--muted)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --accent-border: hsl(var(--accent));
  --accent-border: hsl(from hsl(var(--accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --destructive-border: hsl(var(--destructive));
  --destructive-border: hsl(from hsl(var(--destructive)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
}

.dark {
  --button-outline: rgba(255,255,255, .10);
  --badge-outline: rgba(255,255,255, .05);
  --opaque-button-border-intensity: 9;
  --elevate-1: rgba(255,255,255, .04);
  --elevate-2: rgba(255,255,255, .09);
  --background: 0 0% 4%;
  --foreground: 43 30% 75%;
  --border: 0 0% 14%;
  --card: 0 0% 7%;
  --card-foreground: 43 30% 75%;
  --card-border: 0 0% 12%;
  --sidebar: 0 0% 5%;
  --sidebar-foreground: 43 30% 75%;
  --sidebar-border: 0 0% 12%;
  --sidebar-primary: 43 74% 49%;
  --sidebar-primary-foreground: 0 0% 4%;
  --sidebar-accent: 43 15% 12%;
  --sidebar-accent-foreground: 43 30% 80%;
  --sidebar-ring: 43 74% 49%;
  --popover: 0 0% 8%;
  --popover-foreground: 43 30% 75%;
  --popover-border: 0 0% 15%;
  --primary: 43 74% 49%;
  --primary-foreground: 0 0% 4%;
  --secondary: 43 10% 14%;
  --secondary-foreground: 43 30% 80%;
  --muted: 43 5% 12%;
  --muted-foreground: 43 10% 50%;
  --accent: 43 15% 12%;
  --accent-foreground: 43 30% 80%;
  --destructive: 0 84% 40%;
  --destructive-foreground: 0 0% 98%;
  --input: 0 0% 25%;
  --ring: 43 74% 49%;
  --chart-1: 43 74% 49%;
  --chart-2: 30 68% 50%;
  --chart-3: 20 65% 48%;
  --chart-4: 10 70% 45%;
  --chart-5: 0 75% 42%;
  --shadow-2xs: 0px 2px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-xs: 0px 2px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-sm: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow-md: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 2px 4px -1px hsl(0 0% 0% / 0.00);
  --shadow-lg: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 4px 6px -1px hsl(0 0% 0% / 0.00);
  --shadow-xl: 0px 2px 0px 0px hsl(0 0% 0% / 0.00), 0px 8px 10px -1px hsl(0 0% 0% / 0.00);
  --shadow-2xl: 0px 2px 0px 0px hsl(0 0% 0% / 0.00);

/* Fallback for older browsers */
  --sidebar-primary-border: hsl(var(--sidebar-primary));
  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --sidebar-accent-border: hsl(var(--sidebar-accent));
  --sidebar-accent-border: hsl(from hsl(var(--sidebar-accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --primary-border: hsl(var(--primary));
  --primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --secondary-border: hsl(var(--secondary));
  --secondary-border: hsl(from hsl(var(--secondary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --muted-border: hsl(var(--muted));
  --muted-border: hsl(from hsl(var(--muted)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --accent-border: hsl(var(--accent));
  --accent-border: hsl(from hsl(var(--accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);

  /* Fallback for older browsers */
  --destructive-border: hsl(var(--destructive));
  --destructive-border: hsl(from hsl(var(--destructive)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply font-sans antialiased bg-background text-foreground;
  }
}

.leaflet-container {
  z-index: 1 !important;
}
.leaflet-pane {
  z-index: 1 !important;
}
.leaflet-top,
.leaflet-bottom {
  z-index: 2 !important;
}
.leaflet-control {
  z-index: 2 !important;
}

@keyframes modalOverlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalOverlayOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes modalContentIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modalContentOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.95) translateY(10px); }
}

.modal-overlay {
  animation: modalOverlayIn 0.2s ease-out forwards;
}
.modal-overlay.closing {
  animation: modalOverlayOut 0.15s ease-in forwards;
}
.modal-content {
  animation: modalContentIn 0.25s ease-out forwards;
}
.modal-overlay.closing .modal-content {
  animation: modalContentOut 0.15s ease-in forwards;
}

.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 50;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.15s ease;
}
.modal-close-btn:hover {
  background: hsl(var(--accent));
  color: hsl(var(--foreground));
}

/**
 * Using the elevate system.
 * Automatic contrast adjustment.
 *
 * <element className="hover-elevate" />
 * <element className="active-elevate-2" />
 *
 * // Using the tailwind utility when a data attribute is "on"
 * <element className="toggle-elevate data-[state=on]:toggle-elevated" />
 * // Or manually controlling the toggle state
 * <element className="toggle-elevate toggle-elevated" />
 *
 * Elevation systems have to handle many states.
 * - not-hovered, vs. hovered vs. active  (three mutually exclusive states)
 * - toggled or not
 * - focused or not (this is not handled with these utilities)
 *
 * Even without handling focused or not, this is six possible combinations that
 * need to be distinguished from eachother visually.
 */
@layer utilities {

  /* Hide ugly search cancel button in Chrome until we can style it properly */
  input[type="search"]::-webkit-search-cancel-button {
    @apply hidden;
  }

  /* Placeholder styling for contentEditable div */
  [contenteditable][data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
  }

  /* .no-default-hover-elevate/no-default-active-elevate is an escape hatch so consumers of
   * buttons/badges can remove the automatic brightness adjustment on interactions
   * and program their own. */
  .no-default-hover-elevate {}

  .no-default-active-elevate {}


  /**
   * Toggleable backgrounds go behind the content. Hoverable/active goes on top.
   * This way they can stack/compound. Both will overlap the parent's borders!
   * So borders will be automatically adjusted both on toggle, and hover/active,
   * and they will be compounded.
   */
  .toggle-elevate::before,
  .toggle-elevate-2::before {
    content: "";
    pointer-events: none;
    position: absolute;
    inset: 0px;
    /*border-radius: inherit;   match rounded corners */
    border-radius: inherit;
    z-index: -1;
    /* sits behind content but above backdrop */
  }

  .toggle-elevate.toggle-elevated::before {
    background-color: var(--elevate-2);
  }

  /* If there's a 1px border, adjust the inset so that it covers that parent's border */
  .border.toggle-elevate::before {
    inset: -1px;
  }

  /* Does not work on elements with overflow:hidden! */
  .hover-elevate:not(.no-default-hover-elevate),
  .active-elevate:not(.no-default-active-elevate),
  .hover-elevate-2:not(.no-default-hover-elevate),
  .active-elevate-2:not(.no-default-active-elevate) {
    position: relative;
    z-index: 0;
  }

  .hover-elevate:not(.no-default-hover-elevate)::after,
  .active-elevate:not(.no-default-active-elevate)::after,
  .hover-elevate-2:not(.no-default-hover-elevate)::after,
  .active-elevate-2:not(.no-default-active-elevate)::after {
    content: "";
    pointer-events: none;
    position: absolute;
    inset: 0px;
    /*border-radius: inherit;   match rounded corners */
    border-radius: inherit;
    z-index: 999;
    /* sits in front of content */
  }

  .hover-elevate:hover:not(.no-default-hover-elevate)::after,
  .active-elevate:active:not(.no-default-active-elevate)::after {
    background-color: var(--elevate-1);
  }

  .hover-elevate-2:hover:not(.no-default-hover-elevate)::after,
  .active-elevate-2:active:not(.no-default-active-elevate)::after {
    background-color: var(--elevate-2);
  }

  /* If there's a 1px border, adjust the inset so that it covers that parent's border */
  .border.hover-elevate:not(.no-hover-interaction-elevate)::after,
  .border.active-elevate:not(.no-active-interaction-elevate)::after,
  .border.hover-elevate-2:not(.no-hover-interaction-elevate)::after,
  .border.active-elevate-2:not(.no-active-interaction-elevate)::after,
  .border.hover-elevate:not(.no-hover-interaction-elevate)::after {
    inset: -1px;
  }
}
