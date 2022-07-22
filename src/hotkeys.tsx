import React from 'react'
import Mousetrap from 'mousetrap'
import _ from 'lodash'

export type HotkeyHandler = {
  priority: number,
  handler: (event: Mousetrap.ExtendedKeyboardEvent, combo?: string) => void | boolean
}

Mousetrap.prototype.stopCallback = () => false

const default_options = {
  hot_key_property_name: 'hot_keys',
}

const global_hotkeys: { [hotkey: string]: HotkeyHandler[] | null } = {
}


const hotkey_get_handler = (hotkey: string) => (e: Mousetrap.ExtendedKeyboardEvent, combo?: string) => {
  const handlers = global_hotkeys[hotkey]
  let propagate: boolean | void = true

  _.forEach(handlers, ({ handler }) => {
    if (!propagate) return
    
    propagate = handler(e, combo)
  })
  return propagate
}

export const load_hotkeys = (handlers: { [hotkey: string]: HotkeyHandler }) => {
  _.forEach(handlers, (response, hotkey) => {
    if (global_hotkeys[hotkey] == null) {
      global_hotkeys[hotkey] = [response]

      Mousetrap.bind(hotkey, hotkey_get_handler(hotkey))
    } else {
      global_hotkeys[hotkey]?.push(response)
      global_hotkeys[hotkey] = _.sortBy(global_hotkeys[hotkey], 'priority').reverse()
    }
  })
}

export const unload_hotkeys = (handlers: { [hotkey: string]: HotkeyHandler }) => {
  _.forEach(handlers, (response, hotkey) => {

    if (Array.isArray(global_hotkeys[hotkey])) {
      _.remove(global_hotkeys[hotkey]!, response)
    }

    if (global_hotkeys[hotkey]?.length === 0) {
      global_hotkeys[hotkey] = null
      Mousetrap.unbind(hotkey)
    }
  })
}

export const hotkeys = (Component: React.ComponentType<{ ref: unknown }>, overwrites = {}) => {
  const options = {
    ...default_options,
    ...overwrites,
  }

  return class HotKeysWrapper extends React.PureComponent {
    componentDidMount () {
      const handlers = this.wrapped_component[options.hot_key_property_name]
      if (handlers == null) {
        console.warn(`Component: ${Component.displayName} did not provide hotkey handlers`)
        return
      }
    
      load_hotkeys(handlers)
    }

    componentWillUnmount () {
      const handlers = this.wrapped_component[options.hot_key_property_name]
      if (handlers == null) return
      unload_hotkeys(handlers)
    }

    wrapped_component: any = undefined;

    getWrappedComponent = () => this.wrapped_component

    on_ref_update = (ref: React.Component) => {
      this.wrapped_component = ref
    }

    render () {
      return <Component ref={this.on_ref_update} {...this.props} />
    }
  }
}

export default hotkeys

export const hotkey_display = (shortcut: string) => {
  const am_mac = window.navigator.appVersion.indexOf('Mac') !== -1
  if (!am_mac) return shortcut
  let mac_shortcut = shortcut.replace('alt', 'option')
  return mac_shortcut.replace('meta', '⌘')
}
