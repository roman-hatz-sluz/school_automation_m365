#!/bin/bash

 
REPO_LIST="_repos.txt"

 
if [[ ! -f $REPO_LIST ]]; then
    echo "Error: File '$REPO_LIST' not found!"
    exit 1
fi

 
while IFS= read -r REPO_URL || [[ -n "$REPO_URL" ]]; do
    # Skip empty lines or lines starting with #
    if [[ -z "$REPO_URL" || "$REPO_URL" == \#* ]]; then
        continue
    fi

    echo "Cloning repository: $REPO_URL"

    # Clone the repository and fetch all branches
    git clone "$REPO_URL" || {
        echo "Failed to clone $REPO_URL. Skipping."
        continue
    }
    
done < "$REPO_LIST"

echo "Done cloning all repositories."
