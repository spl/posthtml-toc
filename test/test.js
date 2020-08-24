'use strict'

const test = require('ava')
const plugin = require('..')
const { readFileSync } = require('fs')
const path = require('path')
const posthtml = require('posthtml')
const fixtures = path.join(__dirname, 'fixtures')

test(`invalid 'options.after' throws error`, (t) => {
  invalidOptions(t, { after: 5 }, `unexpected 'options.after': 5`)
})

test(`invalid 'options.title' throws error`, (t) => {
  invalidOptions(t, { title: null }, `unexpected 'options.title': null`)
})

test(`invalid 'options.toggle' throws error`, (t) => {
  invalidOptions(t, { toggle: ['hide', true] }, `unexpected 'options.toggle': hide,true`)
})

test(`invalid 'options.ignoreMissingSelector' throws error`, (t) => {
  invalidOptions(t, { ignoreMissingSelector: 42 }, `unexpected 'options.ignoreMissingSelector': 42`)
})

test('basic', (t) => {
  return compare(t, 'basic')
})

test('toggle', (t) => {
  return compare(t, 'toggle', { after: 'p', title: 'Test', toggle: ['show', 'hide'] })
})

test('class', (t) => {
  return compare(t, 'class', { after: '.p' })
})

test('id', (t) => {
  return compare(t, 'id', { after: '#p' })
})

test('oncetitle', (t) => {
  return compare(t, 'oncetitle')
})

test('selector not found throws error', async (t) => {
  const e = await t.throwsAsync(posthtml([plugin()]).process())
  t.is(e.name, 'PostHtmlTocError')
  t.is(e.message, `selector not found: h1`)
})

test('ignoreMissingSelector does not throw error', (t) => {
  return compare(t, 'unchanged', { after: '#id-not-found', ignoreMissingSelector: true })
})

// const debug = function (html) {
//   const result = []
//   posthtml([function (tree) {
//     tree.match({ tag: 'a', attrs: { href: true } }, node => result.push(node.attrs.href))
//   }]).process(html, { sync: true })
//   return result.toString()
// }

function compare (t, name, options = {}) {
  const html = readFileSync(path.join(fixtures, `${name}.html`), 'utf8')
  const expected = readFileSync(path.join(fixtures, `${name}.expected.html`), 'utf8')

  return posthtml([plugin(options)])
    .process(html)
    .then((res) => {
      // console.log('res', debug(res.html))
      // console.log('exp', debug(expected))
      t.truthy(res.html === expected)
    })
}

function invalidOptions (t, options, message) {
  const e = t.throws(() => { plugin(options) })
  t.is(e.name, 'PostHtmlTocError')
  t.is(e.message, message)
}
