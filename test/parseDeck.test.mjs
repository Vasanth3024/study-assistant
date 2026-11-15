import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDeck, BadOutputError } from '../src/lib/parseDeck.js';

const q = (over = {}) => ({ question: 'Capital of France?', options: ['Paris', 'Rome', 'Madrid', 'Berlin'], answerIndex: 0, explanation: 'Paris.', ...over });
const wrap = (...questions) => JSON.stringify({ title: 'T', questions });
const correctText = (deck, i = 0) => deck.questions[i].options[deck.questions[i].answerIndex];

test('parses clean JSON and keeps the right answer after shuffling', () => {
  const d = parseDeck(wrap(q()));
  assert.equal(correctText(d), 'Paris');
  assert.equal(d.skipped, 0);
});

test('accepts ```json fenced output and prose around the object', () => {
  assert.equal(parseDeck('```json\n' + wrap(q()) + '\n```').questions.length, 1);
  assert.equal(parseDeck('Sure! Here you go:\n' + wrap(q()) + '\nHope that helps.').questions.length, 1);
});

test('malformed JSON throws BadOutputError(malformed)', () => {
  assert.throws(() => parseDeck('{"questions": [oops'), (e) => e instanceof BadOutputError && e.code === 'malformed');
});

test('wrong shape and empty list are rejected', () => {
  assert.throws(() => parseDeck('{"cards": 5}'), (e) => e.code === 'wrong_shape');
  assert.throws(() => parseDeck('{"questions": []}'), (e) => e.code === 'empty');
});

test('drops unusable questions but keeps good ones', () => {
  const d = parseDeck(wrap(q(), q({ answerIndex: 9 }), q({ options: ['only one'] }), null, q({ question: '' })));
  assert.equal(d.questions.length, 1);
  assert.equal(d.skipped, 4);
});

test('all questions unusable -> error', () => {
  assert.throws(() => parseDeck(wrap(q({ answerIndex: -1 }))), (e) => e.code === 'wrong_shape');
});

test('falls back to an "answer" string when answerIndex is missing', () => {
  const d = parseDeck(wrap(q({ answerIndex: undefined, answer: 'rome' })));
  assert.equal(correctText(d), 'Rome');
});

test('duplicate options do not shift the correct answer', () => {
  const d = parseDeck(wrap(q({ options: ['Rome', 'Rome', 'Paris', 'Berlin'], answerIndex: 2 })));
  assert.equal(correctText(d), 'Paris');
  assert.equal(d.questions[0].options.length, 3);
});
