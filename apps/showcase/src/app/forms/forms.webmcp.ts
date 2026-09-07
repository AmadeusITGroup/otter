import {
  provideExperimentalWebMcpTools,
} from '@angular/core';

/**
 * Provides WebMCP tools for the Forms page.
 * These tools allow AI agents to fill and submit the personal info and emergency contact forms.
 */
export function provideFormsWebMcpTools() {
  return provideExperimentalWebMcpTools([
    {
      name: 'fillPersonalInfo',
      description: 'Fill the personal information form with the provided data. The form requires a name and a date of birth.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The full name of the person.'
          },
          dateOfBirth: {
            type: 'string',
            description: 'Date of birth in YYYY-MM-DD format.'
          }
        },
        required: ['name', 'dateOfBirth'],
        additionalProperties: false
      },
      execute: ({ name, dateOfBirth }) => {
        if (typeof name !== 'string' || !name.trim()) {
          return { content: [{ type: 'text', text: 'Error: name is required and must be a non-empty string.' }] };
        }
        if (typeof dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
          return { content: [{ type: 'text', text: 'Error: dateOfBirth must be in YYYY-MM-DD format.' }] };
        }
        const formElement = document.querySelector<HTMLInputElement>('o3r-forms-personal-info-pres input[id*="name"]');
        const dateElement = document.querySelector<HTMLInputElement>('o3r-forms-personal-info-pres input[type="date"], o3r-forms-personal-info-pres o3r-date-picker-input-pres input');
        if (formElement) {
          formElement.value = name;
          formElement.dispatchEvent(new Event('input', { bubbles: true }));
          formElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (dateElement) {
          dateElement.value = dateOfBirth;
          dateElement.dispatchEvent(new Event('input', { bubbles: true }));
          dateElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return { content: [{ type: 'text', text: JSON.stringify({ filled: true, personalInfo: { name, dateOfBirth } }) }] };
      }
    },
    {
      name: 'fillEmergencyContact',
      description: 'Fill the emergency contact form with the provided data.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the emergency contact.'
          },
          phone: {
            type: 'string',
            description: 'The phone number of the emergency contact.'
          },
          email: {
            type: 'string',
            description: 'The email address of the emergency contact.'
          }
        },
        required: ['name', 'phone', 'email'],
        additionalProperties: false
      },
      execute: ({ name, phone, email }) => {
        if (typeof name !== 'string' || !name.trim()) {
          return { content: [{ type: 'text', text: 'Error: name is required.' }] };
        }
        if (typeof phone !== 'string' || !phone.trim()) {
          return { content: [{ type: 'text', text: 'Error: phone is required.' }] };
        }
        if (typeof email !== 'string' || !email.trim()) {
          return { content: [{ type: 'text', text: 'Error: email is required.' }] };
        }
        const nameEl = document.querySelector<HTMLInputElement>('o3r-forms-emergency-contact-pres input[id*="name"]');
        const phoneEl = document.querySelector<HTMLInputElement>('o3r-forms-emergency-contact-pres input[id*="phone"]');
        const emailEl = document.querySelector<HTMLInputElement>('o3r-forms-emergency-contact-pres input[id*="email"]');
        if (nameEl) {
          nameEl.value = name;
          nameEl.dispatchEvent(new Event('input', { bubbles: true }));
          nameEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (phoneEl) {
          phoneEl.value = phone;
          phoneEl.dispatchEvent(new Event('input', { bubbles: true }));
          phoneEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (emailEl) {
          emailEl.value = email;
          emailEl.dispatchEvent(new Event('input', { bubbles: true }));
          emailEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return { content: [{ type: 'text', text: JSON.stringify({ filled: true, emergencyContact: { name, phone, email } }) }] };
      }
    },
    {
      name: 'submitForms',
      description: 'Submit the forms on the page and return the result.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: () => {
        const submitButton = document.querySelector<HTMLButtonElement>('o3r-forms-parent button[type="submit"]');
        if (!submitButton) {
          return { content: [{ type: 'text', text: 'Error: Submit button not found. Make sure you are on the forms page.' }] };
        }
        submitButton.click();
        const errorElements = document.querySelectorAll('o3r-forms-parent .invalid-feedback, o3r-forms-parent .text-danger');
        const errors = Array.from(errorElements).map((el) => el.textContent?.trim()).filter(Boolean);
        if (errors.length > 0) {
          return { content: [{ type: 'text', text: JSON.stringify({ submitted: true, valid: false, errors }) }] };
        }
        return { content: [{ type: 'text', text: JSON.stringify({ submitted: true, valid: true }) }] };
      }
    }
  ]);
}
