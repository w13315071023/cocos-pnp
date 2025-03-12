import { BUILDER_NAME } from '@/extensions/constants'
import { getAdapterConfig, getExcludedModules, getRCSkipBuild } from '@/extensions/utils'
import { exec2xAdapter } from 'playable-adapter-core'
import { shell } from 'electron'
import { join } from 'path'
import workPath from '../worker/2x?worker'

export const initBuildStartEvent = (options: TBuildOptions, callback?: () => void) => {
  Editor.log(`${BUILDER_NAME} 进行预构建处理`)
  Editor.log(`${BUILDER_NAME} 预构建处理完成`)
  callback && callback()
}

export const initBuildFinishedEvent = async (options: TBuildOptions, callback?: () => void) => {
  Editor.info(`${BUILDER_NAME} 开始适配`)

  const start = new Date().getTime();

  const handleExportFinished = () => {
    const end = new Date().getTime();
    Editor.success(`${BUILDER_NAME} 适配完成，共耗时${((end - start) / 1000).toFixed(0)}秒`)

    // 打开目录 start
    shell.openPath(buildFolderPath)
    // 打开目录 end
    callback && callback()
  }
  const handleExportError = (err: string) => {
    Editor.error('适配失败')
    Editor.error(err)
    // 打开目录 end
    callback && callback()
  }

  const {
    projectRootPath,
    projectBuildPath,
    adapterBuildConfig,
  } = getAdapterConfig()

  const buildFolderPath = join(projectRootPath, projectBuildPath)
  const params = {
    buildFolderPath,
    adapterBuildConfig: {
      ...adapterBuildConfig,
      buildPlatform: options.platform,
      orientation: options.webOrientation,
      projectName: options.projectName!
    }
  }

  try {
    const { Worker } = require('worker_threads')

    console.log('支持Worker，将开启子线程适配')
    const worker = new Worker(workPath, {
      workerData: params
    })
    worker.on('message', ({ finished, msg, event }: TWorkerMsg) => {
      if (event === 'adapter:finished') {
        finished ? handleExportFinished() : handleExportError(msg)
        return
      }
      // 处理消息 adapter:log 和 adapter:info
      Editor[event.split(':')[1] as ConsoleMethodName](msg)
    })
  } catch (error) {
    console.log('不支持Worker，将开启主线程适配')

    await exec2xAdapter(params, {
      mode: 'serial'
    })
    handleExportFinished()
  }
}

export const builder2x = () => {
  // 初始化 start
  const {
    buildPlatform,
    originPkgPath,
  } = getAdapterConfig()
  // 初始化 end

  Editor.log(`开始构建项目，导出${buildPlatform}包`)

  Editor.Ipc.sendToMain('builder:query-build-options', (err: any, options: TBuildOptions) => {
    const scenes = options.scenes || []
    if (scenes.length === 0) {
      scenes.push(options.startScene)
    }
    const excludedModules = getExcludedModules()
    let buildOptions: TBuildOptions = {
      ...options,
      md5Cache: false,
      inlineSpriteFrames: false,
      inlineSpriteFrames_native: false,
      debug: false,
      platform: buildPlatform,
      actualPlatform: buildPlatform,
      sourceMaps: false,
      scenes,
      excludedModules,
      dest: originPkgPath
    }

    const isSkipBuild = getRCSkipBuild()
    if (isSkipBuild) {
      initBuildStartEvent(buildOptions, () => {
        initBuildFinishedEvent(buildOptions)
      })
      return
    }
    Editor.Ipc.sendToMain('builder:start-task', 'build', buildOptions)
  })
}
