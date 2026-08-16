# Process Overview

## What I built

Inspired after recently watching Christopher Nolan's "The Oddysey" I built a scroll driven storytelling map that allows the user to trace Odysseus' journey home depicted in Homer's "The Oddysey". As the user scrolls through the map, they can trace the rough path that he took through the Mediterranean Sea, and read about the key points of interest that he stopped at along his journey including their modern real world names, and a little bit about what the location does today. The website also supports keyboard input and works on mobile too.

## The moments that mattered

### Moment 1:

1. **what happened**: 

I found that across sessions, I struggled keeping track of all of the ideas that I wanted to implement into the project, I also found that I struggled remembering where I got up to last time when starting a new session

2. **what you did instead of the obvious thing**

Instead of keeping track of them in a notes document or on paper, I decided to make a claude readable "TODO.md" file that claude could reference at the beginning of each session. This way I could enter planning mode at the beginning of each session with a clear outline of what I needed to do. Once claude completed an item, it could mark it as done with an x, or if we did not manage to get it fully completed in a session, claude could mark it as half done and make note where we got up to so that we could continue where we left off in a new session.

3. **how you knew it was right**

While not observable in the project itself, it quickly became apparent that this was the right move as I found I could get back into the flow of things quicker in a new session and always knew what to do next. Whenever I came up with a new idea, I could add it to the list and start it once the current task was completed, ensuring that no ideas were left in the repo half finished.

4. **the citation**

Please reference ./TODO.md in this repo to see the file






I have found a bug when scrolling between locations, the grey part of the text
area that the user uses to scroll dissapears and when the cursor is placed over it
and scrolled, it interacts with the map instead (zoom out) meaning the user has
to move their cursor to the bottom of the screen to "grab" the next text slide.
Here is a screenshot of what I mean for reference:

[Image #1]

that is incorrect, the user should be able to zoom in and out. The issue is that
the tile that the text sits on is not continuous and when it ends between tiles,
the mouse behaviour switches to zooming in and out as it is sitting on the map
layer, not the text tile layer.