# Motivation
Keine Lust die Noten im Schulnetz Zeile für Zeile manuell hinzuzufügen? 
Mit diesem Bookmarklet kannst Du die Noten von deinem Excel Notenblatt in Schulnetz copy-pasten.  

[Link text Here](https://link-url-here.org)

# Bookmarklet-Installation
Ein Bookmarklet ist ein spezielles Lesezeichen, das JavaScript-Code enthält. Folgen Sie diesen einfachen Schritten, um das Bookmarklet zu installieren:

## Installation

1. **Stellen Sie sicher, dass Ihre Lesezeichen-Leiste sichtbar ist**:
    - Bei den meisten Browsern kann sie durch Drücken von `Ctrl+Shift+B` (Windows/Linux) oder `Command+Shift+B` (Mac) eingeblendet werden.

2. **Fügen Sie das Bookmarklet hinzu**:
    - Ziehen Sie den folgenden Link per Drag-and-Drop in Ihre Lesezeichen-Leiste:
    [Schulnetz-Noten-Copy-Paste](javascript:(async%20function(){window.focus();await%20new%20Promise(resolve=>setTimeout(resolve,500));if(!navigator.clipboard){console.error('Clipboard%20API%20not%20supported%20in%20this%20browser.');return;}try{const%20text=await%20navigator.clipboard.readText();console.log("Clipboard%20content:",text);const%20values=text.trim().split('\n');for(let%20i=0;i<values.length;i++){console.log(`Value%20${i+1}:`,values[i]);const%20elem=document.querySelector(`#feld_${i+1}`);if(elem){elem.value=values[i];}}}catch(err){console.error('Could%20not%20read%20from%20clipboard:',err);}})())


## Verwendung

Um das Bookmarklet auszuführen, klicken Sie einfach auf das Lesezeichen in Ihrer Lesezeichen-Leiste, wenn Sie auf einer Webseite sind.


# Demo Video 

# Hinweise
Sortierung und Anzahl der Einträge muss stimmen, wird nicht überprüft

