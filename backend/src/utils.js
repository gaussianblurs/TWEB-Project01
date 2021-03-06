function getReposLanguagesStats(reposLanguages = []) {
  const stats = {}
  const countLanguages = o => {
    Object.keys(o).forEach(key => {
      const value = o[key]
      const current = stats[key] || 0
      stats[key] = current + value
    })
  }
  reposLanguages.forEach(countLanguages)
  return Object.keys(stats)
    .sort((a, b) => stats[a] - stats[b])
    .map(key => ({ [key]: stats[key] }))
}

function mostPopularsLanguages(languages = []) {
  return languages.slice(languages.length - 6, languages.length)
}

function arrayUnique(array) {
  const a = array.concat()
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) {
        a.splice(j--, 1) //eslint-disable-line
      }
    }
  }
  return a
}

function formatWeeklyCommitsStats(weeklyCommitsStats = []) {
  const commitsStats = []
  weeklyCommitsStats.forEach((repo) => {
    if (Object.keys(repo.commits).length > 0) {
      commitsStats.push(JSON.parse(JSON.stringify(repo)))
    }
  })
  let datesArray = []
  commitsStats.forEach((repo) => {
    Object.entries(repo.commits).forEach((commit) => {
      datesArray.push(new Date(commit[0]))
    })
  })
  datesArray = arrayUnique(datesArray)
  const maxDate = new Date(Math.max.apply(null, datesArray))
  const minDate = new Date(Math.min.apply(null, datesArray))

  commitsStats.forEach((repo) => {
    for (let d = (new Date(minDate)); d <= maxDate; d.setDate(d.getDate() + 1)) {
      let date = d.toISOString()
      date = date.substring(0, date.indexOf('T'))
      let alreadyIn = false

      Object.entries(repo.commits).forEach((commit) => {
        if (date === commit[0]) {
          alreadyIn = true
        }
      })

      if (!alreadyIn) {
        repo.commits[date] = 0 // eslint-disable-line
      }
    }
  })
  return commitsStats
}

function getWeeklyCommitsStats(reposWeeklyCommits = []) {
  const stats = []
  const countCommits = o => {
    if (o.commits.length > 0) {
      stats.push({
        name: o.repoName,
        commits: {},
      })
    }
    o.commits.forEach(commit => {
      let { date } = commit.commit.author
      date = date.substring(0, date.indexOf('T'))
      const current = stats[stats.length - 1].commits[date] || 0
      stats[stats.length - 1].commits[date] = current + 1
    })
  }

  reposWeeklyCommits.forEach(countCommits)
  console.log(stats)
  const commitsStats = formatWeeklyCommitsStats(stats)
  return commitsStats.map(el => (
    {
      name: el.name,
      commits: Object.keys(el.commits)
        .sort((a, b) => new Date(a) - new Date(b))
        .map(key => ({ [key]: el.commits[key] })),
    }
  ))
}

function formatRepoCommitsStats(repoCommitsStats = {}) {
  const repoCommits = repoCommitsStats

  let datesArray = []
  Object.entries(repoCommits).forEach((author) => {
    Object.entries(author[1]).forEach((commit) => {
      datesArray.push(new Date(commit[0]))
    })
  })
  datesArray = arrayUnique(datesArray)
  const maxDate = new Date(Math.max.apply(null, datesArray))
  const minDate = new Date(Math.min.apply(null, datesArray))

  Object.entries(repoCommits).forEach((author) => {
    for (let d = (new Date(minDate)); d <= maxDate; d.setDate(d.getDate() + 1)) {
      let date = d.toISOString()
      date = date.substring(0, date.indexOf('T'))
      let alreadyIn = false

      Object.entries(author[1]).forEach((commit) => {
        if (date === commit[0]) {
          alreadyIn = true
        }
      })

      if (!alreadyIn) {
        author[1][date] = 0 // eslint-disable-line
      }
    }
  })
  return repoCommits
}

function getReposCommitsStats(reposCommits = []) {
  const stats = []
  const countCommits = o => {
    if (o.commits.length > 0) {
      stats.push({
        name: o.repoName,
        commits: o.commits.length,
      })
    }
  }
  reposCommits.forEach(countCommits)
  return stats.sort((a, b) => a.commits - b.commits)
}

function mostPopularRepos(repos = []) {
  return repos.slice(repos.length - 6, repos.length)
}

function getRepoCommitsStats(repoCommits = []) {
  const stats = {}
  repoCommits.forEach(el => {
    if (el.author && !stats[el.author.login]) {
      stats[el.author.login] = {}
    }
  })
  const countCommits = o => {
    if (o.author) {
      const date = o.commit.author.date.substring(0, o.commit.author.date.indexOf('T'))
      const current = stats[o.author.login][date] || 0
      stats[o.author.login][date] = current + 1
    }
  }
  repoCommits.forEach(countCommits)
  const commitsStats = formatRepoCommitsStats(stats)
  return Object.keys(commitsStats)
    .map(author => ({
      author,
      commits: Object.keys(stats[author])
        .sort((a, b) => new Date(a) - new Date(b))
        .map(key => ({ [key]: stats[author][key] })),
    }))
}

function getContributorsStats(contributors = []) {
  return contributors
    .map(el => ({
      username: el.author.login,
      url: el.author.html_url,
      avatarUrl: el.author.avatar_url,
      totalCommits: el.total,
    }))
}

module.exports = {
  getReposLanguagesStats,
  getWeeklyCommitsStats,
  mostPopularsLanguages,
  getReposCommitsStats,
  mostPopularRepos,
  getRepoCommitsStats,
  getContributorsStats,
  formatWeeklyCommitsStats,
  formatRepoCommitsStats,
}
