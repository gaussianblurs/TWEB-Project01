<template>
  <div>
    <b-navbar type="dark" variant="info">
      <a class="mx-auto"><img class="nav-logo" src="../assets/nav-logo.svg"></a>
    </b-navbar>
    <b-container v-if="!loading">
      <b-row class="title mt-2" align-h="between">
        <b-col cols="auto" class="mr-auto">
          <b-img rounded="circle" width="75" height="75" alt="img" class="my-3 mr-3 d-inline" :src="avatar" />
          <h1 class="d-inline">{{ username }}</h1>
        </b-col>
        <b-col cols="auto">
          <div class="user-infos d-inline-block">
            <h2><strong>{{ public_repos }}</strong> PUBLIC REPOS</h2>
            <h2><strong>{{ private_repos }}</strong> PRIVATE REPOS</h2>
          </div>
          <div class="user-infos d-inline-block ml-4">
            <h2><strong>{{ followers }}</strong> FOLLOWERS</h2>
            <h2><strong>{{ collaborators }}</strong> COLLABORATORS</h2>
          </div>
        </b-col>
      </b-row>
      <b-row class="chart-container mt-2">
        <b-col>
          <weekly-commits-line-chart-card  title="3 WEEKS COMMITS" :username="username" />
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col class="chart-container mr-1">
          <languages-pie-chart-card title="LANGUAGES" :username="username" />
        </b-col>
        <b-col class="chart-container ml-1">
          <commits-bar-chart-card title="COMMITS/REPO" :username="username" />
        </b-col>
      </b-row>
      <b-row v-if="!loading" class="repo-select mt-2">
        <b-col>
          <h1 class="mt-2">Select a repo: </h1>
          <b-form-select class="mb-2" v-model="selectedRepo">
            <option v-for="repo in repos" :value="repo">{{ repo }}</option>
          </b-form-select>
        </b-col>
      </b-row>
      <b-row class="chart-container mt-2">
        <b-col class="mr-1">
          <commits-line-chart-card title="COMMITS" :username="username" :reponame="selectedRepo" />
        </b-col>
      </b-row>
      <b-row class="chart-container mt-2">
        <b-col class="mr-1">
          <contributors-list-card title="COLLABORATORS" :reponame="selectedRepo" />
        </b-col>
      </b-row>
      <b-row class="chart-container mt-2 mb-2">
        <b-col class="footer text-center">
          <h3 class="made-by d-inline">MADE WITH </h3>
          <font-awesome-icon class="heart-icon d-inline" icon="heart" />
          <h3 class="made-by d-inline"> BY</h3>
          <h2>
            <a href="https://github.com/psrochat">psrochat</a> &
            <a href="https://github.com/gaussianblurs">gaussianblurs</a>
          </h2>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from '../HTTP'
import WeeklyCommitsLineChartCard from "./components/WeeklyCommitsLineChartCard"
import LanguagesPieChartCard from "./components/LanguagesPieChartCard"
import CommitsBarChartCard from "./components/CommitsBarChartCard"
import CommitsLineChartCard from "./components/CommitsLineChartCard"
import ContributorsListCard from "./components/ContributorsListCard"

export default {
  components: {
    WeeklyCommitsLineChartCard,
    LanguagesPieChartCard,
    CommitsBarChartCard,
    CommitsLineChartCard,
    ContributorsListCard,
  },
  data() {
    return {
      username: '',
      avatar: '',
      public_repos: '',
      private_repos: '',
      collaborators: '',
      followers: '',
      repos: [],
      selectedRepo: null,
      loading: true,
    }
  },
  methods: {
    fetchUser() {
      let token = window.localStorage.getItem('access_token')
      return axios.get(`/user?token=${token}`)
        .then((response) => {
          this.username = response.data.login
          this.avatar = response.data.avatar_url
          this.public_repos = response.data.public_repos
          this.private_repos = response.data.total_private_repos
          this.collaborators = response.data.collaborators
          this.followers = response.data.followers
        })
        .catch((err) => {
          console.log(err)
          this.$router.push({ name: 'homepage' })
        })
    },
    fetchRepos() {
      let token = window.localStorage.getItem('access_token')
      return axios.get(`/repos?token=${token}`)
        .then((response) => {
          for(let rep in response.data) {
            if(response.data[rep].name)
              this.repos.push(response.data[rep].full_name)
          }
          this.selectedRepo = this.repos[0]
        })
        .catch((err) => {
          console.log(err)
          this.$router.push({ name: 'homepage' })
        })
    }
  },
  mounted() {
    this.fetchUser()
      .then(() => this.fetchRepos())
      .then(() =>  {
        this.consoleRepo = this.repos[0]
        this.loading = false
      })
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/statspage.scss';
</style>
