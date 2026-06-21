async function checkIp() {
  const ip = '2406:da12:557:f800:ab55:ff88:5af8:8550';
  const url = `https://ipinfo.io/${ip}/json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('GeoIP lookup error:', err);
  }
}
checkIp();
