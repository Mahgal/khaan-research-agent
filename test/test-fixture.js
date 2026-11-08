const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test 1: default live mode is unchanged
async function testLiveMode() {
  process.env.FIXTURE_SOURCE_URL = '';
  process.argv = ['node', 'test'];
  const { research } = require('../lib/research.js');
  let events = [];
  const res = await research('test query', ev => events.push(ev));

  assert.strictEqual(res.sourceMode, 'live');
  assert.strictEqual(events[0].sourceMode, 'live');
  console.log('✓ testLiveMode passed');
}

// Test 2: fixture mode uses the fixture content and marks the receipt
async function testFixtureMode() {
  const fixFile = path.join(__dirname, 'fix.html');
  // Make the text long enough (>200 chars) to pass the filter in research.js
  let longText = 'Fixture content here. This is the fixture content sentence that is long enough to be extracted. ';
  longText += longText; longText += longText; longText += longText;
  fs.writeFileSync(fixFile, `<title>Fixture Title</title><p>${longText}</p>`);
  const fixtureUrl = 'file://' + fixFile;

  // Reload research to pick up the new env
  delete require.cache[require.resolve('../lib/research.js')];
  process.env.FIXTURE_SOURCE_URL = fixtureUrl;
  const { research } = require('../lib/research.js');

  let events = [];
  const res = await research('test query', ev => events.push(ev));

  assert.strictEqual(res.sourceMode, 'fixture');
  assert.strictEqual(events[0].sourceMode, 'fixture');

  const fetchEvent = events.find(e => e.step === 'fetch');
  assert(fetchEvent, 'fetch event should exist');
  assert.strictEqual(fetchEvent.receipt.sourceMode, 'fixture');
  assert.strictEqual(fetchEvent.ok, true);

  assert(res.sources.length > 0, 'Should have fetched the source');
  assert(res.sources[0].title === 'Fixture Title', 'Source title should match fixture');

  fs.unlinkSync(fixFile);
  console.log('✓ testFixtureMode passed');
}

// Test 3: fixture mode rejects a path outside the allowed fixture file
async function testRejectOutsidePath() {
  const fixFile = path.join(__dirname, 'fix2.html');
  fs.writeFileSync(fixFile, '<title>Fixture Title 2</title><p>Fixture content.</p>');

  const otherFile = path.join(__dirname, 'other.html');
  fs.writeFileSync(otherFile, '<title>Secret File</title><p>Secret content.</p>');

  const fixtureUrl = 'file://' + fixFile;
  const otherUrl = 'file://' + otherFile;

  // Directly run fetch.js via runSandbox to simulate injection
  const { runSandbox } = require('../lib/sandbox.js');

  // Try to fetch 'otherUrl' while 'fixtureUrl' is the allowed fixture
  const r = await runSandbox({
    cls: 'fetch',
    script: 'fetch.js',
    args: [otherUrl, fixtureUrl],
    timeoutMs: 10000,
    fixtureSource: fixtureUrl
  });

  let parsed = null;
  try { parsed = JSON.parse(r.stdout.trim().split('\n').pop()); } catch {}

  assert.strictEqual(parsed.ok, false);
  assert.strictEqual(parsed.error, 'fixture mode rejects a path outside the allowed fixture file');

  fs.unlinkSync(fixFile);
  fs.unlinkSync(otherFile);
  console.log('✓ testRejectOutsidePath passed');
}

(async () => {
  try {
    await testLiveMode();
    await testFixtureMode();
    await testRejectOutsidePath();
    console.log('All tests passed');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
