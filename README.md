# Vote Remote 2020
Getting out the vote since 2020 also only in 2020
- [voteremote2020.com](https://voteremote2020.com)
- Learn more from [1-pager](https://paper.dropbox.com/doc/Vote-Remote-Iyyot2jRrGwQz9s383GgE)

## App overview
- Express.js with scaffolding from generator `express --view=pug --css=sass`
- Pug view engine (formerly Jade) & Sass CSS engine

## Get started
- Mac: Update Xcode & developer tools
- Install Homebrew
- Install Node & NPM with `brew install node`
- Clone git repo `https://github.com/culturegraphic/voteremote`
- Install dependencies `npm install`
- Start! `npm run dev`
- Open http://localhost:3000 in your browser

## Housekeeping
- Keep commits tidy with verb to describe changes made "Updates CSS for primary flow"

## Deploy
- Pushes to git master automatically deploy to Heroku

# Technical Details

## Connect to the Mongo database



## Updating postal code database

Postal codes are stored in Mongodb and the data is sources from the free downloadable Geonames database. See `database.md` for more information on our mongo database.

http://www.geonames.org/export/
or directly, 
https://download.geonames.org/export/zip/US.zip

The zip contains a CSV file. If you need to update the postal codes, you can import the CSV into mongo. First make sure to delete the existing postalcodes to avoid duplicate data:

```
mongo "mongodb+srv://cluster0.fe6lk.mongodb.net/voteremote" --username <user>
> db.postalcodes.truncate()
```

Then import the data from the CSV file. Since it doesn't have a header row we need to specify the header on the command line.
```
TODO
```
