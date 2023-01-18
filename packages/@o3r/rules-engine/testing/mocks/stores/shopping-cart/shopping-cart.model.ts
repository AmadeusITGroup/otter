import { XmasHamper } from "../../xmas-hamper.mock";

/**
 * Shopping cart content
 */
 export interface ShoppingCart {
  /** Cart id */
  id: string;

  /** Christmas hampers in cart */
  xmasHampers?: XmasHamper[];

 }
