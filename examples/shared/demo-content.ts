export const demoMarkdown = `# LLM Markdown Demo

This is a **universal** markdown renderer designed for *AI-streamed* output. It supports every common markdown feature plus custom widgets.

## Core features

- CommonMark + GFM tables, strikethrough ~~like this~~, task lists
- Inline \`code\` and fenced blocks
- Auto-detected direction per block
- Horizontal scroll for wide content

> Block quotes keep their direction independently of the surrounding document.

### A code block

\`\`\`ts
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### A wide table

| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I |
|---|---|---|---|---|---|---|---|---|
| row-1-a | row-1-b | row-1-c | row-1-d | row-1-e | row-1-f | row-1-g | row-1-h | row-1-i |
| row-2-a | row-2-b | row-2-c | row-2-d | row-2-e | row-2-f | row-2-g | row-2-h | row-2-i |

### A task list

- [x] Streaming parser
- [x] Directive registry
- [ ] Shiki highlighting

### Mixed direction

این پاراگراف به فارسی نوشته شده و باید به صورت خودکار از راست به چپ چیده شود.

This paragraph in English should align left-to-right right below it.

הנה פסקה בעברית שצריכה להופיע מימין לשמאל.

## Images

![landscape](https://picsum.photos/seed/hero/800/360 "A randomly-seeded demo image")

Images are plain Markdown \`![alt](url)\` — the default renderer scales them to fit the card and falls back gracefully when a URL 404s.

## Custom widgets

Below is a chart rendered via the \`chart\` directive:

:::chart{type=bar title="Quarterly revenue"}
{"data":[{"label":"Q1","value":12},{"label":"Q2","value":19},{"label":"Q3","value":9},{"label":"Q4","value":24}]}
:::

And a callout that wraps markdown content:

:::callout{tone=info title="Heads up"}
Callouts **render markdown** inside their bodies, so you get \`code\`, lists, and [links](https://example.com) for free.

- one
- two
- three
:::

---

_That's the whole tour._
`;

export const headingsMarkdown = `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Regular paragraph below the headings to verify spacing.
`;

export const inlineMarkdown = `**bold**, *italic*, ***bold italic***, ~~strikethrough~~, \`inline code\`, and [a link](https://example.com "title").

Soft
break inside a paragraph (two trailing spaces).

An autolink: <https://example.com>.
`;

export const listsMarkdown = `Unordered:

- one
- two
  - nested two-a
  - nested two-b
- three

Ordered:

1. first
2. second
3. third

Task list:

- [x] shipped
- [ ] pending
- [x] also done
`;

export const codeMarkdown = `Inline: \`const x = 1\`.

Fenced with language:

\`\`\`ts
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

Fenced without language:

\`\`\`
plain text
second line
\`\`\`

Very long line (should horizontally scroll):

\`\`\`
const reallyLongVariableName = "this line is intentionally very long so that horizontal scroll activates in the code block rendered by the library under test";
\`\`\`
`;

export const blockquoteMarkdown = `> A single-line blockquote.

> A multi-line blockquote
> that spans several lines
> and should keep its direction.

> Nested quotes:
>> nested one
>>> nested two
`;

export const tableMarkdown = `Narrow table:

| Name | Role |
|------|------|
| Ada  | CEO  |
| Bob  | CTO  |

Wide table (should scroll horizontally):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| α | β | γ | δ | ε | ζ | η | θ | ι | κ |

Alignment:

| Left | Center | Right |
|:-----|:------:|------:|
| a    | b      | c     |
| long | middle | last  |
`;

export const bidiMarkdown = `# Mixed direction demo

English paragraph first, left-to-right as usual.

این یک پاراگراف فارسی است که باید راست‌چین نمایش داده شود.

Another English paragraph in between to prove per-block detection.

הנה פסקה בעברית הנוספת שלנו.

> בלוק‌קוت به فارسی باید راست‌چین باشه.

- English item one
- مورد فارسی دوم
- פריט שלישי בעברית
`;

