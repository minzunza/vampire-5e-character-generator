const newCharacterData = generator.generateCharacter();

// Create a new actor (character)
let actorData = {
    name: newCharacterData.clan + " Character",
    type: "character",
    data: {
        attributes: {
            strength: newCharacterData.attributes.Strength,
            dexterity: newCharacterData.attributes.Dexterity,
            // Add all the attributes
        },
        skills: newCharacterData.skills,
        merits: newCharacterData.merits,
        flaws: newCharacterData.flaws,
    }
};

// Create the new actor in Foundry
Actor.create(actorData).then(actor => {
    console.log("New Vampire 5e character created:", actor);
});
