  Hooks.on("renderActorDirectory", (app, html, data) => {
    // Create the button
    const generateButton = $(
      `<button class="v5e-generate-character"><i class="fas fa-dice-d20"></i> Generate V5E Character</button>`
    );
  
    // Add it to the bottom of the directory
    html.find(".directory-footer").append(generateButton);
  
    // Handle the button click
    generateButton.on("click", () => {
      showGeneratorDialog();
    });
  });
  
  
  function showGeneratorDialog() {
    const content = `
    <div class="generator-dialog">
      <h2>Vampire 5e Character Generator</h2>
      <div class="form-group">
        <label for="clan">Choose Clan</label>
        <select id="clan">
          <option value="Thin-Blood">Thin-Blood</option>
          <option value="Brujah">Brujah</option>
          <option value="Ventrue">Ventrue</option>
          <option value="Toreador">Toreador</option>
          <option value="Gangrel">Gangrel</option>
          <option value="Malkavian">Malkavian</option>
          <option value="Nosferatu">Nosferatu</option>
          <option value="Tremere">Tremere</option>
          <option value="Banu Haqim">Banu Haqim</option>
          <option value="Lasombra">Lasombra</option>
          <option value="Tzimisce">Tzimisce</option>
          <option value="Ravnos">Ravnos</option>
          <option value="Giovanni">Giovanni</option>
          <option value="Setite">Setite</option>
        </select>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="random-clan" name="random-clan" />
          Random Clan
        </label>
      </div>
  
      <label for="generation">Choose Generation:</label>
      <select id="generation">
        <option value="13">13th</option>
        <option value="12">12th</option>
        <option value="11">11th</option>
        <option value="10">10th</option>
        <option value="9">9th</option>
        <option value="8">8th</option>
        <option value="7">7th</option>
        <option value="6">6th</option>
        <option value="5">5th</option>
        <option value="4">4th</option>
        <option value="3">3rd</option>
      </select>
    </div>
  
    <div class="form-group">
      <label>Extra Disciplines Mode:</label><br>
      <label><input type="radio" name="discipline-mode" value="manual" checked /> Manual</label>
      <label><input type="radio" name="discipline-mode" value="random" /> Random</label>
    </div>
  
    <div class="form-group" id="manual-discipline-group">
      <label for="additional-disciplines">Select Extra Disciplines</label>
      <select id="additional-disciplines" multiple>
        <option value="Animalism">Animalism</option>
        <option value="Auspex">Auspex</option>
        <option value="Celerity">Celerity</option>
        <option value="Dominate">Dominate</option>
        <option value="Fortitude">Fortitude</option>
        <option value="Obfuscate">Obfuscate</option>
        <option value="Oblivion">Oblivion</option>
        <option value="Potence">Potence</option>
        <option value="Presence">Presence</option>
        <option value="Protean">Protean</option>
        <option value="Sorcery">Sorcery</option>
        <option value="Alchemy">Alchemy</option>
      </select>
      <small>Hold Ctrl or Cmd to select multiple disciplines.</small>
    </div>
  
    <div class="form-group" id="random-discipline-count" style="display: none;">
      <label for="random-extra-count">Number of Random Extra Disciplines</label>
      <select id="random-extra-count">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </div>
  
    <div>
      <label for="mortal-type">Mortal Type:</label>
      <select id="mortal-type">
        <option value="none">None</option>
        <option value="weak">Weak Mortal</option>
        <option value="average">Average Mortal</option>
        <option value="gifted">Gifted Mortal</optiondi>
        <option value="deadly">Deadly Mortal</option>
      </select>
    </div>
  `;
  
  
  
    new Dialog({
        title: "V5E Character Generator",
        content,
        buttons: {
          generate: {
            icon: "<i class='fas fa-dice'></i>",
            label: "Generate",
            callback: html => {
              //const clan = html.find("#clan").val();
              // Toggle visibility of manual vs random input boxes
              $(document).on("change", "input[name='discipline-mode']", function () {
                const mode = $(this).val();
                $("#manual-discipline-group").toggle(mode === "manual");
                $("#random-discipline-count").toggle(mode === "random");
              });
              const useRandomClan = html.find("#random-clan").is(":checked");
              const selectedType = document.getElementById("mortal-type").value;
              

              const generator = new VampireCharacterGenerator();
              const clan = useRandomClan ? generator.generateClan() : html.find("#clan").val();

              const generation = parseInt(html.find("#generation").val());
    
         
// Step 2: In the callback, determine mode and values
const disciplineMode = html.find("input[name='discipline-mode']:checked").val();
let selectedExtras = [];

if (disciplineMode === "manual") {
  selectedExtras = Array.from(html.find("#additional-disciplines")[0].selectedOptions).map(opt => opt.value);
} else {
  const randomCount = parseInt(html.find("#random-extra-count").val());
  const allDisciplines = [
    "Animalism", "Auspex", "Celerity", "Dominate", "Fortitude",
    "Obfuscate", "Oblivion", "Potence", "Presence", "Protean",
    "Sorcery", "Alchemy"
  ];
  const clan = html.find("#clan").val();
  const base = (new VampireCharacterGenerator()).clanDiscipline[clan] || [];
  const pool = allDisciplines.filter(d => !base.includes(d));
  selectedExtras = [...pool.sort(() => 0.5 - Math.random()).slice(0, randomCount)];
}

// Step 3: Generate with selected extras
const character = generator.generateCharacter(clan, generation, selectedExtras);
/////////////////////////////////////
              applyMortalType(selectedType, character.attributes, character.skills);
    
              createActorInFoundry(character);
            }
          },
          cancel: {
            label: "Cancel"
          }
        },
        default: "generate"
      }).render(true);
    }


    async function createActorInFoundry(character) {
        const actorData = {
          name: `${character.clan} Character`,
          type: "vampire",
          system: {
            disciplines: character.Discipline.reduce((acc, d) => {
              acc[d.toLowerCase()] = { value: character.disciplineDots?.[d] || 1 };
              return acc;
            }, {}),
            headers: {
                sire: character.sire,
                generation: character.generation,
                concept:"my concept",
                chronicle:"chronicles de giovanni",
                ambition:"",
                desire:"",
                touchstones:"",
                tenets:""
            },
            blood: {
                potency: character.bloodPotency,
                resonance: character.resonance
              }, 
            
              features: {
                background: [],
                merit: character.merits,
                flaw: [],
                boon: []
              },
            flaws: character.flaws,
            attributes: {},
            skills: {},
            biography: {
                /*value: `
                      <p><strong>Clan:</strong> ${character.clan}</p>
                      <p><strong>Generation:</strong> ${character.generation}th</p>
                      <p><strong>Blood Potency:</strong> ${character.bloodPotency}</p>
                      ${character.isThinBlood ? "<p><em>This character is Thin-Blooded and may use Thin-Blood Alchemy.</em></p>" : ""}
                      ${character.Discipline.length > 0 ? `<h4>Discipline</h4><ul>${character.Discipline.map(d => `<li>${d}</li>`).join("")}</ul>` : ""}
                      <h4>Merits</h4>
                      <ul>${character.merits.map(m => `<li>${m}</li>`).join("")}</ul>
                      <h4>Flaws</h4>
                      <ul>${character.flaws.map(f => `<li>${f}</li>`).join("")}</ul>
                      ${character.alchemy?.length ? `<h4>Thin-Blood Alchemy</h4><ul>${character.alchemy.map(a => `<li>${a}</li>`).join("")}</ul>` : ""}
                `*/
              }
          }
        };

        const clanItem = {
            name: character.clan,
            type: "clan",
            system: {
              // You can fill in real clan data here if you want
              clan: character.clan.toLowerCase(),
              bane: "",
              compulsion: "",
              // etc.
            }
          };

  // Correct discipline item generation
let levels = [3, 2, 1]; // Example levels
const disciplineItems = character.Discipline.map((discipline, i) => ({
  name: discipline,
  type: "power", // or "trait", depending on your system
  system: {
    level: levels[i] || 1,
    discipline: discipline.toLowerCase() // If needed for your system
  }
}));


        for (const [attr, val] of Object.entries(character.attributes)) {
          actorData.system.attributes[attr.toLowerCase()] = { value: val };
        }
      
        for (const [skill, val] of Object.entries(character.skills)) {
          actorData.system.skills[skill.toLowerCase()] = { value: val };
        }
      
        const actor = await Actor.create(actorData);
        ui.notifications.info(`Created character: ${actor.name}`);
        actor.sheet.render(true);
        await actor.createEmbeddedDocuments("Item", [clanItem]);    
        
        // Create all discipline items at once
      //  await actor.createEmbeddedDocuments("Item", disciplineItems);

////////////////////////////////////////////////////
const disciplineNames = character.Discipline.map(d => d.toLowerCase());

// Scale power level cap by generation
const generation = character.generation || 13;  // Default to Gen 13 if missing
const generationToMaxLevel = gen => {
  if (gen <= 4) return 8;
  if (gen <= 5) return 7;
  if (gen <= 6) return 6;
  if (gen <= 7) return 5;
  if (gen <= 9) return 4;
  if (gen <= 12) return 3;
  return 2;
};
const maxLevel = generationToMaxLevel(generation);
const minLevel = 1;
const maxPowersPerDiscipline = maxLevel; // 👈 Set your limit here

// Find the "Discipline" folder
const rootFolder = game.folders.find(f =>
  f.name === "Discipline" &&
  (f.type === "Item" || f.type === "item")
);

if (!rootFolder) {
  ui.notifications.error("⚠️ Could not find folder named 'Discipline'");
  return;
}

// 2. Collect all powers directly from all child folders (.entries)
const allPowers = rootFolder.children.flatMap(folder =>
  (folder.entries || []).filter(item =>
    item.type === "power" &&
    item.system?.level >= minLevel &&
    item.system?.level <= maxLevel
  )
);

// 3. Pick powers per discipline (limit and filter)
const selectedPowers = [];

for (let discipline of disciplineNames) {
  const matching = allPowers.filter(item =>
    item.system?.discipline?.toLowerCase() === discipline ||
    item.name.toLowerCase().includes(discipline)
  );

  // Shuffle and pick N
  const shuffled = matching.sort(() => 0.5 - Math.random());
  const picked = shuffled.slice(0, maxPowersPerDiscipline);

  for (let item of picked) {
    const data = item.toObject();
    data.flags = data.flags || {};
    data.flags.discipline = discipline;
    data.system = data.system || {};
    data.system.visible = true;
    selectedPowers.push(data);
  }
}

// 3. Filter the powers matching the selected disciplines

// 4. Avoid duplicates and add to actor
const existingNames = actor.items.map(i => i.name);
const uniquePowers = selectedPowers.filter(p => !existingNames.includes(p.name));

await actor.createEmbeddedDocuments("Item", uniquePowers);
ui.notifications.info(`✅ Added ${uniquePowers.length} scaled powers to ${actor.name} (Gen ${generation})`);
}

