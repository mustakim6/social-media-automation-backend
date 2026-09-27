
import sharp from "sharp";

const WIDTH = 1080;
const HEIGHT = 1080;


// ================================================
// FONT
// ================================================

const FONT_FAMILY =
    "Noto Sans Bengali, sans-serif";


// ================================================
// CARD THEMES
// ================================================

const CARD_THEMES = {
    midnight: {
        name: "Midnight",
        start: "#0F172A",
        end: "#312E81",
        accent: "#A5B4FC",
    },

    ocean: {
        name: "Ocean",
        start: "#083344",
        end: "#155E75",
        accent: "#67E8F9",
    },

    forest: {
        name: "Forest",
        start: "#052E16",
        end: "#166534",
        accent: "#86EFAC",
    },

    berry: {
        name: "Berry",
        start: "#500724",
        end: "#86198F",
        accent: "#F0ABFC",
    },

    sunset: {
        name: "Sunset",
        start: "#431407",
        end: "#C2410C",
        accent: "#FED7AA",
    },

    royal: {
        name: "Royal",
        start: "#1E1B4B",
        end: "#4338CA",
        accent: "#C7D2FE",
    },

    teal: {
        name: "Teal",
        start: "#042F2E",
        end: "#0F766E",
        accent: "#99F6E4",
    },
};


// ================================================
// XML ESCAPE
// ================================================

const escapeXml = (text) => {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};


// ================================================
// NORMALIZE QUOTE
// ================================================