export const directivesMarkdown = `## Chart directive

:::chart{type=bar title="Quarterly revenue"}
{"data":[{"label":"Q1","value":12},{"label":"Q2","value":19},{"label":"Q3","value":9},{"label":"Q4","value":24}]}
:::

## Chart with different data

:::chart{title="Weekly signups"}
{"data":[{"label":"Mon","value":5},{"label":"Tue","value":8},{"label":"Wed","value":14},{"label":"Thu","value":7},{"label":"Fri","value":22}]}
:::

## Callouts with markdown bodies

:::callout{tone=info title="Info"}
This callout **renders markdown** inside. See also [the docs](https://example.com).
:::

:::callout{tone=success title="Success"}
- done
- tested
- shipped
:::

:::callout{tone=warn title="Warning"}
Watch out for \`edge cases\` in streamed output.
:::

:::callout{tone=danger title="Danger"}
> Nested blockquotes also work inside callouts.
:::
`;

export const persianMarkdown = `# راهنمای استفاده از llm-markdown

این کتابخانه یک **رندرر مارک‌داون** قدرتمند است که به طور خاص برای خروجی‌های *جریان‌دار* هوش مصنوعی طراحی شده. روی وب و ری‌اکت نیتیو با یک پکیج واحد کار می‌کند.

## ویژگی‌های اصلی

- پشتیبانی کامل از **CommonMark** و **GFM**
- تشخیص خودکار جهت متن برای هر بلاک
- اسکرول افقی برای جدول‌های عریض
- کامپوننت‌های قابل شخصی‌سازی از بیرون
- پشتیبانی از دایرکتیوهای سفارشی مثل \`:::chart\`

## نقل قول

> این ابزار در هر دو محیط وب و موبایل بدون تغییر در کد کار می‌کند — یک API برای هر دو پلتفرم.

## نمونه کد

کدها به صورت طبیعی از چپ به راست نمایش داده می‌شوند، حتی وقتی داخل سند فارسی باشند:

\`\`\`ts
// تابع ساده برای ساخت پیام خوش‌آمدگویی
export function greet(name: string): string {
  // ترکیب نام با متن ترحیب
  return \`سلام، \${name}!\`;
}

// نمونه استفاده
console.log(greet("دنیا")); // → سلام، دنیا!
\`\`\`

## جدول ویژگی‌ها

| ویژگی | وضعیت | توضیحات |
|-------|-------|---------|
| جریان‌دار | ✅ | تحمل توکن‌های ناقص |
| جدول | ✅ | اسکرول افقی در صورت نیاز |
| چندزبانه | ✅ | تشخیص فارسی، عربی، عبری |
| تم | ✅ | تم روشن و تیره |
| دایرکتیو | ✅ | نمودار، کالوت، کنوس |

## جدول عریض (باید اسکرول افقی فعال شود)

| ستون ۱ | ستون ۲ | ستون ۳ | ستون ۴ | ستون ۵ | ستون ۶ | ستون ۷ | ستون ۸ | ستون ۹ |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|
| الف | ب | پ | ت | ث | ج | چ | ح | خ |
| د | ذ | ر | ز | ژ | س | ش | ص | ض |
| ط | ظ | ع | غ | ف | ق | ک | گ | ل |

## لیست وظایف

- [x] نوشتن تست‌ها
- [x] آماده‌سازی مستندات
- [ ] انتشار نسخه پایدار ۱.۰

## لیست مرتب

۱. متن مارک‌داون را آماده کنید
۲. کامپوننت‌های مورد نیاز را شخصی‌سازی کنید
۳. در پیام‌های چت محصول خود استفاده کنید

## پیوندها و قالب‌بندی درون‌خطی

می‌توانید در متن **ضخیم**، *کج*، ~~خط‌خورده~~ و \`کد درون‌خطی\` داشته باشید و همچنین به [مستندات](https://example.com "مستندات اصلی") لینک دهید.

---

_انتهای نمونه فارسی._
`;

