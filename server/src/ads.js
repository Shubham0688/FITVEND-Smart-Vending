import { randomUUID } from "crypto";

const campaigns = [
  {
    id: "AD001",
    brand: "FitFuel Nutrition",
    title: "Fuel Your Fitness",
    description: "Explore fitness and nutrition products.",
    category: "Nutrition",
    link: "https://example.com",
    impressions: 0,
    clicks: 0,
    status: "Active",
    createdAt: new Date()
  },
  {
    id: "AD002",
    brand: "PowerWear",
    title: "Fitness Starts Here",
    description: "Discover sportswear for your workouts.",
    category: "Sportswear",
    link: "https://example.com",
    impressions: 0,
    clicks: 0,
    status: "Active",
    createdAt: new Date()
  }
];

const IMPRESSION_RATE = 100;
const CLICK_RATE = 2;

function calculateRevenue(ad) {
  return (
    (ad.impressions / 1000) * IMPRESSION_RATE +
    ad.clicks * CLICK_RATE
  );
}

export default function registerAdsRoutes(app) {

  // GET ACTIVE ADS
  app.get("/api/ads", (req, res) => {
    const activeAds = campaigns.filter(
      ad => ad.status === "Active"
    );

    res.json(activeAds);
  });

  // CREATE CAMPAIGN
  app.post("/api/ads/campaigns", (req, res) => {
    const {
      brand,
      title,
      description,
      category,
      link
    } = req.body;

    if (!brand || !title || !description || !category) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    const newCampaign = {
      id: randomUUID(),
      brand,
      title,
      description,
      category,
      link: link || "",
      impressions: 0,
      clicks: 0,
      status: "Active",
      createdAt: new Date()
    };

    campaigns.push(newCampaign);

    res.status(201).json({
      message: "Campaign created successfully!",
      campaign: newCampaign
    });
  });

  // TRACK IMPRESSIONS
  app.post("/api/ads/:id/impression", (req, res) => {
    const ad = campaigns.find(
      item => item.id === req.params.id
    );

    if (!ad || ad.status !== "Active") {
      return res.status(404).json({
        message: "Advertisement not found."
      });
    }

    ad.impressions += 1;

    res.json({
      message: "Impression recorded.",
      impressions: ad.impressions
    });
  });

  // TRACK CLICKS
  app.post("/api/ads/:id/click", (req, res) => {
    const ad = campaigns.find(
      item => item.id === req.params.id
    );

    if (!ad || ad.status !== "Active") {
      return res.status(404).json({
        message: "Advertisement not found."
      });
    }

    ad.clicks += 1;

    res.json({
      message: "Click recorded.",
      clicks: ad.clicks,
      link: ad.link
    });
  });

  // ADMIN STATISTICS
  app.get("/api/ads/admin/stats", (req, res) => {

    const totalImpressions = campaigns.reduce(
      (sum, ad) => sum + ad.impressions,
      0
    );

    const totalClicks = campaigns.reduce(
      (sum, ad) => sum + ad.clicks,
      0
    );

    const totalRevenue = campaigns.reduce(
      (sum, ad) => sum + calculateRevenue(ad),
      0
    );

    res.json({
      totalCampaigns: campaigns.length,

      activeCampaigns: campaigns.filter(
        ad => ad.status === "Active"
      ).length,

      totalImpressions,
      totalClicks,

      totalRevenue: Number(totalRevenue.toFixed(2)),

      campaigns: campaigns.map(ad => ({
        ...ad,
        revenue: Number(
          calculateRevenue(ad).toFixed(2)
        )
      }))
    });
  });

  // PAUSE OR ACTIVATE CAMPAIGN
  app.patch("/api/ads/campaigns/:id/status", (req, res) => {

    const ad = campaigns.find(
      item => item.id === req.params.id
    );

    const { status } = req.body;

    if (!ad) {
      return res.status(404).json({
        message: "Campaign not found."
      });
    }

    if (!["Active", "Paused"].includes(status)) {
      return res.status(400).json({
        message: "Invalid campaign status."
      });
    }

    ad.status = status;

    res.json({
      message: "Campaign status updated.",
      campaign: ad
    });
  });

}