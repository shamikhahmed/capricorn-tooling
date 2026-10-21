# Apple HIG digest — 2026-10-21

Source: `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`
Fetched live by Cursor for v7. Rules marked **HARD** match Never/Don't/Always/Must language in Apple copy.

**Note:** `navigation-bars.json` returns HTTP 404 — Apple renamed the page to `navigation-and-search` (fetched). Also used `toolbars`, `sidebars`, `status-bars`.

Also see: https://developer.apple.com/design/ (SF Symbols, Icon Composer, Design Resources, Liquid Glass).

## accessibility
- Page: https://developer.apple.com/design/human-interface-guidelines/accessibility
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json

- Your interface can support font size enlargement either through custom UI, or by adopting Dynamic Type.
- Dynamic Type is a systemwide setting that lets people adjust the size of text for comfort and legibility.
- Use recommended defaults for custom type sizes.
- Each platform has different default and minimum sizes for system-defined type styles to promote readability.
- If you’re using custom type styles, follow the recommended defaults.
- Platform Default size Minimum size iOS, iPadOS 17 pt 11 pt macOS 13 pt 10 pt tvOS 29 pt 23 pt visionOS 17 pt 12 pt watchOS 16 pt 12 pt Bear in mind that font weight can also impact how easy text is to read.
- Strive to meet color contrast minimum standards.
- To ensure all information in your app is legible, it’s important that there’s enough contrast between foreground text and icons and background colors.
- Two popular standards of measure for color contrast are the and the Accessible Perceptual Contrast Algorithm (APCA).
- Use standard contrast calculators to ensure your UI meets acceptable levels. uses the following values from WCAG Level AA as guidance in determining whether your app’s colors have an acceptable contrast.
- Text size Text weight Minimum contrast ratio Up to 17 pts All 4.5:1 18 pts All 3:1 All Bold 3:1 If your app doesn’t provide this minimum contrast by default, ensure it at least provides a higher contrast color scheme when the system setting Increase Contrast is turned on.
- If your app supports , make sure to check the minimum contrast in both light and dark appearances.
- A button with insufficient color contrast A button with sufficient color contrast Prefer system-defined colors.
- These colors have their own accessible variants that automatically adapt when people adjust their color preferences, such as enabling Increase Contrast or toggling between the light and dark appearances.
- The default color in iOS The accessible color in iOS Convey information with more than color alone.
- Describe your app’s interface and content for VoiceOver.
- VoiceOver is a screen reader that lets people experience your app’s interface without needing to see the screen.
- Strive to meet the recommended minimum control size for each platform to ensure controls and menus are comfortable for all when tapping and clicking.
- Platform Default control size Minimum control size iOS, iPadOS 44x44 pt 28x28 pt macOS 28x28 pt 20x20 pt tvOS 66x66 pt 56x56 pt visionOS 60x60 pt 28x28 pt watchOS 44x44 pt 28x28 pt Consider spacing between controls as important as size.
- For interactions people do frequently in your app or game, use the simplest gesture possible — avoid custom multifinger and multihand gestures — so repetitive actions are both comfortable and easy to remember.
- Apple’s accessibility features help people with speech disabilities and people who prefer text-based interactions to communicate effectively using their devices.
- Avoid overriding system-defined keyboard shortcuts and evaluate your app to ensure it works well with Full Keyboard Access.
- **HARD** Prefer system gestures and behaviors people are already familiar with over creating custom gestures people must learn and retain.
- Prefer dismissing views with an explicit action.
- Avoid autoplaying audio and video content without also providing controls to start and stop it.
- People might want to avoid bright, frequent flashes of light in the media they consume.
- People who are prone to these effects can turn on the Reduce Motion accessibility setting.
- Other best practices for reducing motion include: Tightening animation springs to reduce bounce effects Tracking animations directly with people’s gestures Avoiding animating depth changes in z-axis layers Replacing transitions in x-, y-, and z-axes with fades to avoid motion Avoiding animating into and out of blurs Optimize your app’s UI for Assistive Access.
- Assistive Access sets a default layout and control presentation for apps that reduces cognitive load, such as the following layout of the Camera app.
- **HARD** Always ask for confirmation twice whenever people perform an action that’s difficult to recover from, such a deleting a file.
- Prefer horizontal layouts to vertical ones that might cause neck strain, and avoid demanding the viewer’s attention in different locations in quick succession.
- Be gentle with camera and video motion, and avoid situations where someone may feel like the world around them is moving without their control.
- Avoid anchoring content to the wearer’s head, which may make them feel stuck and confined, and also prevent them from using assistive technologies like Pointer Control.
- Moved Dynamic Type guidance to the Typography page, and moved VoiceOver guidance to a new VoiceOver page.
- June 10, 2024 Added a link to Apple’s Unity plug-ins for supporting Dynamic Type.

## app-icons
- Page: https://developer.apple.com/design/human-interface-guidelines/app-icons
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/app-icons.json

- In Icon Composer, you define the background layer for your icon, adjust your foreground layer placement, apply visual effects like specular highlights and refraction, annotate for default, dark, and mono appearance variants, test and preview your icon across system versions, and export your icon for use in Xcode.
- Prefer clearly defined edges in foreground layers.
- To ensure system-drawn highlights and shadows look best, avoid soft and feathered edges on foreground layer shapes.
- Prefer vector graphics when bringing layers into Icon Composer.
- For mesh gradients and raster artwork, prefer PNG format because it’s a lossless image format.
- Keep primary content centered to avoid truncation when the system adjusts corners or applies masking.
- Prefer a simple background, such as a solid color or gradient, that puts the emphasis on your primary design — you don’t need to fill the entire icon canvas with content.
- Although displaying a mnemonic like the first letter of your app’s name can help people recognize your app or game, avoid including nonessential words that tell people what to do with it — like “Watch” or “Play” — or context-specific terms like “New” or “For visionOS.” If you include text in a tvOS app icon, make sure it’s above other layers so it’s not cropped by the parallax effect.
- Prefer illustrations to photos and avoid replicating UI components.
- Make sure to avoid extremely thin line weights and sharp corners, because they tend to lose detail and crispness in smaller icon sizes at lower resolutions.
- In iOS, iPadOS, and macOS, people can choose whether their Home Screen app icons are default, dark, clear, or tinted in appearance.
- To create a seamless experience, keep your icon’s core visual features the same in the default, dark, clear, and tinted appearances.
- Avoid creating custom icon variants that swap elements in and out with each variant, which may make it harder for people to find your app when they switch appearances.
- You can preserve the color palette of your default icon, but be mindful that dark icons are more subdued, and clear and tinted icons are even more so.
- Choose complementary colors that reflect the default design, and avoid excessively bright images.
- Color backgrounds generally offer the greatest contrast in dark icons.
- Avoid creating one someone might mistake for another app.
- **HARD** As with your default app icon, all alternate and variant icons are subject to app review and must adhere to the .
- **HARD** To ensure that your icon’s content is always visible, keep a safe zone around it.
- Avoid adding a shape that’s intended to look like a hole or concave area to the background layer.
- Avoid using black for your icon’s background.
- Platform Layout shape Icon shape after system masking Layout size Style Appearances iOS, iPadOS, macOS Square Rounded rectangle (square) 1024x1024 px Layered Default, dark, clear light, clear dark, tinted light, tinted dark tvOS Rectangle (landscape) Rounded rectangle (rectangular) 800x480 px Layered (Parallax) N/A visionOS Square Circular 1024x1024 px Layered (3D) N/A watchOS Square Circular 1088x1088 px Layered N/A The system automatically scales your icon to produce smaller variants that appe

## branding
- Page: https://developer.apple.com/design/human-interface-guidelines/branding
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/branding.json

- If your brand is strongly associated with a specific font, be sure that it’s legible at all sizes and supports accessibility features like bold text and Dynamic Type.
- It can work well to use a custom font for headlines and subheadings while using system fonts for body copy and captions, because the system fonts are designed for optimal legibility at small sizes.
- **HARD** Ensure branding always defers to content.
- Avoid using a launch screen as a branding opportunity.
- **HARD** Apple trademarks must not appear in your app name or images.

## color
- Page: https://developer.apple.com/design/human-interface-guidelines/color
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json