/////////////////////////////////////////

class VampireCharacterGenerator {
    constructor() {
        this.clans = ["Thin-Blood","Brujah", "Ventrue", "Toreador", "Gangrel", "Malkavian", "Nosferatu", "Tremere", "Banu Haqim", "Lasombra", "Tzimisce", "Ravnos", "Giovanni", "Setite"];
        this.attributes = ["Strength", "Dexterity", "Stamina", "Charisma", "Manipulation", "Composure", "Intelligence", "Wits", "Resolve"];
        this.skills = ["Athletics", "Brawl", "Crafts", "Drive", "Firearms", "Larceny", "Melee", "Performance", "Persuasion", "Science", "Stealth", "Survival"];
        this.advantages = ["Sorcery", "Animalism", "Obfuscate", "Dominate", "Auspex", "Celerity", "Potence", "Fortitude"];
        this.merits = ["Allies", "Resources", "Herd", "Contacts", "Retainers", "Status"];
        this.flaws = ["Prey Exclusion", "Outsider", "Nightmares", "Enemy", "Short Fuse"];
        this.clanDiscipline = {
          "Thin-Blood": ["Alchemy"],
            Brujah: ["Celerity", "Potence", "Presence"],
            Ventrue: ["Dominate", "Fortitude", "Presence"],
            Toreador: ["Auspex", "Celerity", "Presence"],
            Gangrel: ["Animalism", "Fortitude", "Protean"],
            Malkavian: ["Auspex", "Dominate", "Obfuscate"],
            Nosferatu: ["Animalism", "Obfuscate", "Potence"],
            Tremere: ["Auspex", "Sorcery", "Dominate"],
            "Banu Haqim": ["Sorcery", "Celerity", "Obfuscate"],
            Lasombra: ["Dominate", "Oblivion", "Potence"],
            Tzimisce: ["Animalism", "Oblivion", "Protean"],
            Ravnos: ["Animalism", "Obfuscate", "Presence"],
            Giovanni: ["Dominate", "Fortitude", "Oblivion"],
            Setite: ["Obfuscate", "Presence", "Protean"]
          };
          this.thinBloodAlchemy = ["Distillation of Vitae", "Binding the Beast", "Crimson Sentinels"];
    }

