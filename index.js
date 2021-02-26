const fs = require('fs-extra')
const async = require('async')
const path = require('path')
const extList = ['.JPG', '.jpg', '.png']
const tinify = require('tinify')
const cwdPath = process.cwd()
const { key, concurrency, finishDelay, imageFolder, outFolder } =
  fs.readJSONSync(path.resolve(cwdPath, './config.json')) || {}
tinify.key = key
let imageFolderPath = path.resolve(cwdPath, imageFolder)
let outFolderPath = path.resolve(cwdPath, outFolder)
;(async () => {
  try {
    if (!key) {
      throw new Error('tinify key 不能为空')
    }
    let exist = await fs.pathExists(imageFolderPath)
    if (!exist) {
      throw new Error(`目录 ${imageFolderPath} 不存在`)
    }
    await fs.remove(outFolderPath)
    let flist = walk(imageFolderPath)
    let begin = Date.now()
    await asyncQueue(flist, minify)
    console.log(`总耗时 ${Math.round((Date.now() - begin) / 1000)}s`)
    await sleep(parseInt(finishDelay) || 3000)
  } catch (error) {
    console.error(error)
    await sleep(parseInt(finishDelay) || 3000)
  }
})()
async function minify(url = '') {
  let desPath = url.replace(imageFolderPath, outFolderPath)
  await fs.ensureDir(path.resolve(desPath, '../'))
  let begin = Date.now()
  console.log(`开始压缩 ${url}`)
  let { size } = await fs.stat(url)
  let source = tinify.fromFile(url)
  let err = await source.toFile(desPath)
  if (err) {
    console.error(err)
  } else {
    let { size: size2 } = await fs.stat(url)
    let b2km = (n) => {
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
  return new Promise((resolve) => {
    let q = async.queue(async (path, cb) => {
      try {
        let res = await handle(path)
        return res
      } catch (error) {
        console.log(error)
      }
    }, parseInt(concurrency) || 10)
    q.drain(resolve)
    for (let i = 0; i < queueList.length; i++) {
      q.push(queueList[i])
    }
  })
}

/**
 * 遍历文件目录
 * @param {*} filePath
 */
function walk(dir) {
  var results = []
  var list = fs.readdirSync(dir)
  list.forEach((file) => {
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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}
