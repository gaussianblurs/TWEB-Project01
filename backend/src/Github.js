const fetch = require('node-fetch')

class ResponseError extends Error {
  constructor(res, body) {
    super(`${res.status} error requesting ${res.url}: ${res.statusText}`)
    this.status = res.status
    this.path = res.url
    this.body = body
  }
}

class Github {
  constructor(baseUrl = 'https://api.github.com') {
    this.baseUrl = baseUrl
  }

  request(token, path, opts = {}, acc = []) {
    const url = `${this.baseUrl}${path}`
    const options = {
      ...opts,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        ...opts.headers,
      },
    }

    return fetch(url, options)
      .then(res => {
        if (!res.ok) {
          throw new ResponseError(res, res.json())
        }
        return res
      })
      .then(res => res.json()
        .then(body => {
          acc.push(body)
          const nextPage = this.nextPage(res.headers.get('link'))
          if (nextPage) {
            return this.request(token, nextPage, options, acc)
          }
          if (acc.length > 1) {
            return [].concat(...acc)
          }
          return body
        }))
  }

  nextPage(linkHeader) {
    if (!linkHeader) {
      return null
    }
    const headersArr = [].concat(...linkHeader.split(',').map(el => el.split(';'))).map(el => el.trim())
    const indexOfRelNext = headersArr.findIndex(el => el === 'rel="next"')
    if (indexOfRelNext === -1) {
      return null
    }
    let nextUrl = headersArr[indexOfRelNext - 1]
    nextUrl = nextUrl.slice(this.baseUrl.length + 1, -1)
    return nextUrl
  }

  user(token) {
    return this.request(token, '/user')
  }

  reposUser(token, page = 1, perPage = 100) {
    return this.request(token, `/user/repos?page=${page}&per_page=${perPage}`)
  }

  repoLanguages(token, repoName, page = 1, perPage = 100) {
    return this.request(token, `/repos/${repoName}/languages?page=${page}&per_page=${perPage}`)
  }

  repoCommits(token, repoName, page = 1, perPage = 100) {
    return this.request(token, `/repos/${repoName}/commits?page=${page}&per_page=${perPage}`)
  }

  repoUserCommits(token, username, repoName, page = 1, perPage = 100) {
    return this.request(token, `/repos/${repoName}/commits?page=${page}&per_page=${perPage}&author=${username}`)
  }

  repoTopics(token, repoName, page = 1, perPage = 100) {
    return this.request(token, `/repos/${repoName}/topics?page=${page}&per_page=${perPage}`, {
      headers: {
        Accept: 'application/vnd.github.mercy-preview+json',
      },
    })
  }

  repoContributors(token, repoName, page = 1, perPage = 100) {
    return this.request(token, `/repos/${repoName}/stats/contributors?page=${page}&per_page=${perPage}`)
  }

  userCommits(token, username) {
    return this.reposUser(token)
      .then(repos => {
        const getCommits = async repo => ({
          repoName: repo.full_name,
          commits: await this.repoUserCommits(token, username, repo.full_name)
            .catch(err => []), // eslint-disable-line no-unused-vars
        })
        return Promise.all(repos.map(getCommits))
      })
  }

  repoUserCommitsSince(token, username, repoName, stringDate, page = 1, perPage = 100) {
    return this.request(token, `/repos/${repoName}/commits?page=${page}&per_page=${perPage}&since=${stringDate}&author=${username}`)
  }

  userLanguages(token) {
    return this.reposUser(token)
      .then((repos) => {
        const getLanguages = repo => this.repoLanguages(token, repo.full_name)
        return Promise.all(repos.map(getLanguages))
      })
  }

  lastThreeWeeksUserCommits(token, username) {
    const d = new Date()
    d.setDate(d.getDate() - 21)
    return this.reposUser(token)
      .then((repos) => {
        const getCommits = async repo => ({
          repoName: repo.full_name,
          commits: await this.repoUserCommitsSince(token, username, repo.full_name, d.toISOString())
            .catch(err => []), // eslint-disable-line no-unused-vars
        })
        return Promise.all(repos.map(getCommits))
      })
  }
}

module.exports = Github