- Avoid using the same color to mean different things.
- Make sure all your app’s colors work well in light, dark, and increased contrast contexts. iOS, iPadOS, macOS, and tvOS offer both light and dark appearance settings.
- System colors vary subtly depending on the system appearance, adjusting to ensure proper color differentiation and contrast for text, symbols, and other elements.
- With the Increase Contrast setting turned on, the color differences become far more apparent.
- If you define a custom color, make sure to supply light and dark variants, and an increased contrast option for each variant that provides a significantly higher amount of visual differentiation.
- Default (light) Increased contrast (light) Default (dark) Increased contrast (dark) Test your app’s color scheme under a variety of lighting conditions.
- If your app lets people choose colors, prefer system-provided color controls where available.
- Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information.
- Avoid using colors that make it hard to perceive content in your app.
- For example, insufficient contrast can cause icons and text to blend with the background and make content hard to read, and people who are color blind might not be able to distinguish some color combinations.
- Avoid hard-coding system color values in your app.
- Avoid redefining the semantic meanings of dynamic system colors.
- By default, Liquid Glass has no inherent color, and instead takes on colors from the content directly behind it.
- By default, Liquid Glass picks up the color from the content layer behind it.
- By default, symbols and text on these elements follow a monochromatic color scheme, becoming darker when the underlying content is light, and lighter when it’s dark.
- Avoid using similar colors in control labels if your app has a colorful background.
- If your app features colorful backgrounds or visually rich content, prefer a monochromatic appearance for toolbars and tab bars, or choose an accent color with sufficient visual differentiation.
- By contrast, in apps with primarily monochromatic content or backgrounds, choosing your brand color as the app accent color can be an effective way to tailor your app experience and reflect your company’s identity.
- Make sure your interface maintains sufficient contrast by avoiding overlap of similar colors in the content layer and controls when possible.
- Although colorful content might intermittently scroll underneath controls, make sure its default or resting state — like the top of a screen of scrollable content — maintains clear legibility.
- To avoid these issues and to ensure visual fidelity on both wide color and sRGB displays, you can use the asset catalog of your Xcode project to provide different versions of images and colors for each color space. iOS defines two sets of dynamic background colors — system and grouped — each of which contains primary, secondary, and tertiary variants that help you convey a hierarchy of information.
- Avoid using only color to indicate focus.
- Prefer using color in places where it can help call attention to important information or show the relationship between parts of the interface.
- Prefer using color in bold text and large areas.
- Although using high contrast can help direct people’s attention to important content, it can also cause visual discomfort if people’s eyes have adjusted to low light or darkness.
- For example, avoid displaying a bright object on a very dark or black background, especially if the object flashes or moves.
- Avoid using full-screen background color in views that are likely to remain onscreen for long periods of time, such as in a workout or audio-playing app.
- Recognize that people might prefer graphic complications to use tinted mode instead of full color.
- Name SwiftUI API Default (light) Default (dark) Increased contrast (light) Increased contrast (dark) Red Orange Yellow Green Mint Teal Cyan Blue Indigo Purple Pink Brown visionOS system colors use the default dark color values.
- Name UIKit API Default (light) Default (dark) Increased contrast (light) Increased contrast (dark) Gray Gray (2) Gray (3) Gray (4) Gray (5) Gray (6) In SwiftUI, the equivalent of is . — SwiftUI — UIKit — AppKit Date Changes December 16, 2025 Updated guidance for Liquid Glass.
- December 19, 2022 Corrected RGB values for system mint color (Dark Mode) in iOS and iPadOS.

## dark-mode
- Page: https://developer.apple.com/design/human-interface-guidelines/dark-mode
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/dark-mode.json

- In iOS, iPadOS, macOS, and tvOS, people often choose Dark Mode as their default interface style, and they generally expect all apps and games to respect their preference.
- In Dark Mode, the system uses a dark color palette for all screens, views, menus, and controls, and may also use greater perceptual contrast to make foreground content stand out against the darker backgrounds.
- Avoid offering an app-specific appearance setting.
- For example, in Dark Mode with Increase Contrast and Reduce Transparency turned on (both separately and together), you may find places where dark text is less legible when it’s on a dark background.
- You might also find that turning on Increase Contrast in Dark Mode can result in reduced visual contrast between dark text and a dark background.
- Although people with strong vision might still be able to read lower contrast text, such text could be illegible for many.
- The Stocks app uses a dark-only appearance The color palette in Dark Mode includes dimmer background colors and brighter foreground colors.
- Avoid using hard-coded color values or colors that don’t adapt.
- System colors in the light appearance System colors in the dark appearance Aim for sufficient color contrast in all appearances.
- Using system-defined colors can help you achieve a good contrast ratio between your foreground and background content.
- At a minimum, make sure the contrast ratio between colors is no lower than 4.5:1.
- For custom foreground and background colors, strive for a contrast ratio of 7:1, especially in small text.
- If you display a content image that includes a white background, consider slightly darkening the image to prevent the background from glowing in the surrounding Dark Mode context.
- The system uses (which automatically adapt to Dark Mode) and full-color images that are optimized for both the light and dark appearances.
- For example, an icon that depicts a full moon might need a subtle dark outline to contrast well with a light background, but need no outline when it displays on a dark background.
- Icon in the light appearance with no border Icon in the dark appearance with border for better contrast Make sure full-color images and icons look good in both appearances.
- Illustration on a light background On a dark background, the same illustration has poor contrast and many details are lost Illustration adjusted for better contrast on a dark background The system uses vibrancy and increased contrast to maintain the legibility of text on darker backgrounds.
- Dark Mode isn’t supported in visionOS or watchOS.
- In Dark Mode, the system uses two sets of background colors — called base and elevated — to enhance the perception of depth when one dark interface is layered above another.
- Base Elevated Light Prefer the system background colors.
- Dark Mode is dynamic, which means that the background color automatically changes from base to elevated when an interface is in the foreground, such as a popover or modal sheet.
- Date Changes August 6, 2024 Added art contrasting the light and dark appearances.

## icons
- Page: https://developer.apple.com/design/human-interface-guidelines/icons
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/icons.json

- Prefer depicting gender-neutral human figures and avoid images that might be hard to recognize across different cultures or languages.
- In contrast, PNG — used for app icons and other images that include effects like shading, textures, and highlighting — doesn’t support scaling, so you have to supply multiple versions for each PNG-based interface icon.
- Alternative text labels — or accessibility descriptions — aren’t visible, but they let VoiceOver audibly describe what’s onscreen, simplifying navigation for people with visual disabilities.
- Avoid using replicas of Apple hardware products.
- **HARD** If you must display Apple hardware, use only the images available in or the SF Symbols that represent various Apple products.
- Whether you use a background fill, a center image, or both, prefer uncomplicated shapes and a reduced palette of distinct colors.
- Avoid placing important content in the top-right corner of your background fill.
- By default, the system displays a document’s extension at the bottom edge of the document icon, but if the extension is unfamiliar you can supply a more descriptive term.
- By default, the system capitalizes every letter in the text.

## images
- Page: https://developer.apple.com/design/human-interface-guidelines/images
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/images.json

- For example, a scale factor of 1 (also called @1x) describes a 1:1 pixel density, where one pixel is equal to one point.
- High-resolution 2D displays have higher pixel densities, such as 2:1 or 3:1.
- A 2:1 density (called @2x) has a scale factor of 2, and a 3:1 density (called @3x) has a scale factor of 3.
- **HARD** Always test images on a range of actual devices.
- **HARD** Your tvOS app icon must use a layered image.
- **HARD** If your app retrieves layered images from a content server at runtime, you must provide runtime layered images ( ).
- **HARD** Using varying levels of opacity to let content shine through higher layers is fine, but your background layer must be opaque — you’ll get an error if it’s not.
- **HARD** To ensure that essential content is always visible, keep it within a safe zone.
- Because you can position images at specific angles within someone’s surroundings, image pixels may not line up 1:1 with screen pixels.
- Avoid bitmap content because it might not look good when the system scales it up.
- Prefer the feathered glass background effect to display text over spatial photos.
- The effect adds contrast to make the text readable, and it blurs out detail to help reduce visual discomfort when people view text over spatial photos.
- Avoid displaying spatial photos inline with other content, as this can cause visual discomfort.
- **HARD** If you must display stereoscopic images inline, provide generous spacing between the image and any inline content to help people’s eyes adjust to the depth changes.
- Avoid displaying too many spatial scenes at once.
- When displaying immersively, prefer minimal UI.
- For example, the Spatial Gallery app displays a single piece of content with a small caption and a single Back button, relying on swipe gestures to navigate between items.
- Prefer displaying larger spatial scenes that you center in someone’s field of view.
- In general, avoid transparency to keep image files small.
- **HARD** If you always composite an image on the same solid background color, it’s more efficient to include the background in the image.

## inclusion
- Page: https://developer.apple.com/design/human-interface-guidelines/inclusion
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/inclusion.json

