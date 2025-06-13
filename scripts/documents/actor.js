export class DykePoleActor extends Actor {
  
  /**
   * Виконує кидок дії згідно з правилами "Дикого Поля"
   * @param {string} skillKey - Ключ навички (напр. "athletics")
   * @param {object} options - Опції для кидка
   * @param {number} options.advantage - Кількість переваг (додаткових кубиків)
   * @param {number} options.cut - Кількість зрізів (кісток, що прибираються)
   * @param {string} options.impact - Рівень впливу ("low", "normal", "high", "massive")
   */
  async rollAction(skillKey, { advantage = 0, cut = 0, impact = "normal" } = {}) {
    const skillValue = this.system.skills[skillKey] || 0;
    const dicePool = skillValue + advantage;
    const rollFormula = dicePool > 0 ? `${dicePool}d6` : "1d6";
    const roll = new Roll(rollFormula);
    await roll.evaluate({async: true});

    let originalResults = [];
    roll.dice[0].results.forEach(die => { originalResults.push(die.result); });
    let finalResults = [...originalResults].sort((a, b) => b - a);
    
    // Застосовуємо Зріз
    if (cut > 0 && finalResults.length > 0) {
      finalResults = finalResults.slice(cut);
    }
    
    let highestResult = finalResults.length > 0 ? finalResults[0] : 0;
    const hasTwist = new Set(originalResults).size !== originalResults.length;

    let resultText = "", resultClass = "", baseMarks = 0;

    // Визначаємо результат
    if (dicePool === 0) {
      baseMarks = (highestResult >= 4) ? 1 : 0;
      resultText = (highestResult >= 4) ? game.i18n.localize("DYKEPOLE.Conflict") : game.i18n.localize("DYKEPOLE.Mishap");
      resultClass = (highestResult >= 4) ? "conflict" : "mishap";
    } else {
      if (highestResult === 6) { baseMarks = 2; resultText = game.i18n.localize("DYKEPOLE.Triumph"); resultClass = "triumph"; } 
      else if (highestResult >= 4) { baseMarks = 1; resultText = game.i18n.localize("DYKEPOLE.Conflict"); resultClass = "conflict"; }
      else { baseMarks = 0; resultText = game.i18n.localize("DYKEPOLE.Mishap"); resultClass = "mishap"; }
    }
    
    // Застосовуємо Вплив
    let finalMarks = baseMarks;
    switch(impact) {
      case 'low': finalMarks = Math.max(0, baseMarks - 1); break;
      case 'high': finalMarks = baseMarks + 1; break;
      case 'massive': finalMarks = 99; break;
    }

    const chatData = {
      skillName: game.i18n.localize(`DYKEPOLE.Skill${foundry.utils.titleCase(skillKey)}`),
      resultText, resultClass, hasTwist, rollFormula,
      rollResults: originalResults, finalMarks, impact, cut
    };
    
    const content = await renderTemplate("systems/dyke-pole/templates/chat/roll-card.html", chatData);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content, roll });
  }

  /**
   * Виконує кидок рейтингу табору.
   */
  async rollCampRating(ratingKey, advantage = 0) {
    const ratingValue = this.system.ratings[ratingKey]?.value || 0;
    const dicePool = ratingValue + advantage;
    
    if (dicePool <= 0) { return ui.notifications.warn("Рейтинг табору та переваги дорівнюють нулю. Кидок неможливий."); }

    const rollFormula = `${dicePool}d6`;
    const roll = new Roll(rollFormula);
    await roll.evaluate({async: true});

    let highestResult = 0;
    const results = roll.dice[0].results.map(r => r.result);
    results.forEach(die => { if (die > highestResult) { highestResult = die; } });

    let resultText = "", resultClass = "";
    if (highestResult === 6) { resultText = game.i18n.localize("DYKEPOLE.Triumph"); resultClass = "triumph"; } 
    else if (highestResult >= 4) { resultText = game.i18n.localize("DYKEPOLE.Conflict"); resultClass = "conflict"; } 
    else { resultText = game.i18n.localize("DYKEPOLE.Mishap"); resultClass = "mishap"; }

    const chatData = {
      ratingName: game.i18n.localize(`DYKEPOLE.Rating${foundry.utils.titleCase(ratingKey)}`),
      resultText, resultClass, rollResults: results
    };
    
    const content = await renderTemplate("systems/dyke-pole/templates/chat/rating-roll-card.html", chatData);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content, roll });
  }
}