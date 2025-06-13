export class DykePoleActor extends Actor {
  
  async rollAction(skillKey, { advantage = 0, cut = 0, impact = "normal" } = {}) {
    const skillValue = this.system.skills[skillKey] || 0;
    const dicePool = skillValue + advantage;

    const rollFormula = dicePool > 0 ? `${dicePool}d6` : "1d6";
    const roll = new Roll(rollFormula);
    await roll.evaluate({async: true});

    let originalResults = [];
    roll.dice[0].results.forEach(die => { originalResults.push(die.result); });

    let finalResults = [...originalResults].sort((a, b) => b - a);
    
    // Logic for "Зріз" 
    if (cut > 0 && finalResults.length > 0) {
      finalResults = finalResults.slice(cut);
    }
    
    let highestResult = finalResults.length > 0 ? finalResults[0] : 0;
    
    // Logic for "Твіст" 
    const hasTwist = new Set(originalResults).size !== originalResults.length;

    let resultText = "";
    let resultClass = "";
    let baseMarks = 0;

    // Determine roll outcome 
    if (dicePool === 0) { // Rule for rolling without dice 
      baseMarks = (highestResult >= 4) ? 1 : 0;
      resultText = (highestResult >= 4) ? game.i18n.localize("DYKEPOLE.Conflict") : game.i18n.localize("DYKEPOLE.Mishap");
      resultClass = (highestResult >= 4) ? "conflict" : "mishap";
    } else {
      if (highestResult === 6) {
          baseMarks = 2;
          resultText = game.i18n.localize("DYKEPOLE.Triumph");
          resultClass = "triumph";
      } else if (highestResult >= 4) {
          baseMarks = 1;
          resultText = game.i18n.localize("DYKEPOLE.Conflict");
          resultClass = "conflict";
      } else {
          baseMarks = 0;
          resultText = game.i18n.localize("DYKEPOLE.Mishap");
          resultClass = "mishap";
      }
    }
    
    // Logic for "Вплив" 
    let finalMarks = baseMarks;
    switch(impact) {
      case 'low': finalMarks = Math.max(0, baseMarks - 1); break;
      case 'high': finalMarks = baseMarks + 1; break;
      case 'massive': finalMarks = 99; break;
    }

    const chatData = {
      skillName: game.i18n.localize(`DYKEPOLE.Skill${skillKey.charAt(0).toUpperCase() + skillKey.slice(1)}`),
      resultText: resultText,
      resultClass: resultClass,
      hasTwist: hasTwist,
      rollFormula: roll.formula,
      rollResults: originalResults,
      finalMarks: finalMarks,
      impact: impact,
      cut: cut
    };
    
    const content = await renderTemplate("systems/dyke-pole/templates/chat/roll-card.html", chatData);
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: roll
    });
  }

  async rollCampRating(ratingKey, advantage = 0) {
    const ratingValue = this.system.ratings[ratingKey]?.value || 0;
    // Dice pool logic 
    const dicePool = ratingValue + advantage;
    
    if (dicePool <= 0) {
      ui.notifications.warn("Рейтинг табору та переваги дорівнюють нулю. Кидок неможливий.");
      return;
    }

    const rollFormula = `${dicePool}d6`;
    const roll = new Roll(rollFormula);
    await roll.evaluate({async: true});

    let highestResult = 0;
    roll.dice[0].results.forEach(die => { if (die.result > highestResult) { highestResult = die.result; } });

    // Outcome logic is the same as for action rolls 
    let resultText = "";
    if (highestResult === 6) { resultText = "Тріумф"; } 
    else if (highestResult >= 4) { resultText = "Конфлікт"; } 
    else { resultText = "Лихо"; }

    const chatData = {
      ratingName: game.i18n.localize(`DYKEPOLE.Rating${ratingKey.charAt(0).toUpperCase() + ratingKey.slice(1)}`),
      resultText: resultText,
      roll: roll
    };

    const content = await renderTemplate("systems/dyke-pole/templates/chat/rating-roll-card.html", chatData);
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: roll
    });
  }
}