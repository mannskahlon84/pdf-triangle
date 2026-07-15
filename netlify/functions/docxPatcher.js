const JSZip = require('jszip');

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function unescapeXml(safe) {
    return safe
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'");
}

async function patchDocx(docxBuffer, replacements) {
    const zip = await JSZip.loadAsync(docxBuffer);
    const docXmlPath = 'word/document.xml';
    if (!zip.file(docXmlPath)) {
        throw new Error("Invalid docx: missing word/document.xml");
    }
    let xml = await zip.file(docXmlPath).async("string");

    // Extract all text nodes
    const textNodes = [];
    const regex = /<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        textNodes.push({
            fullTag: match[0],
            innerXml: match[1],
            index: match.index,
            length: match[0].length
        });
    }

    let plainText = "";
    const nodeMapping = [];
    
    for (const node of textNodes) {
        let text = unescapeXml(node.innerXml);
        for (let i = 0; i < text.length; i++) {
            nodeMapping.push({ nodeIndex: textNodes.indexOf(node), charInNode: i });
        }
        plainText += text;
    }

    const chars = plainText.split('').map((c, i) => ({ char: c, nodeIdx: nodeMapping[i].nodeIndex }));
    
    // Perform replacements
    for (const rep of replacements) {
        let originalText = rep.originalText;
        let newText = rep.newText;
        if (!originalText || !newText) continue;
        
        // Sometimes LLM returns slightly trimmed text, we can try to find it
        let idx = plainText.indexOf(originalText);
        
        // If not found, try a more robust search ignoring exact whitespace
        if (idx === -1) {
            // Very basic fallback
        }

        while (idx !== -1) {
            chars[idx].char = escapeXml(newText);
            for (let i = 1; i < originalText.length; i++) {
                chars[idx + i].char = "";
            }
            // Mute the replaced text so it isn't matched again
            plainText = plainText.substring(0, idx) + '\0'.repeat(originalText.length) + plainText.substring(idx + originalText.length);
            idx = plainText.indexOf(originalText, idx + originalText.length);
        }
    }

    const nodeNewText = new Array(textNodes.length).fill("");
    for (let i = 0; i < chars.length; i++) {
        nodeNewText[chars[i].nodeIdx] += chars[i].char;
    }

    let finalXml = "";
    let lastIndex = 0;
    for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        finalXml += xml.substring(lastIndex, node.index);
        const tagMatch = node.fullTag.match(/^(<w:t(?: [^>]*)?>)/);
        const openTag = tagMatch[1];
        
        // Ensure preserve space is added if there is leading/trailing whitespace
        let opening = openTag;
        if (nodeNewText[i].match(/^\s|\s$/) && !opening.includes('xml:space="preserve"')) {
             opening = opening.replace('<w:t', '<w:t xml:space="preserve"');
        }
        
        finalXml += opening + nodeNewText[i] + "</w:t>";
        lastIndex = node.index + node.length;
    }
    finalXml += xml.substring(lastIndex);
    
    zip.file(docXmlPath, finalXml);
    return await zip.generateAsync({ type: "nodebuffer" });
}

module.exports = { patchDocx };
