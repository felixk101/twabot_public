# twabot

See Twitch Chat's mood at a glance.
##About
A project by Lukas Edelböck, Felix Kampfer, and Andreas Wundlechner

The project is devided in 3 parts:

1. Fetching the data from Twitch and storage in Rethinkdb. Provided by Lukas Edelböck

1. Aanalysing the mood of the chats. Provided by Felix Kampfer

1. Displaying the analysed data with a webfrontend. Provided by Andreas Wundlechner

##Dependencies:
-Node 4.2.3
-RethinkDB 2.2.1

## Setup:
1. Register Twitch account and get Auth token from http://www.twitchapps.com/tmi/
2. Setup a rethinkDB server
2. Modify credentials/credentials.js:
  *replace NICK with your nickname
  *replace PASS with your oauth token
  *replace DBHOST with address of rethinkdb-database server
  *replace DBPORT with port of rethinkdb-database
4. `npm install` (with root permissions)

##Running the project
1. `npm start` (with root permissions)

