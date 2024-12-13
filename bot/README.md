# MurderCrumpet Art Showcase App

### Discord bot

The discord bot requires a few environment variables to work, as shown in the ./.env.example file
DISCORD_TOKEN: Your bot's access token
GUILD_ID: Target discord guild ID
MODERATION_ROLE_ID: The discord role users will require to use review submissions
SUPA_TOKEN: Supabase access token
SUPA_URL: Supabase database URL

This is an open source project for the art showcase website application for [twitch.tv/murdercrumpet](https://www.twitch.tv/murdercrumpet)

#### Project Sturcture:

- ##### /app
  - The web application front-end for the website,
- ##### /bot
  - The middleware bot for discord that will handle uploading and parsing the contest entries from a discord channel.