- Although each person’s perspective comprises a unique intersection of human qualities that’s both distinct and dynamic, all perspectives arise from human characteristics and experiences that everyone shares, including: Age Gender and gender identity Race and ethnicity Sexuality Physical attributes Cognitive attributes Permanent, temporary, and situational disabilities Language and culture Religion Education Political or philosophical opinions Social and economic context As you examine your app o
- Focusing on inclusion can help you avoid potentially offensive content while also helping you create a welcoming experience that everyone can enjoy.
- Avoid using specialized or technical terms without defining them.
- **HARD** If you must use such terms, be sure to define them first and make the definitions easy for people to look up.
- For example, a recipe-sharing app that uses copy like “You can let a subscriber post his or her recipes to your shared folder” could avoid unnecessary gender references by using an alternative like “Subscribers can post recipes to your shared folder.” In addition to using the gender-neutral noun “subscribers,” the revised copy avoids the unnecessary singular pronouns “his” and “her,” helping the sentence remain inclusive when it’s localized for languages that use gendered pronouns.
- In addition, you can often avoid referencing a specific gender in an avatar, emoji, glyph, or game character.
- To welcome everyone to your app or game, prefer giving people the tools they need to customize such items as they choose.
- For example, a fitness app could feature exercise moves demonstrated by people with different racial backgrounds, body types, ages, and physical capabilities.
- If you need to depict occupations or behaviors, avoid stereotypical representations, such as showing only male doctors, female nurses, or heroes and villains that may perpetuate real-world racial or gender stereotypes.
- When it makes sense in your app or game, prefer showing places, homes, activities, and items that are familiar and relatable to most people.
- People rely on Apple’s accessibility features — such as VoiceOver, Display Accommodations, closed captioning, Switch Control, and Speak Screen — to customize their devices for their individual needs, so it’s essential to support these features.
- It’s also essential to avoid assuming that any disability might prevent someone from wanting to enjoy the experience your software provides.
- In contrast, when you make each experience accessible, you give everyone the opportunity to benefit from your app or game in ways that work for them.
- Avoid images and language that exclude people with disabilities.
- For example, include people with disabilities when you represent a variety of people, and avoid language that uses a disability to express a negative quality.
- Prefer familiar, consistent interactions that make tasks simple to perform, and ensure that everyone can perceive your content, whether they use sight, hearing, or touch.

## layout
- Page: https://developer.apple.com/design/human-interface-guidelines/layout
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json

- To support right-to-left languages, prefer standard system components that can automatically adapt UI elements to better reflect each language’s natural reading order.
- You can help ensure an adaptable interface by respecting system-defined safe areas, margins, and guides (where available) and specifying layout modifiers to fine-tune the placement of views in your interface.
- People use Dynamic Type to increase text size to be more readable, which occurs at the system level.
- Support Dynamic Type by adjusting your layout to accommodate text at larger sizes.
- For example, horizontally adjacent views may need to stack vertically to provide more space for text; table rows or other containers may need to grow in height so that text isn’t cropped or doesn’t overlap other content; and table rows with a single line of text by default might need to grow vertically to accommodate multiple lines of text.
- To support Dynamic Type in your Unity-based game, use Apple’s accessibility plug-in (for developer guidance, see ).
- A safe area defines the area within a window that isn’t covered on the edge by a hardware feature or another view within the window, like a toolbar, tab bar, or status bar.
- Respecting the safe area is essential to make sure system UI and hardware features like the Dynamic Island don’t obstruct content and controls.
- Avoid placing controls or critical information at the bottom of a window.
- Avoid displaying content behind the camera housing at the top edge of the window.
- Attribute Value Unfocused content width 860 pt Horizontal spacing 40 pt Minimum vertical spacing 100 pt Attribute Value Unfocused content width 560 pt Horizontal spacing 40 pt Minimum vertical spacing 100 pt Attribute Value Unfocused content width 410 pt Horizontal spacing 40 pt Minimum vertical spacing 100 pt Attribute Value Unfocused content width 320 pt Horizontal spacing 40 pt Minimum vertical spacing 100 pt Attribute Value Unfocused content width 260 pt Horizontal spacing 40 pt Minimum vert
- If a row has a title, provide enough spacing between the bottom of the previous unfocused row and the center of the title to avoid crowding.
- When you allow resizing, make sure your layout adapts well as it changes size, and prefer to keep content horizontally centered at very large sizes so people can easily view and interact with it.
- You can also choose to set a minimum and maximum size for windows, volumes, and attached UI elements like ornaments.
- Use these settings to keep elements from overlapping at small sizes, and to keep large layouts from becoming too unwieldy; but don’t use minimum and maximum sizes as a way to prevent resizing.
- When displaying 3D content inline, place it inset in the window to avoid it colliding with other content or controls, or appearing unpredictably outside the window edge.
- Avoid placing more than two or three controls side by side in your interface.

## materials
- Page: https://developer.apple.com/design/human-interface-guidelines/materials
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json

- In contrast to Liquid Glass, the standard materials help with visual differentiation within the content layer.
- The appearance of these variants can differ in response to certain system settings, like if people choose a preferred look for Liquid Glass in their device’s settings, or turn on accessibility settings that reduce transparency or increase contrast in the interface.
- For optimal contrast and legibility, determine whether to add a dimming layer behind components with clear Liquid Glass: If the underlying content is bright, consider adding a dark dimming layer of 35% opacity.
- Avoid selecting a material or effect based on the apparent color it imparts to your interface, because system settings can change its appearance and behavior.
- When you use system-defined vibrant colors, you don’t need to worry about colors seeming too dark, bright, saturated, or low contrast in different contexts.
- Poor contrast between the material and label Good contrast between the material and vibrant color label Consider contrast and visual separation when choosing a material to combine with blur and vibrancy effects.
- For example, consider that: Thicker materials, which are more opaque, can provide better contrast for text and other elements with fine features.
- In addition to Liquid Glass, iOS and iPadOS continue to provide four standard materials — ultra-thin, thin, regular (default), and thick — which you can use in the content layer to help create visual distinction. iOS and iPadOS also define vibrant colors for labels, fills, and separators that are specifically designed to work with each material.
- The name of a level indicates the relative amount of contrast between an element and the background: The default level has the highest contrast, whereas quaternary (when it exists) has the lowest contrast.
- In general, avoid using quaternary on top of the and materials, because the contrast is too low. (default) You can use the following vibrancy values for fills on all materials. (default) The system provides a single, default vibrancy value for a separator , which works well on all materials. macOS provides several standard materials with designated purposes, and vibrant versions of all system colors .
- Glass is an adaptive material that limits the range of background color information so a window can continue to provide contrast for app content while becoming brighter or darker depending on people’s physical surroundings and other virtual content. visionOS doesn’t have a distinct Dark Mode setting.
- Prefer translucency to opaque colors in windows.
- Because full-screen modal views are common in watchOS, the contrast provided by material layers can help orient people in your app and distinguish controls and system elements from other content.
- Avoid removing or replacing material backgrounds for modal sheets when they’re provided by default. — SwiftUI — SwiftUI — UIKit — AppKit Date Changes September 9, 2025 Updated guidance for Liquid Glass.

## motion
- Page: https://developer.apple.com/design/human-interface-guidelines/motion
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json

- Not everyone can or wants to experience the motion in your app or game, so it’s essential to avoid using it as the only way to communicate important information.
- In apps, generally avoid adding motion to UI interactions that occur frequently.
- For a custom element, you generally want to avoid making people spend extra time paying attention to unnecessary motion every time they interact with it.
- Make sure your game’s motion looks great by default on each platform you support.
- For each platform you support, use the device’s graphics capabilities to enable default settings that let people enjoy your game without first having to change those settings.
- Because motion is likely to be a large part of your visionOS experience, it’s crucial to avoid causing distraction, confusion, or discomfort.
- As much as possible, avoid displaying motion at the edges of a person’s field of view.
- To help people perceive the object’s movement without making them think that they or their surroundings are moving, you can increase the object’s translucency, helping people see through it, or lower its contrast to make its motion less noticeable.
- Although adjusting translucency and contrast can help in this scenario, consider also keeping a window’s size fairly small.
- In general, avoid letting people rotate a virtual world.
- In contrast, if the entire surrounding area appears to move — for example, in a game that automatically moves a player through space — people can feel unwell.
- Avoid showing objects that oscillate in a sustained way.
- In particular, you want to avoid showing an oscillation that has a frequency of around 0.2 Hz because people can be very sensitive to this frequency.

## privacy
- Page: https://developer.apple.com/design/human-interface-guidelines/privacy
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/privacy.json

