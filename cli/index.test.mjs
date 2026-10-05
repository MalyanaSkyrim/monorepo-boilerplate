import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  applyReplacements,
  buildReplacements,
  deriveNames,
  toDisplayName,
  toSlug,
} from './index.mjs'

test('derives every name from the project name', () => {
  const names = deriveNames({ slug: toSlug('My Cool_App') })
  assert.equal(names.slug, 'my-cool-app')
  assert.equal(names.display, 'My Cool App')
  assert.equal(names.pascal, 'MyCoolApp')
  assert.equal(names.scope, 'my-cool-app')
  assert.equal(names.bundleId, 'com.example.mycoolapp')
  assert.equal(names.snake, 'my_cool_app')
})

test('bundle id segment never starts with a digit', () => {
  assert.equal(
    deriveNames({ slug: '42-labs' }).bundleId,
    'com.example.app42labs',
  )
})

test('honors explicit overrides', () => {
  const names = deriveNames({
    slug: 'acme',
    displayName: 'Acme Cloud',
    scope: '@acme-co',
    bundleId: 'io.acme.mobile',
  })
  assert.equal(names.display, 'Acme Cloud')
  assert.equal(names.pascal, 'AcmeCloud')
  assert.equal(names.scope, 'acme-co')
  assert.equal(names.bundleId, 'io.acme.mobile')
})

test('rewrites template placeholders', () => {
  const replacements = buildReplacements(deriveNames({ slug: 'my-app' }))
  const input = [
    '"name": "app-boilerplate"',
    "displayName: 'App Boilerplate'",
    'ios/AppBoilerplate.xcodeproj',
    'com.example.app.staging',
    "import { brand } from '@app/common'",
    'localhost:26259/app_dev?sslmode=disable',
    'apps/api and app_development stay as they are',
  ].join('\n')
  assert.equal(
    applyReplacements(input, replacements),
    [
      '"name": "my-app"',
      "displayName: 'My App'",
      'ios/MyApp.xcodeproj',
      'com.example.myapp.staging',
      "import { brand } from '@my-app/common'",
      'localhost:26259/my_app_dev?sslmode=disable',
      'apps/api and app_development stay as they are',
    ].join('\n'),
  )
})

test('display name title-cases slug words', () => {
  assert.equal(toDisplayName('hello-world'), 'Hello World')
})
