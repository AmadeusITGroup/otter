import { ComponentFixtureProfile, O3rComponentFixture } from '@o3r/testing/core';
import { SidenavPresFixture, SidenavPresFixtureComponent } from '../components/utilities/sidenav/sidenav-pres.fixture';

/**
 * A component fixture abstracts all the interaction you can have with the component's DOM
 * for testing purpose, including instantiating the fixtures of sub-components.
 * It should be used both for component testing and automated testing.
 */
export interface AppFixture extends ComponentFixtureProfile {
  /** Get SidenavPresFixture */
  getSideNav(): Promise<SidenavPresFixture>;
  /** Go to Home page */
  navigateToHome(): Promise<void>;
  /** Go to Run-app-locally page */
  navigateToRunAppLocally(): Promise<void>;
  /** Go to Configuration page */
  navigateToConfiguration(): Promise<void>;
  /** Go to Localization page */
  navigateToLocalization(): Promise<void>;
  /** Go to Dynamic-content page */
  navigateToDynamicContent(): Promise<void>;
  /** Go to Rules-engine page */
  navigateToRulesEngine(): Promise<void>;
  /** Go to Component-replacement page */
  navigateToComponentReplacement(): Promise<void>;
  /** Go to Design-token page */
  navigateToDesignToken(): Promise<void>;
  /** Go to SDK-generator page */
  navigateToSDKGenerator(): Promise<void>;
}

export class AppFixtureComponent extends O3rComponentFixture implements AppFixture {
  /** @inheritDoc */
  public async getSideNav() {
    return new SidenavPresFixtureComponent(await this.query('o3r-sidenav-pres'));
  }

  /** @inheritDoc */
  public async navigateToHome() {
    await (await this.getSideNav()).clickOnLink(0);
  }

  /** @inheritDoc */
  public async navigateToRunAppLocally() {
    await (await this.getSideNav()).clickOnLink(1);
  }

  /** @inheritDoc */
  public async navigateToConfiguration() {
    await (await this.getSideNav()).clickOnLink(2);
  }

  /** @inheritDoc */
  public async navigateToLocalization() {
    await (await this.getSideNav()).clickOnLink(3);
  }

  /** @inheritDoc */
  public async navigateToDynamicContent() {
    await (await this.getSideNav()).clickOnLink(4);
  }

  /** @inheritDoc */
  public async navigateToRulesEngine() {
    await (await this.getSideNav()).clickOnLink(5);
  }

  /** @inheritDoc */
  public async navigateToComponentReplacement() {
    await (await this.getSideNav()).clickOnLink(6);
  }

  /** @inheritDoc */
  public async navigateToDesignToken() {
    await (await this.getSideNav()).clickOnLink(7);
  }

  /** @inheritDoc */
  public async navigateToSDKGenerator() {
    await (await this.getSideNav()).clickOnLink(8);
  }

}
