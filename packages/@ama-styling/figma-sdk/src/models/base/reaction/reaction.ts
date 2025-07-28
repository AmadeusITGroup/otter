/**
 * Model: Reaction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { User } from '../user';

/**
 * A reaction left by a user.
 */
export interface Reaction {
  /** @see User */
  user: User;
  /** The emoji type of reaction as shortcode (e.g. `:heart:`, `:+1::skin-tone-2:`). The list of accepted emoji shortcodes can be found in [this file](https://raw.githubusercontent.com/missive/emoji-mart/main/packages/emoji-mart-data/sets/14/native.json) under the top-level emojis and aliases fields, with optional skin tone modifiers when applicable. */
  emoji: string;
  /** The UTC ISO 8601 time at which the reaction was left. */
  created_at: string;
}