- **HARD** When you submit a new or updated app, you must provide details about your privacy practices and the privacy-relevant data you collect so the App Store can display the information on your product page. (You can manage this information at any time in .) People use the privacy details on your product page to make an informed decision before they download your app.
- **HARD** Always respect people’s choices to use system features like Hide My Email and Mail Privacy Protection, and be sure you understand your obligations with regard to app tracking.
- In iOS, for example, you can take advantage of the Apple Neural Engine and custom CreateML models to process the data right on the device, helping you avoid lengthy and potentially risky round trips to a remote server.
- **HARD** Here are several examples of the things you must request permission to access: Personal data, including location, health, financial, contact, and other personally identifying information User-generated content like emails, messages, calendar data, contacts, gameplay information, Apple Music activity, HomeKit data, and audio, video, and photo content Protected resources like Bluetooth peripherals, home automation features, Wi-Fi connections, and local networks Device capabilities like camera and 
- Avoid requesting permission at launch unless the data or resource is required for your app to function.
- Use sentence case, avoid passive voice, and include a period at the end.
- **HARD** If you want to perform app tracking as soon as people launch your app, you must display the system-provided alert before you collect any tracking data.
- **HARD** Never precede the system-provided alert with a custom screen or window that could confuse or mislead people.
- **HARD** A location button’s appearance can vary to match your app’s UI and it always communicates the action of location sharing in a way that’s instantly recognizable.
- The system also ensures a location button remains legible by warning you about problems like low-contrast color combinations or too much translucency.
- Avoid relying solely on passwords for authentication.
- **HARD** Never store passwords or other secure content in plain-text files.
- Avoid inventing custom authentication schemes.
- If your app requires authentication, prefer system-provided features like passkeys , or .
- Avoid making assumptions about who is signed in.
- By default, visionOS uses ARKit algorithms to handle features like persistence, world mapping, segmentation, matting, and environment lighting.
- **HARD** These algorithms are always running, allowing apps and games to automatically benefit from ARKit while in the Shared Space.
- **HARD** ARKit doesn’t send data to apps in the Shared Space; to access ARKit APIs, your app must open a Full Space.

## right-to-left
- Page: https://developer.apple.com/design/human-interface-guidelines/right-to-left
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/right-to-left.json

- System-provided UI frameworks support right-to-left (RTL) by default, allowing system-provided UI components to flip automatically in the RTL context.
- In contrast, apps that don’t address number-related topics can generally rely on system-provided number representations.
- **HARD** Regardless of the current language or the surrounding content, the digits in a specific number — such as “541,” a phone number, or a credit card number — always appear in the same order.
- **HARD** Latin Hebrew Arabic (Western Arabic numerals) Arabic (Eastern Arabic numerals) Reverse the order of numerals that show progress or a counting direction; never flip the numerals themselves.
- **HARD** For example, in the RTL context, a back button must point to the right so the flow of screens matches the reading order of the RTL language.
- **HARD** For example, if you provide a control that means “to the right,” it must always point right, regardless of the current context.
- Avoid flipping images like photographs, illustrations, and general artwork.
- **HARD** Always display a logo in its original form, even if it includes text.
- People expect universal symbols and marks like the checkmark to have a consistent appearance, so avoid flipping them.
- A logo A universal symbol or mark In general, avoid flipping interface icons that depict real-world objects.
- Unless you use the object to indicate directionality, it’s best to avoid flipping an icon that represents a familiar item.

## sf-symbols
- Page: https://developer.apple.com/design/human-interface-guidelines/sf-symbols
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/sf-symbols.json

- For example, you might want to use multiple opacities of your app’s accent color to give symbols depth and emphasis, or specify a palette of contrasting colors to display symbols that coordinate with various color schemes.
- Regardless of rendering mode, using system-provided colors ensures that symbols automatically adapt to accessibility accommodations and appearance modes like vibrancy and Dark Mode.
- Depending on factors like the size of a symbol and its contrast with the current background color, different rendering modes can affect how well people can discern the symbol’s details.
- Each symbol is also available in three scales: small, medium (the default), and large.
- The bounce animation plays once by default and can help communicate that an action occurred or needs to take place.
- Magic Replace is the new default replace animation, but doesn’t occur between unrelated symbols; the default down-up animation occurs instead.
- You can choose a custom direction for the fallback animation in these situations if you prefer one other than the default.
- Avoid making custom symbols that include common variants, such as enclosures or badges.
- Alternative text labels — or accessibility descriptions — let VoiceOver describe visible UI and content, making navigation easier for people with visual disabilities.
- Download SF Symbols — Symbols framework — UIKit Date Changes July 28, 2025 Updated with guidance for Draw animations and gradient rendering in SF Symbols 7.

## typography
- Page: https://developer.apple.com/design/human-interface-guidelines/typography
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json

