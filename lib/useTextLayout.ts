'use client';

import { useState, useEffect, useRef } from 'react';
import { prepare, layout, type PreparedText, type LayoutResult } from '@chenglou/pretext';

interface TextLayoutResult {
  lineCount: number;
  height: number;
  truncated: boolean;
  ready: boolean;
}

/**
 * Uses Pretext to measure text layout without DOM reflows.
 * Returns line count and whether text would be truncated at maxLines.
 * Inspired by the Pretext library's DOM-free measurement approach.
 */
export function useTextLayout(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  maxLines?: number
): TextLayoutResult {
  const [result, setResult] = useState<TextLayoutResult>({
    lineCount: 0,
    height: 0,
    truncated: false,
    ready: false,
  });
  const preparedRef = useRef<PreparedText | null>(null);
  const prevText = useRef('');
  const prevFont = useRef('');

  useEffect(() => {
    if (!text || maxWidth <= 0) return;

    // Only re-prepare if text or font changed
    if (text !== prevText.current || font !== prevFont.current) {
      preparedRef.current = prepare(text, font);
      prevText.current = text;
      prevFont.current = font;
    }

    if (!preparedRef.current) return;

    const layoutResult: LayoutResult = layout(preparedRef.current, maxWidth, lineHeight);

    setResult({
      lineCount: layoutResult.lineCount,
      height: layoutResult.height,
      truncated: maxLines ? layoutResult.lineCount > maxLines : false,
      ready: true,
    });
  }, [text, font, maxWidth, lineHeight, maxLines]);

  return result;
}
