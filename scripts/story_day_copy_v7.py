"""Longer day-step copy for Cap stories v7. Applied by rebuild-stories-v7.py."""

# persona_id -> list of step texts (same length as day). Optional: also headline/summary/quote overrides.
DAY_COPY: dict[str, list[str]] = {
    "steadycap-bilal": [
        "Still half-asleep in the dark kitchen, Bilal opens Today on his iPhone and marks how the night went — no streak banner, no red shame, just a quiet tick before the bus.",
        "He scrolls the medicine list on the same phone and ticks morning meds while the kettle boils, then drops the phone in his pocket and locks the door.",
        "On warehouse break he borrows the shared iPad and opens the craving forecast — a hard window flagged for late afternoon, so he texts his sponsor a simple “watching it.”",
        "At home he types three honest lines on his laptop while tea cools — private, on-device, nobody scoring the words.",
        "Before bed he opens SOS on the phone and confirms his brother and sponsor are still one tap away, names readable, no scavenger hunt through contacts.",
        "Laptop stays on the desk with Today closed. He missed one tick at lunch; the app does not punish him for it.",
    ],
    "steadycap-priya": [
        "While toast browns, Priya opens the medicine tracker on her iPhone and ticks Dad’s morning pills in the order the clinic printed — large enough to read without glasses.",
        "In the waiting room she flips to the iPad so the nurse can see the full day schedule without flipping through a paper pad full of crossed-out times.",
        "Back home she journals what the doctor said on her laptop — dose change, next bloodwork date — while it is still fresh, still private on the device.",
        "Evening ticks happen on the phone again; she stands at the counter and clears each row before dinner, no scavenger hunt through blister packs.",
        "Before her brother visits she leaves Tomorrow open on the laptop so he can glance the plan without asking Dad to “remember everything.”",
    ],
    "steadycap-hamza": [
        "Between classes Hamza opens Today on his phone — he missed yesterday during a midterm, and the screen does not turn red or lecture him about streaks.",
        "On the hostel iPad he reads a short Knowledge card about sleep debt, bookmarks nothing flashy, just something he can try tonight without buying a course.",
        "His study laptop stays open to SOS while he revises; roommate is the contact. Knowing the button exists is half the calm.",
        "In bed he writes one honest sentence on the phone journal — exam dread, not a performance — then locks the screen.",
        "He puts the phone face-down. The app does not nag him for a second check-in or a perfect week.",
    ],
    "pulsecap-sara": [
        "On the bus Sara opens My Plan on her iPad and confirms today’s 3-day split before she even reaches the basement gym with the unreliable signal.",
        "Phone logger open on the first warm-up set — kilograms and reps save locally with no cloud spinner, which matters when the Wi-Fi dies mid-session.",
        "Still offline for the superset; the rest timer ticks on the phone while she watches the clock on the wall, not an app store login wall.",
        "Sunday evening she opens the laptop progress chart and smiles at three finished sessions — volume up gently, ego left outside.",
        "She nudges next week’s load on My Plan from the laptop, then closes the lid. The basement will still be offline. The log will still work.",
    ],
    "pulsecap-daniel": [
        "At the track Daniel keeps the phone in hand for interval notes — pace, rest, how the left knee felt — one log instead of a separate running app he never opens.",
        "Between client calls he opens a short mobility block on the iPad at his desk, twelve minutes, then back to email without changing clothes.",
        "After work the phone logger takes squats and accessories; last week’s numbers are already there so he is not guessing under fluorescent lights.",
        "Laptop charts at night show volume trending up gently — strength and runs in one place, no spreadsheet archaeology.",
        "A rules-based Smart Coach tip appears on the laptop — not an LLM sermon, just a cue he accepts or dismisses with one tap.",
    ],
    "pulsecap-khalid": [
        "Before fajr traffic, Khalid logs a 25-minute walk on his iPhone with large text — slow is still training, and the doctor’s clearance lives in the note.",
        "Afternoon iPad shows today’s light weights clearly enough that he does not need his son to interpret tiny labels at the gym.",
        "Phone logger for two machines only; he finishes, drinks water, and leaves without chasing a streak or a personal record.",
        "When his son visits they open the laptop together and skim the week at a glance — walks logged, light days honest, nothing performative.",
        "Phone reminder set for tomorrow’s walk. He locks the screen feeling capable, not behind.",
    ],
    "soulcap-zainab": [
        "Before email, Zainab runs a physiological sigh on her iPhone — two minutes in the dark hallway outside the classroom, feet on the floor, then the day can start.",
        "Same phone: she taps how she feels without writing an essay — a check-in that takes less time than scrolling the news.",
        "At lunch the shared iPad opens Calm tools; landscape view, no autoplay noise, just a reset before afternoon classes.",
        "Friday night she writes a longer journal on the laptop — still private, still on-device — naming the week without turning it into content.",
        "Phone shows crisis info is reachable if she ever needs it. Tonight she does not. She locks the screen kindly.",
    ],
    "soulcap-tom": [
        "On the U-Bahn Tom runs a short physiological sigh on his phone between stations — meetings still echoing, scroll hole deferred.",
        "On the sofa the iPad opens Calm tools without autoplay noise; he picks one reset and leaves the rest alone.",
        "Three lines of reflection on the laptop, then the lid closes. The day is allowed to stop.",
        "Last phone check confirms help is listed, then Do Not Disturb. Berlin can wait until morning.",
    ],
    "soulcap-amina": [
        "Outside the exam hall Amina grounds on her phone — five things she can see, feet on the concrete — until her pulse is boring again.",
        "Between papers she opens a quiet journal on the library laptop; no performance, just what her hands are doing.",
        "At home the shared iPad gets a short Calm reset while her sister revises across the table.",
        "Phone shows locked crisis info exactly as shipped. She reads it once, calmly, and puts the phone away.",
    ],
    "vaultcap-ayesha": [
        "Pharmacy keys in one hand, Ayesha opens VaultCap on her iPhone — three expiries this month, including a school passport she would have found in a drawer too late.",
        "Between customers a phone search finds the passport scan in seconds; she texts the school office without leaving the counter or digging through WhatsApp.",
        "Kitchen iPad after school runs: husband’s profile separate, kids’ docs labeled, everything still on-device — no family Dropbox argument.",
        "Laptop for a calm look at sample bank accounts before Ramadan planning; numbers illustrative, tone quiet, no tipping or advice.",
        "Same laptop shows a Zakat summary from holdings so she can email the accountant without photographing paper ledgers.",
        "Phone locks with renewal reminders confirmed. Drawers stay drawers. The vault stays the vault.",
    ],
    "vaultcap-omar": [
        "Omar’s phone dashboard shows AED and GBP sample balances before the first client call — multi-currency without opening three banking apps.",
        "On the sofa he reviews cards on the iPad before lunch, expiry dates visible, no glovebox archaeology.",
        "Laptop writes an encrypted .vos backup to a disk he owns — new phone week, no cloud rent, no “upload everything” pitch.",
        "Security settings on the laptop get a once-over before the swap: demo labeled, passphrase habits intact.",
        "New phone restores from the backup; the sample vault opens like nothing moved. He smiles at the boring success.",
    ],
    "vaultcap-margaret": [
        "Margaret’s iPhone home uses larger text so renewals are readable without asking her son to “just read this bit.”",
        "Documents list on the same phone holds pension letters she used to lose in the bureau — titles clear, not tiny scan thumbnails.",
        "iPad on the table while her son helps label files; he can help without taking the papers away in a plastic bag.",
        "Laptop reminders for home insurance sit in the study beside the kettle — dates she can actually see.",
        "Settings on the laptop stay honest: demo labelled, text size kept. She closes the lid feeling organised, not managed.",
    ],
    "deeponycap-ali": [
        "Ali opens the collection on his phone while a box sits on the bed — finally matching what he owns to what he remembers owning.",
        "A quick phone photo attaches to a pair’s detail page so the shelf and the under-bed storage stop arguing.",
        "Wider shelf map on the iPad shows gaps and doubles; he laughs at two identical colourways he swore were unique.",
        "Laptop wishlist before payday — wants, not cart panic — with notes on size and why he wants them.",
        "Laptop stats show fictional counts only; he closes the lid knowing the shelf finally matches the boxes.",
    ],
    "deeponycap-fatima": [
        "During breakfast tidy Fatima adds a spine on her phone so the kids’ shelves stop lying about what is already owned.",
        "After school the iPad shelf is a game: they point at favourites, she marks duplicates before the next book fair.",
        "Laptop donation list for the weekend drop — titles leaving the house on purpose, not vanishing into a car boot.",
        "Wishlist trimmed on the laptop so the next buy is intentional, not a double of something under the bed.",
        "Phone confirms tonight’s adds before she locks the screen and calls it a weekly win.",
    ],
    "deeponycap-george": [
        "George photographs a sleeve on his phone and adds a condition note that will travel with the record, not live in his head.",
        "Afternoon iPad browse through the collection feels like standing at the shelves without kneeling on the floor.",
        "Laptop inventory for insurance — full list current, fictional values illustrative, no spreadsheet from 2011.",
        "Wishlist of pressings on the laptop; he wants fewer impulse buys and better notes when he finds one.",
        "Phone confirms today’s adds. The note finally travels with the sleeve.",
    ],
    "ledgercap-usman": [
        "After chai Usman opens wealth on his phone — positions in one portfolio, not four notebooks and a calculator app.",
        "Watchlist on the same phone holds fictional symbols he tracks; LedgerCap tracks, it does not tip or whisper buys.",
        "After close he reads markets on the iPad with tea — calm scan, no pushy “trade now” chrome.",
        "Dividend log on the laptop catches what the broker statements bury in PDFs; illustrative figures only.",
        "A paper trade on the laptop is practice only — he notes the thesis and closes the lid without placing anything real.",
    ],
    "ledgercap-nida": [
        "Salary day: Nida ticks the SIP on her phone so the line lives in the app, not in a buried email receipt.",
        "Fund list on the iPad at lunch — NAVs visible, no lecture about what she “should” buy.",
        "Month summary on the laptop replaces the spreadsheet she always meant to update on Sundays.",
        "Watchlist trimmed on the laptop; fewer tickers, clearer intent, still zero advice.",
        "Phone confirms the SIP line before she puts the device face-down. The SIP is a line, not a lecture.",
    ],
    "ledgercap-raza": [
        "Raza opens wealth on his iPhone at large text — retirement holdings readable without asking his daughter to translate pixels.",
        "Together on the iPad they review the portfolio; she can see it without taking the paper file away.",
        "Dividend history on the laptop replaces a drawer of statements; informational, not advisory.",
        "Announcements on the laptop stay informational — he reads, he does not get hustled into a product.",
        "Phone locks. Holdings stay visible. Pride stays quiet.",
    ],
    "scentcap-hira": [
        "Hira opens Today on her phone — weather first, then a bottle suggestion she can accept or ignore in under a minute.",
        "Bottle detail on the phone before it goes in the bag; notes from last wear stop her guessing in the hallway mirror.",
        "Evening iPad browse through the collection feels like opening the cupboard without standing in front of it forever.",
        "Occasion notes on the laptop capture weddings and office days so next time is not a blank memory.",
        "Wear calendar on the laptop shows the week; she closes it knowing the decision took two minutes, not fifteen.",
    ],
    "scentcap-james": [
        "Before the commute James adds a decant on his phone so it has a home — not another orphan vial in the desk drawer.",
        "Lunchtime iPad collection view shows what he actually owns versus what he thinks he owns.",
        "Laptop analytics are illustrative only; he uses them to notice gaps, not to chase a score.",
        "Rules-based advisor tips on the laptop — not magic, just cues he can dismiss without guilt.",
        "Phone Today for tomorrow’s wear. The decant finally has a row in the catalogue.",
    ],
    "scentcap-saad": [
        "After shopping Saad notes a gift on his phone — who, when, which bottle — so he stops accidentally regifting.",
        "Sofa iPad browse with his partner; they laugh at old notes and mark occasions without opening a chat archaeology dig.",
        "Laptop occasion list for the season; birthdays and dinners planned without relying on memory alone.",
        "Today on the laptop for the weekend test wear; weather and notes in one calm screen.",
        "Phone confirms the gift note. He will not buy the same bottle twice for the same cousin.",
    ],
    "carcap-faisal": [
        "Faisal opens Today on his phone — both family cars, next service, fuel trend — before the school run begins.",
        "At the pump he logs litres and odometer on the phone; glovebox receipts stop being the system of record.",
        "Driveway iPad shows service history while the mechanic talks; dates visible, no “I think it was March.”",
        "Laptop documents hold fictional registration and insurance scans so the second car’s papers are not a scavenger hunt.",
        "Garage overview on the laptop covers both cars. He closes the lid knowing neither is a mystery.",
    ],
    "carcap-sophie": [
        "After an overnight charge Sophie logs kWh on her phone — a habit that beats guessing range on a Monday.",
        "iPad reminders at lunch show MOT window thirty days out; the reminder beats the fine, every time.",
        "Laptop document pack holds MOT and insurance; she finds the PDF in seconds, not in email search limbo.",
        "Garage on the laptop is one calm overview — EV and reminders in one place.",
        "Phone Today confirms tomorrow’s charge window. She locks the screen without a paperwork spike.",
    ],
    "carcap-rashid": [
        "At the yard Rashid opens Today on his phone across three business cars — what moves today, what waits.",
        "iPad service board on the bench keeps the tiny fleet honest; gaps show up before a customer does.",
        "Office laptop holds papers — registration, insurance — so “where is the file?” stops being a weekly sport.",
        "Fuel rollup on the laptop is illustrative; he uses it to see patterns, not to micromanage drivers by the litre.",
        "Phone confirms tomorrow’s plan. Three cars. Zero missing papers in his head.",
    ],
    "masterycap-ahmed": [
        "Ahmed opens Campus on his phone in Roman Urdu — trading basics without fake tips or English-only gatekeeping.",
        "iPad practice lab in the afternoon; he tries a scenario, logs the attempt, leaves ego outside the room.",
        "Laptop records show what he finished — education, not a brokerage pitch dressed as a lesson.",
        "School of Money module on the laptop stays calm and factual; he notes questions for a human mentor later.",
        "Phone Today recap before sleep. Roman Urdu first. Hustle culture never.",
    ],
    "masterycap-ruth": [
        "Before her shift Ruth opens Campus on the phone — one lesson, not twelve tutorial tabs she will never finish.",
        "Weekend iPad practice is quiet on purpose; progress without performative hustle posts.",
        "Laptop HTTP lab finally gets a finished run; she logs it instead of promising “tomorrow.”",
        "Records on the laptop show labs done — fewer tabs, more closure.",
        "Phone closes the day. Practice is quiet. That is fine.",
    ],
    "masterycap-bilqees": [
        "Before school Bilqees steals ten minutes of Campus on her phone — progress she can see, not a vague intention.",
        "After classes the iPad review catches what stuck; she bookmarks one idea for tomorrow’s stolen minute.",
        "Laptop practice block at night is short and real — depth over a performance of busyness.",
        "Records on the laptop make the week visible; minutes used are logged, not romanticised.",
        "Phone goodnight. Progress is a page, not a stage.",
    ],
    "travelcap-sana": [
        "Sana opens the honeymoon trip on her phone — tickets, hotel, the shape of Istanbul — without diving into WhatsApp archaeology.",
        "Flight details on the phone are readable at the gate; Kamran can glance without hunting a forwarded PDF.",
        "Sofa iPad itinerary for the day plan; they argue about museums, not about which chat has the booking.",
        "Laptop document list before departure — passports, visas, confirmations — one trip, one checklist.",
        "Budget on the laptop is illustrative; they set a calm ceiling and close the lid excited, not panicked.",
    ],
    "travelcap-hassan": [
        "In the ride to the airport Hassan opens the trip on his phone — visa pinned with the itinerary, not lost in email.",
        "Lounge iPad shows documents without digging through folders named “final_final_visa.”",
        "Hotel desk laptop drafts the next trip while this one is still warm; continuity instead of starting from zero.",
        "Expenses on the laptop are illustrative — enough to reclaim the month without a shoebox of receipts.",
        "Phone tomorrow view. The visa lives with the trip. He sleeps.",
    ],
    "travelcap-malik": [
        "Family trip overview on the phone — London to Lahore, Umrah plus visits — five people, one dashboard.",
        "iPad checklist with the kids pointing at passport rows; scramble becomes a game with a finish line.",
        "Laptop full document pack before packing night; nothing lives only in a parent’s head.",
        "Flights on the laptop for the whole party; seats and times visible without five separate screenshots.",
        "Phone day-of view at the door. Five passports. One checklist. Calm enough to joke.",
    ],
    "cookcap-shahida": [
        "With her granddaughter’s help Shahida captures a masala recipe on the phone — measures that lived only in her hands finally have a page.",
        "iPad cookbook browse in the afternoon; she finds last week’s daal and smiles at her own voice notes.",
        "Laptop chapter edit tidies titles so the grandkids can find “Eid pulao” without calling her mid-stir.",
        "Family profiles on the laptop mark who likes less chilli; the book becomes usable, not just archived.",
        "Phone shows tonight’s dish. The masala finally has a page, and dinner has a plan.",
    ],
    "cookcap-rohan": [
        "Sunday laptop meal plan — five dinners that survive an 8pm arrival, not a fantasy chef schedule.",
        "Phone recipe on the counter while he cooks; steps big enough to read with wet hands.",
        "iPad shopping list on the walk to the shop; Tuesday still has a dinner because the list existed.",
        "Laptop tweak for next week — swap one night, keep the spine of the plan intact.",
        "Phone tomorrow reminder. Takeaway is a choice now, not the default.",
    ],
    "cookcap-mariam": [
        "Mariam saves a recipe on her phone between classes — wanting to cook is easy; remembering which tab is hard.",
        "iPad study of the same recipe: mise en place notes she will actually follow tonight.",
        "Laptop shopping list turns the recipe into ingredients she can buy once, not improvise three times.",
        "Phone propped while cooking; she finishes the dish instead of abandoning it mid-scroll.",
        "Laptop notes for next time — salt, timing, what to skip. The list was half the cooking.",
    ],
    "ideacap-zara": [
        "In the rickshaw Zara hits voice capture on her phone — if she can say it before the idea vanishes, it is saved on-device.",
        "Studio iPad tags the morning captures by project so they do not drown in a single undated inbox.",
        "Laptop idea list at end of day; she promotes one seed and parks the rest without guilt.",
        "Note detail on the laptop expands the keeper into something she can pitch tomorrow.",
        "Phone inbox feels lighter. Saying it was enough to keep it.",
    ],
    "ideacap-kevin": [
        "Kevin dumps a product idea on his phone before standup — Slack is not his notebook, and he is done pretending it is.",
        "iPad sort by project at lunch; tags beat scrolling a year of threads for “that one thought.”",
        "Laptop note detail becomes a decision log — ship, park, or ask — instead of eternal emoji reactions.",
        "Settings confirm offline-friendly habits; the ideas stay his even when the VPN sulks.",
        "Phone clears. Ideas live in IdeaCap, not in a channel he will never search.",
    ],
    "ideacap-hamid": [
        "Garden morning: Hamid writes a story seed on his phone — offline is the point, no account wall between him and the line.",
        "iPad expand turns the seed into a scene without uploading anything to a stranger’s cloud.",
        "Laptop draft gathers the day’s seeds into something that might become a chapter.",
        "Ideas list on the laptop stays local; he owns the folder the way he owns the notebooks.",
        "Phone locks. Offline won. The seed is still there.",
    ],
    "deefoodie-dee": [
        "Dee logs a Karachi lunch on her phone before the walk back — place, dish, a private rating, no performance for strangers.",
        "Same phone: she adjusts the rating while the taste is still honest, not after a week of forgetting.",
        "Map of eats on the phone shows where she has been; useful for her, not a public flex.",
        "Taste profile at night is a quiet summary — what she actually likes, not what she thinks she should like.",
        "Wishlist gets one pin for next weekend. The journal stays hers. Private beta screens, fictional visits.",
    ],
    "deefoodie-arsalan": [
        "After a family lunch Arsalan logs the visit on his phone — kid-friendly is a tag, not a guess next month.",
        "A short note on high chairs and noise lands in the same entry so the next booking is kinder.",
        "Wishlist on the phone holds places to retry without drowning in chat recommendations.",
        "Areas view helps him remember which neighbourhood worked for the kids last time.",
        "Home screen closes the loop. Tomorrow’s dinner decision starts from data, not vibes.",
    ],
    "deefoodie-noor": [
        "Between classes Noor logs a budget eat on her phone — cheap and good can both be true, and now it is written down.",
        "Wishlist collects spots under her ceiling so Friday is not a coin-flip between expensive and regrettable.",
        "Map on the phone pins the honest places; she stops relying on a mental map that forgets after exams.",
        "Journal entry captures what she ordered and what she would skip — future Noor will thank her.",
        "Seasonal note for mango season. Budget list stays honest. Fictional sample data throughout.",
    ],
}