- Follow the recommended default and minimum text sizes for each platform — for both custom and system fonts — to ensure your text is legible on all devices.
- Platform Default size Minimum size iOS, iPadOS 17 pt 11 pt macOS 13 pt 10 pt tvOS 29 pt 23 pt visionOS 17 pt 12 pt watchOS 16 pt 12 pt Test legibility in different contexts.
- If testing shows that some of your text is difficult to read, consider using a larger type size, increasing contrast by modifying the text or background colors, or using typefaces designed for optimized legibility, like the system fonts.
- For example, if you’re using system-provided fonts, prefer Regular, Medium, Semibold, or Bold font weights, and avoid Ultralight, Thin, and Light font weights, which can be difficult to see, especially when text is small.
- **HARD** When someone chooses a larger text size, they typically want to make the content they care about easier to read; they don’t always want to increase the size of every word on the screen.
- For example, the body text style uses values that support a comfortable reading experience over multiple lines of text, while the headline style assigns a font size and weight that help distinguish a heading from surrounding content.
- Using text styles with the system fonts also ensures support for Dynamic Type and larger accessibility type sizes (where available), which let people choose the text size that works for them.
- If you need to display three or more lines of text, avoid tight leading even in areas where height is limited.
- While using a custom font, be guided by the recommended minimum font sizes for various styles and weights in .
- System fonts automatically support Dynamic Type (where available) and respond when people turn on accessibility features, such as Bold Text.
- In a Unity-based game, you can use to support Dynamic Type.
- Dynamic Type is a system-level feature in iOS, iPadOS, tvOS, visionOS, and watchOS that lets people adjust the size of visible text on their device to ensure readability and comfort.
- Mail content at the default text size Mail content at the largest accessibility text size For a list of available Dynamic Type sizes, see .
- You can also download Dynamic Type size tables in the for each platform.
- To support Dynamic Type in Unity-based games, use Apple’s Unity plug-ins .
- When you use , you get icons that scale automatically with Dynamic Type size changes.
- Keep text truncation to a minimum as font size increases.
- Avoid truncating text in scrollable regions unless people can open a separate view to read the rest of the content.
- Reduce the number of columns when the font size increases to avoid truncation and enhance readability.
- NY is available for Mac apps built with Mac Catalyst. macOS doesn’t support Dynamic Type.
- If you use NY, you need to specify the type styles you want. visionOS uses bolder versions of the Dynamic Type body and title styles and it introduces Extra Large Title 1 and Extra Large Title 2 for wide, editorial-style layouts.
- Although a small amount of 3D text can provide a fun visual element that draws people’s attention, if you’re going to display content that people need to read and understand, prefer using text that has little or no visual depth.
- Maximize the contrast between text and the background of its container.
- By default, the system displays text in white, because this color tends to provide a strong contrast with the default system background material, making text easier to read.
- In this situation, you generally want to avoid adding shadows to increase text contrast.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 31 38 Bold Title 1 Regular 25 31 Bold Title 2 Regular 19 24 Bold Title 3 Regular 17 22 Semibold Headline Semibold 14 19 Semibold Body Regular 14 19 Semibold Callout Regular 13 18 Semibold Subhead Regular 12 16 Semibold Footnote Regular 12 16 Semibold Caption 1 Regular 11 13 Semibold Caption 2 Regular 11 13 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 32 39 Bold Title 1 Regular 26 32 Bold Title 2 Regular 20 25 Bold Title 3 Regular 18 23 Semibold Headline Semibold 15 20 Semibold Body Regular 15 20 Semibold Callout Regular 14 19 Semibold Subhead Regular 13 18 Semibold Footnote Regular 12 16 Semibold Caption 1 Regular 11 13 Semibold Caption 2 Regular 11 13 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 33 40 Bold Title 1 Regular 27 33 Bold Title 2 Regular 21 26 Bold Title 3 Regular 19 24 Semibold Headline Semibold 16 21 Semibold Body Regular 16 21 Semibold Callout Regular 15 20 Semibold Subhead Regular 14 19 Semibold Footnote Regular 12 16 Semibold Caption 1 Regular 11 13 Semibold Caption 2 Regular 11 13 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 34 41 Bold Title 1 Regular 28 34 Bold Title 2 Regular 22 28 Bold Title 3 Regular 20 25 Semibold Headline Semibold 17 22 Semibold Body Regular 17 22 Semibold Callout Regular 16 21 Semibold Subhead Regular 15 20 Semibold Footnote Regular 13 18 Semibold Caption 1 Regular 12 16 Semibold Caption 2 Regular 11 13 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 36 43 Bold Title 1 Regular 30 37 Bold Title 2 Regular 24 30 Bold Title 3 Regular 22 28 Semibold Headline Semibold 19 24 Semibold Body Regular 19 24 Semibold Callout Regular 18 23 Semibold Subhead Regular 17 22 Semibold Footnote Regular 15 20 Semibold Caption 1 Regular 14 19 Semibold Caption 2 Regular 13 18 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 38 46 Bold Title 1 Regular 32 39 Bold Title 2 Regular 26 32 Bold Title 3 Regular 24 30 Semibold Headline Semibold 21 26 Semibold Body Regular 21 26 Semibold Callout Regular 20 25 Semibold Subhead Regular 19 24 Semibold Footnote Regular 17 22 Semibold Caption 1 Regular 16 21 Semibold Caption 2 Regular 15 20 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 40 48 Bold Title 1 Regular 34 41 Bold Title 2 Regular 28 34 Bold Title 3 Regular 26 32 Semibold Headline Semibold 23 29 Semibold Body Regular 23 29 Semibold Callout Regular 22 28 Semibold Subhead Regular 21 28 Semibold Footnote Regular 19 24 Semibold Caption 1 Regular 18 23 Semibold Caption 2 Regular 17 22 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 44 52 Bold Title 1 Regular 38 46 Bold Title 2 Regular 34 41 Bold Title 3 Regular 31 38 Semibold Headline Semibold 28 34 Semibold Body Regular 28 34 Semibold Callout Regular 26 32 Semibold Subhead Regular 25 31 Semibold Footnote Regular 23 29 Semibold Caption 1 Regular 22 28 Semibold Caption 2 Regular 20 25 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 48 57 Bold Title 1 Regular 43 51 Bold Title 2 Regular 39 47 Bold Title 3 Regular 37 44 Semibold Headline Semibold 33 40 Semibold Body Regular 33 40 Semibold Callout Regular 32 39 Semibold Subhead Regular 30 37 Semibold Footnote Regular 27 33 Semibold Caption 1 Regular 26 32 Semibold Caption 2 Regular 24 30 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 52 61 Bold Title 1 Regular 48 57 Bold Title 2 Regular 44 52 Bold Title 3 Regular 43 51 Semibold Headline Semibold 40 48 Semibold Body Regular 40 48 Semibold Callout Regular 38 46 Semibold Subhead Regular 36 43 Semibold Footnote Regular 33 40 Semibold Caption 1 Regular 32 39 Semibold Caption 2 Regular 29 35 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 56 66 Bold Title 1 Regular 53 62 Bold Title 2 Regular 50 59 Bold Title 3 Regular 49 58 Semibold Headline Semibold 47 56 Semibold Body Regular 47 56 Semibold Callout Regular 44 52 Semibold Subhead Regular 42 50 Semibold Footnote Regular 38 46 Semibold Caption 1 Regular 37 44 Semibold Caption 2 Regular 34 41 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 60 70 Bold Title 1 Regular 58 68 Bold Title 2 Regular 56 66 Bold Title 3 Regular 55 65 Semibold Headline Semibold 53 62 Semibold Body Regular 53 62 Semibold Callout Regular 51 60 Semibold Subhead Regular 49 58 Semibold Footnote Regular 44 52 Semibold Caption 1 Regular 43 51 Semibold Caption 2 Regular 40 48 Semibold Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Text style Weight Size (points) Line height (points) Emphasized weight Large Title Regular 26 32 Bold Title 1 Regular 22 26 Bold Title 2 Regular 17 22 Bold Title 3 Regular 15 20 Semibold Headline Bold 13 16 Heavy Body Regular 13 16 Semibold Callout Regular 12 15 Semibold Subheadline Regular 11 14 Semibold Footnote Regular 10 13 Semibold Caption 1 Regular 10 13 Medium Caption 2 Medium 10 13 Semibold Point size based on image resolution of 144 ppi for @2x designs.
- Text style Weight Size (points) Leading (points) Emphasized weight Title 1 Medium 76 96 Bold Title 2 Medium 57 66 Bold Title 3 Medium 48 56 Bold Headline Medium 38 46 Bold Subtitle 1 Regular 38 46 Medium Callout Medium 31 38 Bold Body Medium 29 36 Bold Caption 1 Medium 25 32 Bold Caption 2 Medium 23 30 Bold Point size based on image resolution of 72 ppi for @1x and 144 ppi for @2x designs.
- Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 30 32.5 Bold Title 1 Regular 28 30.5 Semibold Title 2 Regular 24 26.5 Semibold Title 3 Regular 17 19.5 Semibold Headline Semibold 14 16.5 Semibold Body Regular 14 16.5 Semibold Caption 1 Regular 13 15.5 Semibold Caption 2 Regular 12 14.5 Semibold Footnote 1 Regular 11 13.5 Semibold Footnote 2 Regular 10 12.5 Semibold Style Weight Size (points) Leading (points) Emphasized weight Large Title Regular 32 34.5 Bold Titl

## writing
- Page: https://developer.apple.com/design/human-interface-guidelines/writing
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/writing.json

- **HARD** When labeling buttons and links, it’s almost always best to use a verb.
- Prioritize clarity and avoid the temptation to be too cute or clever with your labels.
- For example, just saying “Send” often works better than “Let’s do it!” For links, avoid using “Click here” in favor of more descriptive words or phrases, such as “Learn more about UX Writing.” This is especially important for people using screen readers to access your app.
- Avoid using we altogether because it may be unclear who the “we” in question refers to.
- **HARD** Bigger screens also require brevity, as the text must be large for people to see it from a distance.
- **HARD** It’s always best to help people avoid errors.
- When an error message is necessary, display it as close to the problem as possible, avoid blame, and be clear about what someone can do to fix it.
- “Use only letters for your name” is better than “Don’t use numbers or symbols.” Avoid robotic error messages with no helpful information, like “Invalid name.” For guidance, see .

## launching
- Page: https://developer.apple.com/design/human-interface-guidelines/launching
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/launching.json

- Avoid making people retrace steps to reach their previous location in your app or game.
- Avoid including text on your launch screen, even if your first screen displays text.
- Avoid creating a screen that looks like a splash screen or an “About” window, and don’t include logos or other branding elements unless they’re a fixed part of your app’s first screen.

## onboarding
- Page: https://developer.apple.com/design/human-interface-guidelines/onboarding
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/onboarding.json

- In contrast, if you try to teach too much, people can feel overwhelmed and may be less likely to remember what they learned.
- Avoid displaying licensing details within your onboarding flow.
- **HARD** If you must include these items within the onboarding flow, integrate them in a balanced way that doesn’t disrupt the experience.
- Provide reasonable default settings so most people can immediately start interacting with your app or game without performing additional configuration.
- Prefer letting people experience your app or game before prompting them for ratings or purchases.

## loading
- Page: https://developer.apple.com/design/human-interface-guidelines/loading
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/loading.json

- Gauge the remaining loading time as accurately as possible to help you avoid giving people too little time to enjoy your placeholder content or having so much time that you need to repeat it.
- As much as possible, avoid showing a loading indicator in your watchOS experience.

## feedback
- Page: https://developer.apple.com/design/human-interface-guidelines/feedback
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/feedback.json

- In contrast, a warning about possible data loss needs to interrupt people so they have a chance to avoid the problem.
- For example, when you provide feedback using color, text, sound, and haptics, people can receive it whether they silence their device, look away from the screen, or use VoiceOver. (For guidance on providing haptic feedback, see .) Consider integrating status feedback into your interface.
- In contrast, don’t warn people when data loss is the expected result of their action.
- Avoid displaying an indeterminate progress indicator — such as a loading indicator — in a watchOS app.

## entering-data
- Page: https://developer.apple.com/design/human-interface-guidelines/entering-data
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/entering-data.json

