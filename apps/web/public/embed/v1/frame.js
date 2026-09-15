/*
 * Tidywright embed loader, version 1. docs/15-frontend-spec.md 1.1.
 *
 * Immutable: this file is cached for a year and is never edited once it has
 * been served. A change means /embed/v2/frame.js and a one line change in
 * /embed.js, which is the only mutable part.
 *
 * What it does, and nothing else:
 *
 *   - finds #tw-audit, or whatever data-target names
 *   - reserves 220px of height before anything loads, so the agency's page does
 *     not jump when the form arrives
 *   - puts an iframe in it, pointed at /e/<key>
 *   - grows the iframe when the form inside it says it changed height
 *   - opens the report when the form asks
 *
 * It sets no cookies, reads nothing from the page it is on, loads no fonts and
 * has no dependencies. It is loaded async and never blocks rendering, because
 * an agency who loses a tenth of a second of LCP to us removes us.
 *
 * ON MESSAGES, AND WHY THEY CARRY SO LITTLE
 *
 * The form inside the iframe cannot know the origin of the page that framed it,
 * and asking would mean trusting whatever answer came back, so it posts to '*'.
 * Anything sent that way is readable by the page hosting the embed and by
 * anything else listening. That is acceptable for exactly two things: a height
 * in pixels, and the address of a report the visitor is about to be shown
 * anyway.
 *
 * Nothing else may ever be added to these messages. Not the audit token before
 * the visitor has it, not the email, not the embed key, not a session of any
 * kind. If a future version needs to pass something private in either
 * direction, it needs a channel with a known origin, not this one.
 */
;(function () {
  'use strict'

  var me = document.currentScript
  if (!me || !me.src) return

  var key = me.getAttribute('data-key')
  var selector = me.getAttribute('data-target') || '#tw-audit'
  var mode = me.getAttribute('data-mode') === 'redirect' ? 'redirect' : 'inline'
  var variant = me.getAttribute('data-variant') || ''
  var origin

  try {
    origin = new URL(me.src, window.location.href).origin
  } catch (error) {
    return
  }

  function warn(message) {
    if (window.console && window.console.warn) {
      window.console.warn('[tidywright] ' + message)
    }
  }

  if (!key) {
    warn('the script tag needs a data-key attribute. Copy it from your Embed code screen.')
    return
  }

  var MIN_HEIGHT = 220
  var MAX_HEIGHT = 20000
  var mounted = false

  function target() {
    try {
      return document.querySelector(selector)
    } catch (error) {
      warn('data-target is not a valid CSS selector: ' + selector)
      return null
    }
  }

  /* Height first, before the iframe exists, so nothing below it moves later. */
  function reserve() {
    var element = target()
    if (element && !element.style.minHeight) {
      element.style.minHeight = MIN_HEIGHT + 'px'
    }
    return element
  }

  function source() {
    var url =
      origin +
      '/e/' +
      encodeURIComponent(key) +
      '?mode=' +
      mode +
      '&host=' +
      encodeURIComponent(window.location.hostname)
    return variant ? url + '&variant=' + encodeURIComponent(variant) : url
  }

  function listen(frame) {
    window.addEventListener('message', function (event) {
      if (event.origin !== origin) return
      if (event.source !== frame.contentWindow) return

      var data = event.data
      if (!data || typeof data !== 'object') return

      if (data.type === 'tw:resize') {
        var height = Number(data.height)
        if (height > 0 && height < MAX_HEIGHT) {
          frame.style.height = Math.ceil(height) + 'px'
        }
        return
      }

      if (data.type === 'tw:redirect' && typeof data.url === 'string') {
        var url
        try {
          url = new URL(data.url, origin)
        } catch (error) {
          return
        }
        // Only ever our own report. A frame that could hand this loader any
        // address would be a way to open any page from the agency's site.
        if (url.origin !== origin) return
        window.open(url.href, '_blank', 'noopener')
      }
    })
  }

  function mount() {
    if (mounted) return
    var element = reserve()
    if (!element) return
    mounted = true

    var frame = document.createElement('iframe')
    frame.src = source()
    frame.title = 'Free SEO check'
    frame.loading = 'eager'
    frame.scrolling = 'no'
    frame.referrerPolicy = 'strict-origin'
    frame.style.cssText =
      'width:100%;display:block;border:0;background:transparent;min-height:' +
      MIN_HEIGHT +
      'px;color-scheme:light;'

    element.appendChild(frame)
    listen(frame)
  }

  reserve()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mount()
      if (!mounted) {
        warn('no element matches ' + selector + '. Add <div id="tw-audit"></div> to the page.')
      }
    })
  } else {
    mount()
    if (!mounted) {
      warn('no element matches ' + selector + '. Add <div id="tw-audit"></div> to the page.')
    }
  }
})()
