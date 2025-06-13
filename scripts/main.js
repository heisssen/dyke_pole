import { DykePoleActor } from "./documents/actor.js";
import { DykePoleCharacterSheet } from "./sheets/character-sheet.js";
import { DykePoleCampSheet } from "./sheets/camp-sheet.js";
import { DykePoleItemSheet } from "./sheets/item-sheet.js";
import { DykePoleAspectSheet } from "./sheets/aspect-sheet.js";

Hooks.once('init', async function() {
  console.log('Dyke Pole | Initializing Dyke Pole System');

  CONFIG.Actor.documentClass = DykePoleActor;

  const templatePaths = [
    'systems/dyke-pole/templates/actor/character-sheet.html',
    'systems/dyke-pole/templates/actor/camp-sheet.html',
    'systems/dyke-pole/templates/chat/roll-card.html',
    'systems/dyke-pole/templates/chat/rating-roll-card.html',
    'systems/dyke-pole/templates/item/item-sheet.html',
    'systems/dyke-pole/templates/item/aspect-sheet.html'
  ];
  loadTemplates(templatePaths);

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("dyke-pole", DykePoleCharacterSheet, { 
    types: ["character"], 
    makeDefault: true,
    label: "Аркуш персонажа Дикого Поля"
  });
  Actors.registerSheet("dyke-pole", DykePoleCampSheet, {
    types: ["camp"],
    makeDefault: true,
    label: "Аркуш Табору Дикого Поля"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("dyke-pole", DykePoleItemSheet, {
    makeDefault: true,
    label: "Базовий аркуш предмету"
  });
  Items.registerSheet("dyke-pole", DykePoleAspectSheet, {
    types: ["aspect"],
    makeDefault: true,
    label: "Аркуш Аспекту"
  });
});