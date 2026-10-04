export default function PolicyPage() {
  const h: React.CSSProperties = { marginTop: '1.5rem', fontSize: '18px', fontWeight: 800 }
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem', lineHeight: 1.7, fontSize: '14px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Privacy Policy</h1>
      <p>Last updated: [4 Oct 2026]. FarmBridge ("we") is the data fiduciary for your personal data.</p>

      <h2 style={h}>What we collect and why</h2>
      <p>Name, mobile number, village/district/state and role (farmer/buyer) to create and run your account. Optional GPS location only when you tap "Auto-detect". Photos you upload for listings. Your orders, requests and activity in the app. We use your date of birth only to confirm you are 18+, and we do not store it.</p>

      <h2 style={h}>Who sees your data</h2>
      <p>Your name, location and mobile number are visible to other signed-in users so buyers and farmers can contact each other. We do not sell your data.</p>

      <h2 style={h}>Service providers</h2>
      <p>Supabase (database and login), Cloudinary (images), Razorpay (payments), our SMS provider (OTP), OpenStreetMap Nominatim (turns GPS into a place name), Vercel (hosting). Some of these may process data outside India.</p>

      <h2 style={h}>Your rights</h2>
      <p>You can access, correct or delete your data, withdraw consent, and nominate someone to act for you. Write to [EMAIL]. Order records may be kept where the law requires.</p>

      <h2 style={h}>Children</h2>
      <p>FarmBridge is for users aged 18 and above.</p>

      <h2 style={h}>Security and breaches</h2>
      <p>Data is encrypted in transit (HTTPS) and at rest, and protected by access controls. If a breach affects you, we will inform you and the Data Protection Board of India.</p>

      <h2 style={h}>Grievance contact</h2>
      <p>[Siddesh Patil], [siddheshpatil717778@gmail.com], [8080218122]. We respond within [X] days.</p>
    </div>
  )
}