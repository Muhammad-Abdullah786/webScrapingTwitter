

# Twitter Scraper

This is a Twitter scraper designed to extract images, tweets, timestamps, and videos from the X platform (https://x.com) in a human-like behavior to minimize the risk of account bans. The scraper connects to a MongoDB database to store the scraped data and provides an option to export the data as JSON or CSV files.

## Features
- Scrapes images, tweets, timestamps, and videos from specified X URLs.
- Mimics human behavior to reduce the likelihood of being banned.
- Stores data in a MongoDB database.
- Allows export of scraped data to JSON or CSV format upon user request.

## Prerequisites
- Node.js installed on your system.
- MongoDB installed and running, or a MongoDB Atlas connection (e.g., `mongodb+srv://dbname:dbname@first.mcuc1.mongodb.net/dbcollection`).
- `mongoexport` tool installed for data export (part of MongoDB Database Tools).
- pnpm package manager installed (`npm install -g pnpm`).
- Stable internet connection for fast downloading.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Usage
### Starting the Scraper
Run the scraper using the following command:

```bash
pnpm start
```

Alternatively, specify a URL and maximum number of posts directly:

```bash
pnpm start --url <any x url/profile/comunity> --max-post 50
```

### Interactive Mode (if no arguments provided)
If you run `pnpm start` without arguments, the script will prompt you with the following questions:
- **🔗 Enter the x.com URL you want to scrape:** (Default: `https://x.com/home`)
- **🔢 How many posts do you want to scrape?** (Default: `10`)
- **👤 Twitter username (or email):** (Must be a real account)
- **🔒 Twitter password:**  (Must be a real account)

After scraping, it will ask:
- **📥 Would you like to export the data?** (Options: `json`, `csv`, `no`)

### Post-Scraping
- Data is saved to the MongoDB collection `posts` (adjustable in code).
- If you choose to export, the data will be saved as `output.json` or `output.csv` in the project directory.

## Edge Cases
- **No Internet Connection:** The scraper requires a stable internet connection to download media and scrape data. Ensure connectivity before starting.
- **Invalid URL:** The script validates that the URL starts with `https://x.com/`. Entering an invalid URL will prompt an error.
- **MongoDB Connection Issues:** If the database URL is incorrect or the server is down, the script will fail to connect and log an error.
- **Missing `mongoexport`:** Exporting to CSV or JSON requires `mongoexport`. If not installed, the export step will fail.

## Improvements
- **Add Rate Limiting:** Implement a delay between requests to further mimic human behavior and avoid rate limits.
- **Error Handling:** Enhance error handling for failed media downloads or database writes.
- **Config File:** Move database URL, credentials, and other settings to a `.env` file for better security and flexibility.
- **Progress Bar:** Add a progress bar to show the scraping status for large numbers of posts.
- **Multiple Export Formats:** Support additional formats like Excel or integrate with cloud storage (e.g., AWS S3).
- **Logging:** Implement detailed logging to track successes and failures for debugging.

## Contributing
i think there is still alot to contribute and work on this but i will leave it her since it is doing my work