export const arabicMarkdown = `# دليل استخدام llm-markdown

هذه المكتبة هي **عارض ماركداون** قوي مُصمَّم خصّيصًا للمخرجات *المتدفقة* من نماذج الذكاء الاصطناعي. تعمل على الويب وReact Native من حزمة واحدة.

## الميزات الرئيسية

- دعم كامل لـ **CommonMark** و **GFM**
- كشف تلقائي لاتجاه النص لكل فقرة
- تمرير أفقي للجداول العريضة
- مكونات قابلة للتخصيص من الخارج
- دعم التوجيهات المُخصَّصة مثل \`:::chart\`

## اقتباس

> تعمل هذه الأداة في بيئتي الويب والجوال دون أي تغيير في الشيفرة — واجهة برمجية واحدة لكلا المنصّتين.

## مثال برمجي

الشيفرة تُعرض من اليسار إلى اليمين بشكل طبيعي، حتى داخل مستند باللغة العربية:

\`\`\`ts
// دالة بسيطة لإنشاء رسالة الترحيب
export function greet(name: string): string {
  // دمج الاسم مع نص الترحيب
  return \`مرحبًا، \${name}!\`;
}

// مثال على الاستخدام
console.log(greet("العالم")); // → مرحبًا، العالم!
\`\`\`

## جدول الميزات

| الميزة | الحالة | الوصف |
|--------|--------|-------|
| التدفق | ✅ | تحمّل الرموز الجزئية |
| الجداول | ✅ | تمرير أفقي عند اللزوم |
| تعدد اللغات | ✅ | كشف العربية والفارسية والعبرية |
| السمة | ✅ | وضع نهاري وليلي |
| التوجيهات | ✅ | مخططات، تنبيهات، لوحات |

## جدول عريض (ينبغي أن يُمرَّر أفقيًا)

| العمود ١ | العمود ٢ | العمود ٣ | العمود ٤ | العمود ٥ | العمود ٦ | العمود ٧ | العمود ٨ | العمود ٩ |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| أ | ب | ت | ث | ج | ح | خ | د | ذ |
| ر | ز | س | ش | ص | ض | ط | ظ | ع |
| غ | ف | ق | ك | ل | م | ن | ه | و |

## قائمة المهام

- [x] كتابة الاختبارات
- [x] إعداد التوثيق
- [ ] إطلاق الإصدار المستقر ١٫٠

## قائمة مرتبة

١. جهّز نص الماركداون
٢. خصّص المكونات التي تحتاجها
٣. استخدمها في رسائل محادثة منتجك

## الروابط والتنسيق داخل السطر

يمكنك كتابة نص **عريض**، *مائل*، ~~مشطوب~~، و\`كود مضمّن\`، وأن تضيف رابطًا إلى [التوثيق](https://example.com "التوثيق الرئيسي").

---

_انتهت النسخة العربية._
`;

export const imagesMarkdown = `# Images

Markdown supports \`![alt](url "title")\` — the default renderer scales images to fit their container.

## A single landscape image

![Sunlit mountain range](https://picsum.photos/seed/mountain/800/400 "A mountain landscape")

## An image with caption

Below is a portrait-oriented image, good for testing how tall images flow inside a bounded card:

![Portrait of a bird](https://picsum.photos/seed/bird/500/700)

Paragraph text that follows the image — it should flow normally without overlapping.

## Images inside a list

- ![thumb](https://picsum.photos/seed/thumb-a/80/80) First item with a tiny thumbnail
- ![thumb](https://picsum.photos/seed/thumb-b/80/80) Second item with a different thumbnail
- Third item with no image, regular text only

## Side-by-side images via a table

| Morning | Evening |
|---------|---------|
| ![dawn](https://picsum.photos/seed/dawn/280/160) | ![dusk](https://picsum.photos/seed/dusk/280/160) |
| Shot at 6am in the valley. | Shot at 7pm, same spot. |

## Image inside a blockquote

> ![quoted](https://picsum.photos/seed/quote/400/180)
>
> A quoted image with accompanying text. The blockquote bar should stay
> aligned to the left (or right in RTL mode) regardless of the image.

## Reference with a title attribute

Hover the image below on web to see the \`title\` tooltip:

![boat](https://picsum.photos/seed/boat/600/300 "A small sailboat at anchor")

## An image that isn't found

The renderer should fail gracefully and the rest of the document should keep rendering:

![broken image](https://picsum.photos/THIS_DOES_NOT_EXIST_404)

And text after continues to render normally.

---

Images via Lorem Picsum — \`https://picsum.photos/seed/<any-string>/<w>/<h>\` is stable and safe for demos.
`;

