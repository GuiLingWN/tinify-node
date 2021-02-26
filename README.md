# tinify-node

使用 node 实现 https://tinypng.com/ API 对接，实现批量压缩

### 源码运行
```
#依赖安装
npm i
#运行程序
node index
```
### exe运行
直接双击index.exe，确保config.json配置正确

### config.js 配置参数

| 字段        | 类型   | 必填 | 描述                  |
| ----------- | ------ | ---- | --------------------- |
| key         | String | 是   | tinify.com 的 API Key |
| imageFolder | String | 是   | 图片目录              |
| outFolder   | String | 是   | 导出目录              |
| concurrency | Number | 是   | 并发量                |
| finishDelay | Number | 是   | 结束窗口关闭延时      |

### 打包 exe

```
#需要全局安装pkg环境
npm install -g pkg

#命令行打包 or windows系统双击运行package.bat
pkg index.js --targets win
```
