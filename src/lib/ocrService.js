
const OCR_API_URL = 'https://api.ocr.space/parse/image';
const API_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY;

export async function performOCR(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('apikey', API_KEY);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');

  try {
    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.OCRExitCode !== 1) {
      throw new Error(data.ErrorMessage || 'OCR processing failed');
    }

    // Extract relevant information from OCR results
    const text = data.ParsedResults[0].ParsedText;
    
    // Basic parsing of common receipt formats
    const result = {
      merchantName: extractMerchantName(text),
      amount: extractAmount(text),
      date: extractDate(text),
      items: extractLineItems(text),
      rawText: text,
    };

    return result;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
}

function extractMerchantName(text) {
  // Look for merchant name typically at the top of receipt
  const lines = text.split('\n');
  // Usually the first non-empty line that's not a date or amount
  return lines[0]?.trim() || '';
}

function extractAmount(text) {
  // Look for total amount patterns
  const totalPattern = /(?:total|amount|sum)[:\s]*(?:R|ZAR)?\s*(\d+[.,]\d{2})/i;
  const match = text.match(totalPattern);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

function extractDate(text) {
  // Look for common date formats
  const datePattern = /\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/;
  const match = text.match(datePattern);
  return match ? match[0] : null;
}

function extractLineItems(text) {
  // Split into lines and look for patterns of item + price
  const lines = text.split('\n');
  const items = [];
  
  const itemPattern = /(.+?)\s+(?:R|ZAR)?\s*(\d+[.,]\d{2})/i;
  
  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match) {
      items.push({
        description: match[1].trim(),
        amount: parseFloat(match[2].replace(',', '.')),
      });
    }
  }
  
  return items;
}

export default performOCR;
  