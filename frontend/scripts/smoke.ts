const apiUrl = process.env.NEXT_PUBLIC_PS_API_URL ?? 'http://127.0.0.1:8080';

const run = async () => {
  const response = await fetch(`${apiUrl}/api/`, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (![200, 401].includes(response.status)) {
    throw new Error(`Unexpected status from PrestaShop API: ${response.status}`);
  }

  console.log(`Smoke OK: ${apiUrl}/api/ -> ${response.status}`);
};

run().catch((error) => {
  console.error('Smoke FAIL:', error instanceof Error ? error.message : error);
  process.exit(1);
});