    // Randomly select a Clan
    generateClan() {
        return this.clans[Math.floor(Math.random() * this.clans.length)];
    }

    getBloodPotencyFromGeneration(generation,isThinBlood = false) {
        if (isThinBlood) return 0;
        if (generation >= 13) return 1;
        if (generation === 12) return 1;
        if (generation === 11 || generation === 10) return 2;
        if (generation === 9 || generation === 8) return 3;
        if (generation === 7) return 4;
        if (generation === 6) return 5;
        if (generation === 5) return 6;
        if (generation === 4) return 7;
        if (generation === 3) return 8;
        return 1;
      }
    
    // Randomly allocate points to Attributes and Skills (following the V5 creation system)
    generateAttributes() {
        let attributes = {};
        let remainingPoints = 7; // Example for Attributes allocation
        this.attributes.forEach(attr => {
            attributes[attr] = Math.floor(Math.random() * (remainingPoints + 1));
            remainingPoints -= attributes[attr];
        });
        return attributes;
    }

    generateSkills() {
        let skills = {};
        let remainingPoints = 11; // Example for Skills allocation
        this.skills.forEach(skill => {
            skills[skill] = Math.floor(Math.random() * (remainingPoints + 1));
            remainingPoints -= skills[skill];
        });
        return skills;
    }

