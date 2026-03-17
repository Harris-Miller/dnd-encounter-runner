"""
Parse D&D Beyond HTML stat blocks (from JSON array of HTML strings) into
stat-block JSON objects matching the SRD schema.
"""

import json
import re
import sys
from pathlib import Path
from typing import Optional


def unesc(s: str) -> str:
    s = s.strip()
    if s.startswith('"'):
        s = s[1:]
    if s.endswith('"'):
        s = s[:-1]
    return s.replace("\\n", "\n").replace('\\"', '"')


def strip_html(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html).strip()


def parse_size_type_align(text: str) -> tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
    """Return (size, creatureType, descriptiveTags, alignment)."""
    if not text or not text.strip():
        return (None, None, None, None)
    # e.g. "Large Aberration, Lawful Evil" or "Medium or Small Humanoid, Neutral Evil"
    # or "Medium Fiend (Yugoloth), Neutral Evil"
    size_part = r"((?:Tiny|Small|Medium|Large|Huge|Gargantuan)(?:\s+or\s+(?:Tiny|Small|Medium|Large|Huge|Gargantuan))?)"
    match = re.match(
        rf"^{size_part}\s+(.+?),\s*(.+)$",
        text.strip(),
    )
    if not match:
        return (None, None, None, None)
    size = match.group(1).strip()
    type_and_tags = match.group(2).strip()
    alignment = match.group(3).strip()
    # type_and_tags e.g. "Aberration" or "Fiend (Yugoloth)"
    paren = type_and_tags.find("(")
    if paren >= 0:
        creature_type = type_and_tags[:paren].strip()
        descriptive_tags = type_and_tags[paren:].strip()
    else:
        creature_type = type_and_tags
        descriptive_tags = None
    return (size, creature_type, descriptive_tags, alignment)


def parse_skills(raw: Optional[str]) -> Optional[list[str]]:
    """Split 'Perception +4 , Persuasion +4 , Stealth +7' into ['Perception +4', 'Persuasion +4', 'Stealth +7']."""
    if not raw or not raw.strip():
        return None
    return [part.strip() for part in raw.split(",") if part.strip()]


def parse_senses(raw: Optional[str]) -> Optional[list[str]]:
    """Split 'Darkvision 60 ft.; Passive Perception 14' into ['Darkvision 60 ft.', 'Passive Perception 14']."""
    if not raw or not raw.strip():
        return None
    return [part.strip() for part in raw.split(";") if part.strip()]


def parse_comma_separated_list(raw: Optional[str]) -> list[str]:
    """Split 'Cold, Fire, Lightning' into ['Cold', 'Fire', 'Lightning']. Returns [] when raw is None or empty."""
    if not raw or not raw.strip():
        return []
    return [part.strip() for part in raw.split(",") if part.strip()]


def parse_speed(raw: Optional[str]) -> tuple[Optional[str], Optional[str], Optional[str], Optional[str], Optional[str]]:
    """Return (speed, burrowSpeed, climbSpeed, flySpeed, swimSpeed)."""
    if not raw or not raw.strip():
        return (None, None, None, None, None)
    text = raw.strip()
    burrow = None
    climb = None
    fly = None
    swim = None
    # Match "Burrow 20 ft.", "Climb 30 ft.", "Fly 30 ft. (hover)", "Swim 40 ft."
    # Allow period in value so we get "30 ft." not "30 ft"
    burrow_m = re.search(r"Burrow\s+([^,;]+?)(?=\s*[,;]|$)", text, re.I)
    if burrow_m:
        burrow = burrow_m.group(1).strip()
    climb_m = re.search(r"Climb\s+([^,;]+?)(?=\s*[,;]|$)", text, re.I)
    if climb_m:
        climb = climb_m.group(1).strip()
    fly_m = re.search(r"Fly\s+([^,;]+?)(?=\s*[,;]|$)", text, re.I)
    if fly_m:
        fly = fly_m.group(1).strip()
    swim_m = re.search(r"Swim\s+([^,;]+?)(?=\s*[,;]|$)", text, re.I)
    if swim_m:
        swim = swim_m.group(1).strip()
    # Walk speed is the first segment (before first comma or the whole thing)
    first = text.split(",")[0].strip()
    # If first segment is a plain speed (e.g. "30 ft.") and not a keyword speed, it's walk
    if not re.match(r"^(Burrow|Climb|Fly|Swim)\s", first, re.I):
        speed = first
    else:
        speed = None
    return (speed, burrow, climb, fly, swim)