- For example, you might display a prompt in a text field — like “username@company.com” — or provide an introductory label that describes the information, like “Email.” You can also prefill fields with reasonable default values, which can minimize decision making and speed data entry.
- **HARD** Always ask people to enter their password or use biometric or keychain authentication.
- **HARD** When data entry is necessary, make sure people understand that they must provide the required data before they can proceed.

## searching
- Page: https://developer.apple.com/design/human-interface-guidelines/searching
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/searching.json

- **HARD** For example, in the Mail app there is always a clear reference to the mailbox someone is searching.
- Prefer using the system-provided open and save views.

## settings
- Page: https://developer.apple.com/design/human-interface-guidelines/settings
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/settings.json

- Aim to provide default settings that give the best experience to the largest number of people.
- When you choose appropriate default settings, people may not have to make any adjustments before they can start enjoying your app or game.
- Avoid using settings to ask for setup information you can get in other ways.
- For example, a game can automatically detect a connected controller or accessory instead of asking the player to identify it; an app can detect whether people are currently using Dark Mode.
- Respect people’s systemwide settings and avoid including redundant versions of them in your custom settings area.
- **HARD** People must suspend what they’re doing to open an app’s or game’s settings area, so you want to include options that people don’t need to change all the time.
- When possible, prefer letting people modify task-specific options without going to your settings area.
- Avoid adding settings buttons to a window’s toolbar, because doing so decreases the space available for essential commands that people use frequently.
- **HARD** In your settings window, use a noncustomizable toolbar that remains visible and always indicates the active toolbar button.

## modality
- Page: https://developer.apple.com/design/human-interface-guidelines/modality
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/modality.json

- In contrast, apps may also offer nonmodal types of full-screen experiences; for guidance, see . visionOS apps can offer a range of immersive experiences; for guidance, see .
- Take care to avoid creating a modal experience that feels like an app within your app.
- **HARD** If a modal task must contain subviews, provide a single path through the hierarchy and avoid including buttons that people might mistake for the button that dismisses the modal view.
- **HARD** Always give people an obvious way to dismiss a modal view.
- When necessary, help people avoid data loss by getting confirmation before closing a modal view.
- **HARD** Although an alert can appear on top of all other content — including other modal views — you never want to display more than one alert at the same time.

## managing-accounts
- Page: https://developer.apple.com/design/human-interface-guidelines/managing-accounts
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/managing-accounts.json

- To help avoid this situation, give people a chance to get a sense of what your app or game does before asking them to make a commitment to it.
- If you don’t use Sign in with Apple in your iOS, iPadOS, macOS, or visionOS app, prefer using a passkey.
- **HARD** Always identify the authentication method you offer.
- In general, avoid offering an app-specific setting for opting in to biometric authentication.
- Avoid using the term passcode to refer to account authentication.
- **HARD** If you help people create an account within your app or game, you must also help them delete it, not just deactivate it.
- **HARD** If legal requirements compel your app to maintain accounts or information — such as digital health records — or to follow a specific account-deletion process, clearly describe the situation so people can understand the information or accounts you must maintain and the process you must follow.
- **HARD** If people can’t perform account deletion within your app, you must provide a direct link to the webpage on which people can do so.
- For example, avoid making one version of the deletion flow longer or more complicated than the other.
- Avoid displaying a sign-out option when people are signed in at the system level.
- **HARD** If your app must include a sign-out option, invoking it needs to prompt people to navigate to Settings > TV Provider to sign out of their account.
- **HARD** Never instruct people to sign out by adjusting privacy controls.
- Most people interact with Apple TV using a remote, not a keyboard, so ask for the minimum amount of information necessary.
- Prefer letting people use another device to sign up or authenticate.
- When people are signed in to a shared account, avoid asking them to choose their profile every time they become the current user.

## charting-data
- Page: https://developer.apple.com/design/human-interface-guidelines/charting-data
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/charting-data.json

- In general, prefer using common chart types.
- You can also display brief descriptive text that serves as a headline or summary for a chart, helping people grasp essential information at a glance.
- Although a descriptive headline or summary can make a chart more accessible, it doesn’t take the place of accessibility labels.
- **HARD** For example, you always want to make it easy for people to read a chart’s details and descriptive text — like labels and annotations — but you might also want to give people enough room to change the scope of a chart or investigate the data from different perspectives.
- Prefer consistency across multiple charts, deviating only when you need to highlight differences.

## undo-and-redo
- Page: https://developer.apple.com/design/human-interface-guidelines/undo-and-redo
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/undo-and-redo.json

- Avoid placing unnecessary limits on the number of times people can undo or redo.
- Avoid redefining standard gestures for undo and redo.

## playing-haptics
- Page: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/playing-haptics.json

- If the documented use case for a pattern doesn’t make sense in your app or game, avoid using the pattern to mean something else.
- Prefer using haptics to complement other feedback in your app or game.
- In most apps, prefer playing short haptics that complement discrete events.
- On supported iPhone models, you can add haptics to your experience in the following ways: Use standard UI components — like , , and — that play Apple-designed system haptics by default.
- Other scenarios where this type of feedback could be used might include scaling an object to fit within specific dimensions, positioning an object at a preferred location, or reaching the beginning/end or minimum/maximum of something like a scrubber in a video app.
- By default, the system provides linear haptic detents that people can feel as they rotate the Digital Crown.

## offering-help
- Page: https://developer.apple.com/design/human-interface-guidelines/offering-help
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/offering-help.json

- In contrast, if your app or game supports complex or multistep tasks you might want to provide a tutorial that teaches people how to accomplish larger goals.
- In general, directly relate the help you provide to the precise action or task people are doing right now and make it easy for people to dismiss or avoid the help if they don’t need it.
- **HARD** Always make sure guidance is appropriate for the current context.
- Avoid bloating your help content by explaining how standard components or patterns work.
- Keep your tips to one or two sentences and avoid including content that’s promotional or related to a different feature or user flow.
- If there’s an image or symbol that people associate with the feature, consider including it in the tip, and prefer the filled variant.
- If the feature is represented by an image that the tip connects to directly, avoid repeating the same image in both the tip and the UI.
- It often works well to begin the description with a verb — for example, “Restore default settings” or “Add or remove a language from the list.” In general, avoid repeating a control’s name in its tooltip.

## buttons
- Page: https://developer.apple.com/design/human-interface-guidelines/buttons
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json

- **HARD** Always include a press state for a custom button.
- By contrast, placing two buttons of different sizes near each other can make the interface look confusing and inconsistent.
- Avoid applying a similar color to button labels and content layer backgrounds.
- If your app already has bright, colorful content in the content layer, prefer using the default monochromatic appearance of button labels.
- The button is the default button — the button people are most likely to choose.
- Help people avoid losing content by assigning the primary role to nondestructive buttons.
- Push buttons can act as the default button in a view and you can tint them.
- Prefer using a symbol in a square button. provides a wide range of symbols that automatically receive appropriate coloring in their default state and in response to user interaction.
- Avoid using labels to introduce square buttons.
- For example, avoid placing a help button in a toolbar or status bar.
- Avoid displaying text that introduces a help button.
- For example, avoid placing an image button in a toolbar or status bar.
- In general, avoid including a system-provided border in an image button; for developer guidance, see .
- Shape Mini (28 pt) Small (32 pt) Regular (44 pt) Large (52 pt) Extra large (64 pt) Circular Capsule (text only) Capsule (text and icon) Rounded rectangle Prefer buttons that have a discernible background shape and fill.
- It tends to be easier for people to see a button when it’s enclosed in a shape that uses a contrasting background fill.
- Avoid creating a custom button that uses a white background fill and black text or icons.
- In general, prefer circular or capsule-shape buttons.
- When you need to display a button by itself, prefer a capsule-shape button.
- **HARD** Aim to place buttons so their centers are always at least 60 pts apart.
- Also, it’s usually best to avoid displaying small or mini buttons in a vertical stack or horizontal row.
- Specifically, prefer the rounded-rectangle shape in a vertical stack of buttons and prefer the capsule shape in a horizontal row of buttons.
- When you place a button inline with content, it gains a material effect that contrasts with the background to ensure legibility.
- Prefer buttons that span the width of the screen for primary actions in your app.
- **HARD** If two buttons must share the same horizontal space, use the same height for both, and use images or short text titles for each button’s content.

## lists-and-tables
- Page: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/lists-and-tables.json

- Prefer displaying text in a list or table.
- **HARD** In iOS and iPadOS, people must enter an edit mode before they can select table items.
- In contrast, a table that lists options often highlights a row only briefly before adding an image — such as a checkmark — indicating that the item is selected.
- If each item consists of a large amount of text, consider alternatives that help you avoid displaying over-large table rows.
- Avoid adding an index to a table that displays controls — like disclosure indicators — in the trailing ends of its rows.