    generateMerits() {
        let merits = [];
        let numMerits = Math.floor(Math.random() * 3); // Randomly select between 1 and 3 merits
        for (let i = 0; i < numMerits; i++) {
            merits.push(this.merits[Math.floor(Math.random() * this.merits.length)]);
        }
        return merits;
    }

    generateFlaws() {
        let flaws = [];
        let numFlaws = Math.floor(Math.random() * 3); // Randomly select between 1 and 3 flaws
        for (let i = 0; i < numFlaws; i++) {
            flaws.push(this.flaws[Math.floor(Math.random() * this.flaws.length)]);
        }
        return flaws;
    }

    getDisciplineDotsByGeneration(generation, disciplines) {
      let totalDots = 4;  // Default
      if (generation >= 13) totalDots = 3;
      else if (generation === 12) totalDots = 4;
      else if (generation === 11 || generation === 10) totalDots = 6;
      else if (generation === 9 || generation === 8) totalDots = 7;
      else if (generation === 7 || generation === 6) totalDots = 8;
      else if (generation <= 5) totalDots = 12;
    
      const disciplineDots = {};
      const available = [...disciplines];
    
      // Assign descending dots (3, 2, 1, etc.)
      let dots = 5;
      while (totalDots > 0 && available.length > 0) {
        const discipline = available.shift();
        const assigned = Math.min(dots, totalDots);
        disciplineDots[discipline] = assigned;
        totalDots -= assigned;
        dots = Math.max(1, dots - 1);
      }
    
      // If any disciplines left unassigned, give 1
      for (const d of available) {
        if (!(d in disciplineDots)) disciplineDots[d] = 1;
      }
    
      return disciplineDots;
    }
    

