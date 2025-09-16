# email-editor
Edit emails after sending!

# 📩 Dynamic Email Content via Image Link

This project demonstrates a clever technique to **embed dynamic, remotely-updatable content inside an email**, by leveraging the `<img>` tag in HTML emails.

## ✅ What This Project Does

- Sends an email that **appears completely standard** to the recipient — containing normal text.  
- The "text" is actually an **image dynamically served from a remote server**.  
- The image is rendered on-the-fly, and its content can be updated any time after the email is sent.  
- When the recipient reopens the email, they see the **updated content**, without any indication that the message changed.

## 💡 Why Use This Technique?

HTML email clients (like Gmail, Outlook) strictly block dynamic scripts, external content like iframes, or embedded JSON. However, **image loading is still allowed** (unless blocked manually by the user).

By pointing an `<img>` tag in the email to a remote server, we bypass these restrictions and display **dynamic information** that can change in real time.

## 🔧 How It Works

1. The email HTML contains an `<img>` tag like:  
   `<img src="https://yourserver.com/content/abc123.png?v=1699999999999" alt="Dynamic Text" style="display:block; max-width:100%;" width="600" height="200">`

2. On the server:
   - `GET /content/:id.png` dynamically renders a PNG based on the requested `id`.
   - Response includes no-cache headers to avoid email proxy caching.
   - The image is generated from plain text, using a clean, readable font.

3. You can update the server-side text at any time (via POST below).
   - The recipient sees the updated version when re-opening the email.

## 🔐 Limitations & Considerations

- The text is rendered as an image:
  - ❌ Not selectable  
  - ❌ Not searchable or screen-reader accessible  
- Users who **disable images in email clients** will not see the content.  
- You must host and maintain the backend server that returns the dynamic image.

## 🛠 Tech Stack

- **Backend**: Node.js with image generation library (canvas)  
- **Email HTML**: Plain HTML with inline `<img>` tag

## 🔌 API

- `POST /api/message/:id`
  - Body: `{ "text": "Hello" }`
  - Persists the text and returns a cache-busted image URL.
  - Response: `{ "success": true, "imageUrl": "/content/:id.png?v=<timestamp>" }`

- `GET /content/:id.png`
  - Returns a PNG rendered from the latest stored text.
  - Sends `Cache-Control: no-store` and related headers.

## ✉️ Email HTML Example

Embed this directly in your email HTML:

```html
<img
  src="https://yourserver.com/content/abc123.png?v=1699999999999"
  alt="Dynamic message"
  style="display:block; outline:none; border:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%;"
  width="600"
  height="200"
/>
```

Tip: Update the `v` query param (timestamp/version) whenever you change the message.

## 📦 Example Use Cases

- Updating appointment times dynamically  
- Showing live status (e.g. "Still available" / "Sold out")  
- Secret announcements or easter eggs after sending  
- Fake "editable email" demos 😎

---

Proudly built by someone who knows how to get around the rules — creatively and ethically.

-- No scripts. No hacks. Just smart thinking --

