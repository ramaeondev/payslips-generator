import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../services/client.service';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="bg-white rounded shadow p-4 flex flex-col h-full cursor-pointer" (click)="open()">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
        @if (client.logo) {
          <img [src]="client.logo" alt="Logo" class="object-contain h-16 w-full" />
        } @else {
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"/>
          </svg>
        }
      </div>
      <div class="flex-1">
        <div class="font-semibold text-gray-800">{{ client.name }}</div>
        <div class="text-xs text-gray-500">{{ client.contact_email || client.contact_phone || '-' }}</div>
      </div>
      <div class="text-xs text-gray-400">{{ client.created_at | date:'short' }}</div>
    </div>

    <div class="mt-3 text-sm text-gray-600 flex-1">
      <div>{{ client.address || '-' }}</div>
      <div>{{ client.city }}, {{ client.state }} {{ client.postal_code || client.zipCode || '' }}</div>
      @if (client.website) {
        <div class="mt-1 text-blue-600"><a [href]="client.website" target="_blank">{{ client.website }}</a></div>
      }
    </div>

    <div class="mt-4 flex gap-2 justify-end">
      <button (click)="$event.stopPropagation(); requestDelete.emit(client.id)" class="text-sm px-2 py-1 ml-2 text-red-600">Delete</button>
    </div>
  </div>
  `
})
export class ClientCardComponent {
  @Input() client!: Client;
  @Output() edit = new EventEmitter<Client>();
  @Output() requestDelete = new EventEmitter<string>();

  // Open the client edit form when the card is clicked
  open(): void {
    this.edit.emit(this.client);
  }
}
