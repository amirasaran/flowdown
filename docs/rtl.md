# RTL / LTR auto-detection

AI replies routinely mix scripts — English headings with Arabic prose, Persian lists with Latin code blocks, Hebrew quotes in English paragraphs. `llm-markdown` handles this without requiring you to annotate anything.

## How it works

The library runs a second pass over the AST after parsing and, for every **block-level node**, scans its text for the first strong directional character (Unicode Bidi rule P2):

- Hebrew, Arabic (including supplements and presentation forms), Syriac, Thaana, NKo → **RTL**
- Latin, Greek, Cyrillic, CJK, Hangul, Kana → **LTR**
- Digits and punctuation alone → **fall back** to the document-level direction

The detected direction is written to `node.dir` on the AST. Block-level node types that carry their own `dir`:

- `paragraph`
- `heading`
- `blockquote`
- `listItem`
- `tableCell`
- `code`

Inline runs inherit the block they live in.

## The `direction` prop

```tsx
<LLMMarkdown text={text} direction="auto" />  // default
<LLMMarkdown text={text} direction="ltr"  />  // force whole document LTR
<LLMMarkdown text={text} direction="rtl"  />  // force whole document RTL
```

| value   | behavior                                                                               |
| ------- | -------------------------------------------------------------------------------------- |
| `auto`  | each block is detected independently; blocks with no strong chars fall back to `ltr`    |
| `ltr`   | every block is tagged `ltr`; skip the scan                                              |
| `rtl`   | every block is tagged `rtl`; skip the scan                                              |

Even when forced, your custom renderers can still override per-node via the node's `dir` property — the library only sets the fallback.

## What the default renderers do with `dir`

**Web**

- Sets `dir={node.dir}` on each block element. The browser handles bidi line-wrapping, caret, and punctuation mirroring.
- Blockquote bar is swapped from left to right border.
- Task-list checkbox is moved to the opposite side.

**React Native**

- Sets `writingDirection: node.dir` on `Text` styles.
- Flips `flexDirection` to `row-reverse` on containers that have a leading marker (list items, blockquote bar).
- Aligns bullets and checkboxes to the start edge of the RTL block.

## Testing a mixed document

The bundled demo under [`examples/web`](../examples/web) has a `Mixed RTL / LTR` preset that mixes Persian, Arabic, Hebrew, and English in a single message:

```md
# Mixed direction demo

English paragraph first, left-to-right as usual.

این یک پاراگراف فارسی است که باید راست‌چین نمایش داده شود.

Another English paragraph in between to prove per-block detection.

הנה פסקה בעברית הנוספת שלנו.

> בלוק‌קوت به فارسی باید راست‌چین باشه.

- English item one
- مورد فارسی دوم
- פריט שלישי בעברית
```

Each paragraph, the blockquote, and each list item get their own direction independently.

## Limits

- The detector uses **first strong character** (P2), not the full bidi algorithm. That means a paragraph that starts with digits and then says something in Arabic is detected as LTR — because the first strong character (a digit is weak) doesn't exist until the Arabic. In practice this is rare and matches what HTML's `dir="auto"` does.
- No attempt is made to split a paragraph that genuinely mixes directions mid-line. The browser and the OS text engine handle that via standard bidi reordering; we just set the paragraph's base direction and let the engine do its job.
- Punctuation-only blocks fall back to `ltr` by default; pass `direction="rtl"` if your UI is RTL-first and you want the fallback flipped.
