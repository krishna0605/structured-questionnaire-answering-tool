import { extractQuestionsFromText } from '@/lib/parser';

describe('extractQuestionsFromText', () => {
  it('should parse numbered questions with period separator', () => {
    const text = `
1. What is your data retention policy?
2. How do you handle incident response?
3. What encryption standards do you use?
    `;
    const result = extractQuestionsFromText(text);

    expect(result).toHaveLength(3);
    expect(result[0].question_number).toBe(1);
    expect(result[0].question_text).toBe('What is your data retention policy?');
    expect(result[1].question_number).toBe(2);
    expect(result[2].question_number).toBe(3);
  });

  it('should parse numbered questions with parenthesis separator', () => {
    const text = `
1) What backup procedures are in place?
2) Describe your access control mechanisms.
    `;
    const result = extractQuestionsFromText(text);

    expect(result).toHaveLength(2);
    expect(result[0].question_number).toBe(1);
    expect(result[0].question_text).toBe('What backup procedures are in place?');
  });

  it('should handle multi-line question continuation', () => {
    const text = `
1. What is your organization's approach to
   data security and privacy compliance?
2. Describe your incident response plan.
    `;
    const result = extractQuestionsFromText(text);

    expect(result).toHaveLength(2);
    expect(result[0].question_text).toContain('data security and privacy compliance');
  });

  it('should return empty array for empty input', () => {
    const result = extractQuestionsFromText('');
    expect(result).toEqual([]);
  });

  it('should fallback to paragraph splitting when no numbering', () => {
    const text = `
What is your data retention policy?

How do you handle incident response procedures in your organization?

What encryption standards are used for data at rest and in transit?
    `;
    const result = extractQuestionsFromText(text);

    expect(result.length).toBeGreaterThan(0);
    result.forEach((q) => {
      expect(q.question_text.length).toBeGreaterThan(10);
    });
  });

  it('should set original_context to null for text-extracted questions', () => {
    const text = '1. What is your security policy?';
    const result = extractQuestionsFromText(text);

    expect(result[0].original_context).toBeNull();
  });

  it('should handle questions with colon separator', () => {
    const text = `
1: What is your disaster recovery plan?
2: How often do you perform security audits?
    `;
    const result = extractQuestionsFromText(text);

    expect(result).toHaveLength(2);
    expect(result[0].question_number).toBe(1);
  });

  it('should handle single question input', () => {
    const text = '1. What security certifications does your organization hold?';
    const result = extractQuestionsFromText(text);

    expect(result).toHaveLength(1);
    expect(result[0].question_number).toBe(1);
  });
});
