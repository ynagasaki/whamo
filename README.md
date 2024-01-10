## Whamo

It's like... a budgeting app for trading options? Yeah, I dunno either.

### Setup/Run

```
$ node -v
v21.1.0
$ npm -v
10.2.0
$ git clone [the-repo]
$ cd [repo-root]
$ mkdir /path/to/where/you/want/to/store/your/sqlite/file
$ echo "DATA_DIR=\"/path/to/where/you/want/to/store/your/sqlite/file\"" > config.env
$ npm install
$ npm run seed # one-time empty DB setup
$ npm run build
$ npm run start
```

Go to `localhost:3000` in your browser.

If you want to run this on a box in your local network, would recommend:

```
$ screen
$ npm run start > ~/whamo.log 2>&1 &
$ tail -d whamo.log
```
