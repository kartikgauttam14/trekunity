import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { api } from './src/api';

const tabs = ['Home', 'Rides', 'Rentals', 'Host', 'Account'];
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

function Pill({ children }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}

function Button({ children, onPress, variant = 'primary', disabled }) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.button, styles[variant], disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

function Home({ setTab }) {
  return (
    <View>
      <View style={styles.hero}>
        <Pill>Trips • Rides • Rentals</Pill>
        <Text style={styles.title}>Travel Together, Better</Text>
        <Text style={styles.muted}>Plan group travel, compare ride options safely, and book self-drive cars from local hosts.</Text>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>4</Text><Text style={styles.statLabel}>Providers</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>24/7</Text><Text style={styles.statLabel}>Planning</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>Real</Text><Text style={styles.statLabel}>Bookings</Text></View>
        </View>
        <View style={styles.actions}>
          <Button onPress={() => setTab('Rentals')}>Find Cars</Button>
          <Button variant="ghost" onPress={() => setTab('Rides')}>Compare Rides</Button>
        </View>
      </View>
      {[
        ['Self-drive marketplace', 'Search hosted cars, request booking, and manage rentals.'],
        ['Ride comparison ready', 'Connect official provider APIs for live fares without unsafe password sharing.'],
        ['Host dashboard', 'Publish your own vehicle listing from the app.']
      ].map(([title, text]) => (
        <View key={title} style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.muted}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

function Rides({ user, setTab }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [message, setMessage] = useState('');

  const openProvider = (provider) => {
    const q = encodeURIComponent(`${pickup} to ${dropoff}`);
    const urls = {
      Uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(dropoff)}`,
      Ola: `https://book.olacabs.com/?pickup_name=${encodeURIComponent(pickup)}&drop_name=${encodeURIComponent(dropoff)}`,
      Rapido: `https://www.rapido.bike/Home`,
      Zoomcar: `https://www.zoomcar.com/search?query=${q}`
    };
    Linking.openURL(urls[provider]);
  };

  return (
    <View>
      <Text style={styles.heading}>Ride Price Check</Text>
      <Text style={styles.muted}>Real in-app comparison needs official provider APIs. Until credentials are approved, open each provider safely and book there.</Text>
      {!user && <Button onPress={() => setTab('Account')}>Login to Use Real APIs</Button>}
      <Field label="Pickup" value={pickup} onChangeText={setPickup} placeholder="Bangalore Airport" />
      <Field label="Dropoff" value={dropoff} onChangeText={setDropoff} placeholder="Mysore / HSR Layout" />
      <View style={styles.providerGrid}>
        {['Uber', 'Ola', 'Rapido', 'Zoomcar'].map((p) => (
          <TouchableOpacity key={p} style={styles.providerCard} onPress={() => pickup && dropoff ? openProvider(p) : setMessage('Enter pickup and dropoff first.')}>
            <Text style={styles.cardTitle}>{p}</Text>
            <Text style={styles.smallMuted}>{p === 'Zoomcar' ? 'Outer-city rentals' : 'Open official booking'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!message && <Text style={styles.warning}>{message}</Text>}
    </View>
  );
}

function Rentals({ user, setTab }) {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const days = useMemo(() => Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)), [startDate, endDate]);

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/rentals/listings', { location, startDate, endDate });
      setListings(res.data || []);
    } catch (e) {
      setMessage(e.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const book = async (listing) => {
    if (!user) return setTab('Account');
    try {
      await api.post('/rentals/bookings', { listingId: listing.id, startDate, endDate });
      setMessage(`Booking request sent. Total ₹${listing.pricePerDay * days}`);
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <View>
      <Text style={styles.heading}>Self-Drive Marketplace</Text>
      <Field label="City" value={location} onChangeText={setLocation} placeholder="Bangalore" />
      <Field label="Start date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
      <Field label="End date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
      <Button onPress={load} disabled={loading}>{loading ? 'Searching...' : 'Search Cars'}</Button>
      {!!message && <Text style={styles.warning}>{message}</Text>}
      {listings.map((l) => (
        <View key={l.id} style={styles.card}>
          <Text style={styles.cardTitle}>{l.vehicle.make} {l.vehicle.model}</Text>
          <View style={styles.metaRow}>
            <Pill>{l.location}</Pill>
            <Pill>{l.vehicle.seats} seats</Pill>
            <Pill>{l.vehicle.fuelType}</Pill>
          </View>
          <Text style={styles.price}>₹{l.pricePerDay}/day • Total ₹{l.pricePerDay * days}</Text>
          <Button onPress={() => book(l)}>Request Booking</Button>
        </View>
      ))}
      {!loading && listings.length === 0 && <Text style={styles.muted}>No cars loaded yet. Search or list your car from Host.</Text>}
    </View>
  );
}

function Host({ user, setTab }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [pricePerDay, setPricePerDay] = useState('2000');
  const [location, setLocation] = useState('Bangalore');
  const [message, setMessage] = useState('');

  const createVehicleAndListing = async () => {
    if (!user) return setTab('Account');
    try {
      const vehicle = await api.post('/vehicles', {
        make, model, licensePlate, year: 2024, type: 'CAR', seats: 5, fuelType: 'Petrol', transmission: 'Manual', images: []
      });
      await api.post('/rentals/listings', {
        vehicleId: vehicle.data.id, pricePerDay, location, availableFrom: today, availableTo: new Date(Date.now() + 30 * 86400000).toISOString()
      });
      setMessage('Vehicle listed successfully.');
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <View>
      <Text style={styles.heading}>Host Your Car</Text>
      <Field label="Make" value={make} onChangeText={setMake} placeholder="Toyota" />
      <Field label="Model" value={model} onChangeText={setModel} placeholder="Innova" />
      <Field label="License plate" value={licensePlate} onChangeText={setLicensePlate} placeholder="KA01AB1234" />
      <Field label="Price/day" value={pricePerDay} onChangeText={setPricePerDay} keyboardType="numeric" />
      <Field label="Pickup city" value={location} onChangeText={setLocation} />
      <Button onPress={createVehicleAndListing}>Publish Listing</Button>
      {!!message && <Text style={styles.warning}>{message}</Text>}
    </View>
  );
}

function Account({ user, setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiUrl, setApiUrl] = useState(Platform.OS === 'android' ? 'http://10.0.2.2:3001/api' : 'http://127.0.0.1:3001/api');
  const [message, setMessage] = useState('');

  const submit = async () => {
    try {
      const res = await api.post(isRegister ? '/auth/register' : '/auth/login', isRegister ? { name, email, password } : { email, password });
      api.setToken(res.accessToken);
      setUser(res.user);
      setMessage('Logged in.');
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (user) {
    return (
      <View>
        <Text style={styles.heading}>Account</Text>
        <Text style={styles.cardTitle}>{user.name}</Text>
        <Text style={styles.muted}>{user.email}</Text>
        <Button variant="ghost" onPress={() => { api.setToken(null); setUser(null); }}>Logout</Button>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.heading}>{isRegister ? 'Create Account' : 'Login'}</Text>
      {isRegister && <Field label="Name" value={name} onChangeText={setName} />}
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button onPress={submit}>{isRegister ? 'Register' : 'Login'}</Button>
      <Button variant="ghost" onPress={() => setIsRegister(!isRegister)}>{isRegister ? 'Have account? Login' : 'Need account? Register'}</Button>
      <Field label="Backend API URL" value={apiUrl} onChangeText={setApiUrl} placeholder="http://192.168.1.10:3001/api" />
      <Button variant="ghost" onPress={() => { api.setBaseUrl(apiUrl); setMessage('Backend synced.'); }}>Sync Backend</Button>
      {!!message && <Text style={styles.warning}>{message}</Text>}
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState('Home');
  const [user, setUser] = useState(null);
  const screen = { Home, Rides, Rentals, Host, Account }[tab];
  const Screen = screen;

  useEffect(() => {
    if (Platform.OS === 'web') api.setBaseUrl('/api');
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Trekunity</Text>
          <Text style={styles.headerSub}>Travel app</Text>
        </View>
        <Pill>Mobile</Pill>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Screen user={user} setUser={setUser} setTab={setTab} />
      </ScrollView>
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080c10' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#f8fafc', fontWeight: '900', fontSize: 22 },
  headerSub: { color: '#64748b', marginTop: 2, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 112 },
  hero: { padding: 18, borderRadius: 8, backgroundColor: '#101722', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
  title: { color: '#f8fafc', fontSize: 38, fontWeight: '900', lineHeight: 42, marginTop: 14, marginBottom: 12 },
  heading: { color: '#f8fafc', fontSize: 28, fontWeight: '900', marginBottom: 12 },
  muted: { color: '#94a3b8', lineHeight: 22, marginBottom: 16 },
  smallMuted: { color: '#94a3b8', lineHeight: 18, fontSize: 12 },
  actions: { gap: 10 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#0b1118', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statValue: { color: '#fb923c', fontWeight: '900', fontSize: 18 },
  statLabel: { color: '#94a3b8', fontSize: 11, marginTop: 4, fontWeight: '700' },
  providerGrid: { gap: 10 },
  providerCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 16 },
  button: { minHeight: 46, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  primary: { backgroundColor: '#f97316' },
  ghost: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '800' },
  field: { marginBottom: 12 },
  label: { color: '#94a3b8', fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: '#161d27', color: '#f1f5f9', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 13 },
  pill: { alignSelf: 'flex-start', backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(251,146,60,0.35)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { color: '#fdba74', fontWeight: '800', fontSize: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  card: { backgroundColor: '#111827', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 16, marginBottom: 14 },
  cardTitle: { color: '#f1f5f9', fontWeight: '800', fontSize: 18, marginBottom: 6 },
  price: { color: '#fb923c', fontWeight: '900', marginBottom: 10 },
  warning: { color: '#f59e0b', marginTop: 10, lineHeight: 20 },
  tabs: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#0f1419', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(249,115,22,0.12)' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#fb923c' }
});
