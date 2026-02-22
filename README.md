# Artwork Table

Built this as part of an internship assignment. It pulls 
artwork data from the Art Institute of Chicago API and 
displays it in a table.

## Features
- Table with pagination - loads 12 rows per page from API
- Row selections stay saved when you switch pages
- You can select multiple rows at once using the overlay panel

## Tech used
- React + TypeScript
- Vite
- PrimeReact

## Run locally

npm install
npm run dev

## How I handled persistent selection

The tricky part was keeping rows selected across pages 
without fetching extra data. I ended up storing just the 
row IDs in a Set, and for bulk selection I store a single 
number and calculate which rows fall in that range using 
their position. Works without any extra API calls.

## API
https://api.artic.edu/api/v1/artworks