const normalizeQuote = (text) => {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/^["“”']+|["“”']+$/g, "")
        .trim();
};


// ================================================
// WRAP SINGLE LINE
// ================================================

const wrapSingleLine = (
    text,
    maxCharsPerLine = 30
) => {
    const words = text
        .split(/\s+/)
        .filter(Boolean);

    const lines = [];

    let currentLine = "";

    for (const word of words) {

        const testLine =
            currentLine
                ? `${currentLine} ${word}`
                : word;

        if (
            testLine.length >
                maxCharsPerLine &&
            currentLine
        ) {
            lines.push(
                currentLine
            );

            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(
            currentLine
        );
    }

    return lines;
};


// ================================================
// WRAP QUOTE
// ================================================
//
// Preserve LLM line breaks.
// Only wrap a line if it is too long.
// ================================================

const wrapQuote = (
    text,
    maxCharsPerLine = 30
) => {

    const originalLines =
        text
            .split("\n")
            .map(
                (line) =>
                    line.trim()
            )
            .filter(Boolean);

    const lines = [];

    for (
        const line of originalLines
    ) {

        const wrappedLines =
            wrapSingleLine(
                line,
                maxCharsPerLine
            );

        lines.push(
            ...wrappedLines
        );
    }

    return lines;
};


// ================================================
// GET THEME
// ================================================

const getTheme = (
    theme = "midnight"
) => {

    return (
        CARD_THEMES[theme] ||
        CARD_THEMES.midnight
    );
};


// ================================================
// CREATE CARD SVG
// ================================================

const createCardSvg = ({
    text,
    pageName,
    theme = "midnight",
}) => {

    const selectedTheme =
        getTheme(theme);


    const quote =
        normalizeQuote(text);


    const lines =
        wrapQuote(
            quote,
            30
        );


    // --------------------------------
    // Limit visual lines
    // --------------------------------

    const visibleLines =
        lines.slice(0, 4);


    // --------------------------------
    // Dynamic typography
    // --------------------------------

    let fontSize = 58;

    if (
        visibleLines.length === 4
    ) {
        fontSize = 50;
    }

    if (
        visibleLines.length === 3
    ) {
        fontSize = 56;
    }

    if (
        visibleLines.length === 2
    ) {
        fontSize = 62;
    }

    if (
        visibleLines.length === 1
    ) {
        fontSize = 66;
    }


    const lineHeight =
        fontSize * 1.35;


    const totalTextHeight =
        (visibleLines.length - 1) *
            lineHeight;


    const startY =
        540 -
        totalTextHeight / 2;


    // --------------------------------
    // Quote text
    // --------------------------------

    const textElements =
        visibleLines
            .map(
                (
                    line,
                    index
                ) => {

                    const y =
                        startY +
                        index *
                            lineHeight;

                    return `
                        <text
                            x="540"
                            y="${y}"
                            text-anchor="middle"
                            font-family="${FONT_FAMILY}"
                            font-size="${fontSize}px"
                            font-weight="400"
                            fill="#FFFFFF"
                        >
                            ${escapeXml(
                                line
                            )}
                        </text>
                    `;
                }
            )
            .join("");


    // --------------------------------
    // Decorative quotation mark
    // --------------------------------

    const quotationMark = `
        <text
            x="540"
            y="330"
            text-anchor="middle"
            font-family="Georgia, serif"
            font-size="180px"
            font-weight="700"
            fill="${escapeXml(
                selectedTheme.accent
            )}"
            opacity="0.35"
        >
            “
        </text>
    `;


    // --------------------------------
    // Page name
    // --------------------------------

    const safePageName =
        escapeXml(
            pageName
        );


    // --------------------------------
    // SVG
    // --------------------------------

    return `
        <svg
            width="${WIDTH}"
            height="${HEIGHT}"
            viewBox="0 0 ${WIDTH} ${HEIGHT}"
            xmlns="http://www.w3.org/2000/svg"
        >

            <defs>

                <!-- Main gradient -->

                <linearGradient
                    id="backgroundGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >

                    <stop
                        offset="0%"
                        stop-color="${escapeXml(
                            selectedTheme.start
                        )}"
                    />

                    <stop
                        offset="100%"
                        stop-color="${escapeXml(
                            selectedTheme.end
                        )}"
                    />

                </linearGradient>


                <!-- Soft glow -->

                <radialGradient
                    id="glow"
                    cx="50%"
                    cy="45%"
                    r="55%"
                >

                    <stop
                        offset="0%"
                        stop-color="#FFFFFF"
                        stop-opacity="0.08"
                    />

                    <stop
                        offset="100%"
                        stop-color="#FFFFFF"
                        stop-opacity="0"
                    />

                </radialGradient>

            </defs>


            <!-- Background -->

            <rect
                width="${WIDTH}"
                height="${HEIGHT}"
                fill="url(#backgroundGradient)"
            />


            <!-- Soft center glow -->

            <rect
                width="${WIDTH}"
                height="${HEIGHT}"
                fill="url(#glow)"
            />


            <!-- Decorative circle -->

            <circle
                cx="920"
                cy="160"
                r="180"
                fill="${escapeXml(
                    selectedTheme.accent
                )}"
                opacity="0.06"
            />


            <!-- Decorative circle -->

            <circle
                cx="100"
                cy="950"
                r="220"
                fill="${escapeXml(
                    selectedTheme.accent
                )}"
                opacity="0.05"
            />


            <!-- Top accent line -->

            <rect
                x="440"
                y="115"
                width="200"
                height="5"
                rx="3"
                fill="${escapeXml(
                    selectedTheme.accent
                )}"
                opacity="0.8"
            />


            <!-- Quotation mark -->

            ${quotationMark}


            <!-- Quote -->

            ${textElements}


            <!-- Bottom divider -->

            <rect
                x="470"
                y="850"
                width="140"
                height="2"
                rx="1"
                fill="#FFFFFF"
                opacity="0.3"
            />


            <!-- Page name -->

            <text
                x="540"
                y="920"
                text-anchor="middle"
                font-family="${FONT_FAMILY}"
                font-size="30px"
                font-weight="400"
                letter-spacing="0.5px"
                fill="#FFFFFF"
                opacity="0.85"
            >
                ${safePageName}
            </text>


            <!-- Small bottom accent -->

            <circle
                cx="540"
                cy="970"
                r="5"
                fill="${escapeXml(
                    selectedTheme.accent
                )}"
            />

        </svg>
    `;
};


// ================================================
// RENDER CARD
// ================================================

const renderCard = async ({
    text,
    pageName,
    theme = "midnight",
}) => {

    // --------------------------------
    // Validate text
    // --------------------------------

    if (
        !text ||
        typeof text !== "string" ||
        !text.trim()
    ) {
        throw new Error(
            "Card text is required"
        );
    }


    // --------------------------------
    // Validate page name
    // --------------------------------

    if (
        !pageName ||
        typeof pageName !== "string" ||
        !pageName.trim()
    ) {
        throw new Error(
            "Page name is required"
        );
    }


    // --------------------------------
    // Create SVG
    // --------------------------------

    const svg =
        createCardSvg({
            text:
                text.trim(),

            pageName:
                pageName.trim(),

            theme,
        });


    // --------------------------------
    // Convert SVG → PNG
    // --------------------------------

    const imageBuffer =
        await sharp(
            Buffer.from(svg)
        )
            .png()
            .toBuffer();


    return imageBuffer;
};


// ================================================
// EXPORT
// ================================================

export default renderCard;

