async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/data');
    const data = await res.json();
    console.log('API banners:', data.banners);
  } catch (err) {
    console.error(err);
  }
}
run();
