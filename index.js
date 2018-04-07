import fs from 'fs'
import path from 'path'
import md5 from 'md5'
import yaml from 'yamljs'
import jsonfile from 'jsonfile'
import util from './src/util'
import config from './src/config'

const {
  readdirSync,
  increaseId: id
} = util

const list = readdirSync(config.source)

const db = {
  posts: {},
  categories: {},
  tags: {}
}

while (list.length) {
  const target = list.pop()
  const stat = fs.statSync(target)

  if (stat.isDirectory()) {
    list.push(...readdirSync(target))
  } else if (stat.isFile()) {
    const targetId = id()
    const categories = path.dirname(path.relative(config.source, target)).split(path.sep)

    const raw = fs.readFileSync(target, { encoding: 'utf-8' })
    const items = raw.split(/\n---*\n/)
    const postConfig = yaml.parse(items.shift())
    const md = items.join('\n---\n')
    const relativePath = path.relative(config.source, target)

    // post
    db.posts[targetId] = {
      url: [config.url, ...relativePath.split(path.sep)].join('/'),
      version: md5(raw),
      config: postConfig,
      relativePath,
      md
    }

    // categories
    db.categories = categories.reduce((res, cat) => {
      if (cat !== '.') {
        res[cat] = res[cat] || new Set()
        res[cat].add(targetId)
      }
      return res
    }, db.categories)

    // tags
    db.tags = (postConfig.tags || []).reduce((res, tag) => {
      res[tag] = res[tag] || new Set()
      res[tag].add(targetId)
      return res
    }, db.tags)
  }
}

Object.values(db.posts).forEach(post => {
  util.writeFileSync(path.join(config.public, post.relativePath), post.md)
  delete post.public
  delete post.md
})

jsonfile.writeFileSync(path.join(config.public, 'db.json'), db)
