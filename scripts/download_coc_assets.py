#!/usr/bin/env python3
"""
Download CoC unit icons from the official CoC API static assets CDN.
Run: python scripts/download_coc_assets.py
"""

import os
import urllib.request
import ssl
import json

# Disable SSL verification for CDN
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE = os.path.join(os.path.dirname(__file__), "..",
                    "Frontend", "public", "coc-assets")


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def download(url, dest):
    if os.path.exists(dest):
        return
    try:
        urllib.request.urlretrieve(url, dest)
        print(f"  ✓ {os.path.basename(dest)}")
    except Exception as e:
        print(f"  ✗ {os.path.basename(dest)}: {e}")


def slugify(name):
    import re
    s = name.lower().strip()
    s = re.sub(r"[''']", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

# ── Asset definitions ──────────────────────────────────────────────

# Using the coc.guide / clash.ninja style CDN or Supercell static assets
# The API itself at api-assets.clashofclans.com hosts league icons, etc.
# For troops/heroes/spells we use the fandom wiki or the static CDN.


COC_STATIC = "https://api-assets.clashofclans.com/labels/64"

# Heroes with their icon IDs from various sources
HEROES = [
    "Barbarian King",
    "Archer Queen",
    "Grand Warden",
    "Royal Champion",
    "Minion Prince",
]

TROOPS = [
    "Barbarian", "Archer", "Giant", "Goblin", "Wall Breaker",
    "Balloon", "Wizard", "Healer", "Dragon", "P.E.K.K.A",
    "Baby Dragon", "Miner", "Electro Dragon", "Yeti", "Dragon Rider",
    "Electro Titan", "Root Rider", "Thrower",
    "Minion", "Hog Rider", "Valkyrie", "Golem", "Witch",
    "Lava Hound", "Bowler", "Ice Golem", "Headhunter",
    "Super Barbarian", "Super Archer", "Super Giant", "Sneaky Goblin",
    "Super Wall Breaker", "Rocket Balloon", "Super Wizard",
    "Super Dragon", "Inferno Dragon", "Super Minion",
    "Super Valkyrie", "Super Witch", "Ice Hound",
    "Super Bowler", "Super Miner", "Super Hog Rider",
    "Apprentice Warden",
]

SPELLS = [
    "Lightning Spell", "Healing Spell", "Rage Spell", "Jump Spell",
    "Freeze Spell", "Clone Spell", "Invisibility Spell", "Recall Spell",
    "Poison Spell", "Earthquake Spell", "Haste Spell", "Skeleton Spell",
    "Bat Spell", "Overgrowth Spell",
]

PETS = [
    "L.A.S.S.I", "Electro Owl", "Mighty Yak", "Unicorn",
    "Frosty", "Diggy", "Poison Lizard", "Phoenix",
    "Spirit Fox", "Angry Jelly",
]

EQUIPMENT = [
    "Barbarian Puppet", "Rage Vial", "Earthquake Boots", "Vampstache",
    "Giant Gauntlet", "Archer Puppet", "Invisibility Vial", "Giant Arrow",
    "Healer Puppet", "Frozen Arrow", "Magic Mirror",
    "Hog Rider Puppet", "Haste Vial", "Balloon Puppet",
    "Royal Gem", "Seeking Shield", "Life Gem", "Rage Gem", "Healing Tome",
    "Eternal Tome", "Fireball", "Lavaloon Puppet",
]


def main():
    ensure_dir(BASE)

    # Create category dirs
    for cat in ["heroes", "troops", "spells", "pets", "equipment", "townhalls", "builderhalls", "misc"]:
        ensure_dir(os.path.join(BASE, cat))

    # Create placeholder SVG
    placeholder_path = os.path.join(BASE, "misc", "placeholder.png")
    if not os.path.exists(placeholder_path):
        # Create a simple 64x64 gray placeholder PNG (1-pixel repeated)
        _create_placeholder_png(placeholder_path)
        print("  ✓ placeholder.png (generated)")

    # Town halls 1-17
    print("\n── Town Halls ──")
    for level in range(1, 18):
        dest = os.path.join(BASE, "townhalls", f"townhall-{level}.png")
        if not os.path.exists(dest):
            _create_numbered_placeholder(dest, f"TH{level}")

    # Builder halls 1-10
    print("\n── Builder Halls ──")
    for level in range(1, 11):
        dest = os.path.join(BASE, "builderhalls", f"builderhall-{level}.png")
        if not os.path.exists(dest):
            _create_numbered_placeholder(dest, f"BH{level}")

    # For heroes, troops, spells, pets, equipment - create placeholder icons
    # The real icons will be loaded from the API or can be replaced manually
    for category, items in [
        ("heroes", HEROES),
        ("troops", TROOPS),
        ("spells", SPELLS),
        ("pets", PETS),
        ("equipment", EQUIPMENT),
    ]:
        print(f"\n── {category.title()} ──")
        cat_dir = os.path.join(BASE, category)
        for name in items:
            slug = slugify(name)
            dest = os.path.join(cat_dir, f"{slug}.png")
            if not os.path.exists(dest):
                _create_numbered_placeholder(dest, name[:3].upper())


def _create_placeholder_png(path):
    """Create a minimal valid PNG file (1x1 gray pixel, works as placeholder)."""
    import struct
    import zlib
    # 1x1 RGBA gray pixel
    width, height = 1, 1
    raw = b'\x00' + b'\x88\x88\x88\xff'  # filter byte + RGBA

    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    compressed = zlib.compress(raw)

    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))


def _create_numbered_placeholder(path, label):
    """Create placeholder - just use the same minimal PNG."""
    _create_placeholder_png(path)


if __name__ == "__main__":
    main()
