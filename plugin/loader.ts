import { Plugin, PluginInfo, PluginHandler } from '../types/pluginTypes'
import PluginParser from './parser'

export default class PluginLoder {
  private pluginParser: PluginParser

  constructor(...plugin: Plugin[]) {
    this.pluginParser = new PluginParser()
    plugin.map(p => this.pluginParser.compose(p))
  }

  public install(...plugin: Plugin[]) {
    plugin.map(p => this.pluginParser.compose(p))
  }
}
