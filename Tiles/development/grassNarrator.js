import { pronounSets, getPronounSet, applyPronouns, applyFeet } from './narratorSettings.js';

const NarratorLines = {
    tile: {
        grass: [
            "You tread softly across the lush grass.",
            "Grass cushions your steps as you wander.",
            "The scent of fresh grass fills the air.",
            "A gentle breeze sways the blades of grass around you.",
            "Dew sparkles on the grass beneath your feet.",
            "You hear the faint chirping of insects hidden in the grass.",
            "Sunlight warms the open grassy field.",
            "Tiny wildflowers peek out from the green expanse.",
            "Your footsteps leave a faint trail in the soft grass.",
            "A butterfly flutters past, landing briefly on a blade.",
            "The grass rustles quietly as you move.",
            "You spot a rabbit darting through the tall grass.",
            "The ground feels cool and springy underfoot.",
            "A patch of clover catches your eye among the grass.",
            "A cricket leaps away as you approach.",
            "You notice a spiderweb glistening between the blades.",
            "The grass is damp from a recent rain.",
            "You find a feather nestled in the grass.",
            "A gentle hum of bees fills the air.",
            "You pause to watch ants marching through the grass."
        ]
    },
    nonhostileEncounter: (name) => [
        `You spot a ${name} nibbling on wildflowers among the tall grass.`,
        `A gentle breeze parts the grass, revealing a ${name} sniffing at a patch of clover.`,
        `You notice a ${name} rolling playfully in a field dotted with yellow dandelions.`,
        `A ${name} pauses to scratch at the earth near a smooth, sun-warmed rock.`,
        `You see a ${name} weaving between tufts of grass, chasing a fluttering butterfly.`,
        `A ${name} lounges in a patch of soft moss, half-hidden by swaying grass blades.`,
        `You catch a glimpse of a ${name} peeking out from behind a cluster of wildflowers.`,
        `A ${name} sits atop a small mound, ears twitching as insects buzz nearby.`,
        `You watch as a ${name} leaps over a fallen stick, landing softly in the grass.`,
        `A ${name} sniffs curiously at a patch of dew-covered clover.`,
        `You nearly step on a ${name} camouflaged among the short grass and scattered pebbles.`,
        `A ${name} circles a patch of blooming daisies, tail flicking contentedly.`,
        `You see a ${name} basking in a sunlit clearing, surrounded by tall grass and wildflowers.`,
        `A ${name} pauses to watch a ladybug crawl along a blade of grass.`,
        `You notice a ${name} digging at the base of a weathered stone.`,
        `A ${name} sits quietly beneath a flowering bush, blending in with the greenery.`,
        `You spot a ${name} rolling in a patch of clover, sending petals flying.`,
        `A ${name} sniffs at a cluster of mushrooms growing in the shade of a large rock.`,
        `You catch a ${name} watching you from behind a tangle of tall grass and wildflowers.`,
        `A ${name} hops onto a flat stone, surveying the grassy field with bright eyes.`
    ],
    hostileBlock: [
        "A hostile furry creature blocks your path!",
        "Something snarls and refuses to let you pass.",
        "An angry furry creature stands in your way.",
        "A menacing growl warns you not to proceed.",
        "You are confronted by a hostile furry enemy.",
        "Sharp eyes glare at you, daring you to move forward.",
        "A creature bares its teeth, blocking your advance.",
        "You sense danger as something blocks your route.",
        "A hostile presence looms ahead, unmoving.",
        "You freeze as a creature steps into your path.",
        "A sudden snarl halts your progress.",
        "You are stopped by a threatening furry.",
        "A wild beast stands between you and your destination.",
        "A low growl rumbles from the shadows ahead.",
        "You cannot continue—something dangerous blocks the way.",
        "A hostile figure refuses to let you pass.",
        "You are forced to stop by a creature's aggressive stance.",
        "A pair of glowing eyes watches you, unblinking.",
        "A threatening furry paces in front of you.",
        "You hear a hiss as your path is blocked."
    ],
    hostileEncounter: (name) => [
        `A hostile ${name} bursts onto the scene, baring its teeth!`,
        `You are confronted by a ${name} with a menacing glare.`,
        `A sudden movement reveals a ${name} ready to attack!`,
        `You come face to face with a hostile ${name}, its eyes narrowed in aggression.`,
        `A ${name} blocks your path, growling fiercely.`,
        `You hear a snarl and spot a ${name} preparing to strike.`,
        `A ${name} emerges from the shadows, posture threatening.`,
        `You lock eyes with a ${name} that looks ready to pounce.`,
        `A ${name} circles you, keeping its distance but never breaking its hostile gaze.`,
        `You sense danger as a ${name} steps into your path.`,
        `A ${name} appears suddenly, startling you with its aggression.`,
        `You notice a ${name} watching you closely, muscles tensed for battle.`,
        `A ${name} stands before you, unmoving and clearly hostile.`,
        `You catch a glimpse of a ${name} stalking you from the shadows.`,
        `A ${name} lets out a warning growl, daring you to approach.`,
        `You are forced to stop as a ${name} blocks your way, ready to fight.`,
        `A ${name} paces in front of you, eyes never leaving your own.`,
        `You hear a hiss as a ${name} prepares to defend its territory.`,
        `A ${name} lunges forward, aggression clear in every movement.`,
        `You are surrounded by the hostile presence of a ${name}.`
    ],
    hungerTooLow: [
        "You are too hungry to do that.",
        "Your stomach rumbles, preventing you from acting.",
        "Hunger weakens you too much to continue.",
        "You feel faint from hunger and can't go on.",
        "Your body refuses to move without food.",
        "You lack the strength to continue in your current state.",
        "Your vision blurs as hunger overtakes you.",
        "You clutch your stomach, too weak to act.",
        "A wave of dizziness stops you in your tracks.",
        "You try to move, but hunger holds you back.",
        "Your limbs feel heavy and unresponsive from hunger.",
        "You stagger, unable to muster the energy to proceed.",
        "Your hunger is overwhelming; you must eat first.",
        "You gasp for breath, drained by hunger.",
        "Your empty stomach aches, making action impossible.",
        "You collapse to your knees, too hungry to continue.",
        "You can barely stand, let alone act.",
        "Your body cries out for nourishment before you can do anything.",
        "You are paralyzed by hunger and unable to act.",
        "You need food before you can do anything else."
    ],
    playerDamage: () => [
        "You unleash a powerful blow, forcing your foe to stagger!",
        "Your strike lands with precision, sending shockwaves through the enemy!",
        "You attack fiercely, driving your opponent back!",
        "You swing your weapon in a wide arc, catching your foe off guard!",
        "A solid hit! The enemy reels from your assault.",
        "Your attack connects, and your opponent grunts in pain.",
        "You land a critical strike, the enemy's defenses falter!",
        "You lash out, your foe scrambling to recover.",
        "You press the attack, keeping your opponent on the defensive.",
        "Your blow lands true, the enemy stumbles from the impact.",
        "You strike swiftly, your foe barely able to react.",
        "You catch your foe off guard, forcing them to retreat a step!",
        "You deliver a punishing hit, the enemy's resolve wavering.",
        "Your weapon arcs through the air, the clash echoing across the battlefield.",
        "You drive your attack home, the enemy's guard shatters.",
        "You find an opening and exploit it, your opponent gasping in surprise.",
        "You attack with force, the enemy's stance breaking.",
        "You land a heavy blow, the foe's confidence shaken.",
        "You press your advantage, dominating the fight.",
        "You strike with determination, your enemy falters before your might."
    ],
    allyDamage: (name) => [
        `${name} launches a swift attack, catching the enemy by surprise!`,
        `${name} lands a solid blow, forcing the foe to stumble!`,
        `${name} strikes with precision, the enemy reeling from the hit!`,
        `${name} charges forward, driving the opponent back!`,
        `${name} delivers a powerful strike, the enemy's guard falters!`,
        `${name} bites down, the foe yelping in pain!`,
        `${name} slashes at the enemy, leaving them scrambling to recover!`,
        `${name} pounces, pinning the opponent momentarily!`,
        `${name} attacks fiercely, dominating the skirmish!`,
        `${name} rams into the foe, sending them sprawling!`,
        `${name} CLAWS at the opponent, forcing them to retreat!`,
        `${name} lands a critical hit, the enemy's confidence shaken!`,
        `${name} uses its strength to overpower the foe!`,
        `${name} surprises the enemy with a quick, decisive move!`,
        `${name} delivers a punishing blow, the opponent's resolve wavering!`,
        `${name} leaps into action, taking control of the fight!`,
        `${name} swings with force, the enemy's stance breaking!`,
        `${name} lunges, pressing the attack relentlessly!`,
        `${name} catches the enemy off guard, forcing them to defend desperately!`,
        `${name} presses the attack, keeping the foe on the defensive!`
    ],
    furryWounded: [
        "The furry is wounded!",
        "Your strike leaves the creature hurt!",
        "It reels back, clearly injured.",
        "The furry staggers from the blow.",
        "A pained cry escapes the creature.",
        "Blood stains the furry's FUR.",
        "The furry limps, favoring one side.",
        "You see fear in the furry's eyes.",
        "The furry snarls in pain.",
        "It struggles to keep its footing.",
        "The furry's movements slow from injury.",
        "A fresh wound marks the furry's side.",
        "The furry winces and pulls away.",
        "It bares its teeth, wounded but defiant.",
        "The furry's breathing grows ragged.",
        "You notice a deep gash on the furry's body.",
        "The furry trembles, weakened by the attack.",
        "It lets out a wounded whimper.",
        "The furry's strength is fading.",
        "The furry tries to retreat, clearly hurt."
    ],
    furryWarms: (type) => [
        `The ${type} warms up to you.`,
        `The ${type} seems less wary of you now.`,
        `You earn the ${type}'s trust.`,
        `The ${type} presses its body closer, seeking your touch.`,
        `A soft purr escapes the ${type} as it nuzzles against you.`,
        `You feel the ${type}'s breath warm against your skin.`,
        `The ${type}'s eyes glimmer with longing as it draws near.`,
        `A shiver runs through the ${type} as your hands graze its FUR.`,
        `The ${type} arches its back, inviting your caress.`,
        `You sense a deep, primal connection as the ${type} leans in.`,
        `The ${type} lets out a low, inviting growl as you approach.`,
        `Your touch elicits a soft moan from the ${type}.`,
        `The ${type} wraps itself around you, craving your warmth.`,
        `You feel the ${type}'s heartbeat quicken beneath your fingertips.`,
        `The ${type} gazes at you with smoldering intensity.`,
        `A playful nip from the ${type} sends a thrill through you both.`,
        `The ${type} trembles with anticipation as you draw closer.`,
        `You and the ${type} share a lingering, intimate moment.`,
        `The ${type} presses its lips to yours in a heated embrace.`,
        `A wave of desire passes between you and the ${type}.`,
        `The ${type} melts into your arms, surrendering to your touch.`,
        `You lose yourself in the ${type}'s passionate gaze.`,
        `The ${type} purrs deeply, inviting you to explore further.`
    ],

    playerFlirtHostileEnemy: (type, gender, plural = false) => {
        // Flirting with a hostile enemy: tension, cracks in their hostility, reluctant enjoyment
        const lines = [
            `You meet the hostile ${type}'s gaze, a daring smile on your lips. GENDER1 tries to look tough, but a smirk betrays GENDER3 amusement.`,
            `You brush your fingers along the ${type}'s arm, and GENDER1 stiffens—yet you catch a hint of shyness in GENDER2 eyes.`,
            `With a teasing grin, you lean in and whisper something that makes the ${type} bite back a smile.`,
            `You press close, letting your breath tickle the ${type}'s ear. GENDER1 pretends not to care, but you see a faint blush.`,
            `A playful wink and a gentle touch make the ${type} roll GENDER2 eyes, but GENDER1 can't hide a pleased grin.`,
            `You lock eyes with the ${type}, and for a moment, GENDER1's guard drops—just enough for you to see a flicker of warmth.`,
            `You let your hand linger on the ${type}'s side, and GENDER1 huffs, but doesn't pull away.`,
            `You murmur a sultry taunt, and the ${type} tries to scoff, but GENDER1's lips twitch with reluctant delight.`,
            `You draw the ${type} near, feeling GENDER1's resistance melt into a playful shove.`,
            `You press your body close, and the ${type} grumbles, but GENDER1's tail gives an involuntary wag.`,
            `You whisper something daring, and the ${type} snorts, but GENDER1's ears flick with interest.`,
            `You trail your fingers along the ${type}'s jaw, and GENDER1's eyes narrow, but a smile tugs at GENDER2 lips.`,
            `You lean in, your breath warm, and the ${type} tries to glare, but GENDER1's cheeks flush.`,
            `You tease the ${type} with a compliment, and GENDER1 scoffs, but can't hide a pleased look.`,
            `You nudge the ${type} playfully, and GENDER1 shoves back, but laughter escapes.`,
            `You let your hand rest on the ${type}'s chest, and GENDER1's heartbeat quickens despite GENDER4 efforts to hide it.`,
            `You murmur a secret, and the ${type} pretends not to listen, but GENDER1 leans closer.`,
            `You brush your lips near the ${type}'s ear, and GENDER1 shivers, trying to play it cool.`,
            `You compliment the ${type}'s strength, and GENDER1 puffs up, but a bashful grin slips through.`,
            `You catch the ${type} watching you, and when your eyes meet, GENDER1 quickly looks away, flustered.`,
        ];
        return lines.map(line => applyPronouns(line, gender, plural));
    },

    playerFlirtNonhostileEnemy: (type, gender, plural = false) => {
        // Flirting with a non-hostile enemy: curiosity, playfulness, gentle tension
        const lines = [
            `You offer the ${type} a warm smile, stepping closer as GENDER1 blushes softly.`,
            `You gently brush your hand along the ${type}'s fur, making GENDER3 shiver with anticipation.`,
            `A playful compliment makes the ${type} giggle, GENDER1 clearly enjoying your attention.`,
            `You lean in, your words soft and inviting, and the ${type} can't help but smile.`,
            `You lock eyes with the ${type}, your gaze lingering as GENDER1 looks away bashfully.`,
            `You let your fingers entwine with the ${type}'s, feeling a spark pass between you.`,
            `You whisper a sweet secret, making the ${type} perk up with interest.`,
            `You draw the ${type} into a gentle embrace, GENDER1 relaxing in your arms.`,
            `You trail a soft kiss along the ${type}'s cheek, earning a delighted sigh.`,
            `You share a quiet laugh, the air between you charged with possibility.`,
            `You nuzzle the ${type}'s neck, and GENDER1 giggles, leaning into your touch.`,
            `You compliment the ${type}'s eyes, and GENDER1 beams with pride.`,
            `You playfully bump shoulders with the ${type}, and GENDER1 laughs, bumping you back.`,
            `You whisper a joke, and the ${type} bursts into laughter, GENDER1's tail wagging.`,
            `You brush a stray lock of fur from the ${type}'s face, and GENDER1 smiles shyly.`,
            `You offer your hand, and the ${type} takes it, fingers squeezing yours gently.`,
            `You share a secret glance, and GENDER1's cheeks flush with excitement.`,
            `You tease the ${type} with a flirty remark, and GENDER1 grins, clearly enjoying the attention.`,
            `You lean in for a playful peck, and the ${type} returns it with a bashful giggle.`,
            `You and the ${type} share a moment of quiet closeness, the world fading away.`,
        ];
        return lines.map(line => applyPronouns(line, gender, plural));
    },

        allyFlirtPlayer: (name, gender, fingers, skin, hand, mouth, plural = false) => {
        // Ally flirting with the player: trust, affection, shared history
        const lines = [
            `${name}'s grin widens as GENDER1 pulls you down into the soft grass beside GENDER2, the sun casting a warm glow upon your intertwined bodies. GENDER1 props GENDER2 up on one elbow, GENDER3 other ${hand} reaching out to gently trace the contours of your face. GENDER3 touch is feather-light, sending shivers of pleasure coursing through your veins. ${name} leans in closer, GENDER3 muzzle hovering just above yours as GENDER1 whispers,"You know, I've been wanting to do this since you took me on this adventure." GENDER3 eyes flicker down to your lips, a hunger burning within their emerald depths. The tall grass surrounds you both like a private haven, shielding your intimate moment from the world beyond.`,
            `${name} reaches down and plucks a delicate wildflower from the grass. With gentle movements, GENDER1 tucks the blossom behind your ear, GENDER3 velvety ${fingers} brushing softly against your ${skin}. The flower's petals tickle your ear as ${name}'s touch lingers, sending a shiver of anticipation down your spine. GENDER3 beautiful eyes smolder with desire as GENDER1 leans in closer, GENDER3 muzzle barely inches from yours. "You're even more beautiful up close," GENDER1 murmurs, GENDER3 warm breath mingling with yours.`,
            `${name}'s ${skin} contrasts beautifully with GENDER3 piercing vibrant eyes, which seem to sparkle with mischief and desire. GENDER1 leans in closer, GENDER3 hot breath tickling your ear as GENDER1 whispers,"You know, I've been admiring you from afar during this journey. Your strength, your courage... it's incredibly attractive." GENDER3 velvety ${hand} reaches out to gently caress your cheek, GENDER3 touch sending electric shivers down your spine. ${name}'s lips curl into a seductive smile as GENDER1 leans back slightly, gazing into your eyes with an unmistakable hunger.`,
            `${name}'s laughter echoes through the tranquil meadow as GENDER1 rolls onto GENDER2 back, pulling you along with GENDER3. GENDER1 wraps an arm around your waist, holding you close as you both gaze up at the cloud-streaked sky. GENDER3 chest rises and falls with each contented breath, GENDER3 heartbeat steady and comforting against your side."Look," GENDER1 murmurs, pointing at a fluffy white cloud that resembles a playful puppy."It's like it's chasing its tail." ${name} chuckles softly, GENDER3 warm breath ruffling your ${skin}. In this peaceful moment, surrounded by the gentle rustling of grass and the distant chirping of birds, you feel a deep connection forming between you and your ${gender} ally.`,
            `As you stroll through the verdant meadow, your palms lightly brushing against the soft grass with each step, a sudden warmth envelops your ${hand}. ${name}'s ${fingers} intertwine with yours, GENDER3 grip gentle yet firm. GENDER1 turns to you with a tender smile, GENDER3 glistening eyes shining with affection. The unexpected touch sends a tingling sensation up your arm, and you find yourself instinctively squeezing GENDER3 ${hand} in return. In this tranquil moment, surrounded by the gentle swaying of grass and the distant hum of nature, a profound connection blossoms between you and your ${name} ally.`,
            `${name}'s playful laughter rings out through the meadow as GENDER1 takes off after you, GENDER3 ${fingers} pounding against the earth. You dash through the tall grass, your heart racing with exhilaration, as you weave and dodge GENDER3 attempts to catch you. The wind rushes through your ${skin}, whipping it back as you run faster and faster. Suddenly, ${name} lunges forward, tackling you to the ground in a fit of giggles. You both tumble into the soft grass, your bodies intertwined as you roll around, breathless and laughing. The world spins around you in a blur of green as you come to a stop, ${name} hovering above you with a mischievous grin. GENDER3 chest heaves with each breath, GENDER3 eyes sparkling with joy and something more...`,
            `As you sit in the heart of the meadow, the tall grass surrounding you like a private sanctuary, a sudden movement catches your eye. A grasshopper leaps away, its wings glinting in the sunlight. ${name}, who had been sitting quietly beside you, scoots closer until GENDER3 knee gently brushes against yours. The touch is subtle, almost imperceptible, yet it sends a jolt of electricity through your body. GENDER3 eyes meet yours, and in their glowing depths, you see a flicker of something unspoken - a spark of attraction that sets your heart racing. The world around you fades away, leaving only the two of you in this intimate moment, connected by the gentle pressure of GENDER3 knee against yours.`,
            `${name}'s ${fingers} deftly weave a delicate crown of clover, the small white flowers intertwining to form a simple yet elegant accessory. With a tender smile, GENDER1 leans in close and gently places the crown upon your head, GENDER3 touch lingering for a moment. As GENDER1 pulls back, GENDER3 eyes shine with an affection that makes your heart flutter. The clover crown sits lightly upon your brow, a symbol of GENDER3 admiration and fondness for you. In this peaceful meadow, surrounded by the gentle rustling of grass and the distant hum of bees, you feel cherished and adored by your ${name}'s thoughtful gesture.`,
            `${name}'s tender smile lingers on GENDER3 lips as GENDER1 leans back, GENDER3 eyes never leaving yours. The tall grass sways gently around you both, creating a private world where only the two of you exist. You find yourself mirroring GENDER3 smile, a secret understanding passing between you in the quiet intimacy of this moment. Your gazes lock, and in the depths of GENDER3 glowing eyes, you see a reflection of your own growing affection. The meadow seems to hold its breath, the world outside fading away as you share this silent, intimate connection - a bond forged in the gentle rustling of grass and the warmth of each other's presence.`,
            `${name} leans in closer, a playful glint in GENDER3 eye. With a gentle, teasing touch, GENDER1 takes a blade of grass and tickles your cheek with it. The sudden sensation makes you giggle, your laughter ringing out through the meadow. GENDER3 grin widens at your reaction, and GENDER1 continues GENDER3 playful assault, now tickling your nose and chin with the soft grass. You squirm and laugh, trying to dodge GENDER3 teasing touches while simultaneously leaning into them. The simple, joyful moment is filled with warmth and affection, a testament to the growing bond between you and your ${name} ally.`,
            `${name} sprawls in the grass, GENDER3 ${skin} contrasting beautifully with the green blades that surround GENDER2. GENDER1 pats the spot beside GENDER2, inviting you to join GENDER2 in this tranquil setting. As you settle in next to GENDER2, GENDER1 turns GENDER3 head to look at you, GENDER3 charming eyes filled with warmth and affection. The scent of earth and wildflowers fills the air, mingling with the natural musk of ${name}'s ${skin}. ${name} leans in closer, GENDER3 ${mouth} hovering just above your ear as GENDER1 whispers, "You know, I've been wanting to tell you something... You're incredibly beautiful when you're relaxed like this." GENDER3 voice is low and husky, sending a shiver down your spine. You can feel the heat rising in your cheeks as a blush spreads across your face, your heart fluttering at GENDER3 tender words.`,
            `${name} stretches out in the lush grass, GENDER3 ${skin} blending seamlessly with the verdant surroundings. GENDER1 props GENDER2 up on one elbow, patting the space beside GENDER2 invitingly with GENDER3 other ${hand}. "Come join me," GENDER1 says, GENDER3 voice warm and enticing. "Let's enjoy this peaceful moment together." GENDER3 big eyes sparkle with affection and a hint of longing as GENDER1 gazes at you, waiting for you to settle in beside GENDER2. The sun beats down gently upon the meadow, casting a golden glow over the scene and enveloping you both in its comforting warmth.`,
            `As you both lie in the grass, gazing up at the clear blue sky, a vibrant butterfly catches your eye. It flutters and dances above you, its delicate wings catching the sunlight as it weaves through the air. ${name} watches the mesmerizing display alongside you, GENDER3 head tilted slightly as GENDER1 admires the graceful creature. Without breaking GENDER3 gaze from the butterfly, GENDER1 ${hand} finds yours in the grass, GENDER3 ${fingers} intertwining with your fingers. The simple gesture fills you with a sense of warmth and contentment, a silent acknowledgment of the growing bond between you and your ally.`,
            `${name} leans in close, GENDER3 warm breath tickling your ear as GENDER1 whispers, "You know, I've been thinking about you all day. About the way your ${skin} looks in the sunlight, about the sound of your laughter..." GENDER3 ${hand} slides up your thigh, GENDER3 touch gentle yet electric. "About how much I want to run my ${fingers} through your ${skin} and pull you close..." GENDER1 nuzzles your neck, inhaling deeply as if savoring your scent."I can't stop thinking about kissing you, about tasting every inch of you..." GENDER3 glowing eyes smolder with desire as GENDER1 pulls back slightly, GENDER3 gaze raking over your body with an intensity that makes your heart race and your breath catch in your throat. "Tell me," GENDER1 murmurs huskily, "do you ever think about me like that? Do you ever imagine my ${hand}s on your body, my lips on yours?" GENDER3 ${hand} squeezes your thigh gently, a promise of pleasures yet to come.`,
            `A gentle breeze sweeps through the meadow, carrying with it a flurry of dandelion fluff. The tiny, white seeds dance and twirl in the air, like miniature parachutes drifting on the wind. You both laugh at the whimsical sight, your eyes following the delicate ballet of nature. ${name} reaches out, GENDER3 ${hand} moving swiftly to catch one of the dandelions mid-flight. GENDER1 holds it out to you, a playful smile on GENDER3 lips. "Make a wish," GENDER1 says softly, GENDER3 eyes sparkling with mischief and affection. "And maybe I'll grant it for you..." GENDER3 voice trails off suggestively, leaving the possibilities open to your imagination.`,
            `As you traverse the verdant fields, the sun's rays dancing upon the swaying grass, a sudden warmth grazes your ear. Your ${name} leans in, GENDER3 breath a gentle caress against your skin, sending shivers down your spine. GENDER3 voice, low and husky, whispers secrets of desire that mingle with the rustling leaves. The world around you fades into insignificance as GENDER3 proximity ignites a fire within you, making your heart race and your pulse quicken. In this moment, amidst the tranquil beauty of nature, an undeniable attraction blossoms between you and ${name}, promising a flirtation that will leave you breathless.`,
            `The gentle breeze carries the sweet scent of wildflowers as it whispers through the tall grass, the only sound in the tranquil landscape.You and your ally stand in a pocket of silence, the rest of the world muted and distant. GENDER3 eyes, a piercing blue that mirrors the cloudless sky above, lock onto yours with an intensity that steals your breath. GENDER1 reaches out, GENDER3 fingers brushing against yours in a fleeting touch that sends electric sparks racing through your veins. The air between you crackles with unspoken tension, each stolen glance and subtle gesture building an undeniable connection. Inthis serene moment, amidst the swaying grass and azure heavens, you find yourself lost in GENDER3 gaze, drawn to GENDER2 like a moth to a flame.`,
            `Fox's playful grin widens as GENDER1 tugs you down into the soft grass, your laughter mingling with the melodic song of crickets. The dandelion fluff swirls around you both, catching on your fur like tiny, white ornaments.GENDER1 pulls you close, GENDER3 body pressing against yours as GENDER1 whispers,"You know, I have a wish of my own..." GENDER3 emerald eyes lock onto yours, filled with a warmth and intensity that makes your heart flutter. The world around you fades away, leaving only the two of you in this private haven. Fox leans in closer, GENDER3 muzzle hovering just above yours as GENDER1 murmurs,"I wish I could kiss you right now..."GENDER3 breath is warm against your lips, a tantalizing promise of the passion that lies just beyond.`,
            `Hidden in the tall grass of the meadow, you and Fox lie close, the swaying blades shielding your whispers from the world. GENDER3 orange fur gleams in the dappled sunlight, and GENDER3 emerald eyes flicker with a playful yet intimate glow as GENDER1 leans closer. “This field’s got secrets, but none as sweet as yours,” GENDER1 murmurs, GENDER3 voice low and teasing, GENDER3 bushy tail brushing lightly against your side. GENDER3 paw grazes your arm, lingering just long enough to send a warm shiver through you, as GENDER1 whispers, “Tell me something no one else knows… just for me.”`,
            `The cool grass presses against your back as Fox lies beside you, GENDER3 orange fur catching the sunlight in a fiery glow. GENDER3 paw moves with deliberate slowness, tracing lazy circles on your arm, each touch sending a faint tingle across your skin. GENDER3 emerald eyes glint with a mix of mischief and warmth, and GENDER1 lets out a soft chuckle, the sound blending with the rustle of the meadow around you. “Feels nice, doesn’t it?” GENDER1 murmurs, GENDER3 voice low and teasing, GENDER3 claws grazing your fur just enough to make your heart skip.`
        ]
            return lines.map(line => applyPronouns(line, gender, plural));
        },

    allyFlirtAlly: (name, name2, gender, plural = false) => {
        // Ally flirting with another ally: playful, lighthearted, and set in a sunlit grass field
        const lines = [
            `${name} and ${name2} sprawl in the grass, trading jokes as the sun warms their backs.`,
            `${name} weaves a daisy chain and places it on ${name2}'s head, both of them laughing in the breeze.`,
            `${name2} flicks a blade of grass at ${name}, who grins and flicks one back.`,
            `${name} and ${name2} chase each other through the tall grass, their laughter echoing across the field.`,
            `${name} leans close to ${name2}, whispering a secret as grasshoppers leap away.`,
            `${name} and ${name2} collapse side by side, breathless and smiling, hidden by the swaying green.`,
            `${name} tosses a wildflower to ${name2}, who catches it and tucks it behind GENDER2 ear.`,
            `${name} and ${name2} share a quiet moment, watching clouds drift by above the grass.`,
            `${name} nudges ${name2} with a playful grin, sending a flurry of grass seeds into the air.`,
            `${name} and ${name2} lie back, hands behind their heads, as the grass whispers around them.`,
            `${name} braids a few blades of grass and hands them to ${name2} as a token of friendship.`,
            `${name} and ${name2} watch a butterfly flutter past, their shoulders touching in the soft green.`,
            `${name} and ${name2} share a secret smile, hidden from the world by the tall grass.`,
            `${name} leans over to brush a stray leaf from ${name2}'s hair, both of them grinning.`,
            `${name} and ${name2} roll down a gentle hill, coming to rest in a tangle of laughter and grass.`,
            `${name} and ${name2} make wishes on dandelion fluff, their voices soft in the open air.`,
            `${name} and ${name2} lie close, the scent of earth and wildflowers all around them.`,
            `${name} and ${name2} share a playful glance, the field their secret world.`,
            `${name} and ${name2} watch the sun dip low, the grass glowing gold around them.`,
            `${name} and ${name2} drift off in the grass, the sounds of the field lulling them into peace.`
        ];
        return lines;
    },

    playerFlirtAlly: (name, gender, plural = false) => {
        // Flirting with an ally: trust, affection, shared history
        const lines = [
            `You catch ${name}'s eye and flash a mischievous grin, making GENDER1 laugh.`,
            `You lean against ${name}, your touch familiar and welcome.`,
            `A whispered joke in ${name}'s ear makes GENDER1 blush and nudge you playfully.`,
            `You entwine your fingers with ${name}'s, sharing a moment of quiet affection.`,
            `You press your lips to ${name}'s cheek, feeling GENDER2 warmth radiate back.`,
            `You share a lingering look with ${name}, memories and feelings passing unspoken between you.`,
            `You draw ${name} close, your arms wrapping around GENDER3 in a gentle hug.`,
            `You tease ${name} with a playful wink, earning a soft laugh.`,
            `You rest your head on ${name}'s shoulder, feeling safe and content.`,
            `You and ${name} share a private smile, the bond between you clear to anyone watching.`,
            `You ruffle ${name}'s hair, and GENDER1 grins, swatting your hand away playfully.`,
            `You whisper a compliment, and ${name} beams with pride.`,
            `You bump hips with ${name}, and GENDER1 laughs, bumping you back.`,
            `You share a secret glance, and GENDER1's cheeks flush with affection.`,
            `You offer your hand, and ${name} squeezes it gently.`,
            `You nuzzle into ${name}'s neck, and GENDER1 giggles, hugging you tighter.`,
            `You share a silly inside joke, and both of you burst into laughter.`,
            `You lean in for a playful peck, and ${name} returns it with a bashful smile.`,
            `You and ${name} share a moment of quiet closeness, the world fading away.`,
            `You rest your forehead against ${name}'s, savoring the warmth between you.`,
        ];
        return lines.map(line => applyPronouns(line, gender, plural));
    },

    // === Ally Actions Against Enemies ===
    allyFlirtEnemy: (allyName, enemyName, gender, plural = false) => {
        // Ally flirting with enemy: protective, seductive, nature-themed
        const lines = [
            `${allyName} sidles through the tall grass, approaching ${enemyName} with a sultry sway. GENDER1 brushes a wildflower against GENDER3 own cheek before offering it with a coy smile, the afternoon sun highlighting GENDER3 alluring features.`,
            `${allyName} emerges from behind a patch of swaying grass, GENDER3 gaze locked on ${enemyName}. With feline grace, GENDER1 circles slowly, letting GENDER3 scent mingle with the sweet meadow air as GENDER1 purrs low and enticing.`,
            `${allyName} plucks a handful of dandelion seeds and blows them toward ${enemyName}, the white fluff dancing in the breeze. "Make a wish," GENDER1 whispers huskily, GENDER3 eyes sparkling with mischief and desire.`,
            `${allyName} stretches languidly in the sun-warmed grass, deliberately catching ${enemyName}'s attention. GENDER1 rolls onto GENDER3 side, patting the soft earth beside GENDER2 with an inviting smile that promises hidden pleasures.`,
            `${allyName} weaves between the wildflowers, GENDER3 movements fluid and hypnotic. GENDER1 pauses just within arm's reach of ${enemyName}, tilting GENDER3 head with a knowing smile as a butterfly lands briefly on GENDER3 shoulder.`,
            `${allyName} finds a patch of soft clover and settles down gracefully, beckoning ${enemyName} with a curl of GENDER3 finger. "The grass is so soft here," GENDER1 murmurs, GENDER3 voice like honey carried on the warm breeze.`,
            `${allyName} approaches through the meadow with predatory grace, GENDER3 eyes never leaving ${enemyName}. GENDER1 trails GENDER3 fingers through the grass tops, creating small waves in the green sea around them both.`,
            `${allyName} lies back in the grass, arms behind GENDER3 head, gazing up at ${enemyName} with half-lidded eyes. "The view from down here is quite... interesting," GENDER1 says with a playful grin.`,
            `${allyName} gathers a small bouquet of wildflowers and approaches ${enemyName} with confident steps. GENDER1 tucks one bloom behind GENDER3 own ear, then offers the rest with a wink and a promise-filled smile.`,
            `${allyName} moves through the grass like liquid silk, each step deliberate and enticing. GENDER1 stops just close enough for ${enemyName} to catch GENDER3 scent - wild and intoxicating like the meadow itself.`
        ];
        return lines.map(line => applyPronouns(line, gender, plural));
    },

    allyFeastSuccess: (allyName, enemyType) => [
        `${allyName} pounces through the grass with primal hunger, overwhelming the ${enemyType} in the open meadow. The struggle is brief among the wildflowers before ${allyName} claims GENDER3 feast, strength flowing through GENDER2 as GENDER1 devours GENDER3 prey.`,
        `${allyName} stalks silently through the tall grass before striking. The ${enemyType} barely has time to react as ${allyName} tackles them into the soft earth, GENDER3 feast swift and decisive among the scattered dandelions.`,
        `${allyName} emerges from the swaying grass like a wild predator, eyes gleaming with hunger. The ${enemyType} stumbles backward into a patch of clover, but there's nowhere to flee in the open meadow as ${allyName} claims GENDER3 prize.`,
        `${allyName} circles the ${enemyType} through the sun-dappled grass, waiting for the perfect moment. When it comes, GENDER1 strikes like lightning, the chase ending swiftly among the wildflowers as ${allyName} satisfies GENDER3 primal hunger.`,
        `${allyName} uses the tall grass as cover, approaching the ${enemyType} with predatory patience. The meadow witnesses GENDER3 successful hunt as GENDER1 emerges victorious, licking GENDER3 lips with satisfaction.`,
        `${allyName} bounds through the grass with feral grace, the ${enemyType} unable to escape across the open field. The feast happens quickly among the scattered petals and morning dew, ${allyName} growing stronger with each swallow.`,
        `${allyName} crouches low in the grass, muscles coiled like a spring. When GENDER1 leaps, the ${enemyType} is caught completely off-guard, their struggle ending among the crushed wildflowers as ${allyName} claims GENDER3 victory.`,
        `${allyName} moves through the meadow with purpose, the ${enemyType} backing away into taller grass. But the field offers no sanctuary as ${allyName} closes in, GENDER3 successful hunt nourishing GENDER2 completely.`
    ],

    allyFeastFail: (allyName, enemyType) => [
        `${allyName} lunges through the grass at the ${enemyType}, but GENDER3 prey slips away through the wildflowers like a shadow, leaving ${allyName} empty-handed among the scattered petals.`,
        `${allyName} gives chase across the meadow, but the ${enemyType} zigzags through the tall grass with surprising agility, escaping into a thicker patch where ${allyName} loses the trail.`,
        `${allyName} attempts to corner the ${enemyType} against a cluster of rocks, but GENDER3 prey leaps over the stones with grace, bounding away through the open field to safety.`,
        `${allyName} stalks carefully through the grass, but steps on a dry twig. The snap alerts the ${enemyType}, who darts away across the meadow before ${allyName} can react.`,
        `${allyName} pounces with confidence, but the ${enemyType} rolls away through the soft clover, using the uneven ground to escape ${allyName}'s grasp and flee to safer grass.`,
        `${allyName} circles through the wildflowers, but the ${enemyType} calls out in distress. A flock of startled birds takes flight, creating enough chaos for the prey to slip away unseen.`,
        `${allyName} moves in for the feast, but the ${enemyType} proves surprisingly resilient, fighting back with desperate strength that sends both tumbling before the prey breaks free and escapes.`
    ],

    allyFeedSuccess: (allyName, enemyType) => [
        `${allyName} approaches the ${enemyType} through the peaceful meadow, offering a handful of sweet berries found among the grass. GENDER3 gentle kindness and the tranquil setting win over the ${enemyType}, who decides to join your growing group.`,
        `${allyName} sits peacefully in the clover, sharing GENDER3 gathered nuts and seeds with the wary ${enemyType}. The gesture of trust, surrounded by the serene grassland, convinces the ${enemyType} to become part of your family.`,
        `${allyName} weaves a crown of wildflowers and places it gently on the ${enemyType}'s head. The beautiful gift and ${allyName}'s warm smile in the sun-dappled meadow melts away all hostility, earning a new ally.`,
        `${allyName} shares GENDER3 water from a clear stream, offering it to the thirsty ${enemyType} with cupped hands. This act of generosity in the abundant grassland creates an unbreakable bond of friendship.`,
        `${allyName} demonstrates the safety of the meadow by lying peacefully in the grass, showing the ${enemyType} that there's no threat here. GENDER3 calm presence and the field's tranquility convince the ${enemyType} to stay.`,
        `${allyName} gathers honeysuckle and presents it to the ${enemyType} as a peace offering. The sweet fragrance and ${allyName}'s genuine kindness among the wildflowers creates an instant connection and trust.`,
        `${allyName} shows the ${enemyType} a hidden patch of the sweetest grass, sharing this secret treasure. The generous gesture in this abundant meadow proves ${allyName}'s goodwill and wins over the ${enemyType} completely.`,
        `${allyName} plays gently in the grass, inviting the ${enemyType} to join GENDER2 in innocent games. The playful interaction under the warm sun dissolves all barriers, creating a lasting friendship.`
    ],

    allyFeedFail: (allyName, enemyType) => [
        `${allyName} offers gathered berries to the ${enemyType}, but GENDER3 approach through the grass is too sudden. The ${enemyType} takes it as a threat and flees across the meadow, leaving the rejected offering scattered among the wildflowers.`,
        `${allyName} tries to share GENDER3 food with the ${enemyType}, but the wind carries an unfamiliar scent through the grass. The ${enemyType} becomes suspicious and backs away through the tall blades, rejecting ${allyName}'s peaceful gesture.`,
        `${allyName} presents a crown of flowers to the ${enemyType}, but a buzzing bee frightens them both. In the chaos among the disturbed grass, the moment of trust is lost and the ${enemyType} runs away.`,
        `${allyName} attempts to demonstrate friendship by playing in the grass, but GENDER3 enthusiasm is misunderstood. The ${enemyType} sees it as aggressive play and retreats to the safety of distant wildflowers.`,
        `${allyName} tries to share water with the ${enemyType}, but accidentally spills it in GENDER3 nervousness. The ${enemyType} interprets this clumsiness as incompetence and wanders away through the meadow, unimpressed.`,
        `${allyName} offers sweet honeysuckle to the ${enemyType}, but a sudden gust of wind blows the petals away. The failed gesture among the swaying grass leaves the ${enemyType} unswayed and still wary.`,
        `${allyName} tries to show the ${enemyType} kindness, but GENDER3 approach disturbs a resting rabbit. The sudden movement through the grass startles everyone, ruining the peaceful moment and driving the ${enemyType} away.`
    ],

    allyFuckSuccess: (allyName, enemyType, gender, plural = false) => [
        `${allyName} and the ${enemyType} find secluded comfort in a hidden grove within the meadow. Surrounded by tall grass and wildflowers, their intimate connection blossoms naturally, the peaceful setting enhancing their shared passion and creating a moment of pure bliss.`,
        `${allyName} leads the ${enemyType} to a soft patch of moss and clover, where they explore their desires under the open sky. The gentle rustling of grass provides nature's soundtrack to their tender encounter, leaving both satisfied and content.`,
        `${allyName} and the ${enemyType} discover each other among the sun-warmed grass, their bodies intertwining like the wildflowers around them. The meadow keeps their secrets as they find pleasure in each other's arms, the earth soft beneath them.`,
        `${allyName} creates a bower of flowers and grass for GENDER3 and the ${enemyType} to share. In this natural sanctuary, they connect deeply, their passion as vibrant as the blooming meadow that witnesses their intimate dance.`,
        `${allyName} and the ${enemyType} curl together in the tall grass, hidden from the world. The warmth of the sun and the softness of the earth below enhance their connection, creating a memory as sweet as the honey-scented air.`,
        `${allyName} guides the ${enemyType} through the swaying grass to a private clearing. There, surrounded by nature's beauty, they share an experience that leaves them both glowing with satisfaction, the meadow blessing their union.`,
        `${allyName} and the ${enemyType} find themselves drawn together in the heart of the grassland. Their encounter is gentle yet passionate, the soft earth and fragrant flowers creating the perfect backdrop for their shared intimacy.`,
        `${allyName} whispers sweet promises to the ${enemyType} among the wildflowers, leading to a tender coupling in the protected embrace of tall grass. The meadow holds their secrets as they discover pleasure in each other's company.`
    ],

    allyFuckFail: (allyName, enemyType) => [
        `${allyName} tries to create an intimate moment with the ${enemyType} in the grass, but a sudden shower sends them both scrambling for shelter, the romantic mood completely lost among the wet wildflowers.`,
        `${allyName} and the ${enemyType} settle into the soft clover, but a curious deer wanders too close, startling them apart. The interruption in the peaceful meadow ruins the intimate atmosphere they were building.`,
        `${allyName} attempts to seduce the ${enemyType} among the wildflowers, but GENDER1 accidentally lies on a thistle. GENDER3 yelp of pain breaks the mood completely, leaving the ${enemyType} concerned but no longer interested.`,
        `${allyName} tries to impress the ${enemyType} with GENDER3 knowledge of the meadow's secret spots, but leads them into a patch of itchy grass instead. The uncomfortable situation kills any romantic tension between them.`,
        `${allyName} and the ${enemyType} begin to connect in the tall grass, but a swarm of gnats discovers them. Their intimate moment turns into a frantic dance of swatting and scratching, completely ruining the mood.`,
        `${allyName} tries to create a romantic setting in the clover, but the ${enemyType} is distracted by the sound of distant thunder. Fear of the approaching storm makes intimacy impossible among the restless grass.`,
        `${allyName} attempts to charm the ${enemyType} with sweet wildflower scents, but unfortunately chooses ragweed by mistake. The resulting sneezing fit thoroughly destroys any possibility of romance in the meadow.`
    ],

    furryInterested: (type) => [
        `The ${type} seems interested...`,
        `You notice a spark of curiosity in its eyes.`,
        `It appears intrigued by you.`,
        `The ${type} tilts its head, watching you closely.`,
        `A soft sound escapes the ${type} as it draws nearer.`,
        `You catch the ${type} glancing at you repeatedly.`,
        `It circles you, sniffing the air with interest.`,
        `The ${type}'s EARS perk up as you approach.`,
        `You sense the ${type}'s attention is fixed on you.`,
        `It takes a cautious step in your direction.`,
        `The ${type}'s TAIL flicks with anticipation.`,
        `You see the ${type}'s NOSE twitch as it studies you.`,
        `It sits down, waiting to see what you'll do next.`,
        `The ${type}'s eyes follow your every movement.`,
        `It lets out a curious chirp or grunt.`,
        `You feel the ${type}'s gaze linger on you.`,
        `It edges closer, clearly wanting to learn more.`,
        `The ${type} sniffs at your hand, testing your scent.`,
        `It gives a tentative wag or purr.`,
        `You notice the ${type}'s body language relax slightly.`
    ],
    feastSuccess: (type, gain) => [
        `You feast on the ${type} and gain ${gain} hunger!`,
        `Devouring the ${type} restores ${gain} hunger!`,
        `You consume the ${type}, replenishing ${gain} hunger.`,
        `You open wide and swallow the ${type} whole, feeling your hunger fade as it settles inside.`,
        `The ${type} squirms as you gulp it down, your belly growing fuller with every swallow.`,
        `With a deep breath, you engulf the ${type}, its struggles fading as you digest it for ${gain} hunger.`,
        `You savor the sensation as the ${type} slides down your throat, nourishing you from within.`,
        `The ${type} vanishes into your MAW, leaving you satisfied and energized.`,
        `You feel the ${type} wriggle as it descends, your hunger replaced by a pleasant fullness.`,
        `A powerful gulp sends the ${type} into your stomach, where it fuels your strength.`,
        `You relish the fullness as the ${type} is safely tucked away inside you.`,
        `The ${type} is enveloped by your body, its energy becoming your own.`,
        `You pat your belly contentedly after swallowing the ${type} whole.`,
        `The ${type} disappears past your lips, and you feel a surge of vitality.`,
        `You draw the ${type} in, your hunger quickly fading as you digest your living meal.`,
        `The ${type} is helpless as you swallow it, your body eagerly absorbing its energy.`,
        `You gulp down the ${type}, feeling it settle and your hunger vanish.`,
        `A deep sense of satisfaction washes over you as the ${type} is vored alive.`,
        `You feel the ${type} moving inside for a moment before your hunger is fully sated.`,
        `The ${type} is drawn into your stomach, its presence fueling your recovery.`,
        `You finish your meal, the ${type} now a part of you, and your hunger gone.`,
        `You swallow the ${type} in one smooth motion, feeling stronger immediately.`,
        `The ${type} is enveloped by your MAW, and you feel your hunger melt away.`,
        `You savor the living meal, the ${type} nourishing you as it disappears inside.`,
        `You feel the ${type}'s energy flow into you as you finish your feast.`,
        `The ${type} is gone, leaving you feeling full and revitalized.`,
        `You take a moment to enjoy the sensation as the ${type} is digested alive.`,
        `You feel your strength return as the ${type} is absorbed within you.`,
        `The ${type} is swallowed whole, and you feel completely satisfied.`
    ],
    feastFail: (type) => [
        `Your feast attempt fails.`,
        `You fail to satisfy your hunger.`,
        `The ${type} slips from your grasp.`,
        `You miss your chance to swallow the ${type}.`,
        `Your prey escapes before you can feast.`,
        `You fumble and lose the ${type}.`,
        `Your hunger remains as the ${type} wiggles out of your PAWS.`,
        `You bite down, but the ${type} wriggles free.`,
        `You hesitate, and the opportunity is lost.`,
        `You can't quite manage to eat the ${type} this time.`,
        `Your MAW snaps shut on empty air.`,
        `You lunge, but your ${type} gets away.`,
        `You try to feast on the ${type}, but you fail.`,
        `You lose your grip and the ${type} escapes.`,
        `Your attempt is thwarted by a sudden movement.`,
        `You are left hungry as your ${type} flees.`,
        `You feel frustration as the ${type} dodges your grasp.`,
        `You watch helplessly as the ${type} slips away.`,
        `Your belly gurgles as you fail to swallow the ${type}.`,
        `${type} escapes your grasp at the last moment.`
    ],
    recruitSuccess: (type) => [
        `You successfully recruit the ${type}!`,
        `The ${type} joins your cause!`,
        `You gain a new ally: the ${type}.`,
        `The ${type} is now part of your team.`,
        `With a nod, the ${type} agrees to follow you.`,
        `The ${type} pledges loyalty to your journey.`,
        `A new friendship is forged with the ${type}.`,
        `The ${type} stands proudly at your side.`,
        `You welcome the ${type} into your ranks.`,
        `The ${type} is eager to help you on your quest.`,
        `A sense of camaraderie grows as the ${type} joins you.`,
        `The ${type} is ready to face challenges with you.`,
        `You feel stronger with the ${type} as your ally.`,
        `The ${type} gives a cheerful nod, ready for adventure.`,
        `The ${type} is happy to be part of your group.`,
        `You and the ${type} share a moment of mutual respect.`,
        `The ${type} is now a trusted companion.`,
        `The ${type} steps forward, accepting your invitation.`,
        `A bond forms as the ${type} joins your side.`,
        `The ${type} is now a valued member of your party.`,
        `You sense the ${type}'s determination to help you succeed.`
    ],
    allyMadeOut: (type, gender, plural = false) => {
        // Use GENDER# placeholders in lines
        const lines = [
            `${type} kisses you passionately, breathless kiss, hands roaming hungrily over each other's bodies.`,
            `${type} presses against your body with lust in GENDER2 eyes, GENDER1 throws you on the ground, and you both make out.`,
            `You both explore each other's body, moans and gasps filling the air.`,
            `You lock paws with ${type}, bodies entwined as you kiss deeply.`,
            `${type} gently pushes you against a tree, kissing you passionately.`,
            `You both pull eachother close, bodies pressed tightly, feeling every curve and muscle as you kiss deeply.`,
            `${type} pulls you to the ground, kissing you passionately.`,
            `You both lean into each other, shivering with anticipation as lips and tongues explore sensitive spots.`,
            `One bites gently at the other's lower lip, drawing a gasp before diving into another passionate kiss.`,
            `You lose yourself in ${type}'s passionate kisses, hands and mouths exploring, breath mingling in the heat.`,
            `Your fingers trace along GENDER2 skin, sending shivers as they press closer, desperate for more contact.`,
            `${type}'s hand slides down, gripping a thigh and pulling their bodies even tighter.`,
            `You both roll on the ground, tangled in limbs and laughter, lips never parting for long.`,
            `A teasing tongue flicks along your lips before diving into a deep, passionate kiss.`,
            `${type}'s kisses grow deeper, more urgent, as hands roam and bodies grind together.`,
            `You both gasp each other's names, lost in the haze of pleasure and longing.`,
            `${type} pins you to the ground, lips trailing down your neck as GENDER2 hands explore boldly.`,
            `You both arch and writhe together, every touch and kiss stoking the fire between you.`,
            `Breathless and flushed, you cling to each other, savoring every heated moment.`,
            `Your bodies move in perfect rhythm, lost in the intensity of your embrace.`,
        ];
        return lines.map(line => applyPronouns(line, gender, plural));
    },
    actionFail: [
        "Your attempt fails.",
        "That didn't work.",
        "You don't manage to pull it off.",
        "You fumble and lose your chance.",
        "Your hands slip at the last moment.",
        "You hesitate, and the opportunity passes.",
        "You try, but nothing happens.",
        "You misjudge your timing and fail.",
        "You lose focus and the action slips away.",
        "You make a mistake and it doesn't work.",
        "You stumble, ruining your attempt.",
        "You can't seem to get it right.",
        "You miss your mark.",
        "You act, but the result is disappointing.",
        "You give it your best, but fall short.",
        "You try again, but still fail.",
        "You are thwarted by bad luck.",
        "You falter and the action fizzles.",
        "You attempt it, but something goes wrong.",
        "You are unable to complete the action."
    ],
    enemyHitPlayer: (type) => [
        `The ${type} hits you with a fierce blow!`,
        `You are struck by the ${type}, pain radiating through your body!`,
        `Ouch! The ${type}'s attack leaves you reeling.`,
        `A sudden blow from the ${type} knocks you off balance!`,
        `The ${type} lashes out, forcing you to defend yourself!`,
        `You feel pain as the ${type} attacks relentlessly.`,
        `The ${type}'s attack lands, making you stagger!`,
        `You stagger as the ${type} lands a solid hit.`,
        `A sharp strike from the ${type} makes you wince.`,
        `The ${type} CLAWS at you, tearing at your defenses!`,
        `You wince as the ${type} bites down hard.`,
        `A heavy blow from the ${type} sends you stumbling!`,
        `The ${type} rams into you, knocking the wind from your lungs.`,
        `You are knocked back by the ${type}'s powerful attack.`,
        `The ${type} pounces, pinning you momentarily!`,
        `You feel the sting of the ${type}'s relentless assault.`,
        `A quick swipe from the ${type} leaves a burning pain!`,
        `The ${type} lands a solid hit, your vision blurring for a moment.`,
        `You are wounded by the ${type}, struggling to stay upright.`,
        `The ${type} strikes fiercely, your strength faltering.`,
        `You are battered by the ${type}'s unyielding assault.`
    ],
    enemyHitAlly: (type, name) => [
        `The ${type} hits ${name} with a fierce blow!`,
        `${name} is struck by the ${type}, reeling from the impact!`,
        `${name} is knocked back by the ${type}'s attack!`,
        `${name} takes a blow from the ${type}, struggling to stay upright!`,
        `A fierce attack from the ${type} leaves ${name} staggering!`,
        `${name} is wounded by the ${type}, faltering in the fight!`,
        `The ${type} CLAWS at ${name}, tearing at their defenses!`,
        `${name} winces as the ${type} lands a solid hit.`,
        `A sudden strike from the ${type} leaves ${name} off balance.`,
        `${name} is battered by the ${type}, barely holding on!`,
        `The ${type} bites down on ${name}, making them cry out!`,
        `${name} is knocked back by the ${type}'s powerful attack!`,
        `A heavy blow from the ${type} leaves ${name} hurt and dazed.`,
        `${name} is caught off guard and takes a punishing hit from the ${type}.`,
        `The ${type} pounces on ${name}, pinning them momentarily!`,
        `${name} suffers under the ${type}'s relentless assault!`,
        `A quick swipe from the ${type} leaves ${name} scrambling to recover!`,
        `${name} staggers as the ${type} delivers a crushing blow!`,
        `The ${type} rams into ${name}, sending them sprawling!`,
        `${name} is wounded by a sudden attack from the ${type}, struggling to regain composure!`
    ],
    enemyFled: (type) => [
        `The ${type} fled!`,
        `The ${type} escapes into the distance!`,
        `With a quick dash, the ${type} is gone.`,
        `The ${type} vanishes into the undergrowth.`,
        `You watch as the ${type} disappears from sight.`,
        `The ${type} bolts away, leaving you behind.`,
        `A flash of movement, and the ${type} is gone.`,
        `The ${type} retreats hastily, not looking back.`,
        `You see only a blur as the ${type} flees.`,
        `The ${type} darts away, evading your grasp.`,
        `The ${type} slips away before you can react.`,
        `You lose sight of the ${type} as it escapes.`,
        `The ${type} sprints off, quickly out of reach.`,
        `A rustle in the brush marks the ${type}'s escape.`,
        `The ${type} makes a hasty retreat.`,
        `You hear the sound of the ${type} running away.`,
        `The ${type} vanishes between the trees.`,
        `The ${type} flees, leaving only footprints behind.`,
        `You catch a glimpse of the ${type} as it disappears.`,
        `The ${type} runs for safety, not daring to look back.`
    ],
    enemyFleeFail: (type) => [
        `The ${type} tried to flee but failed.`,
        `The ${type} attempts escape and stumbles!`,
        `Escape fails for the ${type}.`,
        `The ${type} tries to run but is blocked!`,
        `The ${type} makes a break for it, but can't get away.`,
        `The ${type} darts to the side, but you cut it off.`,
        `The ${type} hesitates and loses its chance to escape.`,
        `A failed flee leaves the ${type} vulnerable.`,
        `The ${type} slips but can't get away in time.`,
        `The ${type} turns to flee, but is stopped short.`,
        `The ${type} is too slow and fails to escape.`,
        `The ${type} panics, but can't find a way out.`,
        `The ${type} is cornered and cannot flee.`,
        `The ${type} tries to vanish, but you block its path.`,
        `The ${type} is trapped and its escape fails.`,
        `The ${type} looks for an exit, but finds none.`,
        `The ${type} is thwarted in its attempt to flee.`,
        `The ${type} makes a desperate dash, but is caught.`,
        `The ${type} is forced to stay and fight.`,
        `The ${type} freezes, unable to escape.`
    ],
    playerFleeFail: (type) => [
        `Failed to flee!`,
        `You can't get away!`,
        `Your escape attempt is thwarted.`,
        `You try to run, but the ${type} blocks your path.`,
        `You stumble and lose your chance to escape.`,
        `You hesitate, and the ${type} closes in.`,
        `You turn to flee, but your legs won't move.`,
        `A sudden obstacle stops you from escaping.`,
        `You dash for safety, but are forced back.`,
        `You slip and fall, unable to get away.`,
        `Your path is blocked and you can't escape.`,
        `You make a break for it, but are intercepted.`,
        `You freeze in fear and fail to flee.`,
        `You try to slip away, but are spotted instantly.`,
        `You attempt to retreat, but the way is shut.`,
        `You are too slow and the ${type} catches up.`,
        `You look for an exit, but find none.`,
        `You try to vanish into the shadows, but are seen.`,
        `You dart to the side, but are cut off.`,
        `You attempt to escape, but your efforts are in vain.`
    ],

    // Inter-party feast mechanics
    playerFeastAlly: (name, gender) => [
        `You feast upon ${name} beneath the swaying grass. The meadow bears silent witness to your dark hunger.`,
        `In the peaceful field, you consume ${name}. The wildflowers seem to bow their heads in solemn acknowledgment.`,
        `The sun continues to shine warmly as you devour ${name} among the dandelions. Nature carries on, indifferent to tragedy.`,
        `You satisfy your hunger with ${name}'s essence while butterflies dance nearby, oblivious to the grim feast.`,
        `The gentle rustling of grass masks the sound of your feeding as ${name} becomes one with the meadow forever.`
    ],

    allyFeastPlayer: (name, gender) => [
        `${name} reveals their true nature in this tranquil meadow, consuming you as the grass witnesses your final moments.`,
        `In the peaceful field where you once felt safe, ${name} satisfies their dark hunger with your essence.`,
        `The wildflowers sway gently as ${name} feasts upon you, the meadow becoming your final resting place.`,
        `${name}'s predatory instincts emerge beneath the warm sun, and you become sustenance among the clover.`,
        `The serene grassland becomes the setting of your end as ${name} reveals their true, ravenous nature.`
    ],

    allyFeastAlly: (sourceName, targetName, targetGender) => [
        `${sourceName} turns on ${targetName} in the peaceful meadow, the tall grass hiding the grim deed from prying eyes.`,
        `Among the wildflowers and butterflies, ${sourceName} reveals their predatory nature, consuming ${targetName} whole.`,
        `The gentle breeze carries away ${targetName}'s last breath as ${sourceName} satisfies their hunger in the tranquil field.`,
        `${sourceName} and ${targetName}'s alliance ends tragically among the dandelions, with only one surviving the encounter.`,
        `The meadow's serenity is shattered as ${sourceName} demonstrates that even allies can become prey when hunger calls.`
    ],

    // Inter-party fuck mechanics
    playerFuckAlly: (name, gender) => [
        `You and ${name} share an intimate moment in the soft grass, hidden among the wildflowers as butterflies dance around you.`,
        `In the privacy of the swaying meadow, you and ${name} express your affection while the warm sun bathes your entwined forms.`,
        `The fragrant field becomes your sanctuary as you and ${name} find comfort in each other's embrace beneath the open sky.`,
        `Among the clover and dandelions, you and ${name} share passion while the gentle breeze carries your whispered endearments.`,
        `The peaceful grassland witnesses your tender union with ${name}, nature itself seeming to bless your intimate connection.`
    ],

    allyFuckPlayer: (name, gender) => [
        `${name} takes the initiative in the soft meadow grass, leading you into an intimate embrace while wildflowers bloom around you.`,
        `In the tranquil field, ${name} expresses their affection for you, the warm sun blessing your passionate encounter.`,
        `${name} draws you into their arms among the swaying grass, your bodies finding harmony beneath the endless blue sky.`,
        `The meadow becomes your private paradise as ${name} shows you the depth of their feelings through tender touch.`,
        `${name} guides you into intimacy among the dandelions, the peaceful surroundings enhancing your shared passion.`
    ],

    allyFuckAlly: (sourceName, targetName, targetGender) => [
        `${sourceName} and ${targetName} find solace in each other among the tall grass, their passion hidden from the world by nature's veil.`,
        `In the secluded meadow, ${sourceName} and ${targetName} express their mutual attraction while butterflies flutter overhead.`,
        `The peaceful field becomes the setting for ${sourceName} and ${targetName}'s intimate encounter, blessed by the warm sunlight.`,
        `Among the wildflowers, ${sourceName} and ${targetName} discover a deeper connection, their bodies moving in harmony.`,
        `${sourceName} and ${targetName} share a passionate moment in the grass, the gentle breeze carrying their soft sighs.`
    ],

    // Inter-party feed mechanics
    playerFeedAlly: (name, gender) => [
        `You offer nourishment to ${name} in the peaceful meadow, sharing sustenance among the wildflowers.`,
        `In the grass-covered field, you provide ${name} with food while butterflies dance around you both.`,
        `You feed ${name} sweet clover and tender shoots from the meadow, nature providing its bounty.`,
        `Among the dandelions, you share a meal with ${name}, the warm sun blessing your generous act.`,
        `You gather fresh berries from nearby bushes to feed ${name} in this tranquil grassland.`
    ],

    allyFeedPlayer: (name, gender) => [
        `${name} offers you fresh grass seeds and sweet nectar in the peaceful meadow, their generosity touching your heart.`,
        `In the flower-dotted field, ${name} shares wild berries with you while bees hum contentedly nearby.`,
        `${name} gathers tender shoots and herbs from the meadow to nourish you, showing their care.`,
        `Among the swaying grass, ${name} provides you with nature's bounty, their kindness evident in every gesture.`,
        `${name} finds fresh spring water and sweet clover to sustain you in this serene grassland.`
    ],

    allyFeedAlly: (sourceName, targetName, targetGender) => [
        `${sourceName} shares food with ${targetName} among the tall grass, their bond strengthened by this act of care.`,
        `In the meadow's embrace, ${sourceName} nourishes ${targetName} with wild fruits and tender leaves.`,
        `${sourceName} and ${targetName} share a meal in the peaceful field while nature provides its abundance.`,
        `Among the wildflowers, ${sourceName} feeds ${targetName} sweet grass and fresh water from a nearby stream.`,
        `${sourceName} shows their affection for ${targetName} by offering the choicest plants from the meadow.`
    ],

    // Inter-party fight mechanics
    playerFightAlly: (name, gender) => [
        `You consider fighting ${name} in the peaceful meadow, but the serene surroundings calm your aggressive thoughts.`,
        `The tranquil grass field reminds you that ${name} is your ally, not your enemy, and you choose peace instead.`,
        `Among the swaying wildflowers, you realize that violence has no place in such a harmonious setting with ${name}.`,
        `The gentle breeze and singing birds help you reconsider your hostile feelings toward ${name}.`,
        `In this beautiful meadow, you choose friendship over conflict with ${name}, letting the peaceful atmosphere guide you.`
    ],

    allyFightPlayer: (name, gender) => [
        `${name} seems momentarily aggressive but the peaceful meadow calms their hostile impulses toward you.`,
        `In the serene grassland, ${name} reconsiders their confrontational thoughts and chooses harmony instead.`,
        `The tranquil field reminds ${name} of your friendship, and they abandon any thoughts of violence.`,
        `${name} takes a deep breath of the flower-scented air and decides that this beautiful place is meant for peace, not conflict.`,
        `The gentle rustling of grass and distant bird songs help ${name} remember that you are allies, not enemies.`
    ],

    allyFightAlly: (sourceName, targetName, targetGender) => [
        `${sourceName} and ${targetName} have a momentary disagreement in the meadow, but the peaceful setting helps them resolve it peacefully.`,
        `In the tranquil grassland, ${sourceName} and ${targetName} choose dialogue over conflict, their voices mixing with the wind.`,
        `The serene field reminds ${sourceName} and ${targetName} that they are companions, and their tension dissolves among the wildflowers.`,
        `${sourceName} and ${targetName} let the calm meadow atmosphere guide them toward understanding rather than fighting.`,
        `Among the swaying grass, ${sourceName} and ${targetName} realize that their bond is stronger than any momentary disagreement.`
    ],

    // Ally flee narration
    allyFleeStays: (name, gender) => [
        `${name} considers fleeing through the tall grass but chooses to remain by your side among the wildflowers.`,
        `${name} takes a few steps toward the edge of the meadow but turns back, their loyalty stronger than their fear.`,
        `${name} looks toward the open field as an escape route but decides to stand with you beneath the warm sun.`,
        `${name} hesitates among the swaying grass, torn between flight and friendship, ultimately choosing you.`,
        `${name} starts to retreat through the peaceful meadow but stops, their bond with you proving unbreakable.`
    ],

    // Battle status messages
    enemySleeping: (name) => [
        `${name} remains fast asleep, lost in blissful dreams among the wildflowers.`,
        `${name} slumbers peacefully in the soft grass, oblivious to the world around them.`,
        `${name} continues to sleep deeply, a contented smile on their face.`,
        `${name} dreams sweetly in the meadow, their breathing slow and peaceful.`,
        `${name} rests in tranquil sleep, surrounded by the gentle rustling of grass.`
    ],

    enemyFlirtDebuff: [
        "The enemy becomes pacified by your charm, no longer hostile.",
        "Your seductive power overwhelms them, turning hostility into desire.",
        "The enemy's aggression melts away under your alluring gaze.",
        "Your flirtation breaks through their defenses, calming their hostile nature.",
        "The enemy is enchanted by your charm, abandoning all thoughts of conflict."
    ],

    enemySleep: [
        "The enemy falls into a blissful sleep, overcome by desire.",
        "Your charm sends them into a peaceful slumber of passion.",
        "They drift off to sleep, lost in dreams of romantic bliss.",
        "The enemy succumbs to drowsiness, your allure too powerful to resist.",
        "Sleep takes them as they become lost in fantasies of you."
    ],

    allyDefeated: (allyName, enemyName) => [
        `${allyName} has been defeated by ${enemyName} among the scattered wildflowers!`,
        `${allyName} falls in the grass, overcome by ${enemyName}'s fierce assault!`,
        `${enemyName} proves victorious over ${allyName} in the meadow battle!`,
        `${allyName} collapses in the soft grass, defeated by ${enemyName}!`,
        `The battle ends with ${allyName} lying motionless while ${enemyName} stands triumphant!`
    ],

    enemyAttemptsFlee: (enemyName) => [
        `${enemyName} attempts to flee through the tall grass!`,
        `${enemyName} tries to escape across the meadow!`,
        `${enemyName} turns and runs toward the safety of distant wildflowers!`,
        `${enemyName} makes a desperate dash for freedom!`,
        `${enemyName} seeks to escape this confrontation!`
    ]
};

function narrateTile(tile) {
    const lines = NarratorLines.tile[tile];
    if (Array.isArray(lines) && lines.length > 0) {
        const line = lines[Math.floor(Math.random() * lines.length)];
        updateNarrator(line);
    }
}
export default NarratorLines;