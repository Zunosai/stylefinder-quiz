/**
 * StyleFinder ID® reference data.
 *
 * Extracted from the StyleFinder source documents — the per-StyleType Elements
 * of Style cards and the per-archetype description sheets. This is the material
 * that grounds a generated Blueprint in the real system: without it the model
 * invents style icons, colors and shadow sides that do not belong to StyleFinder.
 *
 * Generated from those documents; edit them and re-extract rather than editing
 * the values here by hand.
 */

import type { StyleType } from './archetypes';

/** One StyleType's Elements of Style card. */
export interface StyleTypeReference {
  energy: 'Yang' | 'Yin';
  /** Vocabulary the system uses for this energy. */
  words: string;
  /** How this energy goes wrong when under- or over-expressed. */
  shadowSide: string;
  /** The one thing that matters most for this StyleType. */
  mostImportant: string;
  elements: string;
  colors: string;
  patterns: string;
  textures: string;
  silhouettes: string;
}

/** One archetype's description sheet. */
export interface ArchetypeReference {
  name: string;
  /** The three words the sheet leads with. */
  descriptor: string | null;
  /** Reference women named by the sheet. */
  styleIcons: string[];
  elements: string[];
  shadowSide: string[];
  /** The sheet's own style statement, in her voice. */
  statement: string | null;
}

