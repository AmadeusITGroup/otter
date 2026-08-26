import {
  inject,
  provideExperimentalWebMcpTools,
} from '@angular/core';
import {
  PetApi,
} from '@o3r-training/showcase-sdk';

/**
 * Provides WebMCP tools for the SDK page.
 * These tools expose read-only access to the Pet Store API for AI agents.
 */
export function provideSdkWebMcpTools() {
  return provideExperimentalWebMcpTools([
    {
      name: 'listPets',
      description: 'List available pets from the Pet Store API filtered by status.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter pets by status. Possible values: "available", "pending", "sold". Defaults to "available".'
          }
        },
        additionalProperties: false
      },
      execute: async ({ status }) => {
        const petApi = inject(PetApi);
        const petStatus = (status === 'pending' || status === 'sold') ? status : 'available';
        try {
          const pets = await petApi.findPetsByStatus({ status: petStatus });
          const otterPets = pets.filter((p) => p.category?.name === 'otter');
          const summary = otterPets.map((p) => ({ id: p.id, name: p.name, status: p.status, tags: p.tags?.map((t) => t.name) }));
          return { content: [{ type: 'text', text: JSON.stringify({ total: summary.length, pets: summary }, null, 2) }] };
        } catch {
          return { content: [{ type: 'text', text: 'Error: Failed to fetch pets from the Pet Store API.' }] };
        }
      }
    },
    {
      name: 'searchPets',
      description: 'Search for pets by name, tag, or category keyword in the Pet Store.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keyword to filter pets by name, tag, or category.'
          }
        },
        required: ['query'],
        additionalProperties: false
      },
      execute: async ({ query }) => {
        const petApi = inject(PetApi);
        if (typeof query !== 'string' || !query.trim()) {
          return { content: [{ type: 'text', text: 'Error: A non-empty search query is required.' }] };
        }
        try {
          const pets = await petApi.findPetsByStatus({ status: 'available' });
          const matchString = new RegExp(query.replace(/[\s#$()*+,.?[\\\]^{|}-]/g, '\\$&'), 'i');
          const filtered = pets.filter((pet) =>
            matchString.test(pet.name)
            || (pet.category?.name && matchString.test(pet.category.name))
            || (pet.tags?.some((tag) => tag.name && matchString.test(tag.name)))
          );
          const summary = filtered.map((p) => ({ id: p.id, name: p.name, status: p.status, category: p.category?.name, tags: p.tags?.map((t) => t.name) }));
          return { content: [{ type: 'text', text: JSON.stringify({ query, total: summary.length, pets: summary }, null, 2) }] };
        } catch {
          return { content: [{ type: 'text', text: 'Error: Failed to search pets from the Pet Store API.' }] };
        }
      }
    },
    {
      name: 'getPetById',
      description: 'Get details of a specific pet by its ID.',
      inputSchema: {
        type: 'object',
        properties: {
          petId: {
            type: 'number',
            description: 'The unique identifier of the pet.'
          }
        },
        required: ['petId'],
        additionalProperties: false
      },
      execute: async ({ petId }) => {
        const petApi = inject(PetApi);
        if (typeof petId !== 'number') {
          return { content: [{ type: 'text', text: 'Error: petId must be a number.' }] };
        }
        try {
          const pet = await petApi.getPetById({ petId });
          const result = {
            id: pet.id, name: pet.name, status: pet.status,
            category: pet.category?.name, tags: pet.tags?.map((t) => t.name), photoUrls: pet.photoUrls
          };
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch {
          return { content: [{ type: 'text', text: `Error: Could not find pet with ID ${String(petId)}.` }] };
        }
      }
    }
  ]);
}
