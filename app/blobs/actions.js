'use server';
import { getStore } from '@netlify/blobs';
import { uploadDisabled } from 'utils';
import fs from 'fs';
import path from 'path';

function store() {
    return getStore({ name: 'shapes', consistency: 'strong' });
}

// Function to upload visits.geojson to the Netlify Blob Store
export async function uploadVisitsGeoJSON() {
    if (uploadDisabled) throw new Error('Sorry, uploads are disabled');

    const filePath = path.join(__dirname, '../../public/visits.geojson');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const key = 'visits.geojson';
    await store().set(key, fileContent, { type: 'application/json' });
    console.log('Stored visits.geojson with key:', key);
}