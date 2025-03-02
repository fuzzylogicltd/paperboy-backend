# Paperboy Feed Reader API

This is the backend for the Paperboy feed reader. For more info on the app, see [the frontend repo](https://github.com/fuzzylogicltd/paperboy-frontend), or [the live demo](https://paperboy.fuzzylogic.ltd).

The backend is a REST API NodeJS app, using Express and the Prisma ORM. The database is PostgreSQL running on an AWS RDS instance. The Node app itself is on an EC2 instance, using Nginx and pm2. The only other thing worth mentioning is that it uses [Rowan Manning's feed-parser package](https://www.npmjs.com/package/@rowanmanning/feed-parser) for, you guessed it, parsing the RSS feeds.

## The data

To understand the data structure in detail take a look at the `prisma/schema.prisma` file. But in short, everything revolves around Users, Feeds and Articles.

A User can create a Subscription to a Feed, which is their own "instance" of that Feed, since many users could be following the same feed, so it's a many-to-many relationship. This also offers options for each user to customize their feed a bit, with custom names and tags.

Each Feed is linked to a bunch of Articles that have been fetched from it over time.

Users are also linked to Reads, which are similarly "instances" of Articles relative to them. That way we can show if they've been read and when, if they've been saved to favorites etc.

The way the app works is that when an endpoint for getting articles is requested, it will fetch the articles for that feed via RSS and save them to the database. Once that is done, the API will return the requested articles. Since the number or articles could be very large they are paginated by 10 at a time. Also, in order not to spam the feeds that we get the content from, we don't fetch a feed if it's been fetched in the last five minutes.

Also, users can sign up and add their own Feeds. Signup works, but new accounts are disabled by default until I set up an email validation mechanism. To test-drive the app, [check out the Frontend repo readme](https://github.com/fuzzylogicltd/paperboy-frontend).

## To-do

This app is very much a WIP. Some of the main things for the backend are:

- Verifying a submitted URL is actually a valid feed before adding it
- Email verification for new users
- Reset password functionality
- Add Postman collection to the repo for documentation purposes
- Add unit tests
