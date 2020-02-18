const fs = require('fs-extra')
const async = require('async')
const path = require('path')
const extList = ['.jpg', '.png']
const tinify = require('tinify')
const cwdPath = process.cwd()
const { key, concurrency, finishDelay } = fs.readJSONSync(path.resolve(cwdPath, './config.json')) || {}
if (!key) {
  console.error('tinify key 不能为空')
  return
}
tinify.key = key
async function minify(url) {
  let begin = Date.now()
  console.log(`开始压缩 ${url}`)
  let { size } = await fs.stat(url)
  let source = tinify.fromFile(url)
  let err = await source.toFile(url)
  if (err) {
    console.error(err)
  } else {
    let { size: size2 } = await fs.stat(url)
    let b2km = n => {
      if (n > 1024 * 1024) {
        return `${(n / (1024 * 1024)).toFixed(2)}MB`
      } else {
        return `${(n / 1024).toFixed(2)}KB`
      }
    }
    console.log(`压缩结束 ${b2km(size)}=>${b2km(size2)} 耗时 ${Math.round((Date.now() - begin) / 1000)}s ${url}`)
  }
}

/**
 * 执行异步队列
 * @param {*} queueList
 * @param {*} handle
 * @returns
 */
async function asyncQueue(queueList, handle) {
  return new Promise(resolve => {
    let q = async.queue(async (path, cb) => {
      let res = await handle(path)
      return res
    }, parseInt(concurrency) || 10)
    q.drain(resolve)
    for (let i = 0; i < queueList.length; i++) {
      q.push(queueList[i])
    }
  })
}

;(async () => {
  let dirPath = path.resolve(cwdPath, './imgs')
  let flist = walk(dirPath)
  let begin = Date.now()
  await asyncQueue(flist, minify)
  console.log(`总耗时 ${Math.round((Date.now() - begin) / 1000)}s`)
  await sleep(parseInt(finishDelay) || 3000)
})()

/**
 * 遍历文件目录
 * @param {*} filePath
 */
function walk(dir) {
  var results = []
  var list = fs.readdirSync(dir)
  list.forEach(file => {
    file2 = dir + '/' + file
    var stat = fs.statSync(file2)
    let fileInfo = path.parse(file2)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file2))
    } else if (fileInfo && (!extList || extList.includes(fileInfo.ext))) {
      results.push(file2)
    }
  })
  return results
}
async function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}