export const tableAlignmentMarkdown = `# Table alignment stress test

Each section tests a different combination of direction + variable text sizes.
If rendering is correct, every column boundary should line up **vertically**
across every row within its own table.

## A · LTR, wildly varying cell sizes

| x | medium content | very very very long content that should wrap inside the cell |
|---|----------------|--------------------------------------------------------------|
| a | bb             | ccc                                                          |
| A very long first-cell value that wraps | short | medium text |
| tiny | tiny | tiny |
| one | another long line of text inside the second column | yy |

## B · RTL Persian, wildly varying cell sizes

| ک | متن متوسط | متن بسیار بسیار طولانی که باید درون سلول شکسته شود |
|---|-----------|----------------------------------------------------|
| الف | ب | پ |
| مقدار بسیار طولانی برای سلول اول که می‌پیچد | کوتاه | متوسط |
| ت | متن طولانی در ستون دوم که می‌شکند | ث |
| ج | چ | ح |

## C · RTL Arabic, wildly varying cell sizes

| ك | نص متوسط | نص طويل جدًا جدًا جدًا يجب أن يُلَفّ داخل الخلية |
|---|----------|------------------------------------------------|
| أ | ب | ت |
| قيمة طويلة جدًا للخلية الأولى مع لفّ | قصير | متوسط |
| ث | نص طويل في العمود الثاني | ج |
| ح | خ | د |

## D · Mixed RTL + LTR cells in one row

| English short | فارسی متوسط | Very long English line that wraps |
|---------------|-------------|-----------------------------------|
| Ada           | عدا         | forty two                         |
| A long English name | بوب            | 100                         |
| C             | یک اسم فارسی طولانی در این سلول | 3                 |

## E · Narrow 2-column table (should fill width)

| Key | Value |
|-----|-------|
| short | short |
| a very long key | tiny |
| tiny | a long value that wraps inside the second column |

## F · Very wide 10-column table (should scroll)

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|----|
| a | b | c | d | e | f | g | h | i | j  |
| α | β | γ | δ | ε | ζ | η | θ | ι | κ  |
| ا | ب | ت | ث | ج | ح | خ | د | ذ | ر  |

---

_Every column boundary in A through E should be at the exact same x across all rows of its own table. F should scroll horizontally while still keeping columns aligned as you scroll._
`;

export const streamingEdgeMarkdown = `# Streaming edge cases

A paragraph that grows as tokens arrive. The next block is a code fence that
may be unclosed while streaming — the renderer must not blank out when that
happens:

\`\`\`js
function loadData() {
  return fetch('/api/items')
    .then(r => r.json())
    .then(items => items.filter(i => i.active))
    .then(list => list.sort((a, b) => a.rank - b.rank));
}
\`\`\`

Here is a table that may render partially:

| step | status |
|------|--------|
| 1    | ok     |
| 2    | ok     |
| 3    | ok     |
| 4    | pending |
`;

export const fullMarkdown = demoMarkdown;

export interface Preset {
  id: string;
  label: string;
  text: string;
}

export const presets: Preset[] = [
  { id: 'full', label: 'Everything', text: demoMarkdown },
  { id: 'headings', label: 'Headings', text: headingsMarkdown },
  { id: 'inline', label: 'Inline formatting', text: inlineMarkdown },
  { id: 'lists', label: 'Lists & tasks', text: listsMarkdown },
  { id: 'code', label: 'Code blocks', text: codeMarkdown },
  { id: 'blockquote', label: 'Blockquotes', text: blockquoteMarkdown },
  { id: 'tables', label: 'Tables', text: tableMarkdown },
  { id: 'bidi', label: 'Mixed RTL / LTR', text: bidiMarkdown },
  { id: 'persian', label: 'Persian (فارسی)', text: persianMarkdown },
  { id: 'arabic', label: 'Arabic (العربية)', text: arabicMarkdown },
  { id: 'align', label: 'Table alignment stress test', text: tableAlignmentMarkdown },
  { id: 'directives', label: 'Directives (charts, callouts)', text: directivesMarkdown },
  { id: 'images', label: 'Images', text: imagesMarkdown },
  { id: 'streaming', label: 'Streaming edge cases', text: streamingEdgeMarkdown },
];

export const chartPayload = (raw: string | undefined): { label: string; value: number }[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.data) ? parsed.data : [];
  } catch {
    return [];
  }
};
