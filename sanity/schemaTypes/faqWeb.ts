import { defineField, defineType } from 'sanity';

export const faqWeb = defineType({
    name: 'faq',
    title: 'FAQ',
    type: 'document',
    fields: [
        defineField({
            name: 'question',
            title: 'Question',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'answer',
            title: 'Answer',
            type: 'text',
            rows: 4,
            validation: (rule) => rule.required(),
        }),
    ],
});