## sheets
- Page: https://developer.apple.com/design/human-interface-guidelines/sheets
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/sheets.json

- **HARD** In macOS, tvOS, visionOS, and watchOS, a sheet is always modal .
- **HARD** If you provide a Done button, always pair it with a Cancel button to give people a clear way to dismiss the sheet without confirming or saving their changes, or a Back button to move to a previous step in the sheet.
- Avoid showing all three buttons — Cancel, Done, and Back — together.
- In contrast, you might not want to support the medium detent if a sheet’s content is more useful when it displays at full height.
- In addition to providing a visual indicator of resizability, a grabber also works with VoiceOver so people can resize the sheet without seeing the screen.
- Prefer using the page or form sheet presentation styles in an iPadOS app.
- Each style uses a default size for the sheet, centering its content on top of a dimmed background view and providing a consistent experience.
- Present a sheet in a reasonable default size.
- Avoid displaying a sheet that emerges from the bottom edge of a window.
- To help people view the sheet, prefer centering it in their field of view .
- Present a sheet in a default size that helps people retain their context.
- Avoid displaying a sheet that covers most or all of its window, but consider letting people resize the sheet if they want.
- Avoid using a sheet to help people navigate your app’s content.
- If you change the default label, prefer using SF Symbols to represent the action.
- Avoid using a label that might mislead people into thinking that the sheet is part of a hierarchical navigation interface.

## tab-bars
- Page: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/tab-bars.json

- Prefer filled symbols or icons for consistency with the platform.
- Avoid applying a similar color to tab labels and content layer backgrounds.
- If your app already has bright, colorful content in the content layer, prefer a monochromatic appearance for tab bars, or choose an accent color with sufficient visual differentiation.
- If you let people select their own tabs, aim for a default list of five or fewer to preserve continuity between compact and regular view sizes.
- For example, you can: Specify a tint, color, or image for the tab bar background Choose a font for tab items, including a different font for the selected item Specify tints for selected and unselected items Add button icons, like settings and search By default, a tab bar is translucent, and only the selected tab is opaque.
- By default, people can scroll the tab bar offscreen when the current tab contains a single main view.
- **HARD** Regardless of a tab’s contents, focus always returns to the tab bar at the top of the page when people press Menu on the remote.
- **HARD** In visionOS, a tab bar is always vertical, floating in a position that’s fixed relative to the window’s leading side.
- **HARD** A tab’s symbol is always visible in the tab bar.
- July 28, 2025 Added guidance for Liquid Glass.

## sidebars
- Page: https://developer.apple.com/design/human-interface-guidelines/sidebars
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/sidebars.json

- Avoid hiding the sidebar by default to ensure that it remains discoverable.
- By default, sidebar icons use your app’s accent color .
- Avoid putting critical information or actions at the bottom of a sidebar.

## status-bars
- Page: https://developer.apple.com/design/human-interface-guidelines/status-bars
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/status-bars.json

- By default, the background of the status bar is transparent, allowing content beneath to show through.
- Prefer using a scroll edge effect to place a blurred view behind the status bar.
- The Photos app with the status bar visible The Photos app with the status bar hidden Avoid permanently hiding the status bar.

## toolbars
- Page: https://developer.apple.com/design/human-interface-guidelines/toolbars
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toolbars.json

- They include three types of content: The title of the current view Navigation controls, like back and forward, and search fields Actions, or bar items, like buttons and menus In contrast to a toolbar, a tab bar is specifically for navigating between areas of an app.
- Choose items deliberately to avoid overcrowding.
- Don’t add an overflow menu manually, and avoid layouts that cause toolbar items to overflow by default.
- Avoid applying a similar color to toolbar item labels and content layer backgrounds.
- If your app already has bright, colorful content in the content layer, prefer using the default monochromatic appearance of toolbars.
- Prefer using standard components in a toolbar.
- By default, standard buttons, text fields, headers, and footers have corner radii that are concentric with bar corners.
- Prefer the standard symbols for each, and don’t use a text label that says Back or Close .
- Prefer simple, recognizable symbols for items instead of text, except for actions like edit that aren’t well-represented by symbols.
- Prefer system-provided symbols without borders.
- **HARD** To ensure that these items are always available, items on the toolbar’s leading edge aren’t customizable.
- Use a large title to help people stay oriented as they navigate and scroll.
- By default, a large title transitions to a standard title as people begin scrolling the content, and transitions back to large when people scroll to the top, reminding them of their current location.
- In contrast, it doesn’t make sense to provide a toolbar item for every menu item, because not all menu commands are important enough or used often enough to warrant space in the toolbar.
- Avoid using a pull-down menu in a toolbar.
- **HARD** If you place these buttons above scrolling content, the buttons always remain visible, as the content scrolls under them.
- By default, a scrolling toolbar button remains hidden until people reveal it by scrolling up.

## text-fields
- Page: https://developer.apple.com/design/human-interface-guidelines/text-fields
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/text-fields.json

- **HARD** Always use a secure text field when your app asks for sensitive data, such as a password.
- By default, the system clips any text extending beyond the bounds of a text field.
- Whenever possible, prefer displaying a list of options rather than requiring text entry. — SwiftUI — SwiftUI — UIKit — AppKit Date Changes June 5, 2023 Updated guidance to reflect changes in watchOS 10.

## pickers
- Page: https://developer.apple.com/design/human-interface-guidelines/pickers
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/pickers.json

- By default, a minute list includes 60 values (0 to 59).
- You can configure a picker to display an outline, caption, and scrolling indicator.

## toggles
- Page: https://developer.apple.com/design/human-interface-guidelines/toggles
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/toggles.json

- **HARD** A toggle always lets people manage the state of something, so if you need to support other types of actions — such as choosing from a list of items — use a different component, like a pop-up button .
- Avoid relying solely on different colors to communicate state, because not everyone can perceive the differences.
- Change the default color of a switch only if necessary.
- The default green color tends to work well in most cases, but you might want to use your app’s accent color instead.
- Be sure to use a color that provides enough contrast with the uncolored appearance to be perceptible.
- Avoid supplying a label that explains the button’s purpose.
- Use switches, checkboxes, and radio buttons in the window body, not the window frame.
- In particular, avoid using these components in a toolbar or status bar.
- Prefer a switch for settings that you want to emphasize.
- Selected Deselected Prefer a set of radio buttons to present mutually exclusive options.
- Avoid listing too many radio buttons in a set.
- To present a single setting that can be on or off, prefer a checkbox.

## alerts
- Page: https://developer.apple.com/design/human-interface-guidelines/alerts
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/alerts.json

- Avoid using an alert merely to provide information.
- If you need to provide only information, prefer finding an alternative way to communicate it within the relevant context.
- Avoid displaying alerts for common, undoable actions, even when they’re destructive.
- Avoid showing an alert when your app starts.
- Alerts often describe problems and serious situations, so avoid being oblique or accusatory, or masking the severity of the issue.
- Avoid writing a title that doesn’t convey useful information — like “Error” or “Error 329347 occurred” — but also avoid overly long titles that wrap to more than two lines.
- **HARD** Prefer verbs and verb phrases that relate directly to the alert text — for example, “View All,” “Reply,” or “Ignore.” In informational alerts only, you can use “OK” for acceptance, avoiding “Yes” and “No.” Always use “Cancel” to title a button that cancels the alert’s action.
- Avoid using OK as the default button title unless the alert is purely informational.
- **HARD** Always place the default button on the trailing side of a row or at the top of a stack.
- In contrast, people appreciate an alert that draws their attention to a button that can perform a destructive action they didn’t originally intend.
- If there’s a destructive action, include a Cancel button to give people a clear, safe way to avoid the action.
- **HARD** Always use the title “Cancel” for a button that cancels an alert’s action.
- Note that you don’t want to make a Cancel button the default button.
- If you want to encourage people to read an alert and not just automatically press Return to dismiss it, avoid making any button the default button.
- **HARD** Similarly, if you must display an alert with a single button that’s also the default, use a Done button, not a Cancel button.
- When possible, avoid displaying an alert that scrolls.
- If you need to display an accessory view in a visionOS alert, create a view that has a maximum height of 154 pt and a 16-pt corner radius. — SwiftUI — UIKit — AppKit Date Changes February 2, 2024 Enhanced guidance for using default and Cancel buttons.

## action-sheets
- Page: https://developer.apple.com/design/human-interface-guidelines/action-sheets
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/action-sheets.json