    // The function to generate the entire character
    generateCharacter(clan, generation,extraDisciplines = []) {
      const getRandom = (list, count = 1) => {
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };
    
      const getRandomStats = (keys, maxPoints) => {
        const stats = {};
        let points = maxPoints;
        const pool = [...keys];
        while (points > 0 && pool.length > 0) {
          const key = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
          const val = Math.min(points, Math.ceil(Math.random() * 3));
          stats[key] = val;
          points -= val;
        }
        return stats;
      };
    
      const isThinBlood = clan === "Thin-Blood";
      const allDisciplines = [...new Set(this.advantages)];
      const availableDisciplines = this.clanDiscipline[clan] || [];
      //let Discipline = getRandom(availableDisciplines, Math.min(3, availableDisciplines.length));
      // Step 4: In generateCharacter(), merge as before
      const base = getRandom(availableDisciplines, Math.min(3, availableDisciplines.length));
      const Discipline = [...new Set([...base, ...extraDisciplines.filter(d => !base.includes(d))])];

      

   /////////////////////////////////////////////////     
      // Add extra disciplines not already included
if (extraDisciplines > 0) {
  const pool = allDisciplines.filter(d => !Discipline.includes(d));
  const extras = getRandom(pool, Math.min(extraDisciplines, pool.length));
  Discipline = [...Discipline, ...extras];

  
// Assume Discipline is an array of final selected disciplines
// Assign dots using a fixed or generation-scaled distribution


}
const disciplineDots = this.getDisciplineDotsByGeneration(generation, Discipline);
const merits = getRandom(this.merits, 2);
const flaws = getRandom(this.flaws, 2);
  /////////////////////////
      return {
        clan,
        generation,
        bloodPotency: this.getBloodPotencyFromGeneration(generation, isThinBlood),
        attributes: getRandomStats(this.attributes, 15),
        skills: getRandomStats(this.skills, 20),
        merits,
        flaws,
        Discipline,
        disciplineDots,
        isThinBlood
      };
    }
  }
    
 
    function  _updateSelectedDiscipline(actor, discipline) {
      // Variables yet to be defined
      const updatedData = {}
    
      // Make sure we actually have a discipline defined
      if (discipline && actor.system.disciplines[discipline]) {
        updatedData.disciplines ??= {}
        updatedData.disciplines[discipline] ??= {}
    
        // Update the selected disciplines
        updatedData.selectedDiscipline = discipline
        updatedData.disciplines[discipline].selected = true
      } else {
        // Revert to an empty string
        updatedData.selectedDiscipline = ''
      }
    
      // Unselect the previously selected discipline
    
      const previouslySelectedDiscipline = actor.system?.selectedDiscipline
      if (previouslySelectedDiscipline && previouslySelectedDiscipline !== discipline) {
        updatedData.disciplines[previouslySelectedDiscipline] ??= {}
        updatedData.disciplines[previouslySelectedDiscipline].selected = false
      }
    
      // Update the actor data
      actor.update({
        system: updatedData
      })
    }

    function _updateSelectedDisciplinePower(actor, power) {
      // Variables yet to be defined
      const updatedData = {}
    
      // Make sure we actually have a valid power defined
      if (power && actor.items.get(power)) {
        const powerItem = actor.items.get(power)
        const discipline = powerItem.system.discipline
    
        // Update the selected power
        updatedData.selectedDisciplinePower = power
        powerItem.update({
          system: {
            selected: true
          }
        })
            // Update the selected disciplines
            _updateSelectedDiscipline(actor, discipline)
          } else {
            // Revert to an empty string
            updatedData.selectedDisciplinePower = ''
          }
        
          // Unselect the previously selected power
          const previouslySelectedPower = actor.system?.selectedDisciplinePower
          if (previouslySelectedPower && actor.items.get(previouslySelectedPower) && previouslySelectedPower !== power) {
            actor.items.get(previouslySelectedPower).update({
              system: {
                selected: false
              }
            })
          }
        
          // Update the actor data
          actor.update({
            system: updatedData
          })
    }

    function applyMortalType(type, attributes, skills) {
      // Helper to apply dots
      function setDots(target, distribution, specialties = []) {
        let keys = Object.keys(target);
        let index = 0;
    
        for (let dots of distribution) {
          if (index >= keys.length) break;
          target[keys[index]] = dots;
          index++;
        }
    
        specialties.forEach(spec => {
          if (target[spec]) {
            target[spec + "_specialty"] = true;
          }
        });
      }
    
      switch (type) {
        case "weak":
          setDots(attributes, [2, 2, 1, 1, 1, 1, 1, 1, 1]);
          setDots(skills, [3, 2, 1, 1, 1, 1, 1]);
          break;
        case "average":
          setDots(attributes, [3, 3, 2, 1, 1, 1, 1, 1, 1]);
          setDots(skills, [3, 3, 2, 2, 1, 1, 1]);
          break;
        case "gifted":
          setDots(attributes, [4, 3, 3, 2, 2, 1, 1, 1, 1]);
          setDots(skills, [4, 4, 3, 3, 2, 2, 1]);
          break;
        case "deadly":
          setDots(attributes, [5, 5, 4, 3, 3, 2, 2, 2, 2]);
          setDots(skills, [5, 5, 4, 4, 3, 3, 2]);//, ['one', 'two', 'three']); // replace with real keys
          break;
        default:
          break;
      }
    }
    

// Example of usage:

const generator = new VampireCharacterGenerator();
const newCharacter = generator.generateCharacter();
console.log(newCharacter);
