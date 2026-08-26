// Block state (module state, its producer, and the shell-side mirror consumer)
export * from './block-state/navigation-block.service';
export * from './block-state/navigation-block-state-producer.service';
export * from './block-state/navigation-block-state-consumer.service';

// Navigation request (request/decision producer, request consumer, side-specific handlers)
export * from './navigation-request/navigation-request-manager.service';
export * from './navigation-request/navigation-request-consumer.service';
export * from './navigation-request/navigation-request-handler';
export * from './navigation-request/navigation-request-module-handler';
export * from './navigation-request/navigation-request-shell-handler';

// Navigation decision (decision reply consumer)
export * from './navigation-decision/navigation-decision-consumer.service';

// Guards (router guards)
export * from './guards/navigation-block.shell-guard';
export * from './guards/navigation-block.module-guard';

// UI (confirmation - framework agnostic, browser-based only)
export * from './navigation-confirmation/navigation-block-confirmation.interface';
export * from './navigation-confirmation/navigation-block-confirmation.service';
export * from './navigation-confirmation/strategies/browser-confirmation.strategy';
export * from './navigation-confirmation/providers';
