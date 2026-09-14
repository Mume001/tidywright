/*
 * Tidywright embed, the mutable channel. docs/15-frontend-spec.md 1.1.
 *
 *   <script src="https://siteauditserver.com/embed.js" data-key="pk_live_..." async></script>
 *   <div id="tw-audit"></div>
 *
 * This file is cached for five minutes and does nothing but load the real
 * loader, which is cached for a year and never changes once published. That is
 * the whole reason for the split: we can ship a new loader without asking three
 * hundred agencies to edit a script tag, and without serving a file that has to
 * be revalidated on every page view of every site we are on.
 *
 * No framework, no cookies, no reading of the host page, no fonts.
 */
;(function () {
  'use strict'

  var me = document.currentScript
  if (!me || !me.src) return

  var origin
  try {
    origin = new URL(me.src, window.location.href).origin
  } catch (error) {
    return
  }

  var loader = document.createElement('script')
  loader.src = origin + '/embed/v1/frame.js'
  loader.async = true

  // Carry the configuration across, so the agency writes it once on the tag
  // they pasted and the versioned file reads it from the tag it is on.
  for (var i = 0; i < me.attributes.length; i += 1) {
    var attribute = me.attributes[i]
    if (attribute.name.indexOf('data-') === 0) {
      loader.setAttribute(attribute.name, attribute.value)
    }
  }

  ;(document.head || document.documentElement).appendChild(loader)
})()
