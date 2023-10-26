# Motivation
Keine Lust die Noten im Schulnetz Zeile für Zeile manuell hinzuzufügen? 
Mit diesem Bookmarklet kannst Du die Noten von deinem Excel Notenblatt in Schulnetz copy-pasten.  

# Bookmarklet-Installation
Ein Bookmarklet ist ein spezielles Lesezeichen, das JavaScript-Code enthält. Folgen Sie diesen einfachen Schritten, um das Bookmarklet zu installieren:

## Installation
1. **Stellen Sie sicher, dass Ihre Lesezeichen-Leiste sichtbar ist**:
    - Bei den meisten Browsern kann sie durch Drücken von `Ctrl+Shift+B` (Windows/Linux) oder `Command+Shift+B` (Mac) eingeblendet werden.

2. **Fügen Sie das Bookmarklet hinzu**:
    - Ziehen Sie den folgenden Link per Drag-and-Drop in Ihre Lesezeichen-Leiste:
    [**Schulnetz-Noten-einfügen**](javascript:(async function(){window.focus();await new Promise(resolve=>setTimeout(resolve,500));if(!navigator.clipboard){console.error('Clipboard API not supported in this browser.');return;}try{const text=await navigator.clipboard.readText();console.log("Clipboard content:",text);const values=text.trim().split('\n');for(let i=0;i<values.length;i++){console.log(`Value ${i+1}:`,values[i]);const elem=document.querySelector(`#feld_${i+1}`);if(elem){elem.value=values[i];}}}catch(err){console.error('Could not read from clipboard:',err);}})();
)

## Verwendung

Um das Bookmarklet auszuführen, klicken Sie einfach auf das Lesezeichen in Ihrer Lesezeichen-Leiste, wenn Sie auf einer Webseite sind.


# Demo Video 

# Hinweise
Sortierung und Anzahl der Einträge muss stimmen, wird nicht überprüft

