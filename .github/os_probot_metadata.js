/**
 * Based on probot-metadata - https://github.com/probot/metadata
 */
const regex = /\n\n<!-- probot = (.*) -->/

const { Octokit } = require("@octokit/action")

const octokit = new Octokit()

module.exports = (context, issue = null) => {
  console.log(context)
  const prefix = "onesignal-probot"

  if (!issue) issue = context.payload.issue

  return {
    async get (key = null) {
      let body = issue.body

      if (!body) {
        body = (await octokit.issues.get(issue)).data.body || ''
      }

      const match = body.match(regex)

      if (match) {
        const data = JSON.parse(match[1])[prefix]
        return key ? data && data[key] : data
      }
    },

    async set (key, value) {
      let body = issue.body
      let data = {}

      if (!body) body = (await octokit.issues.get(issue)).data.body || ''

      body = body.replace(regex, (_, json) => {
        data = JSON.parse(json)
        return ''
      })

      if (!data[prefix]) data[prefix] = {}

      if (typeof key === 'object') {
        Object.assign(data[prefix], key)
      } else {
        data[prefix][key] = value
      }

      body = `${body}\n\n<!-- probot = ${JSON.stringify(data)} -->`

      const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
      const issue_number = context.payload.issue.number
      return octokit.issues.update({ owner, repo, issue_number, body })
    }
  }
}
