#!/bin/bash

EXAM_DIR="$1"
RESPONSE_DIR="$EXAM_DIR/responses"

REPORT1_DIR="$EXAM_DIR/report_check"
REPORT2_DIR="$EXAM_DIR/report_check_runtime"

 
REPO_LIST="$1/_repos.txt"
if [[ -z $EXAM_DIR ]]; then
    echo "Error: Exam directory not specified!"
  
    exit 1
fi

if [[ ! -d $RESPONSE_DIR ]]; then
    mkdir -p "$RESPONSE_DIR"
fi

if [[ ! -d $REPORT1_DIR ]]; then
    mkdir -p "$REPORT1_DIR"
fi

if [[ ! -d $REPORT2_DIR ]]; then
    mkdir -p "$REPORT2_DIR"
fi

 
if [[ ! -f $REPO_LIST ]]; then
    echo "Error: File '$REPO_LIST' not found!"
    exit 1
fi



while IFS= read -r REPO_URL || [[ -n "$REPO_URL" ]]; do
    # Skip empty lines 
    if [[ -z "$REPO_URL" ]]; then
        continue
    fi

    echo "Cloning repository: $REPO_URL"
    cd "$RESPONSE_DIR"
    # Clone the repository and fetch all branches
    git clone "$REPO_URL"  || {
        echo "Failed to clone $REPO_URL. Skipping."
        continue
    }
    
done < "$REPO_LIST"

echo "Done cloning all repositories."
