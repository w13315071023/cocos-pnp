import { TNoPlayableConfig, TPlayableConfig, TWebOrientations } from '@/typings'
import { ADAPTER_FETCH, PLAYABLE_DEFAULT_CONFIG } from "@/constants"
import { writeToPath } from './file-system';
import { join } from "path";

const getPlayableConfig = (options?: { orientation?: TWebOrientations, languages?: string[] }) => {
  const { orientation, languages } = options || {}

  const OrientationMap: { [key in TWebOrientations]: 0 | 1 | 2 } = {
    auto: 0,
    portrait: 1,
    landscape: 2
  }

  const playableConfig: TPlayableConfig = {
    playable_orientation: orientation ? OrientationMap[orientation] : PLAYABLE_DEFAULT_CONFIG.playable_orientation,
    playable_languages: languages || PLAYABLE_DEFAULT_CONFIG.playable_languages
  }

  return playableConfig
}

const getNoPlayableConfig = (options?: { orientation?: TWebOrientations, languages?: string[] }) => {
  const { orientation, languages } = options || {}

  const OrientationMap: { [key in TWebOrientations]: 0 | 1 | 2 } = {
    auto: 0,
    portrait: 1,
    landscape: 2
  }

  const playableConfig: TNoPlayableConfig = {
    orientation: orientation ? OrientationMap[orientation] : PLAYABLE_DEFAULT_CONFIG.playable_orientation,
    languages: languages || PLAYABLE_DEFAULT_CONFIG.playable_languages
  }

  return playableConfig
}

export const isObjectString = (str: string) => {
  try {
    const obj = JSON.parse(str);
    return obj && typeof obj === 'object' && !Array.isArray(obj);
  } catch (e) {
    return false;
  }
}

// Replacing XMLHttpRequest
export const removeXMLHttpRequest = (codeStr: string) => {
  return codeStr.replace(/XMLHttpRequest/g, ADAPTER_FETCH)
}

export const exportConfigJson = async (options: {
  destPath: string
  orientation?: TWebOrientations;
  languages?: string[];
}, noPlayable: boolean = false) => {

  const { destPath, orientation, languages } = options
  if(noPlayable){

  }else{

  }
  const playableConfig = noPlayable?getNoPlayableConfig({
    orientation,
    languages
  }):getPlayableConfig({
    orientation,
    languages
  })
  const configJsonPath = join(destPath, '/config.json')
  writeToPath(configJsonPath, JSON.stringify(playableConfig))
}