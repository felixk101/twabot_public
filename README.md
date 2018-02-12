# twabot

See Twitch Chat's mood at a glance.

![Twich Chat](https://docs.google.com/drawings/d/e/2PACX-1vQ6tMI40XQE12BDA_DdDJlCDeSmFY_GEV0jOqxGwMDkonLWgNHkdWppo4fwOQ2YN87Mghmt-NPAVFgz/pub?w=885&h=449 "Beispielbild")

## About

A project by Lukas Edelböck, Felix Kampfer, and Andreas Wundlechner (3 students from IN3 without database knowledge from other lectures).

The project is divided into 3 parts:

1. Fetching the data from Twitch and storage in Rethinkdb. Provided by Lukas Edelböck
1. Aanalysing the mood of the chats. Provided by Felix Kampfer
1. Displaying the analysed data with a webfrontend. Provided by Andreas Wundlechner

## Dependencies:
- Node 4.2.3
- RethinkDB 2.2.1

## Setup:
1. Register Twitch account and get Auth token from http://www.twitchapps.com/tmi/
2. Setup a rethinkDB server
2. Modify credentials/credentials.js:
  - replace NICK with your nickname
  - replace PASS with your oauth token
  - replace DBHOST with address of rethinkdb-database server
  - replace DBPORT with port of rethinkdb-database
4. `npm install` (try it without root permissions first)

## Running the project
1. `npm start` 
2. Wait 30 Seconds (don't ask)
3. Open a browser and visit http://localhost/index.html

