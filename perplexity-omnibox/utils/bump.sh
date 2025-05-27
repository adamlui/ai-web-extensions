#!/bin/bash

# Bumps Chromium manifest if changes detected + git commit/push if --no-<commit|push> not passed

shopt -s nocasematch # enable case-insensitive matching (to flexibly check commit msg for bumps)

# Init UI COLORS
NC="\033[0m"        # no color
DG="\033[38;5;243m" # dim gray
BR="\033[1;91m"     # bright red
BY="\033[1;33m"     # bright yellow
BG="\033[1;92m"     # bright green
BW="\033[1;97m"     # bright white

# Parse ARGS
for arg in "$@" ; do case "$arg" in
    --no-commit) no_commit=true ;;
    --no-push) no_push=true ;;
    *) echo -e "${BR}Invalid argument: $arg.${NC}" && exit 1 ;;
esac ; done

# Init manifest PATH
MANIFEST_PATH="chromium/extension/manifest.json"

echo -e "${BY}\nBumping version in ${MANIFEST_PATH}...${NC}\n"

# Init BUMP vars
declare -A bumped_manifests=()
TODAY=$(date +'%Y.%-m.%-d') # YYYY.M.D format

# Check LATEST COMMIT for extension changes
chromium_manifest_path=$(dirname "$MANIFEST_PATH" | sed 's|^\./||')
echo "Checking last commit details for $chromium_manifest_path..."
latest_platform_commit_msg=$(git log -1 --format=%s -- "$chromium_manifest_path")
echo -e "${DG}${latest_platform_commit_msg}${NC}\n"
if [[ $latest_platform_commit_msg =~ bump.*(ersion|manifest) ]] ; then
    echo -e "No changes found." ; exit ; fi 

echo "Bumping version in Chromium manifest..."

# Determine OLD/NEW versions
old_ver=$(sed -n 's/.*"version": *"\([0-9.]*\)".*/\1/p' "$MANIFEST_PATH")
if [[ $old_ver == "$TODAY" ]] ; then
     new_ver="$TODAY.1"
elif [[ $old_ver == "$TODAY."* ]] ; then
     LAST_NUMBER=$(echo "$old_ver" | awk -F '.' '{print $NF}')
     new_ver="$TODAY.$((LAST_NUMBER + 1))"
else new_ver="$TODAY" ; fi

# BUMP old version
sed -i "s/\"version\": \"$old_ver\"/\"version\": \"$new_ver\"/" "$MANIFEST_PATH"
echo -e "Updated: ${BW}v${old_ver}${NC} → ${BG}v${new_ver}${NC}\n"
bumped_manifests["$platform_manifest_path/manifest.json"]="$old_ver;$new_ver"

# LOG manifests bumped
plural_suffix=$((( ${#bumped_manifests[@]} > 1 )) && echo "s")
if (( ${#bumped_manifests[@]} == 0 )) ; then echo -e "${BW}Completed. No manifests bumped.${NC}" ; exit 0
else echo -e "${BG}${#bumped_manifests[@]} manifest${plural_suffix} bumped!${NC}" ; fi

# ADD/COMMIT/PUSH bump(s)
if [[ "$no_commit" != true ]] ; then
    echo -e "\n${BY}Committing bump${plural_suffix} to Git...\n${NC}"

    # Init commit msg
    COMMIT_MSG="Bumped \`version\` to \`$new_ver\`" ; fi

    # git add/commit/push
    git add ./**/manifest.json && git commit -n -m "$COMMIT_MSG"
    if [[ "$no_push" != true ]] ; then
        echo -e "\n${BY}Pulling latest changes from remote to sync local repository...${NC}\n"
        git pull || (echo -e "${BR}Merge failed, please resolve conflicts!${NC}" && exit 1)
        echo -e "\n${BY}Pushing bump${plural_suffix} to Git...\n${NC}"
        git push
    fi

    git_action="updated"$( [[ "$no_commit" != true ]] && echo -n "/committed" )$(
                           [[ "$no_push"   != true ]] && echo -n "/pushed" )
    echo -e "\n${BG}Success! ${#bumped_manifests[@]} manifest${plural_suffix} ${git_action} to GitHub${NC}"
fi

# Final SUMMARY log
echo # line break
for manifest in "${!bumped_manifests[@]}" ; do
    IFS=";" read -r old_ver new_ver <<< "${bumped_manifests[$manifest]}"
    echo -e "  ± $manifest ${BW}v${old_ver}${NC} → ${BG}v${new_ver}${NC}"
done
