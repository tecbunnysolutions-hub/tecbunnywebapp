async function testFetch() {
  try {
    const res = await fetch('https://tecbunny.com/api/upcoming');
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON response:", json);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testFetch();
