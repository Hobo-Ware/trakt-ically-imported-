### ✨ Effortlessly import your liberated TV Time data into Trakt.tv! ✨

This tool is the perfect companion to [tv-time-liberator](https://github.com/Hobo-Ware/tv-time-liberator/). Once you've rescued your watch history, favorites, and lists from TV Time, trakt-ically-imported seamlessly transfers them to your Trakt account.

# Features:

- **Automated import:** Say goodbye to tedious manual entry!
- **Comprehensive data transfer:** Import your movies, shows. **Coming Soon:** favorites, and custom lists.
- **Seamless integration:** Works smoothly with data exported by [tv-time-liberator](https://github.com/Hobo-Ware/tv-time-liberator/).
- **Easy to use:** Clear instructions and a straightforward setup process.

# Getting Started:

1. Liberate your data: Export your data from TV Time using [tv-time-liberator](https://github.com/Hobo-Ware/tv-time-liberator/).
1. Clone trakt-ically-imported: and follow the instructions below.
    - This repository uses submodules, be sure to run `git submodule update --init --recursive` after cloning.

# Usage:

1. Install the required dependencies:

    `bun install`

1. Setup your local environment:

    - Create a `.env` file in the project root directory.
    - Add your Trakt API client ID and client secret to the `.env` file:

        ```
        TRAKT_CLIENT_ID=your_client_id
        TRAKT_CLIENT_SECRET=your_client_secret
        LIBERATOR_EXPORT_PATH=path_to_liberated_data
        ```
        
1. Run the script:

    `bun index.ts`

# How to get your Trakt API credentials:

1. Log in to your Trakt account.
1. Create a new API app [`here`](https://trakt.tv/oauth/applications/new).
1. Set `Name` to `trakt-ically-imported`.
1. Set `Redirect uri:` to `urn:ietf:wg:oauth:2.0:oob`.
1. Click `Save App`.
1. Set your `.env` file with the `Client ID` and `Client Secret` from the app you just created.

Let's make Trakt integration trakt-ically easy! 🚀