const express = require('express')
const cors = require('cors')
const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy

const got = require('got')

const app = express()

let user

app.use(cors({
  origin: true,
  credentials: true
}))

const credentials = require('./../credentials/spotify.json')
const spotifyId = credentials.id
const spotifySecret = credentials.secret
const spotifyScopes = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private'
]

const PORT = process.env.PORT || 7337

const BASE_URL = `http://localhost:${PORT}/`
const LOG_IN_URL = `${BASE_URL}auth/spotify`
const CALLBACK_URL = `${BASE_URL}auth/spotify/callback`

app.use(passport.initialize())

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

function checkAuth (req, res) {
  if (!user) {
    res.send({
      error: 'inloggen ouwe',
      login: LOG_IN_URL,
    })

    return false
  } else {
    return true
  }
}

function spotifyApi (user, api, options) {
  const accessToken = user.accessToken
  const refreshToken = user.refreshToken

  let func = got.get
  if (options && options.method) {
    func = got[options.method]
  }

  return func(`https://api.spotify.com/v1${api}`, Object.assign({
    json: true,
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  }, options))
}

app.get('/', (req, res) => {
  res.send({
    login: LOG_IN_URL,
    current: `${BASE_URL}current`,
    search: `${BASE_URL}search?q=Blood%20on%20the%20Tracks`
  })
})

app.get('/search', (req, res) => {
  if (!checkAuth(req, res)) {
    return
  }

  const query = `?q=${req.query.q}&type=album`

  spotifyApi(user, `/search${query}`)
    .then((response) => {
      const album = response.body.albums.items[0]

      const data = {
        method: 'put',
        body: JSON.stringify({
          context_uri: album.uri
        })
      }

      spotifyApi(user, `/me/player/play`, data)
        .then((response) => {
          res.send(response.body)
        })
        .catch((error) => {
          console.error(error)
          res.send(error)
        })

    })
    .catch((error) => {
      res.send(error)
    })
})

app.get('/current', (req, res) => {
  if (!checkAuth(req, res)) {
    return
  }

  spotifyApi(user, '/me/player/currently-playing')
    .then((response) => {
      res.send({
        artist: response.body.item.artists[0].name,
        title: response.body.item.name
      })
    })
    .catch((error) => {
      res.send(error)
    })
})

passport.use(new SpotifyStrategy({
    clientID: spotifyId,
    clientSecret: spotifySecret,
    callbackURL: CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {
    user = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profileUrl: profile.profileUrl,
      photos: profile.photos,
      accessToken,
      refreshToken
    }

    return done(null, user)
  }
))

app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: spotifyScopes}),
  (req, res) => {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  })

app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/')
  })

app.listen(PORT, () => {
  console.log(`Formula API listening on port ${PORT}!`);
})
