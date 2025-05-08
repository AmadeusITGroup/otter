/**
 * Model: ActivityLogContext
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Contextual information about the event.
 */
export interface ActivityLogContext {
  /** The third-party application that triggered the event, if applicable. */
  client_name: string;
  /** The IP address from of the client that sent the event request. */
  ip_address: string;
  /** If Figma's Support team triggered the event. This is either true or false. */
  is_figma_support_team_action: boolean;
  /** The id of the organization where the event took place. */
  org_id: string;
  /** The id of the team where the event took place -- if this took place in a specific team. */
  team_id: string;
}