- To encourage people to pay attention to action sheets, avoid using them more than necessary.
- A SwiftUI confirmation dialog includes a Cancel button by default.
- In contrast, people expect a menu to appear when they choose to reveal it.
- There are three system-defined button styles: Style Meaning Default The button has no special meaning.
- Avoid displaying more than four buttons in an action sheet, including the Cancel button.

## menus
- Page: https://developer.apple.com/design/human-interface-guidelines/menus
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/menus.json

- Although a game might have a different writing style, generally prefer using title-style capitalization, which capitalizes every word except articles, coordinating conjunctions, and short prepositions, and capitalizes the last word in the label, regardless of the part of speech.
- **HARD** In English, articles always lengthen labels, but rarely enhance understanding.
- Prefer listing important or frequently used menu items first.
- Prefer keeping all logically related commands in the same group, even if the commands don’t all have the same importance.
- Prefer using a submenu to indenting menu items.
- If you want to avoid listing a separate menu item for each state, it can be efficient to create a single, toggled menu item that communicates the current state and lets people change it.
- Let players navigate in-game menus using the platform’s default interaction method.
- **HARD** To ensure that your menu is always visible to people, even when other content occludes it, you can apply a .
- Prefer displaying a menu near the content it controls.
- Prefer the subtle breakthrough effect in most cases.
- When you select for the breakthrough effect of a menu that overlaps with 3D content, the system applies by default.
- July 28, 2025 Added guidance for representing menu items with icons.

## segmented-controls
- Page: https://developer.apple.com/design/human-interface-guidelines/segmented-controls
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/segmented-controls.json

- In contrast, people can choose multiple segments in the font attributes control to combine styles like bold, italics, and underline.
- Prefer using either text or images — not a mix of both — in a single segmented control.
- Avoid putting other focusable elements close to segmented controls.

## search-fields
- Page: https://developer.apple.com/design/human-interface-guidelines/search-fields
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/search-fields.json

- Default to a broader scope and let people refine it as they need.
- **HARD** You can place search as a tab in a tab bar, which keeps search visible and always available as people switch between the sections of your app.
- **HARD** A dedicated area also ensures search is always available as people navigate and switch sections of your app.

## progress-indicators
- Page: https://developer.apple.com/design/human-interface-guidelines/progress-indicators
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/progress-indicators.json

- People generally prefer a determinate progress indicator, because it helps them gauge what’s happening and how long it will take.
- Avoid vague terms like loading or authenticating because they seldom add value.
- A refresh control is a specialized type of activity indicator that’s hidden by default, becoming visible when people drag down the view they want to reload.
- Indeterminate progress bar Indeterminate circular progress indicator Prefer an activity indicator (spinner) to communicate the status of a background operation or when space is constrained.
- Avoid labeling a spinning progress indicator.
- By default the system displays the progress indicators in white over the scene’s background color.

## charts
- Page: https://developer.apple.com/design/human-interface-guidelines/charts
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/charts.json

- **HARD** In a fixed range, the upper and lower bounds of the axis never change, whereas in a dynamic range, the upper and lower bounds can vary with the current data.
- Consider using a fixed range when specific minimum and maximum values are meaningful for all possible data values.
- For example, people expect a chart that shows a battery’s current charge to have a minimum value of 0% (completely empty) and a maximum value of 100% (completely full).
- In contrast, consider using a dynamic range when the possible data values can vary widely and you want the marks to fill the available plot area.
- In contrast, defining a lower bound of zero can sometimes make meaningful differences between values more difficult to discern.
- **HARD** For example, a heart rate chart that always uses zero for the lower bound could obscure important differences between resting and active readings because the differences occur in a range that’s far from zero.
- Prefer familiar sequences of values in the tick and grid-line labels for an axis.
- Providing context in this way is especially important for VoiceOver users and those with certain types of cognitive disabilities because they rely on your descriptions to understand the purpose and primary message of your chart before they decide to investigate it further.
- For example, it’s essential to support VoiceOver, which describes onscreen content to help people get information and navigate without needing to see the screen (to learn more about VoiceOver, see ).
- In addition to supplying accessibility labels that describe the components of your chart, you can enhance the VoiceOver experience by also using Audio Graphs. provides chart information to VoiceOver, which constructs a set of tones that audibly represent a chart’s data values and their trend; it also lets you present high-level text summaries that provide additional context.
- When this is the case, consider expanding the hit target to include the entire plot area, letting people scrub across the area to reveal various values.
- By default, these input types tend to visit individual onscreen elements in a linear sequence, such as the sequence of values in a data file.
- Note that both of these customizations can also enhance the VoiceOver experience, even when your chart isn’t interactive.
- Animating such changes can help people notice them, but you need to highlight the changes in other ways, too, to ensure that VoiceOver users and people who turn off animations know about them.
- Avoid relying solely on color to differentiate between different pieces of data or communicate essential information in a chart.
- When you use Swift Charts to create a chart, you get a default implementation of , in addition to a default accessibility element for each mark (or group of marks) that describes its value.
- Consider using Audio Graphs to give VoiceOver users more information about your chart.
- You can customize the default Audio Graphs implementation that Swift Charts provides by supplying a chart title and descriptive summary that VoiceOver speaks to help people understand the purpose and main features of your chart.
- In contrast, Health offers an accessibility label for each bar in the Steps chart, because the purpose of the chart is to give people their actual step count for each tracking period.
- For the focused section of this cycling elevation chart, VoiceOver provides information about that portion of the route, including distance and elevation changes.
- **HARD** For example, if you always mention the X axis first, people can spend less time figuring out which axis is relevant in a description.
- VoiceOver users can get mark values and trend information through accessibility labels and Audio Graphs, so they don’t generally need the content in the visible labels.
- In general, avoid requiring complex chart interactions in your watchOS app.
- As much as possible, prefer displaying useful information people can get at a glance and supporting simple interactions when they add value.

## designing-for-ios
- Page: https://developer.apple.com/design/human-interface-guidelines/designing-for-ios
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-ios.json

- Adapt seamlessly to appearance changes — like device orientation, Dark Mode, and Dynamic Type — letting people choose the configurations that work best for them.

## designing-for-ipados
- Page: https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-ipados.json

- Adapt seamlessly to appearance changes — like device orientation, multitasking modes, Dark Mode, and Dynamic Type — and transition effortlessly to running in macOS, letting people choose the configurations that work best for them.

## designing-for-macos
- Page: https://developer.apple.com/design/human-interface-guidelines/designing-for-macos
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-macos.json

- Summary: People rely on the power, spaciousness, and flexibility of a Mac as they perform in-depth productivity tasks, view media or content, and play games, often using several apps at once.
- (No HARD/numeric sentences auto-extracted; see JSON.)


## navigation-and-search (was navigation-bars)
- Page: https://developer.apple.com/design/human-interface-guidelines/navigation-and-search
- JSON: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/navigation-and-search.json


## v7 §2.2 acceptance criteria (reviewer-verified 2026-10-21 — binding)

These numbers are the gate. Digest pages above supply Apple wording; §2.2 is what we implement.

### Typography
- iOS/iPadOS body default **17 pt**, minimum **11 pt** anywhere. macOS default 13 / min 10.
- Text-style ramp (default): Large Title 34, Title1 28, Title2 22, Title3 20, Headline 17 semibold, Body 17, Callout 16, Subhead 15, Footnote 13, Caption1 12, Caption2 11.
- **HARD** Do not embed/bundle SF Pro font files. Use `-apple-system, BlinkMacSystemFont, system-ui`.
- Dynamic Type: layout from xSmall to **AX5** (Body ≈ 53 pt). Offer enlargement ≥ 200%.
- Avoid Ultralight/Thin/Light for UI text. Max 2 typefaces.

### Accessibility
- Contrast: ≤17 pt **4.5:1**; ≥18 pt or bold **3:1**. Higher-contrast under `prefers-contrast: more`.
- Hit targets: **44×44 pt** default, **28×28** absolute min.
- **HARD** Never convey state by colour alone.
- Every gesture has on-screen alternative. VoiceOver labels. Reduce Motion fades. Videos: captions + transcript.
- Destructive actions need confirmation; prefer Undo; prefer explicit dismissal over timers.

### Layout / Nav / Launch
- **HARD** Safe areas (`env(safe-area-inset-*)`, `viewport-fit=cover`).
- **HARD** Functionality identical across size classes.
- Tab bar = navigation only, 3–5 tabs; never hidden/disabled.
- Nav: large title top-level, inline when pushed.
- **HARD** Launch screen = plain background + logo mark only — no text, ads, or "loading".

### Missing pages
- None (navigation-bars noted above as 404).
