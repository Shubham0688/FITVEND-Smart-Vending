import React, { useCallback, useEffect, useState } from "react";
import "./Ads.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Ads() {
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    brand: "",
    title: "",
    description: "",
    category: "Nutrition",
    link: ""
  });

  const load = useCallback(async () => {
    try {
      const [adsResponse, statsResponse] = await Promise.all([
        fetch(`${API}/ads`),
        fetch(`${API}/ads/admin/stats`)
      ]);

      if (!adsResponse.ok || !statsResponse.ok) {
        throw new Error("Ads API could not load. Check backend.");
      }

      setAds(await adsResponse.json());
      setStats(await statsResponse.json());
    } catch (error) {
      setMessage(error.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createCampaign(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/ads/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create campaign.");
      }

      setForm({
        brand: "",
        title: "",
        description: "",
        category: "Nutrition",
        link: ""
      });

      setMessage("Campaign created successfully!");
      await load();

    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function track(id, action) {
    try {
      const response = await fetch(
        `${API}/ads/${id}/${action}`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tracking failed.");
      }

      if (action === "click" && data.link) {
        window.open(data.link, "_blank", "noopener,noreferrer");
      }

      await load();

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function toggle(ad) {
    const status = ad.status === "Active" ? "Paused" : "Active";

    try {
      const response = await fetch(
        `${API}/ads/campaigns/${ad.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      await load();

    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="ads-page">

      <header className="ads-heading">
        <div>
          <small>FITVEND / BUSINESS MODULE</small>
          <h1>Advertisement <em>Revenue</em></h1>
          <p>Manage demo campaigns and view estimated ad revenue.</p>
        </div>

        <button onClick={load}>↻ Refresh</button>
      </header>

      <p className="ads-notice">
        Demo analytics only. Impressions and clicks are not independently
        verified. Rates are illustrative, not actual advertiser payments.
      </p>

      <section className="ads-stats">

        <article>
          <span>Campaigns</span>
          <b>{stats?.totalCampaigns ?? "—"}</b>
        </article>

        <article>
          <span>Active</span>
          <b>{stats?.activeCampaigns ?? "—"}</b>
        </article>

        <article>
          <span>Impressions</span>
          <b>{stats?.totalImpressions ?? "—"}</b>
        </article>

        <article>
          <span>Clicks</span>
          <b>{stats?.totalClicks ?? "—"}</b>
        </article>

        <article>
          <span>Estimated revenue</span>
          <b>₹{Number(stats?.totalRevenue || 0).toFixed(2)}</b>
        </article>

      </section>

      <div className="ads-columns">

        <form className="ads-panel" onSubmit={createCampaign}>

          <small>NEW ADVERTISEMENT</small>
          <h2>Create campaign</h2>

          <label>
            Brand
            <input
              required
              value={form.brand}
              onChange={e =>
                setForm({ ...form, brand: e.target.value })
              }
            />
          </label>

          <label>
            Campaign title
            <input
              required
              value={form.title}
              onChange={e =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </label>

          <label>
            Description
            <textarea
              required
              rows="3"
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

          <label>
            Category
            <select
              value={form.category}
              onChange={e =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>Nutrition</option>
              <option>Sportswear</option>
              <option>Fitness</option>
              <option>Wellness</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Destination URL
            <input
              type="url"
              placeholder="https://example.com"
              value={form.link}
              onChange={e =>
                setForm({ ...form, link: e.target.value })
              }
            />
          </label>

          <button className="ads-primary" disabled={busy}>
            {busy ? "Creating..." : "Create campaign"}
          </button>

        </form>

        <section className="ads-panel">

          <small>CAMPAIGN MANAGEMENT</small>
          <h2>Current campaigns</h2>

          {ads.length === 0 ? (
            <p>No active campaigns found. Create one or check backend.</p>
          ) : (
            ads.map(ad => (
              <article className="ads-card" key={ad.id}>

                <div className="ads-card-head">
                  <div>
                    <span>{ad.category}</span>
                    <h3>{ad.title}</h3>
                    <p>{ad.brand} · {ad.description}</p>
                  </div>

                  <b>{ad.status}</b>
                </div>

                <div className="ads-metrics">
                  <span>{ad.impressions} impressions</span>
                  <span>{ad.clicks} clicks</span>
                  <span>
                    ₹{Number(ad.revenue || 0).toFixed(2)} estimated
                  </span>
                </div>

                <div className="ads-actions">

                  <button onClick={() => track(ad.id, "impression")}>
                    Demo impression
                  </button>

                  <button onClick={() => track(ad.id, "click")}>
                    Demo click
                  </button>

                  <button onClick={() => toggle(ad)}>
                    {ad.status === "Active" ? "Pause" : "Activate"}
                  </button>

                </div>

              </article>
            ))
          )}

        </section>

      </div>

      {message && (
        <p className="ads-message" role="status">
          {message}
          <button onClick={() => setMessage("")}></button>
        </p>
      )}

      <p className="ads-footnote">
        Demo rates: ₹100 per 1,000 impressions and ₹2 per click.
        These are illustrative values, not actual payments.
      </p>

    </main>
  );
}