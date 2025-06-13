import { DykePoleActor } from "./documents/actor.js";
import { DykePoleCharacterSheet } from "./sheets/character-sheet.js";
import { DykePoleCampSheet } from "./sheets/camp-sheet.js";
import { DykePoleItemSheet } from "./sheets/item-sheet.js";
import { DykePoleAspectSheet } from "./sheets/aspect-sheet.js";

Hooks.once('init', async function() {
  console.log('Dyke Pole | Initializing Dyke Pole System');

  // Реєстрація класу актора
  CONFIG.Actor.documentClass = DykePoleActor;

  // Попереднє завантаження шаблонів
  const templatePaths = [
    'systems/dyke-pole/templates/actor/character-sheet.html',
    'systems/dyke-pole/templates/actor/camp-sheet.html',
    'systems/dyke-pole/templates/chat/roll-card.html',
    'systems/dyke-pole/templates/chat/rating-roll-card.html',
    'systems/dyke-pole/templates/item/item-sheet.html',
    'systems/dyke-pole/templates/item/aspect-sheet.html'
  ];
  
  try {
    await loadTemplates(templatePaths);
    console.log('Dyke Pole | Templates loaded successfully');
  } catch (error) {
    console.error('Dyke Pole | Error loading templates:', error);
  }

  // Реєстрація аркушів акторів
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

  // Реєстрація аркушів предметів
  Items.unregisterSheet("core", ItemSheet);
  
  Items.registerSheet("dyke-pole", DykePoleItemSheet, {
    types: ["equipment", "shard", "map", "injury", "bonus", "faction"],
    makeDefault: true,
    label: "Базовий аркуш предмету"
  });
  
  Items.registerSheet("dyke-pole", DykePoleAspectSheet, {
    types: ["aspect"],
    makeDefault: true,
    label: "Аркуш Аспекту"
  });

  console.log('Dyke Pole | System initialization complete');
});

// Додатковий хук для готовності системи
Hooks.once('ready', async function() {
  console.log('Dyke Pole | System ready');
});

// Хук для обробки помилок (опціонально)
Hooks.on('error', (origin, error) => {
  if (origin.includes('dyke-pole')) {
    console.error('Dyke Pole | System Error:', error);
  }
});