def parse_cr_line(text: str) -> tuple[Optional[str], Optional[int], Optional[str], Optional[int]]:
    """Return (challengeRating, experiencePoints, experiencePointsAlt, proficiencyBonus)."""
    if not text or not text.strip():
        return (None, None, None, None)
    text = text.strip()
    # e.g. "10 (XP 5,900, or 7,200 in lair; PB +4 )"
    cr_match = re.match(r"^(\d+(?:/\d+)?)\s*\(?", text)
    challenge_rating = cr_match.group(1) if cr_match else None
    xp_match = re.search(r"XP\s*([\d,]+)", text)
    experience_points = int(xp_match.group(1).replace(",", "")) if xp_match else None
    alt_match = re.search(r"or\s+([\d,]+)\s+in\s+lair", text, re.I)
    experience_points_alt = alt_match.group(1).strip() if alt_match else None
    pb_match = re.search(r"PB\s*([+-]?\d+)", text)
    proficiency_bonus = int(pb_match.group(1)) if pb_match else None
    return (challenge_rating, experience_points, experience_points_alt, proficiency_bonus)


def parse_abilities(html: str) -> dict[str, dict[str, int]]:
    out: dict[str, dict[str, int]] = {}
    for ab in ["Str", "Dex", "Con", "Int", "Wis", "Cha"]:
        pat = (
            r"<th>"
            + re.escape(ab)
            + r"</th>\s*<td>(\d+)</td>(?:\s*<[^>]+>)*\s*<strong>([+-]?\d+)</strong>(?:\s*<[^>]+>)*\s*<strong>([+-]?\d+)</strong>"
        )
        m = re.search(pat, html, re.DOTALL)
        if m:
            out[ab] = {
                "score": int(m.group(1)),
                "mod": int(m.group(2)),
                "save": int(m.group(3)),
            }
    return out


