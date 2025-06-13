import { DykePoleActor } from "./documents/actor.js";
import { DykePoleCharacterSheet } from "./sheets/character-sheet.js";
import { DykePoleCampSheet } from "./sheets/camp-sheet.js";
import { DykePoleItemSheet } from "./sheets/item-sheet.js";
import { DykePoleAspectSheet } from "./sheets/aspect-sheet.js";

Hooks.once('init', async function() {
  console.log('Dyke Pole | Initializing Dyke Pole System');

  CONFIG.Actor.documentClass = DykePoleActor;

  // Реєстрація кастомного хелпера для циклів по числу
  Handlebars.registerHelper('numLoop', function(n, block) {
    let accum = '';
    for(let i = 0; i < n; ++i) {
      block.data.index = i;
      accum += block.fn(i);
    }
    return accum;
  });

  const templatePaths = [
    'systems/dyke-pole/templates/actor/character-sheet.html',
    'systems/dyke-pole/templates/actor/camp-sheet.html',
    'systems/dyke-pole/templates/chat/roll-card.html',
    'systems/dyke-pole/templates/chat/rating-roll-card.html',
    'systems/dyke-pole/templates/item/item-sheet.html',
    'systems/dyke-pole/templates/item/aspect-sheet.html'
  ];
  await loadTemplates(templatePaths);

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);
  
  Actors.registerSheet("dyke-pole", DykePoleCharacterSheet, { types: ["character"], makeDefault: true, label: "dyke-pole.CharacterSheet" });
  Actors.registerSheet("dyke-pole", DykePoleCampSheet, { types: ["camp"], makeDefault: true, label: "dyke-pole.CampSheet" });
  Items.registerSheet("dyke-pole", DykePoleItemSheet, { types: ["equipment", "shard", "map", "injury", "bonus", "faction"], makeDefault: true, label: "dyke-pole.ItemSheet" });
  Items.registerSheet("dyke-pole", DykePoleAspectSheet, { types: ["aspect"], makeDefault: true, label: "dyke-pole.AspectSheet" });

  console.log('Dyke Pole | System initialization complete');
});