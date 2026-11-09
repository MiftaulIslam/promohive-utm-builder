import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addressOf, barsPath, buildUtm, channelOf, parseSlip, utmParts, UTM_EMPTY } from './logic.ts';

const utm = (url: string, more: Partial<typeof UTM_EMPTY> = {}) => buildUtm({ ...UTM_EMPTY, url, source: 'facebook', medium: 'paid_social', campaign: 'launch', ...more });

test('utm builds a link and adds https://', () => {
  const r = utm('a.com/p');
  assert.equal(r.link, 'https://a.com/p?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch');
  assert.deepEqual(r.notes, ['Added https:// to the start of the URL.']);
});

test('utm still notes real cleanup', () => {
  assert.deepEqual(utm('https://a.com', { campaign: 'App Launch' }).notes, ['campaign: “App Launch” becomes “app-launch” (lowercase, spaces as hyphens).']);
});

test('utm does not note a trailing space alone', () => {
  assert.deepEqual(utm('https://a.com', { source: 'facebook ' }).notes, []);
});

test('utm notes a kept query string even with a #fragment', () => {
  const r = utm('https://a.com/p?a=1&b=2#frag');
  assert.equal(r.link, 'https://a.com/p?a=1&b=2&utm_source=facebook&utm_medium=paid_social&utm_campaign=launch#frag');
  assert.deepEqual(r.notes, ['Kept the query string that was already on the URL.']);
});

test('utm notes a replaced utm_ parameter', () => {
  const r = utm('https://a.com/p?utm_source=old');
  assert.equal(r.link, 'https://a.com/p?utm_source=facebook&utm_medium=paid_social&utm_campaign=launch');
  assert.deepEqual(r.notes, ['Replaced the utm_source that was already on the URL.']);
});

test('utm with no query string gets no query note', () => {
  assert.deepEqual(utm('https://a.com/p').notes, []);
});

test('utm rejects an address without a dot and says what is missing', () => {
  const bad = utm('https://yourapp');
  assert.equal(bad.urlInvalid, true);
  assert.equal(bad.urlMsg, 'That does not look like a web address yet.');
  assert.equal(bad.waiting, 'Fix the URL to build the link.');
  assert.equal(buildUtm({ ...UTM_EMPTY, url: 'a.com', source: 'x' }).waiting, 'Still needed: utm_medium, utm_campaign.');
  assert.equal(buildUtm(UTM_EMPTY).waiting, 'Add the destination URL to start.');
});

test('utmParts stops a parameter at the #fragment', () => {
  const parts = utmParts('https://a.com/p?utm_source=x&utm_term=y#frag');
  assert.deepEqual(parts, ['https://a.com/p?', 'utm_source=x', '&', 'utm_term=y', '#frag']);
});

test('addressOf shows the host and path only', () => {
  assert.equal(addressOf(' yourapp.com/signup/?ref=home '), 'yourapp.com/signup');
  assert.equal(addressOf(''), '');
});

test('channelOf names a preset and shortens anything too long for the arc', () => {
  assert.equal(channelOf({ ...UTM_EMPTY, source: 'Google', medium: 'cpc' }), 'Google Ads');
  assert.equal(channelOf({ ...UTM_EMPTY, source: 'partner blog' }), 'partner-blog');
  assert.equal(channelOf({ ...UTM_EMPTY, source: 'a'.repeat(30) }), `${'a'.repeat(21)}…`);
});

test('parseSlip reads the campaign and route, and tolerates junk', () => {
  assert.deepEqual(parseSlip('https://a.com/?utm_source=x&utm_medium=y&utm_campaign=z'), { camp: 'z', route: 'x / y' });
  assert.deepEqual(parseSlip('not a url'), { camp: 'not a url', route: '' });
});

test('barsPath is one deterministic path that stays inside the box', () => {
  const d = barsPath('https://a.com/?utm_source=x');
  assert.equal(d, barsPath('https://a.com/?utm_source=x'));
  assert.notEqual(d, barsPath('https://a.com/?utm_source=y'));
  assert.equal(barsPath(''), '');
  const bars = [...d.matchAll(/M(\d+) 0h(\d+)v56h-\2z/g)];
  assert.equal(bars.map((m) => m[0]).join(''), d);
  assert.ok(bars.every((m) => Number(m[1]) + Number(m[2]) <= 160));
});
