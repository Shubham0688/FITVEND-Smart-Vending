
import React,{useEffect,useState} from 'react';import{createRoot}from'react-dom/client';import{Activity,ArrowRight,CheckCircle,Clock,CreditCard,Dumbbell,HeartPulse,Package,RefreshCw,ShieldCheck,ShoppingBag,User,Wallet, Zap}from'lucide-react';import'./style.css';
import FitMind from "./FitMind";
import VendingSimulation from "./VendingSimulation";
import Fitcoin from "./Fitcoin.jsx";
import Ads from "./Ads.jsx";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const productImages = {
  "Classic Protein Shake": "/products/classic-shake.jpg",
  "Plant Protein Shake": "/products/plant-shake.jpg",
  "Protein Bar": "/products/protein-bar.jpg",
  "Lactose-Free Protein Drink": "/products/lactose-free.jpg",
  "Peanut Butter Energy Bar": "/products/peanut-bar.jpg",
  "Roasted Almond Pack": "/products/almonds.jpg",
  "Oats Energy Drink": "/products/oats-drink.jpg",
  "Coconut Water": "/products/coconut-water.jpg",
  "Electrolyte Drink": "/products/electrolyte.jpg",
  "Trail Mix Pack": "/products/trail-mix.jpg",
  "Soy Protein Drink": "/products/soy-drink.jpg",
  "Banana Oat Bar": "/products/banana-bar.jpg"
};
function App(){const[products,setProducts]=useState([]),[profile,setProfile]=useState({name:'Guest',age:'21',height:'170',weight:'68',goal:'General fitness',workout:'Strength training'}),[result,setResult]=useState(null),[orders,setOrders]=useState([]),[tab,setTab]=useState('machine'),[filter,setFilter]=useState('All'),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[health,setHealth]=useState('Connecting…');  const load=async()=>{try{const [p,o,h]=await Promise.all([fetch(API+'/products'),fetch(API+'/orders'),fetch(API+'/health')]);setProducts(await p.json());setOrders(await o.json());setHealth((await h.json()).database)}catch{setHealth('API offline')}};useEffect(()=>{load()},[]);
const recommend=async e=>{e.preventDefault();setBusy(true);setMsg('');try{const r=await fetch(API+'/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(profile)});const d=await r.json();if(!r.ok)throw Error(d.message);setResult(d);setMsg('Your profile has been processed.')}catch(e){setMsg(e.message)}finally{setBusy(false)}};
const buy=async p=>{setBusy(true);setMsg('');try{const r=await fetch(API+'/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p._id,user:profile.name||'Guest',quantity:1,paymentMethod:'UPI demo'})});const d=await r.json();if(!r.ok)throw Error(d.message);setMsg(`Order confirmed! ${d._id||''} · ₹${d.total}. Demo payment only.`);await load()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
const visible=products.filter(p=>filter==='All'||p.tag===filter);   


const recommendedProducts = products
  .map(p => {
    const text = `${p.name} ${p.category} ${p.tag} ${p.description}`.toLowerCase();
    let score = 0;

    if (profile.goal === 'Plant-based' &&
        /plant|soy|vegan/i.test(text)) score += 5;

    if (profile.goal === 'Lactose-free' &&
        /lactose-free|dairy-free/i.test(text)) score += 5;

    if (profile.goal === 'Muscle gain' &&
        /protein|almond|peanut/i.test(text)) score += 3;

    if (profile.goal === 'General fitness' &&
        /oats|banana|trail mix|electrolyte/i.test(text)) score += 2;

    if (profile.workout === 'Cardio' &&
        /electrolyte|coconut water|oats/i.test(text)) score += 2;

    if (profile.workout === 'Strength training' &&
        /protein|almond|peanut/i.test(text)) score += 2;

    if (profile.workout === 'Rest day' &&
        /coconut water|trail mix|oats/i.test(text)) score += 1;

    return { ...p, recommendationScore: score };
  })
  .filter(p => p.recommendationScore > 0 && p.stock > 0)
  .sort((a, b) => b.recommendationScore - a.recommendationScore)
  .slice(0, 4);


return <div className="app"><header><a className="brand" onClick={()=>setTab('machine')}><span className="logo"><Activity/></span><span>FIT<span className="lime">VEND</span><small>SMART NUTRITION STATION</small></span></a><nav><button className={tab==='machine'?'active':''} onClick={()=>setTab('machine')}>Machine</button><button className={tab==='orders'?'active':''} onClick={()=>{setTab('orders');load()}}>My orders</button><button className={tab==='admin'?'active':''} onClick={()=>setTab('admin')}>Admin</button>       

<button
  className={tab==='fitmind'?'active':''}
  onClick={()=>setTab('fitmind')}
>
  🎙️ FITMIND AI
</button>

<button
  className={tab==='simulation'?'active':''}
  onClick={()=>setTab('simulation')}
>
  🎮 VENDING SIMULATION
</button>

<button
  className={tab === 'fitcoin' ? 'active' : ''}
  onClick={() => setTab('fitcoin')}
>
  🪙 FITCOIN
</button>

<button
  className={tab === "ads" ? "active" : ""}
  onClick={() => setTab("ads")}
>
  📢 AD REVENUE
</button>

              </nav><span className="status"><i/> {health}</span></header> 


{tab === 'fitmind' && (
  <FitMind
    products={products}
    onAddToCart={buy}
  />
)}


{tab === 'simulation' && (
  <VendingSimulation />
)}




{tab === 'fitcoin' && <Fitcoin />}
{tab === "ads" && <Ads />}

{tab==='machine'&&<><section className="hero"><div><div className="eyebrow"><span/> SMART FITNESS · SIMPLE CHOICES</div><h1>Fuel your<br/><em>next level.</em></h1><p>A smarter gym vending experience. Explore sealed nutrition products, set your preferences and order in a few taps.</p><button className="primary" onClick={()=>document.getElementById('profile').scrollIntoView({behavior:'smooth'})}>Personalise experience <ArrowRight size={17}/></button><div className="hero-points"><span><ShieldCheck/> Sealed products</span><span><Clock/> Convenient access</span><span><Zap/> Quick checkout</span></div></div><div className="hero-art"><div className="ring ring1"/><div className="ring ring2"/><div className="machine"><div className="machine-top"><b>FIT<span>VEND</span></b><span className="live">● LIVE</span></div><div className="machine-screen"><span>YOUR FITNESS<br/>FUEL STATION</span><strong>01 — 04</strong></div><div className="shelves">{['🥤','🧃','🍫','🥛'].map((x,i)=><div key={i}>{x}</div>)}</div><div className="machine-slot">PICK UP HERE <ArrowRight size={12}/></div></div><div className="float-card"><span>✦</span><div><b>Made for your routine</b><small>Preference-led picks</small></div></div></div></section>

<section className="feature-section">

  <div className="feature-heading">
    <div className="eyebrow">EXPLORE FITVEND</div>
    <h2>
      Everything you need.<br />
      <em>One smart station.</em>
    </h2>
    <p>Explore the features of your smart nutrition station.</p>
  </div>

  <div className="feature-grid">

    <button
      className="feature-card"
      onClick={() => document.getElementById('profile').scrollIntoView({ behavior: 'smooth' })}
    >
      <span className="feature-icon"><Clock size={27} /></span>
      <span className="feature-number">24/7 ACCESS</span>
      <h3>Smart Access</h3>
      <p>Explore the member profile and personalised experience.</p>
      <span className="feature-link">Explore access <ArrowRight size={16} /></span>
    </button>

    <button
      className="feature-card"
      onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
    >
      <span className="feature-icon"><CreditCard size={27} /></span>
      <span className="feature-number">DEMO CHECKOUT</span>
      <h3>Secure Checkout</h3>
      <p>Explore products and experience the demo checkout flow.</p>
      <span className="feature-link">Explore checkout <ArrowRight size={16} /></span>
    </button>

    <button
      className="feature-card"
      onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
    >
      <span className="feature-icon"><Dumbbell size={27} /></span>
      <span className="feature-number">12+ CHOICES</span>
      <h3>Nutrition Products</h3>
      <p>Discover available products and their details.</p>
      <span className="feature-link">View products <ArrowRight size={16} /></span>
    </button>

    <button
      className="feature-card"
      onClick={() => {
        setTab('orders');
        load();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <span className="feature-icon"><Package size={27} /></span>
      <span className="feature-number">ORDER HISTORY</span>
      <h3>Order Tracking</h3>
      <p>View your previous orders and their payment status.</p>
      <span className="feature-link">Track orders <ArrowRight size={16} /></span>
    </button>

  </div>
</section>


<section className="section" id="profile"><div className="section-head"><div><div className="eyebrow">01 / YOUR PROFILE</div><h2>Start with <em>you.</em></h2><p>Use your preferences to filter the product catalogue.</p></div><div className="step">STEP 01 <span>● ○ ○</span></div></div><div className="profile-layout"><form className="profile-card" onSubmit={recommend}><div className="card-title"><User/><div><b>Member details</b><small>Demo QR / RFID login is represented by this profile form.</small></div><span className="tag">DEMO LOGIN</span></div><label>Member name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} placeholder="Enter name"/></label><div className="input-grid"><label>Age<input type="number" min="1" max="110" value={profile.age} onChange={e=>setProfile({...profile,age:e.target.value})}/></label><label>Height (cm)<input type="number" value={profile.height} onChange={e=>setProfile({...profile,height:e.target.value})}/></label><label>Weight (kg)<input type="number" value={profile.weight} onChange={e=>setProfile({...profile,weight:e.target.value})}/></label><label>Fitness goal<select value={profile.goal} onChange={e=>setProfile({...profile,goal:e.target.value})}><option>General fitness</option><option>Muscle gain</option><option>Plant-based</option><option>Lactose-free</option></select></label></div><label>Today's workout<select value={profile.workout} onChange={e=>setProfile({...profile,workout:e.target.value})}><option>Strength training</option><option>Cardio</option><option>Sports</option><option>Rest day</option></select></label><button className="primary full" disabled={busy}>Get product suggestions <ArrowRight size={16}/></button></form><div className="insight-card"><div className="insight-icon"><HeartPulse/></div><div className="eyebrow">SMART GUIDANCE</div><h3>Better choices.<br/><em>Not guesswork.</em></h3><p>FitVend uses your selected preferences to surface relevant products. It is a student project demo, not a medical or dietetic service.</p>{result?<div className="result"><div className="result-top"><span>PROFILE RESULT</span>{result.bmi!==null&&<b>BMI {result.bmi}</b>}</div><p>{result.note}</p></div>:<div className="hint"><ShieldCheck/> Your details stay within this demo app's local workflow.</div>}</div></div>

{result && (
  <section className="recommended-section">
    <div className="eyebrow">03 / PERSONALIZED PICKS</div>

    <h2>Recommended <em>for you.</em></h2>

    <p>
      Products selected using your fitness goal and workout preferences.
    </p>

    {recommendedProducts.length > 0 ? (
      <div className="products">
        {recommendedProducts.map((p, i) => (
          <article className="product" key={p._id}>
            <div className={`product-art art${i % 4}`}>
              <img
                src={productImages[p.name]}
                alt={p.name}
                className="product-image"
                onError={e => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <small>YOUR SMART PICK</small>
              <div className="art-label">RECOMMENDED</div>
            </div>

            <div className="product-info">
              <div className="product-meta">
                <span>{p.category}</span>
                <span>{p.tag}</span>
              </div>

              <h3>{p.name}</h3>
              <p>{p.description}</p>

              <div className="buy-row">
                <b>₹{p.price}</b>
                <button onClick={() => buy(p)} disabled={busy}>
                  Add +
                </button>
              </div>

              <small className="stock">
                {p.stock} available
              </small>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <p>No matching products available right now.</p>
    )}
  </section>
)}

  <div className="catalog-intro" id="products">
  <div>
    <div className="eyebrow">02 / PRODUCT WALL</div>
    <h2>Pick your <em>fuel.</em></h2>
    <p>Discover nutrition choices for your everyday fitness journey.</p>
  </div>
  <div className="catalog-badge">
    <Zap size={17}/>
    SMART NUTRITION PICKS
  </div>
</div>

<div className="catalog-stats">
  <div><b>{products.length}</b><span>Available products</span></div>
  <div><b>04</b><span>Product categories</span></div>
  <div><b>₹45+</b><span>Starting price</span></div>
  <div><b>FIT</b><span>Made for gym routines</span></div>
</div>

<div className="featured-product">
  <div className="featured-copy">
    <span className="featured-label">✦ FITVEND FEATURED</span>
    <h3>Fuel your<br/><em>fitness journey.</em></h3>
    <p>Explore convenient nutrition choices, all in one smart station.</p>
    <button onClick={() =>
      document.querySelector('.products')?.scrollIntoView({behavior:'smooth'})
    }>
      Explore products <ArrowRight size={16}/>
    </button>
  </div>
  <div className="featured-visual">
    <span>🥤</span>
    <small>YOUR DAILY FUEL</small>
  </div>
</div>

<div className="catalog-toolbar">
  <div>
    <div className="eyebrow">EXPLORE COLLECTION</div>
    <h3>Our products <span>({visible.length})</span></h3>
  </div>
  <div className="filters">
    {['All','Vegetarian','Vegan','Lactose-free'].map(x=>
      <button
        className={filter===x?'chosen':''}
        onClick={()=>setFilter(x)}
        key={x}
      >{x}</button>
    )}
  </div>
</div>

<div className="products">
  {visible.map((p,i)=>
    <article className="product" key={p._id}>
    <div className={`product-art art${i%4}`}>
  <img
    src={productImages[p.name]}
    alt={p.name}
    className="product-image"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
  <small>FITVEND PICK</small>
  <div className="art-label">SMART FUEL</div>
</div>

      <div className="product-info">
        <div className="product-meta">
          <span>{p.category}</span>
          <span>{p.tag}</span>
        </div>
        <h3>{p.name}</h3>
        <p>{p.description}</p>

        <div className="buy-row">
          <b>₹{p.price}</b>
          <button onClick={()=>buy(p)} disabled={busy||p.stock<1}>
            {p.stock>0?'Add +':'Out of stock'}
          </button>
        </div>
        <small className="stock">{p.stock} available</small>
      </div>
    </article>
  )}
</div>

<div className="catalog-footer">
  <ShieldCheck size={19}/>
  <span>Simple choices. Convenient nutrition. The FITVEND experience.</span>
</div>
  </section></>}
{tab==='orders'&&<section className="section page"><div className="eyebrow">03 / ORDER HISTORY</div><h2>Your <em>orders.</em></h2><p>Recent demo purchases and payment status.</p>{orders.length?<div className="order-list">{orders.map((o,i)=><div className="order" key={o._id||i}><span className="order-icon"><Package/></span><div><b>{o.productName}</b><small>{new Date(o.createdAt).toLocaleString()} · {o.quantity} item(s)</small></div><strong>₹{o.total}</strong><span className="paid"><CheckCircle size={14}/> {o.paymentStatus}</span></div>)}</div>:<div className="empty"><ShoppingBag/><h3>No orders yet</h3><p>Your confirmed orders will appear here.</p><button className="primary" onClick={()=>setTab('machine')}>Explore products</button></div>}</section>}
{tab==='admin'&&<section className="section page"><div className="eyebrow">04 / MACHINE MANAGEMENT</div><h2>Admin <em>overview.</em></h2><p>Inventory and sales overview for the FitVend prototype.</p><div className="admin-grid"><div className="admin-stat"><Package/><small>Products</small><b>{products.length}</b></div><div className="admin-stat"><ShoppingBag/><small>Total orders</small><b>{orders.length}</b></div><div className="admin-stat"><Wallet/><small>Demo revenue</small><b>₹{orders.reduce((s,o)=>s+o.total,0)}</b></div></div><h3 className="inventory-title">Inventory</h3><div className="order-list">{products.map(p=><div className="order" key={p._id}><span className="order-icon"><Package/></span><div><b>{p.name}</b><small>₹{p.price} · {p.tag}</small></div><strong>{p.stock} units</strong></div>)}</div><p className="admin-note">Stock editing is available through the backend API: PATCH /api/admin/products/:id/stock.</p></section>}
{msg&&<div className="toast" onClick={()=>setMsg('')}>{msg}<button>×</button></div>}<footer><div className="brand"><span className="logo"><Activity/></span><span>FIT<span className="lime">VEND</span><small>FITSQUAD · ABES ENGINEERING COLLEGE</small></span></div><span>Student prototype · Not a medical or real payment service</span><button onClick={load}><RefreshCw size={14}/> Refresh data</button></footer></div>}
createRoot(document.getElementById('root')).render(<App/>);