export const STYLE_TYPE_REFERENCE: Record<StyleType, StyleTypeReference> = {
  Classic: {
    energy: 'Yang',
    words: 'Timeless, elegant, refined, uncomplicated, sophisticated, cherished, honors tradition, intellectual, predictable, heritage, respectful, polished, opulent, reliable, tailored, architectural, understated, poised, gracious, composed, simplistic, enduring, cultivated, structured, composed',
    shadowSide: 'Looking dated, staying the same, looking boring, hiding your shape, looking matronly',
    mostImportant: 'Clothing that is timeless and transcends the trends',
    elements: 'Classic cuts, understated details, unfussy',
    colors: 'Neutrals, black, pastels, khaki, green, pink, medium tones, monochromatic looks',
    patterns: 'Stripes, polka dots, florals, plaids, herringbone',
    textures: 'Crisp, tailored, structure, soft structure',
    silhouettes: '',
  },
  Sporty: {
    energy: 'Yang',
    words: 'Fun, kinetic, highly energetic, reliable, active, casual, team player, proud, healthy, fit, athletic, comfortable, fresh, easy going, goal oriented, confident, relaxed, competitive, understated, informal movement genuine, harmonious',
    shadowSide: 'Frumpy, default style, hiding your shape, hiding out, sloppy, lack of style',
    mostImportant: 'Physical comfort is paramount, whether dressed for the gym or the boardroom',
    elements: 'Stretch, ease, comfort, flow, flexible',
    colors: 'Black, white, gray, yellow, optic brights',
    patterns: 'Stripes, graphic designs',
    textures: 'Stretch, smooth, shiny',
    silhouettes: 'Fitted, close to the body',
  },
  Dramatic: {
    energy: 'Yang',
    words: 'Avant-garde, unique, innovative, strong, exciting, Passionate, presence, modern, powerful, daring, Cutting edge, singular, mysterious, driven, striking, Flamboyant, statement, free-spirit, purposeful, elemental, Change-agent, rebel, creative, stature, elegant, Pioneer, exotic, controversial, authority, graceful, Experimental, maverick, bold, artisan',
    shadowSide: 'Trying too hard, letting clothes wear you or overwhelm you, wearing something inappropriate, posing as something you’re not',
    mostImportant: 'The, Dramatic woman wants to be noticed. No wallflower, she chooses clothing that is bold, cutting-edge and expresses her individuality. Standing out and wearing something that makes a statement is her modus operandi, and she often chooses things for their shock value',
    elements: '',
    colors: 'The dramatic woman often has dramatic coloring, whether natural or chemically enhanced, and looks best in primary colors, rich bold jewel tones, black and white. Metallics, Pastels are not for the dramatic woman, Design, Lines: Sculptural, Cuts, Long jackets over shorter skirts, Asymmetrical lines, modern edge, Columnar shapes, Angular, Accessories: Look for avante-garde',
    patterns: 'Abstract prints, Optic prints, geometric prints, color blocking, bold stripes and dots, bold animal prints, solid black',
    textures: 'Opulent fabrics, swooping layers, crisp details, sheer cutouts, shiny surfaces, studded, rough, distressed',
    silhouettes: '',
  },
  Contemporary: {
    energy: 'Yang',
    words: 'Modern, innovative, energetic, discerning, sexy, current, hipster, fun, chic, status, designer, leading edge, stylish, in style, up to the minute, trendy, fashionista, luxury, elegant, powerful, vivacious, magnetic',
    shadowSide: 'Trying too hard, keeping up with the, Joneses, sameness, being label-conscious',
    mostImportant: 'Wearing what’s hot and in style, wearing the season’s best colors, looking on-trend',
    elements: 'Pairing trendy items with timeless pieces, designer handbag and shoes',
    colors: 'Blue, red, black, green, gold, metallic, brown',
    patterns: 'Bold, colorful prints, abstract, stripes, dots, floral, color blocks',
    textures: 'Sheer, smooth, denim',
    silhouettes: 'Columnar, flowy, sleek, tailored, structure',
  },
  Natural: {
    energy: 'Yin',
    words: 'Nurturing, organic, hand-crafted, homespun, easy going, comfortable, authentic, reliable, unconventional, free-spirit, eco-friendly, conscious, enlightened, fresh, creative, practical, energetic, intuitive, relaxed rustic sacred understated',
    shadowSide: 'Looking frumpy, boring, plain, wearing oversized clothing that hides your shape',
    mostImportant: 'Wearing natural fibers, fabrics that feel good to the touch and comfortable against the skin',
    elements: 'Natural fibers, soft textures and elements that feel good',
    colors: 'Green, ivory, beige, muted colors',
    patterns: 'Florals, abstract, swirls',
    textures: 'Nubby, rough, flowy, sheer, layered, embroidered, hand stitched, elastic',
    silhouettes: 'Flowy, layered, relaxed, unstructured',
  },
  Whimsical: {
    energy: 'Yin',
    words: 'Playful, fun, mismatched, layered, cute, colorful, spirited, rich, energetic, creative, excite, intrigue, interesting, multi-faceted, surprise, delight, indulge, decadent, eclectic, regal, whimsy, unexpected, youthful, fantasy, innovative, bold, curious',
    shadowSide: 'Looking silly, dressing too youthful, overkill, being label- conscious',
    mostImportant: 'Fun and surprise',
    elements: 'Mix things in new and different ways. Ask yourself what’s unexpected?',
    colors: 'Vibrant, multi-colored, brights, pastels and neutrals and blended together and mixed in unexpected ways',
    patterns: 'Polka dots, stripes, floral, swirls, medium to small animal prints, colorful patchwork, butterflies, insects',
    textures: 'Ribbed, nubby, lustrous, sensuous, soft, beaded, ribbons',
    silhouettes: 'Boxy, short, layered, defined, style lines, short over long, curved, playful shapes such as animals or flowers',
  },
  Delicate: {
    energy: 'Yin',
    words: 'Refined, sweet, thoughtful, understated, sensitive, cute, quiet, playful, dainty, soft, relaxed, demure, tasteful, reserved, precise, unfussy, petite feminine cultivated',
    shadowSide: 'Childlike, dressing too young, being overpowered by clothes or shapes, getting lost',
    mostImportant: 'Undeniably feminine yet understated',
    elements: 'Feminine with a touch of girlish charm, pretty, sleek',
    colors: 'Ivory, beige, muted colors, pastels',
    patterns: 'Tiny prints, ditsy prints, polka dots, thin stripes, hearts, flowers',
    textures: 'Soft, flowy, smooth',
    silhouettes: 'Curved, untailored, details',
  },
  Romantic: {
    energy: 'Yin',
    words: 'Flowing, bohemian, spirit of the southwest, angelic, sensual, nostalgic, vintage, ruffles, flourish, sweet, feminine, pretty, a little bit country, flirtatious, charming, soft, charismatic, impulsive, sentimental graceful history cherish',
    shadowSide: 'too much of a good thing, overpowering looks, overdone makeup, overkill',
    mostImportant: 'Unabashedly feminine, sense of history, items that tell a story',
    elements: 'Flounces, ruffles, lace, vintage inspired charm, nostalgia',
    colors: 'Dark, purple, pink, black, caramel, teal, taupe, gray, metallic',
    patterns: 'Floral, dots, stripes, mixed patterns',
    textures: 'Lace, sheer, fluid, flowy',
    silhouettes: 'Contoured, full, flowy, soft, rounded',
  },
};

