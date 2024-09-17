# MapLibre GL JS React Component

This project demonstrates a React component that uses MapLibre GL JS to display an interactive map with custom markers and labels.

## Setup

### Prerequisites

- Node.js (version 12 or later)
- npm (usually comes with Node.js)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install the dependencies:
   ```
   npm install
   ```

### Environment Variables

This project uses MapTiler for map styles, which requires an API key. To keep this key secure, we use environment variables.

1. Create a `.env` file in the root directory of the project:
   ```
   touch .env
   ```

2. Open the `.env` file and add your MapTiler API key:
   ```
   REACT_APP_MAPTILER_API_KEY=your_maptiler_api_key_here
   ```
   Replace `your_maptiler_api_key_here` with your actual MapTiler API key.

3. The `.env` file is included in `.gitignore` to prevent accidentally committing your API key to the repository.

Note: If you don't have a MapTiler API key, you can sign up for a free account at [MapTiler Cloud](https://cloud.maptiler.com/maps/).

### Running the Application

After setting up your environment variable, you can start the development server:

```
npm start
```

The application should now be running at `http://localhost:3000`.

## How It Works

The main component, `MapComponent`, uses the MapLibre GL JS library to render an interactive map. It loads GeoJSON data from a local file and displays markers and labels based on this data.

The MapTiler API key is accessed in the component using `process.env.REACT_APP_MAPTILER_API_KEY`. This allows us to use the API key without exposing it in our source code.

## Contributing

If you'd like to contribute to this project, please fork the repository and create a pull request. Be sure not to commit any sensitive information like API keys.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
