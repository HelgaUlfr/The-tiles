// development/pronouns.js

export const pronounSets = {
    male:    ["he", "his", "him", "his", "himself"],
    female:  ["she", "her", "her", "hers", "herself"],
    nonbinary: ["they", "their", "them", "theirs", "themself"],
    unknown: ["they", "their", "them", "theirs", "themself"]
};

export function getPronounSet(gender, plural = false) {
    if (plural) return pronounSets["nonbinary"];
    gender = (gender || 'unknown').toLowerCase();
    if (!['male', 'female', 'nonbinary'].includes(gender)) gender = 'unknown';
    return pronounSets[gender];
}

export function applyPronouns(line, gender, plural = false) {
    const set = getPronounSet(gender, plural);
    // Replace GENDER1-GENDER5 with correct pronoun
    return line.replace(/GENDER([1-5])/g, (_, n) => set[parseInt(n)-1]);
}

// Utility to replace (feet) with the furry's feet type
export function applyFeet(line, feet) {
    return line.replace(/\(feet\)/gi, feet || 'feet');
}

// Utility to replace (fingers) with the furry's finger type
export function applyFingers(line, fingers) {
    return line.replace(/\(fingers\)/gi, fingers || 'fingers');
}

//Utility to replace (mouth) with the furry's mouth type
export function applyMouth(line, mouth) {
    return line.replace(/\(mouth\)/gi, mouth || 'mouth');
}

//Utility to replace (tail) with the furry's tail type
export function filterTailLines(lines, tail) {
    if (!tail || tail === 'none') {
        // Exclude lines that reference (tail) or ${tail}
        return lines.filter(line => !(/\(tail\)|\$\{tail\}/i.test(line)));
    }
    return lines;
}

//Utility to replace (skin) with the furry's skin type
export function applySkin(line, skin) {
    return line.replace(/\(skin\)/gi, skin || 'skin');
}
