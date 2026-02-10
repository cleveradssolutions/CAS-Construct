
# https://editor.construct.net/

# Plugin compile flow:
# $ npm update
# $ tsc -p tsconfig.json
# $ python3 update.py

# Publication .c3addon to github releases
# Publication login: CleverAdsSolutions 
# https://www.construct.net/en/make-games/addons/manage
# https://www.construct.net/en/make-games/addons/1532/cas-ai-mobile-ads


import os
import zipfile
import subprocess
import shutil

_CORDOVA_VERSION = "4.6.0"
_PLUGIN_VERSION = _CORDOVA_VERSION + ".0"

plugin_dirs = [
    "c3runtime",
    "lang"
]
plugin_files = [
    "aces.json",
    "addon.json",
    "icon.svg",
    "instance.js",
    "instance.ts",
    "plugin.js",
    "plugin.ts",
    "type.js",
    "type.ts"
]


def update_version_in_file(file_path, prefix, suffix):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    success = False
    stripPrefix = prefix.lstrip()
    with open(file_path, 'w', encoding='utf-8') as file:
        for line in lines:
            if line.lstrip().startswith(stripPrefix):
                file.write(prefix + suffix + '\n')
                success = True
            else:
                file.write(line)

    if success:
        print("Updated " + file_path + ":\n   " + stripPrefix + suffix)
    else:
        raise RuntimeError(f"Prefix {prefix} not found in file: {file_path}")


update_version_in_file(
    'plugin.ts',
    'const CORDOVA_VERSION = "',
    _CORDOVA_VERSION + '";'
)
update_version_in_file(
    'addon.json',
    '	"version": "',
    _PLUGIN_VERSION + '",'
)

subprocess.run(["tsc"])

for dir in plugin_dirs:
    for file in os.listdir(dir):
        name, extension = os.path.splitext(file)
        if extension.lower() in [".js", ".ts", ".json"]:
            plugin_files.append(os.path.join(dir, file))

dist_dir = 'dist'
shutil.rmtree(dist_dir)
os.makedirs(dist_dir)

archive_path = os.path.join(
    dist_dir, f"CASMobileAdsPlugin_{_PLUGIN_VERSION}.c3addon"
)
with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zipf:
    for file in plugin_files:
        zipf.write(file)

print("Archive: " + archive_path)