def parse_one(html_raw: str) -> dict:
    s = unesc(html_raw)
    texts: list[str] = []
    for p in re.findall(r"<p[^>]*>(.*?)</p>", s, re.DOTALL):
        texts.append(re.sub(r"\s+", " ", strip_html(p)).strip())

    name = None
    m = re.search(
        r'<a[^>]*class="[^"]*monster-tooltip[^"]*"[^>]*>([^<]+)</a>', s
    )
    if m:
        name = m.group(1).strip()

    size_type_align = texts[0] if texts else None
    size, creature_type, descriptive_tags, alignment = parse_size_type_align(
        size_type_align or ""
    )

    ac = None
    init_mod = None
    init_score = None
    hp = None
    hp_dice = None
    speed_raw = None
    skills_raw = None
    senses_raw = None
    languages = None
    cr_line = None
    resistances_raw = None
    immunities_raw = None
    vulnerabilities = None
    gear = None

    for t in texts:
        if "AC" in t and "Initiative" in t:
            ma = re.search(r"AC\s*(\d+)", t)
            if ma:
                ac = int(ma.group(1))
            ma = re.search(r"Initiative\s*([+-]?\d+)\s*\((\d+)\)", t)
            if ma:
                init_mod = ma.group(1)
                init_score = int(ma.group(2))
        elif "HP" in t and "(" in t:
            ma = re.search(r"(\d+)\s*\(([^)]+)\)", t)
            if ma:
                hp = int(ma.group(1))
                hp_dice = ma.group(2).strip()
        elif t.startswith("Speed "):
            speed_raw = t.replace("Speed ", "", 1).strip()
        elif t.startswith("Skills "):
            skills_raw = t.replace("Skills ", "", 1).strip()
        elif t.startswith("Senses "):
            senses_raw = t.replace("Senses ", "", 1).strip()
        elif t.startswith("Languages "):
            languages = t.replace("Languages ", "", 1).strip()
        elif t.startswith("CR "):
            cr_line = t.replace("CR ", "", 1).strip()
        elif t.startswith("Resistances "):
            resistances_raw = t.replace("Resistances ", "", 1).strip()
        elif t.startswith("Immunities "):
            immunities_raw = t.replace("Immunities ", "", 1).strip()
        elif t.startswith("Vulnerabilities "):
            vulnerabilities = t.replace("Vulnerabilities ", "", 1).strip()
        elif t.startswith("Gear "):
            gear = t.replace("Gear ", "", 1).strip()

    challenge_rating, experience_points, experience_points_alt, proficiency_bonus = (
        parse_cr_line(cr_line or "")
    )

    speed, burrow_speed, climb_speed, fly_speed, swim_speed = parse_speed(speed_raw)
    skills = parse_skills(skills_raw)
    senses = parse_senses(senses_raw)
    resistances = parse_comma_separated_list(resistances_raw)
    immunities = parse_comma_separated_list(immunities_raw)

    abilities = parse_abilities(s)

    headers = list(re.finditer(r'<p class="monster-header"[^>]*>([^<]+)</p>', s))
    legendary_intro = None
    legendary_match = re.search(
        r'<p class="legendary-actions"[^>]*>(.*?)</p>', s, re.DOTALL
    )
    if legendary_match:
        legendary_intro = re.sub(r"\s+", " ", strip_html(legendary_match.group(1))).strip()

    traits: list[str] = []
    actions: list[str] = []
    bonus_actions: list[str] = []
    reactions: list[str] = []
    legendary_actions: list[str] = []

    for i, H in enumerate(headers):
        sec = H.group(1).strip()
        start = H.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(s)
        block = s[start:end]
        paras = re.findall(r'<p data-content-chunk-id="[^"]*">(.*?)</p>', block, re.DOTALL)
        if sec == "Legendary Actions" and legendary_intro:
            legendary_actions.append(legendary_intro)
            legendary_intro = None
        for p in paras:
            t = re.sub(r"\s+", " ", strip_html(p)).strip()
            if not t:
                continue
            if sec == "Traits":
                traits.append(t)
            elif sec == "Actions":
                actions.append(t)
            elif sec == "Bonus Actions":
                bonus_actions.append(t)
            elif sec == "Reactions":
                reactions.append(t)
            elif sec == "Legendary Actions":
                legendary_actions.append(t)
    if legendary_intro and not legendary_actions:
        legendary_actions.append(legendary_intro)

    flat_abilities: dict[str, int] = {}
    ab_map = {
        "Str": "strength",
        "Dex": "dexterity",
        "Con": "constitution",
        "Int": "intelligence",
        "Wis": "wisdom",
        "Cha": "charisma",
    }
    for ab, key in ab_map.items():
        if ab in abilities:
            flat_abilities[key] = abilities[ab]["score"]
            flat_abilities[key + "Save"] = abilities[ab]["save"]

    return {
        "name": name,
        "size": size,
        "creatureType": creature_type,
        "descriptiveTags": descriptive_tags,
        "alignment": alignment,
        "armorClass": ac,
        "initiativeModifier": init_mod,
        "initiativeScore": init_score,
        "hitPoints": hp,
        "hitPointDice": hp_dice,
        "speed": speed,
        "speedBurrow": burrow_speed,
        "speedClimb": climb_speed,
        "speedFly": fly_speed,
        "speedSwim": swim_speed,
        **flat_abilities,
        "skills": skills,
        "resistances": resistances,
        "immunities": immunities,
        "vulnerabilities": vulnerabilities,
        "gear": gear,
        "senses": senses,
        "languages": languages,
        "challengeRating": challenge_rating,
        "experiencePoints": experience_points,
        "experiencePointsAlt": experience_points_alt,
        "proficiencyBonus": proficiency_bonus,
        "traits": traits,
        "actions": actions,
        "bonusActions": bonus_actions,
        "reactions": reactions,
        "legendaryActions": legendary_actions,
    }


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: parse_stat_blocks.py <input.json> <output.json>", file=sys.stderr)
        sys.exit(1)
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)
    with open(input_path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        print("Input JSON must be an array of HTML strings", file=sys.stderr)
        sys.exit(1)
    parsed = [parse_one(entry) for entry in data]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2, ensure_ascii=False)
    print(f"Parsed {len(parsed)} stat blocks to {output_path}")


if __name__ == "__main__":
    main()