/** Keyed `${primary}/${secondary}`, matching ARCHETYPES. */
export const ARCHETYPE_REFERENCE: Record<string, ArchetypeReference> = {
  'Classic/Delicate': {
    name: 'The Gracious',
    descriptor: 'Ladylike, reserved, demure',
    styleIcons: [
      'Princess Diana',
      'Giada DeLaurentis',
      'Rachel Bilson',
      'Grace Kelly',
      'Natalie Portman',
    ],
    elements: [
      'Understated Femininity',
      'Timeless Style',
      'Relaxed structure',
      'Elegance',
    ],
    shadowSide: [
      'Looking too young or too old',
      'Looking dated',
      'Looking boring',
      'Hiding your shape',
    ],
    statement: 'Understated Elegance',
  },
  'Classic/Natural': {
    name: 'The Genuine',
    descriptor: 'Refined, Authentic, Prestige',
    styleIcons: [
      'Jackie Kennedy',
      'Katie Holmes',
      'Michelle Obama',
      'Kate Middleton',
    ],
    elements: [
      'Timeless Styling',
      'Understated details',
      'Relaxed structure',
      'Fabrics that feel good',
    ],
    shadowSide: [
      'Looking matronly',
      'Looking boring',
      'Looking dated',
      'Hiding your shape',
    ],
    statement: 'Simple Elegance',
  },
  'Classic/Romantic': {
    name: 'The Sentimental',
    descriptor: 'Understated, Nostalgic, Elegant',
    styleIcons: [
      'Anne Hathaway',
      'Rachel Weisz',
      'Lily Collins',
      'Marion Cotillard',
    ],
    elements: [
      'Unabashedly Feminine',
      'Timeless Style',
      'Relaxed structure',
      'Elegance',
    ],
    shadowSide: [
      'Looking overdone',
      'Looking dated',
      'Looking frumpy',
      'Hiding your shape',
    ],
    statement: 'Feminine Elegance',
  },
  'Classic/Whimsical': {
    name: 'The Adventurer',
    descriptor: 'Sophisticated, Polished, Creative',
    styleIcons: [
      'Diane Keaton',
      'Jenna Lyons',
      'Audrey Hepburn',
      'Olivia Palermo',
    ],
    elements: [
      'Fun & Surprise',
      'Timeless Style',
      'Relaxed structure',
      'Something Unexpected',
    ],
    shadowSide: [
      'Looking too young or too old',
      'Looking silly',
      'Looking dated',
      'Hiding your shape',
    ],
    statement: 'Classic with a Twist',
  },
  'Contemporary/Delicate': {
    name: 'The Cosmopolitan',
    descriptor: 'Modern, Refined, Unfussy',
    styleIcons: [
      'Jane Birkin',
      'Naomi Watts',
      'Carolyn Bessette-Kennedy',
      'Katie Holmes',
    ],
    elements: [
      'Up to the minute style',
      'Latest colors and trends',
      'Understated look',
      'Undeniably Feminine',
    ],
    shadowSide: [
      'Dressing too youthful',
      'Being overpowered by clothing',
      'Being label-conscious',
      'Getting lost',
      'Keeping up with the Joneses',
    ],
    statement: 'Fashionably Understated',
  },
  'Contemporary/Natural': {
    name: 'The Polished',
    descriptor: 'Elegant, Unconventional, Relaxed',
    styleIcons: [
      'Lauren Hutton',
      'Gisele Bundchen',
      'Naomi Watts',
      'Jennifer Aniston',
    ],
    elements: [
      'Up to the minute style',
      'Latest colors and trends',
      'Wearing fabrics that feel good',
      'Relaxed structure',
    ],
    shadowSide: [
      'Trying too hard',
      'Looking frumpy',
      'Hiding your shape',
      'Keeping up with the Joneses',
    ],
    statement: 'Relaxed Chic',
  },
  'Contemporary/Romantic': {
    name: 'The Superstar',
    descriptor: 'Powerful, Sexy, Charismatic',
    styleIcons: [
      'Beyonce Knowles',
      'Goldie Hawn',
      'Tyra Banks',
      'Farrah Fawcett',
      'Jennifer Lopez',
    ],
    elements: [
      'Wearing what’s on trend',
      'Wearing current colors',
      'Feminine looks',
      'Sense of history',
    ],
    shadowSide: [
      'Trying too hard',
      'Anything overdone',
      'Too much of a good thing',
      'Keeping up with the Joneses',
    ],
    statement: 'Modern Glamour',
  },
  'Contemporary/Whimsical': {
    name: 'The Trendsetter',
    descriptor: 'Luxury, Stylish, Surprise',
    styleIcons: [
      'Kim Kardashian',
      'Kate Moss',
      'Olivia Palermo',
      'Alexa Chung',
    ],
    elements: [
      'Up to the minute style',
      'Latest colors and trends',
      'Something Fun',
      'Unexpected combinations',
    ],
    shadowSide: [
      'Trying too hard',
      'Looking frumpy',
      'Hiding your shape',
      'Keeping up with the Joneses',
    ],
    statement: 'Stylish Surprise',
  },
  'Delicate/Classic': {
    name: 'The Darling',
    descriptor: 'Feminine, Refined, Sweet',
    styleIcons: [
      'Audrey Hepburn',
      'Natalie Portman',
      'Lily Collins',
      'Emmy Rossum',
      'Grace Kelly',
    ],
    elements: [
      'Delicate femininity',
      'Refined details',
      'Timeless silhouettes',
      'Soft sophistication',
    ],
    shadowSide: [
      'Looking too girlish',
      'Looking overly conservative',
      'Fading into the background',
      'Looking dated or overly precious',
    ],
    statement: 'Timeless Femininity',
  },
  'Delicate/Contemporary': {
    name: 'The Understated',
    descriptor: 'Refined, Feminine, Modern',
    styleIcons: [
      'Naomi Watts',
      'Carolyn Bessette-Kennedy',
      'Katie Holmes',
      'Gwyneth Paltrow',
      'Felicity Jones',
    ],
    elements: [
      'Understated femininity',
      'Modern simplicity',
      'Refined details',
      'Current accents',
    ],
    shadowSide: [
      'Fading into the background',
      'Looking too plain',
      'Being overpowered by trends',
      'Dressing too youthful',
      'Playing it too safe',
    ],
    statement: 'Quietly Chic',
  },
  'Delicate/Dramatic': {
    name: 'The Primadonna',
    descriptor: 'Exquisite, Captivating, Dramatic',
    styleIcons: [
      'Lily Collins',
      'Audrey Hepburn',
      'Rooney Mara',
      'Anya Taylor-Joy',
      'Winona Ryder',
    ],
    elements: [
      'Exquisite details',
      'Feminine silhouettes',
      'High contrast',
      'Dramatic accents',
    ],
    shadowSide: [
      'Looking too precious',
      'Letting clothes overpower you',
      'Trying too hard',
      'Looking overly theatrical',
    ],
    statement: 'Exquisite Drama',
  },
  'Delicate/Sporty': {
    name: 'The Informal',
    descriptor: 'Soft, Casual, Unassuming',
    styleIcons: [
      'Michelle Williams',
      'Kristen Bell',
      'Reese Witherspoon',
      'Meg Ryan',
      'Amy Adams',
    ],
    elements: [
      'Understated femininity',
      'Soft details',
      'Comfortable fabrics',
      'Casual ease',
    ],
    shadowSide: [
      'Looking too youthful',
      'Looking frumpy',
      'Fading into the background',
      'Sacrificing style for comfort',
      'Being overpowered by clothing',
    ],
    statement: 'Casual Femininity',
  },
  'Dramatic/Delicate': {
    name: 'The Demure Diva',
    descriptor: 'Mysterious, Refined, Exciting',
    styleIcons: [
      'Gennifer Goodwin',
      'Tina Fey',
      'Mae West',
      'Dita von Teese',
    ],
    elements: [
      'Sculptural Cuts',
      'Girlish charm',
      'Soft Details',
      'Sleek lines',
    ],
    shadowSide: [
      'Trying too hard',
      'Looking childlike',
      'Hiding your shape',
      'Letting clothes wear you',
    ],
    statement: 'Boldly Feminine',
  },
  'Dramatic/Natural': {
    name: 'The Bon Vivant',
    descriptor: 'Free-spirit – Enlightened - Innovative',
    styleIcons: [
      'Donna Karan',
      'Lupita Nyong’o',
      'Tilda Swinton',
      'Linda Rodin',
    ],
    elements: [
      'Sculptural Cuts',
      'Natural Fibers',
      'Minimalist Details',
      'Soft Textures',
    ],
    shadowSide: [
      'Trying too hard',
      'Looking frumpy',
      'Hiding your shape',
      'Letting clothes wear you',
    ],
    statement: 'Artful Ease',
  },
  'Dramatic/Romantic': {
    name: 'The Sensualist',
    descriptor: 'Magnetic – Sophisticated – Seductive',
    styleIcons: [
      'Monica Bellucci',
      'Sophia Loren',
      'Catherine Zeta-Jones',
      'Salma Hayek',
    ],
    elements: [
      'Sensuous Silhouettes',
      'Luxurious Fabrics',
      'Dramatic Details',
      'Rich Color',
    ],
    shadowSide: [
      'Overdoing the sex appeal',
      'Looking overly glamorous',
      'Mistaking tight for sensual',
      'Hiding your sensuality to fit in',
    ],
    statement: 'Magnetic Allure',
  },
  'Dramatic/Whimsical': {
    name: 'The Ingenue',
    descriptor: 'Strong, Playful, Elegant',
    styleIcons: [
      'Isabella Blow',
      'Pink!',
      'Tina Chow',
      'Tracee Ellis Ross',
      'Lady Gaga',
    ],
    elements: [
      'Sculptural Cuts',
      'Playful Combinations',
      'Bold Details',
      'Colorful Items',
      'Conversation pieces',
    ],
    shadowSide: [
      'Trying too hard',
      'Looking frumpy',
      'Hiding your shape',
      'Letting clothes wear you',
    ],
    statement: 'Spirited Elegance',
  },
  'Natural/Classic': {
    name: 'The Girl Next Door',
    descriptor: 'Fresh, Timeless, Genuine',
    styleIcons: [
      'Katie Couric',
      'Julie Roberts',
      'Mia Farrow',
      'Liz Lange',
    ],
    elements: [
      'Fabrics with Stretch',
      'Natural Fibers',
      'Timeless Pieces',
      'Functional Items',
    ],
    shadowSide: [
      'Looking boring',
      'Looking frumpy',
      'Hiding your shape',
    ],
    statement: 'Easy Care, Easy Wear',
  },
  'Natural/Contemporary': {
    name: 'The Essential',
    descriptor: 'Sexy, Easy-going, Stylish',
    styleIcons: [
      'Gwyneth Paltrow',
      'Jennifer Lawrence',
      'Alicia Silverstone',
      'Julianne Moore',
    ],
    elements: [
      'Wearing the best colors',
      'Natural Fibers',
      'Looking on-trend',
      'Luxurious fabrics',
    ],
    shadowSide: [
      'Looking boring',
      'Looking frumpy',
      'Trying too hard',
      'Hiding your shape',
    ],
    statement: 'Relaxed Polish',
  },
  'Natural/Dramatic': {
    name: 'The Artiste',
    descriptor: 'Authentic, Innovative, Unconventional',
    styleIcons: [
      'Georgia O’Keefe',
      'Norma Kamali',
      'Vera Wang',
      'Anne Hathaway',
    ],
    elements: [
      'Sculptural Cuts',
      'Natural Fibers',
      'Minimalist Details',
      'Soft Textures',
    ],
    shadowSide: [
      'Trying too hard',
      'Looking frumpy',
      'Hiding your shape',
      'Letting clothes wear you',
    ],
    statement: 'Sculptural Simplicity',
  },
  'Natural/Sporty': {
    name: 'The Easy Going',
    descriptor: 'Relaxed, Unfussy, Warm',
    styleIcons: [
      'Cameron Diaz',
      'Sienna Miller',
      'Jennifer Aniston',
      'Lauren Hutton',
    ],
    elements: [
      'Fabrics with Stretch',
      'Natural Fibers',
      'Comfort',
      'Ease',
    ],
    shadowSide: [
      'Looking boring',
      'Looking frumpy',
      'Hiding your shape',
    ],
    statement: 'Form + Function',
  },
  'Romantic/Classic': {
    name: 'The Nostalgic',
    descriptor: 'Timeless, Charming, Sentimental',
    styleIcons: [
      'Diane Lane',
      'Michelle Pfeiffer',
      'Kate Winslet',
      'Marcia Cross',
    ],
    elements: [
      'Unabashed Femininity',
      'Timeless cuts',
      'Items that tell a story',
      'Vintage Inspiration',
    ],
    shadowSide: [
      'Trying too hard',
      'Overkill',
      'Hiding your shape',
      'Looking Dated',
      'Looking Matronly',
    ],
    statement: 'Sentimental Sophistication',
  },
  'Romantic/Contemporary': {
    name: 'The Charmer',
    descriptor: 'Alluring, Stylish, Irresistible',
    styleIcons: [
      'Blake Lively',
      'Sofia Vergara',
      'Kate Hudson',
      'Jennifer Aniston',
      'Eva Mendes',
    ],
    elements: [
      'Feminine silhouettes',
      'Sensual details',
      'Current trends',
      'Luxurious fabrics',
    ],
    shadowSide: [
      'Looking overly sexy',
      'Trying too hard',
      'Too much femininity',
      'Chasing trends that don’t flatter',
    ],
    statement: 'Modern Romance',
  },
  'Romantic/Dramatic': {
    name: 'The Bohemian',
    descriptor: 'Enchanting – Exotic - Presence',
    styleIcons: [
      'Helena Bonham Carter',
      'Stevie Nicks',
      'Helena Christensen',
      'Brigitte Bardot',
      'Nichole Richie',
    ],
    elements: [
      'Sculptural Cuts',
      'Unabashed Femininity',
      'Items that make a statement',
      'Conversation pieces',
    ],
    shadowSide: [
      'Trying too hard',
      'Overkill',
      'Hiding your shape',
      'Letting clothes wear you',
    ],
    statement: 'Enchanting Elegance',
  },
  'Romantic/Sporty': {
    name: 'The Flirt',
    descriptor: 'Feminine, Playful, Energetic',
    styleIcons: [
      'Kate Hudson',
      'Jennifer Lopez',
      'Goldie Hawn',
      'Sofia Vergara',
      'Eva Longoria',
    ],
    elements: [
      'Feminine details',
      'Body-conscious silhouettes',
      'Comfortable fabrics',
      'Ease of movement',
    ],
    shadowSide: [
      'Looking too girlish',
      'Showing too much',
      'Sacrificing comfort for sex appeal',
      'Looking overly casual',
    ],
    statement: 'Effortless Allure',
  },
  'Sporty/Delicate': {
    name: 'The Subdued',
    descriptor: 'Informal, Refined, Reserved',
    styleIcons: [
      'Kristen Bell',
      'Halle Berry',
      'Michelle Williams',
      'Marisa Tomei',
    ],
    elements: [
      'Fabrics with Stretch',
      'Comfort',
      'Understated Femininity',
      'Unfussy details',
    ],
    shadowSide: [
      'Looking boring',
      'Looking frumpy',
      'Dressing too youthful',
      'Being overpowered by clothing',
      'Hiding your shape',
    ],
    statement: 'Sleek and Chic',
  },
  'Sporty/Natural': {
    name: 'The Elemental',
    descriptor: 'Comfortable, Authentic, Fresh, ',
    styleIcons: [
      'Alicia Keys',
      'Sandra Bullock',
      'Carolyn Murphy',
      'Cameron Diaz',
    ],
    elements: [
      'Fabrics with Stretch',
      'Comfort',
      'Fabrics that feel good to the touch',
    ],
    shadowSide: [
      'Looking boring',
      'Looking frumpy',
      'In a rut',
      'Lack of style',
      'Hiding your shape',
    ],
    statement: 'Comfort Chic',
  },
  'Sporty/Romantic': {
    name: 'The Impulsive',
    descriptor: 'Energetic, Confident, Impetuous',
    styleIcons: [
      'Naomi Osaka',
      'Serena Williams',
      'Lindsey Vonn',
      'J. Lo',
    ],
    elements: [
      'Fabrics with Stretch',
      'Comfort',
      'Unabashedly Feminine',
      'Sense of History',
    ],
    shadowSide: [
      'Looking boring',
      'Looking frumpy',
      'Overkill',
      'Overpowering looks',
      'Hiding your shape',
    ],
    statement: 'Sexy Comfort',
  },
  'Sporty/Whimsical': {
    name: 'The Playful Muse',
    descriptor: 'Playful, Jaunty, Rich',
    styleIcons: [
      'Jessica Alba',
      'Michelle Williams',
      'Kelly Osborne',
      'Kate Hudson',
    ],
    elements: [
      'Playfulness',
      'Unexpected Combinations',
      'Comfort',
      'Ease of movement',
    ],
    shadowSide: [
      'Looking too youthful',
      'Looking silly',
      'Frumpy',
      'Wearing oversized clothing',
    ],
    statement: 'Eclectic Chic',
  },
  'Whimsical/Classic': {
    name: 'The Spirited',
    descriptor: 'Playful, Polished, Charming',
    styleIcons: [
      'Olivia Palermo',
      'Emma Stone',
      'Kate Spade',
      'Jenna Lyons',
    ],
    elements: [
      'Playful sophistication',
      'Polished silhouettes',
      'Unexpected details',
      'Color & pattern',
    ],
    shadowSide: [
      'Looking too prim',
      'Looking too youthful',
      'Over-coordinating',
      'Playing it too safe',
    ],
    statement: 'Polished Playfulness',
  },
  'Whimsical/Contemporary': {
    name: 'The Fanciful',
    descriptor: 'Eclectic – Elegant - Intrigue',
    styleIcons: [
      'Betsy Johnson',
      'Zandra Rhodes',
      'Vivienne Westwood',
      'Chloe Sevigny',
    ],
    elements: [
      'Playfulness',
      'Unexpected Combinations',
      'Looking on Trend',
      'Wearing the Hottest Colors',
    ],
    shadowSide: [
      'Looking too youthful',
      'Looking silly',
      'Keeping up with the Joneses',
      'Looking too trendy',
    ],
    statement: 'Eclectic Chic',
  },
  'Whimsical/Dramatic': {
    name: 'The Creative',
    descriptor: 'Spirited, Passionate, Purposeful',
    styleIcons: [
      'Katy Perry',
      'Nancy Cunard',
      'Dita von Teese,',
    ],
    elements: [
      'Playfulness',
      'Being Unique',
      'Something Unexpected',
      'Making a Statement',
    ],
    shadowSide: [
      'Looking too youthful',
      'Looking silly',
      'Letting clothing wear you',
      'Wearing something inappropriate',
    ],
    statement: 'Edgy Fun',
  },
  'Whimsical/Sporty': {
    name: 'The Clever',
    descriptor: 'Playful, Jaunty, Rich',
    styleIcons: [
      'Jessica Alba',
      'Gwen Stefani',
      'Kelly Osborne',
      'Zooey Deschanel',
    ],
    elements: [
      'Playfulness',
      'Unexpected Combinations',
      'Comfort',
      'Ease of movement',
    ],
    shadowSide: [
      'Looking too youthful',
      'Looking silly',
      'Frumpy',
      'Wearing oversized clothing',
    ],
    statement: 'Eclectic Chic',
  },
};
