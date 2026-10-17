Dev export instructions

How to export edits from the on-site Dev Mode and send them to the assistant for application.

1) Open your site and press the floating "Dev" button (bottom-right).
2) Enter the dev code: 041012 and click Unlock.
3) Make edits using Add text / Add image / Create new page etc.
4) When done, click Export code (copy). This copies a base64-encoded export string to your clipboard.
5) Paste the export string into the chat with me in this format (single message):

Apply export:<paste-the-code-here>

Example:
Apply export: H4sIAAAAAAA... (the long string)

What I will do after you paste the export string
- I will decode the export string, create a branch named apply-export-YYYYMMDD-HHMMSS, commit the updated files (pages, images as files if included) to that branch, and open a Pull Request from that branch into main. You will be able to review before merging.

Notes
- Export includes image data as data-URLs. Very large images may create very long export strings; if the export is huge, consider uploading images directly to the repo or ask me to accept separate image uploads.
- Exports are stored only in your clipboard and localStorage until you share them with me. I will not receive anything until you paste the export string into the chat.
