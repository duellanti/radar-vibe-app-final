/**
 * Radar Vibe - Billing Configuration
 * 
 * Replace the placeholder IDs below with your actual
 * in-app purchase product IDs from Google Play / Apple App Store
 * before building with WebIntoApp or similar wrapper.
 */

const BILLING_CONFIG = {
  ID_PREMIUM_MONTHLY: "radarvibe_premium_monthly",
  ID_PREMIUM_ANNUALLY: "radarvibe_premium_annually",

  PRICE_MONTHLY: "€1.99",
  PRICE_ANNUALLY: "€8.99",

  API_ENDPOINT: "/api/subscribe",

  async purchaseMonthly() {
    return this._purchase(this.ID_PREMIUM_MONTHLY, "monthly");
  },

  async purchaseAnnually() {
    return this._purchase(this.ID_PREMIUM_ANNUALLY, "yearly");
  },

  async _purchase(productId, plan) {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan, productId }),
      });

      if (!response.ok) {
        throw new Error("Purchase failed");
      }

      const data = await response.json();

      if (data.user && data.user.isPremium) {
        document.querySelectorAll('[data-admob-slot]').forEach((el) => {
          el.style.display = "none";
        });
        const footerAd = document.getElementById("ad-banner-footer");
        if (footerAd) footerAd.style.display = "none";
      }

      return data;
    } catch (err) {
      console.error("Billing error:", err);
      throw err;
    }
  },
};

if (typeof window !== "undefined") {
  window.BILLING_CONFIG = BILLING_CONFIG;
}
