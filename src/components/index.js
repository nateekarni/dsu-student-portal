/**
 * Components Index - Re-export all components from a single entry point
 * 
 * Usage:
 *   import { Button, Input, Modal, Table } from './components/index.js';
 * 
 * Structure:
 *   components/
 *   ├── ui/       - Form inputs, buttons, modals
 *   ├── data/     - Tables, cards, badges, stats
 *   └── feed/     - Feed cards for project listings
 */

// ===== UI Components =====
export { 
  Button, 
  Input, 
  Select, 
  Textarea, 
  Modal, 
  initModalSystem 
} from './ui/index.js';

// ===== Data Display Components =====
export { 
  Table, 
  Card, 
  StatCard, 
  StatusBadge, 
  Tag, 
  StatusTag,
  Avatar,
  EmptyState, 
  LoadingSpinner 
} from './data/index.js';

// ===== Feed Components =====
export { 
  FeedCard, 
  FeedCardCompact 
} from './feed/index.js';
