/**
 * Fixed Blueprint front and back matter.
 *
 * The cover letter and the About page are identical in every Blueprint Mary
 * Michele has authored, so they are template text rather than something the
 * model writes each time. That is cheaper, and it means her own words about
 * her own practice can never drift.
 *
 * Only the client's first name varies.
 */

/** The opening letter, addressed to the client. */
export function coverLetter(firstName: string): string {
  return `Bonjour ${firstName},

Congratulations! You've just taken a powerful step toward aligning how you show up in the world — with both your personal style and your personal brand presence.

Your StyleFinder ID® Blueprint is designed to be your **guide**. Inside, you'll discover how your unique style energies blend together, how they **influence** the way you dress, how others **perceive** you, and how you can **translate** that into your *magnetic brand identity.*

Think of this as both a mirror and a map:

- A **mirror** that reflects your authentic self back to you with clarity and confidence.
- A **map** that points you toward new ways to elevate your visibility, embrace your individuality, and lead with impact.

As you read through your profile, I invite you to stay **curious** and **open**. Notice what **resonates**, what **excites** you, and even what **stretches** you. This isn't about **changing** who you are — it's about **amplifying** the best of you so that your style and brand feel *effortless, authentic, and powerful.*

I'm thrilled to walk alongside you in this journey of expression, alignment, and visibility.

To your most confident and magnetic self,

**Mary Michele Nidiffer**
The Visibility Stylist™`;
}

/** The About page. Identical in every Blueprint. */
export const ABOUT_MARY_MICHELE = `## About Mary Michele

Mary Michele Nidiffer is The Visibility Stylist™, a Master Style & Empowerment Coach and the creator of the StyleFinder ID® System, the **first framework to decode your style DNA and align your wardrobe, brand, and your leadership presence**. She is passionate about helping midlife women break free from the Invisibility Trap — the exhausting cycle of feeling not enough, shrinking into victimhood, and chasing external validation — so they can reclaim their identity, embody unapologetic confidence, and lead with magnetic presence.

A North Carolina native, Mary Michele knows firsthand what it feels like to wrestle with low self-esteem and the belief of not being enough. Her personal journey from insecurity to empowerment fuels her mission to guide women in transforming not just their wardrobes, but their entire self-image.

Through coaching, courses, workshops, retreats, VIP Days, and powerful online content, she empowers women to rewrite their stories, shed limiting beliefs, and fully step into the vibrant, visible, and confident lives they deserve.

### Let's Connect

- Podcast — The Art of Becoming Visible
- Substack — The Art of Becoming Visible
- Instagram — @marymicheleofficial
- LinkedIn — Mary Michele Nidiffer
- Facebook — The Art of Becoming Visible

*"What you wear tells the world who you are. What is your wardrobe saying about you?"*`;

/** The closing reassurance. Appears in several of the authored Blueprints. */
export const YES_YOU_DO_HAVE_A_STYLE = `## Yes, You Do Have a Style

Many clients have told me over the years that they 'don't have a style' or they're 'all over the map'. The truth is, you were born with your very own authentic personal style that is unique to you, much like your fingerprint. Yet most women are not in touch with what their style actually is. Women often say they don't have a style — in actuality they do, but they've either lost touch with it or just haven't discovered it yet. Through your StyleFinder ID® you will be able to truly understand your personal style and how to express it.`;

/**
 * Assemble the delivered document: fixed front matter, the generated body,
 * then fixed back matter.
 */
export function assembleBlueprint(
  firstName: string,
  generatedBody: string,
): string {
  return [
    coverLetter(firstName),
    '',
    '---',
    '',
    ABOUT_MARY_MICHELE,
    '',
    '---',
    '',
    generatedBody.trim(),
    '',
    '---',
    '',
    YES_YOU_DO_HAVE_A_STYLE,
  ].join('\n');
}