# Optional richer summaries / headlines / transcripts (persona_id -> dict of fields)
META: dict[str, dict] = {
    "vaultcap-ayesha": {
        "summary": "Ayesha runs a pharmacy and two school runs in Lahore. She finds documents on her phone between customers, reviews family profiles on the kitchen iPad, and does banks plus Zakat on the laptop — always on-device, always fictional sample data.",
        "transcript": "Morning vault on iPhone shows expiries. Midday search finds a passport scan. Evening iPad separates family profiles. Laptop banks and Zakat stay calm and illustrative. Phone reminders lock the day. Fictional sample vault throughout.",
    },
    "steadycap-bilal": {
        "summary": "Bilal works late warehouse shifts in Karachi. Dawn check-ins on iPhone, craving forecast on a shared iPad at lunch, journal and SOS on laptop and phone at night — never scored, never shamed, always fictional.",
        "transcript": "Bilal checks in on iPhone at dawn, ticks meds, reads a craving forecast on iPad, journals on laptop, confirms SOS contacts, and closes the day without guilt. Fictional sample data throughout.",
    },
}


# Canonical products.js featureIds per persona (validator-enforced)
FEATURES_USED: dict[str, list[str]] = {
    "vaultcap-ayesha": ["family-profiles", "expiry-reminders", "zakat", "documents"],
    "vaultcap-omar": ["encrypted-backup", "aes-gcm-vault", "documents"],
    "vaultcap-margaret": ["expiry-reminders", "documents", "dynamic-type"],
    "pulsecap-sara": ["exercise-library", "pr-tracking"],
    "pulsecap-daniel": ["smart-coach", "pr-tracking", "recovery-readiness"],
    "pulsecap-khalid": ["exercise-library", "recovery-readiness"],
    "steadycap-bilal": ["sos-crisis-flow", "medicine-tracker", "no-streak-guilt"],
    "steadycap-priya": ["medicine-tracker", "journal-check-ins"],
    "steadycap-hamza": ["no-streak-guilt", "sos-crisis-flow", "journal-check-ins"],
    "soulcap-zainab": ["guided-techniques", "on-device-journal", "one-tap-check-in"],
    "soulcap-tom": ["guided-techniques", "on-device-journal", "help-numbers"],
    "soulcap-amina": ["guided-techniques", "on-device-journal", "help-numbers"],
    "ledgercap-usman": ["psx-holdings", "research-tools", "net-worth-pkr"],
    "ledgercap-nida": ["mutual-funds", "net-worth-pkr"],
    "ledgercap-raza": ["psx-holdings", "net-worth-pkr"],
    "deeponycap-ali": ["photo-shelves", "wishlist-tiers", "user-defined-series"],
    "deeponycap-fatima": ["photo-shelves", "wishlist-tiers"],
    "deeponycap-george": ["photo-shelves", "independent-tracker"],
    "scentcap-hira": ["today-picks", "bottle-catalog", "wear-log"],
    "scentcap-james": ["bottle-catalog", "wear-log", "rules-advisor"],
    "scentcap-saad": ["bottle-catalog", "wear-log"],
    "carcap-faisal": ["multi-vehicle-garage", "fuel-odometer", "service-log", "documents-on-device"],
    "carcap-sophie": ["service-log", "fuel-odometer", "documents-on-device"],
    "carcap-rashid": ["multi-vehicle-garage", "service-log", "documents-on-device"],
    "masterycap-ahmed": ["bilingual-tracks", "quizzes-practice", "not-financial-advice"],
    "masterycap-ruth": ["quizzes-practice", "bilingual-tracks"],
    "masterycap-bilqees": ["bilingual-tracks", "self-issued-certificates"],
    "travelcap-sana": ["trip-dashboard", "document-vault", "transit-stays"],
    "travelcap-hassan": ["trip-dashboard", "document-vault", "official-sources"],
    "travelcap-malik": ["trip-dashboard", "document-vault", "transit-stays"],
    "cookcap-shahida": ["family-cookbook", "cook-mode"],
    "cookcap-rohan": ["shopping-list", "cook-mode", "family-cookbook"],
    "cookcap-mariam": ["family-cookbook", "shopping-list", "cook-mode"],
    "ideacap-zara": ["voice-text-capture", "ideas-board"],
    "ideacap-kevin": ["ideas-board", "summary-local"],
    "ideacap-hamid": ["ideas-board", "optional-keys"],
    "deefoodie-dee": ["private-beta", "visit-journal"],
    "deefoodie-arsalan": ["visit-journal", "sync-devices"],
    "deefoodie-noor": ["visit-journal", "private-beta", "delete-my-data"],
}


def apply_rich_copy(persona: dict) -> None:
    pid = persona["id"]
    texts = DAY_COPY.get(pid)
    if texts:
        day = persona["day"]
        n = min(len(day), len(texts))
        for i in range(n):
            day[i]["text"] = texts[i]
    meta = META.get(pid)
    if meta:
        for k, v in meta.items():
            if k == "transcript" and "video" in persona:
                persona["video"]["transcript"] = v
            else:
                persona[k] = v
    if pid in FEATURES_USED:
        persona["features_used"] = list(FEATURES_USED[pid])
