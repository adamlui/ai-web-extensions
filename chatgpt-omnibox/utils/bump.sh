#!/bin/bash

# Bumps extension manifests if changes detected + git commit/push
# NOTE: Pass --chrom<e|ium> to forcibly bump Chromium manifest only
# NOTE: Pass --<ff|firefox> to forcibly bump Firefox manifest only
# NOTE: Pass --no-<commit|push> to skip git commit/push

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
    *chrom*) chromium_only=true ;;
    *f*f*) ff_only=true ;;
    --no-commit) no_commit=true ;;
    --no-push) no_push=true ;;
    *) echo -e "${BR}Invalid argument: $arg.${NC}" && exit 1 ;;
esac ; done

# Init manifest PATHS
chromium_manifest_path="chromium/extension/manifest.json"
ff_manifest_path="firefox/extension/manifest.json"
if [ "$chromium_only" = true ] ; then MANIFEST_PATHS=$(echo "$chromium_manifest_path" | grep -i 'chrom')
elif [ "$ff_only" = true ] ; then MANIFEST_PATHS=$(echo "$ff_manifest_path" | grep -i 'firefox')
else MANIFEST_PATHS=("$chromium_manifest_path" "$ff_manifest_path") ; fi

# BUMP versions
if (( ${#MANIFEST_PATHS[@]} > 1 )) ; then manifest_label="manifests"
else manifest_label="${MANIFEST_PATHS[0]}" ; fi
echo -e "${BY}\nBumping version in ${manifest_label}...${NC}\n"
declare -A bumped_manifests=()
TODAY=$(date +'%Y.%-m.%-d') # YYYY.M.D format
for manifest_path in "${MANIFEST_PATHS[@]}" ; do

    # Check latest commit for extension changes if forcible platform flag not set
    platform_manifest_path=$(dirname "$manifest_path" | sed 's|^\./||')
    if [[ ! "$chromium_only $ff_only" =~ true ]] ; then
        echo "Checking last commit details for $platform_manifest_path..."
        latest_platform_commit_msg=$(git log -1 --format=%s -- "$platform_manifest_path")
        echo -e "${DG}${latest_platform_commit_msg}${NC}\n"
        if [[ $latest_platform_commit_msg =~ bump.*(ersion|manifest) ]] ; then
            echo -e "No changes found. Skipping...\n" ; continue ; fi
    fi

    # Echo begin bump
    if [ "$chromium_only" = true ] ; then manifest_prefix="Chromium"
    elif [ "$ff_only" = true ] ; then manifest_prefix="Firefox" ; fi
    echo "Bumping version in ${manifest_prefix} manifest..."

    # Determine old/new versions
    old_ver=$(sed -n 's/.*"version": *"\([0-9.]*\)".*/\1/p' "$manifest_path")
    if [[ $old_ver == "$TODAY" ]] ; then
         new_ver="$TODAY.1"
    elif [[ $old_ver == "$TODAY."* ]] ; then
         LAST_NUMBER=$(echo "$old_ver" | awk -F '.' '{print $NF}')
         new_ver="$TODAY.$((LAST_NUMBER + 1))"
    else new_ver="$TODAY" ; fi

    # Bump old version
    sed -i "s/\"$old_ver\"/\"$new_ver\"/" "$manifest_path"
    echo -e "Updated: ${BW}v${old_ver}${NC} → ${BG}v${new_ver}${NC}\n"
    bumped_manifests["$platform_manifest_path/manifest.json"]="$old_ver;$new_ver"

done

# LOG manifests bumped
plural_suffix=$((( ${#bumped_manifests[@]} > 1 )) && echo "s")
if (( ${#bumped_manifests[@]} == 0 )) ; then echo -e "${BW}Completed. No manifests bumped.${NC}" ; exit 0
else echo -e "${BG}${#bumped_manifests[@]} manifest${plural_suffix} bumped!${NC}" ; fi

# ADD/COMMIT/PUSH bump(s)
if [[ "$no_commit" != true ]] ; then
    echo -e "\n${BY}Committing bump${plural_suffix} to Git...\n${NC}"

    # Init commit msg
    COMMIT_MSG="Bumped \`version\`"
    declare -A unique_versions
    for manifest in "${!bumped_manifests[@]}" ; do
        IFS=";" read -r old_ver new_ver <<< "${bumped_manifests[$manifest]}" ; unique_versions["$new_ver"]=1 ; done
    if (( ${#unique_versions[@]} == 1 )) ; then COMMIT_MSG+=" to \`${!unique_versions[@]}\`" ; fi

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
