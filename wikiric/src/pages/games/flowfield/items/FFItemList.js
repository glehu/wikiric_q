/*
 * Copyright (c) 2024.
 * Module FFItemList.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import FFItem from 'pages/games/flowfield/items/FFItem'
import FFItemEffect from 'pages/games/flowfield/items/FFItemEffect'

class FFItemList {
  constructor () {
    this.version = 1
    this.categories = {
      /**
       * @type FFItem[]
       */
      starter: []
    }
  }

  initiateStarterItems () {
    let item
    let effect
    /**
     * STARTER ITEM: HEALTH
     * @type {FFItem}
     */
    item = new FFItem(
      0,
      1,
      'Health',
      'Increases the player\'s health.')
    effect = new FFItemEffect(
      'hp',
      50,
      50,
      0,
      false,
      true)
    item.effects.push(effect)
    this.categories.starter.push(item)
    /**
     * STARTER ITEM: SPEED
     * @type {FFItem}
     */
    item = new FFItem(
      0,
      1,
      'Speed',
      'Increases the player\'s movement speed.')
    effect = new FFItemEffect(
      'speed',
      0.2,
      0.2,
      0,
      false,
      true)
    item.effects.push(effect)
    this.categories.starter.push(item)
    /**
     * STARTER ITEM: ARMOR
     * @type {FFItem}
     */
    item = new FFItem(
      0,
      1,
      'Armor',
      'Increases the player\'s resistance to damage.')
    effect = new FFItemEffect(
      'armor',
      2,
      2,
      0,
      false,
      true)
    item.effects.push(effect)
    this.categories.starter.push(item)
  }
}

export default FFItemList
