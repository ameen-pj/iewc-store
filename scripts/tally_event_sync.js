require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');

const BASE_URL = 'https://api.tally.so/forms';
const OUTPUT_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'events.json');

const getTallyForms = async () => {
  const apiKey = process.env.TALLY_API_KEY;
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const listResponse = await fetch(BASE_URL, options);
    if (!listResponse.ok) throw new Error(`List Fetch Error: ${listResponse.status}`);

    const listData = await listResponse.json();
    const forms = listData.items || [];
    const allFormDetails = [];

    console.log(`Found ${forms.length} forms. Fetching details...`);

    for (const form of forms) {
      try {
        const detailResponse = await fetch(`${BASE_URL}/${form.id}`, options);
        if (!detailResponse.ok) continue;

        const formDetails = await detailResponse.json();
        allFormDetails.push(formDetails);
        console.log(`Fetched: ${formDetails.name || form.id}`);
      } catch (innerErr) {
        console.error(`Error fetching form ${form.id}:`, innerErr.message);
      }
    }

    await fs.writeFile(
      OUTPUT_FILE, 
      JSON.stringify(allFormDetails, null, 2),
      'utf-8'
    );

    console.log(`\nSuccess! Saved ${allFormDetails.length} forms to ${OUTPUT_FILE}`);
    
  } catch (err) {
    console.error('General Error:', err.message);
  }
};

getTallyForms();